import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  // signs Better Auth's session cookies; generate with `openssl rand -base64 32`
  BETTER_AUTH_SECRET: z
    .string({ error: "BETTER_AUTH_SECRET is required" })
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  // public URL the auth routes are reached at (the frontend's domain when the
  // API goes through its /api rewrite); optional for local development
  BETTER_AUTH_URL: z.url().optional(),
  // Outgoing email (password reset links) over SMTP; works with Gmail (app
  // password), Resend, SendGrid, Brevo, ... Without SMTP_HOST, emails are
  // printed to the console in development instead of being sent.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("Good Notes <no-reply@goodnotes.app>"),
  // "Continue with Google": an OAuth client (type: Web application) from
  // Google Cloud Console. Without both, signing in with Google is turned off.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Optional comma-separated DNS servers, e.g. "1.1.1.1,8.8.8.8". Needed on
  // Windows with Node 24, which can pick 127.0.0.1 as its DNS server and then
  // fail the SRV lookup for "mongodb+srv://" URIs (querySrv ECONNREFUSED).
  DNS_SERVERS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(",")
        .map((server) => server.trim())
        .filter(Boolean)
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const CORS_ORIGINS = [
  "http://localhost:5173",
  "https://notes-app-frontend-abwb.onrender.com",
];
