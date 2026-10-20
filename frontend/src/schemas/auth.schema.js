import { z } from "zod";

// Same rules the backend enforces (backend/src/config/auth.js): lowercase
// emails, names of at most 50 characters and passwords of at least 6.

export const NAME_MAX_LENGTH = 50;

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(NAME_MAX_LENGTH, `Name can be at most ${NAME_MAX_LENGTH} characters`);

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email("Invalid email"));

const newPassword = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters");

const confirmPassword = z.string().min(1, "Confirm Password is required");

const passwordsMatch = [
  (data) => data.password === data.confirmPassword,
  {
    error: "Passwords must match",
    path: ["confirmPassword"],
    // check the match as soon as both password fields are filled in
    when: ({ value }) => Boolean(value?.password && value?.confirmPassword),
  },
];

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name,
    email,
    password: newPassword,
    confirmPassword,
  })
  .refine(...passwordsMatch);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password: newPassword, confirmPassword })
  .refine(...passwordsMatch);

// Settings page

export const profileSchema = z.object({ name });

// `password` is the new password, so the sign-up rules and match check apply
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: newPassword,
    confirmPassword,
  })
  .refine(...passwordsMatch);

export const deleteAccountSchema = z.object({
  deletePassword: z.string().min(1, "Password is required"),
});
