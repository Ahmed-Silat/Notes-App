import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { CORS_ORIGINS, env } from "./env.js";
import { resetPasswordEmail } from "../emails/resetPasswordEmail.js";
import { sendEmail } from "../utils/mailer.js";

const SESSION_DAYS = 7;
const DAY_SECONDS = 24 * 60 * 60;
const RESET_LINK_MINUTES = 60;

const normalizeName = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : name;

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
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      // keep the sign-up -> log in flow the frontend already has
      autoSignIn: false,
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

    hooks: {
      // With autoSignIn off, Better Auth answers a sign-up for an existing
      // email with a fake success (to hide which emails are registered). Keep
      // the app's clear "already exists" message instead.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;

        const email = String(ctx.body?.email ?? "").trim().toLowerCase();
        if (email && (await ctx.context.internalAdapter.findUserByEmail(email))) {
          throw new APIError("UNPROCESSABLE_ENTITY", {
            message: "An account with this email already exists",
          });
        }
      }),
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
