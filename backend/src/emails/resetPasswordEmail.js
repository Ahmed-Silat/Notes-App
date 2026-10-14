const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

// Usernames are stored lowercase: "muhammad ahmed" -> "Muhammad Ahmed"
const capitalizeWords = (value) =>
  String(value)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Subject, plain text and HTML for the "reset your password" email.
export const resetPasswordEmail = ({ name, url, expiresInMinutes }) => {
  const greeting = name?.trim() ? `Hi ${capitalizeWords(name)},` : "Hi,";
  const safeUrl = escapeHtml(url);

  return {
    subject: "Reset your Good Notes password",
    text: [
      greeting,
      "",
      "We received a request to reset your Good Notes password.",
      `Open this link to choose a new one (it expires in ${expiresInMinutes} minutes):`,
      "",
      url,
      "",
      "If you didn't ask for this, you can ignore this email. Your password won't change.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f1f1f">
        <h2 style="margin:0 0 16px">Reset your password</h2>
        <p>${escapeHtml(greeting)}</p>
        <p>We received a request to reset your Good Notes password. Click the button below to choose a new one.</p>
        <p style="margin:28px 0">
          <a href="${safeUrl}" style="background:#1f1f1f;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
        </p>
        <p style="color:#666;font-size:13px">This link expires in ${expiresInMinutes} minutes and can only be used once.</p>
        <p style="color:#666;font-size:13px">If you didn't ask for this, you can ignore this email. Your password won't change.</p>
        <p style="color:#999;font-size:12px;word-break:break-all">Button not working? Paste this link into your browser:<br>${safeUrl}</p>
      </div>
    `,
  };
};
