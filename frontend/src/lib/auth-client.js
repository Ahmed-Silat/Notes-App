import { createAuthClient } from "better-auth/react";

// Same rule as lib/api.js: with VITE_API_BASE_URI empty, auth requests go to
// "/api/auth" on the frontend's own domain, keeping the session cookie
// first-party (which Safari requires).
const apiBase = import.meta.env.VITE_API_BASE_URI || window.location.origin;

export const authClient = createAuthClient({
  baseURL: `${apiBase}/api/auth`,
  fetchOptions: { credentials: "include" },
});
