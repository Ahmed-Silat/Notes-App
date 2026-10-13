import { z } from "zod";

// Mirrors backend/src/dtos/auth.dto.js so both sides enforce the same rules.

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Invalid email"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Full Name is required"),
    email,
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
    // check the match as soon as both password fields are filled in
    when: ({ value }) => Boolean(value?.password && value?.confirmPassword),
  });
