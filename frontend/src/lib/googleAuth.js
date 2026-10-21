// What to tell the user when Google sends them back with ?error=<code>
// (Better Auth's codes, plus Google's own "access_denied" for Cancel).
const GOOGLE_ERRORS = {
  access_denied: "Google sign-in was cancelled.",
  account_not_linked:
    "You already have an account with this email. Log in with your password, then connect Google in Settings.",
  email_does_not_match:
    "That Google account uses a different email address than your Good Notes account.",
  account_already_linked_to_different_user:
    "That Google account is already connected to another Good Notes account.",
};

export const getGoogleErrorMessage = (
  code,
  fallback = "Couldn't sign in with Google. Please try again."
) => GOOGLE_ERRORS[code] ?? fallback;
