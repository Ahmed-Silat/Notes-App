import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { CORS_ORIGINS, env } from "./env.js";
import { resetPasswordEmail } from "../emails/resetPasswordEmail.js";
import { deleteByUser } from "../repositories/note.repository.js";
import { sendEmail } from "../utils/mailer.js";

const SESSION_DAYS = 7;
const DAY_SECONDS = 24 * 60 * 60;
const RESET_LINK_MINUTES = 60;

// same limit as the forms (frontend/src/schemas/auth.schema.js)
const NAME_MAX_LENGTH = 50;

// Usernames are stored trimmed and lowercase. Rejects an empty or too long
// name with a 400, which the sign-up and Settings forms show as an error.
const normalizeName = (name) => {
  const normalized = String(name ?? "").trim().toLowerCase();

  if (!normalized) {
    throw new APIError("BAD_REQUEST", { message: "Name is required" });
  }
  if (normalized.length > NAME_MAX_LENGTH) {
    throw new APIError("BAD_REQUEST", {
      message: `Name can be at most ${NAME_MAX_LENGTH} characters`,
    });
  }
  return normalized;
};

// how long after confirming with Google an account without a password can be
// deleted
const GOOGLE_CONFIRM_MINUTES = 5;

// Deleting an account needs proof that it's really the owner, not just a
// session cookie (which could be stolen): the password, or for accounts that
// only use Google, a Google login in the last GOOGLE_CONFIRM_MINUTES. Logging
// in with Google or connecting it again (Settings) updates the Google
// account's updatedAt. Better Auth checks the password itself when one is sent.
const checkDeleteAccount = async (ctx) => {
  if (ctx.body?.password) return;

  const session = await getSessionFromCtx(ctx);
  // not logged in: the delete route itself answers 401
  if (!session) return;

  const accounts = await ctx.context.internalAdapter.findAccounts(
    session.user.id
  );
  if (accounts.some((account) => account.providerId === "credential" && account.password)) {
    throw new APIError("BAD_REQUEST", {
      message: "Enter your password to delete your account",
      code: "PASSWORD_REQUIRED",
    });
  }

  const googleAccount = accounts.find((account) => account.providerId === "google");
  const confirmedAt = googleAccount ? new Date(googleAccount.updatedAt).getTime() : 0;
  if (Date.now() - confirmedAt > GOOGLE_CONFIRM_MINUTES * 60 * 1000) {
    throw new APIError("FORBIDDEN", {
      message: "Confirm with Google to delete your account",
      code: "GOOGLE_CONFIRMATION_REQUIRED",
    });
  }
};

// Removing a sign-in method needs a login from the last day. This is Better
// Auth's own rule, turned off globally (session.freshAge: 0) because
// checkDeleteAccount replaces it for deleting accounts.
const checkUnlinkAccount = async (ctx) => {
  const session = await getSessionFromCtx(ctx);
  if (!session) return;

  const loggedInAt = new Date(session.session.createdAt).getTime();
  if (Date.now() - loggedInAt > DAY_SECONDS * 1000) {
    throw new APIError("FORBIDDEN", {
      message: "Log in again to remove a sign-in method",
      code: "SESSION_NOT_FRESH",
    });
  }
};

const protectSensitiveRoutes = createAuthMiddleware(async (ctx) => {
  if (ctx.path === "/delete-user") await checkDeleteAccount(ctx);
  if (ctx.path === "/unlink-account") await checkUnlinkAccount(ctx);
});

// Sign in with Google, when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
// Google redirects back to BETTER_AUTH_URL + /api/auth/callback/google, which
// must be listed as an authorized redirect URI on the OAuth client.
const google =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // let people pick which Google account to use, every time
        prompt: "select_account",
        // a Google name can be longer than our limit, or missing
        mapProfileToUser: (profile) => ({
          name: (profile.name?.trim() || profile.email.split("@")[0]).slice(
            0,
            NAME_MAX_LENGTH
          ),
        }),
      }
    : null;

const createAuth = () =>
  betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: CORS_ORIGINS,
    // shares mongoose's connection; no client is passed, so no transactions
    database: mongodbAdapter(mongoose.connection.db),

    // reuse the existing "users" collection, where the name lives in "username"
    user: {
      modelName: "users",
      fields: { name: "username" },
      // Settings page: users can delete their account (confirmed with their
      // password). Their notes go first, so if that fails the account stays and
      // they can try again, instead of leaving notes behind without an owner.
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          await deleteByUser(user.id);
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      // signing up also logs the user in, straight to their notes. (With this
      // on, Better Auth also rejects an already-registered email clearly.)
      autoSignIn: true,
      // bcrypt, as before, so existing users' passwords keep working
      password: {
        hash: (password) => bcryptjs.hash(password, 10),
        verify: ({ hash, password }) => bcryptjs.compare(password, hash),
      },

      // Forgot password: the emailed link is single-use and expires
      resetPasswordTokenExpiresIn: RESET_LINK_MINUTES * 60,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          ...resetPasswordEmail({
            name: user.name,
            url,
            expiresInMinutes: RESET_LINK_MINUTES,
          }),
        });
      },
      // a reset logs the account out everywhere, in case someone else was in
      revokeSessionsOnPasswordReset: true,
    },

    // On in production only (NODE_ENV=production): 100 requests per 10
    // seconds per visitor, and 3 per 10 seconds for sign-in, sign-up and
    // change-password. Counts are kept in memory, fine for a single server.
    rateLimit: {
      customRules: {
        // Better Auth's default too; kept here so a forgot-password form can't
        // be used to flood someone's inbox even if that default changes
        "/request-password-reset": { window: 60, max: 3 },
      },
    },

    advanced: {
      ipAddress: {
        // the visitor's address as Express resolved it (see app.js). Render's
        // own X-Forwarded-For can hold several addresses, which Better Auth
        // rejects, and then everyone would share one rate limit.
        ipAddressHeaders: ["x-client-ip"],
      },
    },

    hooks: {
      before: protectSensitiveRoutes,
    },

    socialProviders: google ? { google } : {},

    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        // Signing in with Google doesn't join an existing email/password
        // account whose email isn't verified: whoever created it may not own
        // the address. Those users log in with their password and connect
        // Google in Settings instead (authClient.linkSocial), which proves
        // they own both. Google's sign-in then fails with
        // ?error=account_not_linked, which the frontend explains.
        requireLocalEmailVerified: true,
      },
    },

    session: {
      expiresIn: SESSION_DAYS * DAY_SECONDS,
      // an active user's session is extended at most once a day
      updateAge: DAY_SECONDS,
      // Better Auth's "login from the last day" rule for sensitive actions is
      // off; protectSensitiveRoutes applies stricter rules instead. Otherwise
      // someone who just confirmed with Google would still be refused for
      // having logged in days ago.
      freshAge: 0,
    },

    databaseHooks: {
      user: {
        // usernames are stored trimmed and lowercase, as before
        create: {
          before: async (user) => ({ data: { ...user, name: normalizeName(user.name) } }),
        },
        update: {
          before: async (user) =>
            user.name === undefined
              ? { data: user }
              : { data: { ...user, name: normalizeName(user.name) } },
        },
      },
    },
  });

let auth;

// Created on first use, because the adapter needs mongoose to be connected.
export const getAuth = () => {
  if (!auth) auth = createAuth();
  return auth;
};
