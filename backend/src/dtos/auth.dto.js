import { z } from "zod";

const email = z
  .string({ error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Invalid email"));

export const signupDto = z.object({
  username: z
    .string({ error: "Username is required" })
    .trim()
    .min(1, "Username is required"),
  email,
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export const signinDto = z.object({
  email,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});
