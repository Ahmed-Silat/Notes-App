import { authClient } from "@/lib/auth-client";

// Login, sign-up and logout go through Better Auth. They resolve to the same
// shape the pages already use ({ data: { success, message, rest } }) and throw
// an Error with Better Auth's message when the request fails. The error's
// `code` is Better Auth's error code, e.g. "INVALID_PASSWORD".

// Better Auth allows 3 sign-in, sign-up or password attempts per 10 seconds,
// and 3 reset emails a minute (in production)
const TOO_MANY_ATTEMPTS = "Too many attempts. Please wait a minute and try again.";

const unwrap = ({ data, error }) => {
  if (error) {
    const err = new Error(
      error.status === 429
        ? TOO_MANY_ATTEMPTS
        : error.message || error.statusText || "Something went wrong"
    );
    err.code = error.code;
    err.status = error.status;
    throw err;
  }
  return data;
};

const toUser = (user) => ({
  _id: user.id,
  username: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const login = async (email, password) => {
  const { user } = unwrap(await authClient.signIn.email({ email, password }));
  return { data: { success: true, message: "Login Successful", rest: toUser(user) } };
};

// Creates the account and logs the user in (the backend has autoSignIn on).
export const singnUp = async (username, email, password) => {
  const { user } = unwrap(
    await authClient.signUp.email({ name: username, email, password })
  );
  return {
    data: { success: true, message: "Account created", rest: toUser(user) },
  };
};

// Emails a reset link. Succeeds whether or not the email has an account, so
// the form can't be used to find out who is registered.
export const requestPasswordReset = async (email) => {
  unwrap(
    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
  );
};

export const resetPassword = async (token, newPassword) => {
  unwrap(await authClient.resetPassword({ token, newPassword }));
};

// Sends the browser to Google to pick an account. Google comes back to
// /auth/callback, with ?error=<code> when signing in didn't work.
export const signInWithGoogle = async () => {
  const callbackURL = `${window.location.origin}/auth/callback`;
  unwrap(
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL: callbackURL,
    })
  );
};

// The logged-in user (e.g. right after Google redirected back), or null.
export const getSignedInUser = async () => {
  const session = unwrap(await authClient.getSession());
  return session?.user ? toUser(session.user) : null;
};

// How the logged-in user can sign in: with a password, with Google, or both.
export const getSignInMethods = async () => {
  const accounts = unwrap(await authClient.listAccounts());
  const providers = accounts.map((account) => account.providerId);
  return {
    hasPassword: providers.includes("credential"),
    hasGoogle: providers.includes("google"),
  };
};

// Connects a Google account (with the same email) to the logged-in account.
// Google comes back to Settings with ?connected=google, or ?error=<code>.
export const connectGoogle = async () => {
  const settingsURL = `${window.location.origin}/settings`;
  unwrap(
    await authClient.linkSocial({
      provider: "google",
      callbackURL: `${settingsURL}?connected=google`,
      errorCallbackURL: settingsURL,
    })
  );
};

// Before an account without a password is deleted: sends the browser through
// Google again to prove it's the owner. Only the Google account already
// connected is accepted, so it can't switch to another account. Comes back to
// Settings with ?confirm-delete=google, plus &error=<code> when it failed.
export const confirmWithGoogleToDelete = async () => {
  const settingsURL = `${window.location.origin}/settings?confirm-delete=google`;
  unwrap(
    await authClient.linkSocial({
      provider: "google",
      callbackURL: settingsURL,
      errorCallbackURL: settingsURL,
    })
  );
};

export const signout = async () => {
  unwrap(await authClient.signOut());
  return { data: { success: true, message: "User logged out successfully" } };
};

// Saves a new name and resolves to the updated user, with the name as the
// server stored it (trimmed and lowercase).
export const updateName = async (name) => {
  unwrap(await authClient.updateUser({ name }));
  const { user } = unwrap(await authClient.getSession());
  return toUser(user);
};

// Also logs the account out on every other device; this one stays logged in.
export const changePassword = async (currentPassword, newPassword) => {
  unwrap(
    await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
  );
};

// Permanently deletes the account and all its notes, and logs it out. Without
// a password (accounts that only use Google), the user must have confirmed
// with Google in the last 5 minutes (confirmWithGoogleToDelete), or it fails
// with the code "GOOGLE_CONFIRMATION_REQUIRED".
export const deleteAccount = async (password) => {
  unwrap(await authClient.deleteUser({ password }));
};
