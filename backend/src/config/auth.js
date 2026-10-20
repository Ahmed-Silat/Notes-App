import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";
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

    session: {
      expiresIn: SESSION_DAYS * DAY_SECONDS,
      // an active user's session is extended at most once a day
      updateAge: DAY_SECONDS,
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
