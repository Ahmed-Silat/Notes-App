import { authClient } from "@/lib/auth-client";

// Login, sign-up and logout go through Better Auth. They resolve to the same
// shape the pages already use ({ data: { success, message, rest } }) and throw
// an Error with Better Auth's message when the request fails.

const unwrap = ({ data, error }) => {
  if (error) {
    throw new Error(error.message || error.statusText || "Something went wrong");
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

export const signout = async () => {
  unwrap(await authClient.signOut());
  return { data: { success: true, message: "User logged out successfully" } };
};
