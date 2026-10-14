import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // port 465 uses TLS from the start; 587 upgrades with STARTTLS
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    if (env.NODE_ENV === "production") {
      // never print links that grant account access into production logs
      console.error(`Email not sent to ${to}: SMTP is not configured`);
      return;
    }
    console.info(`\n[email - SMTP not configured, not sent]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }

  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, text, html });
};
