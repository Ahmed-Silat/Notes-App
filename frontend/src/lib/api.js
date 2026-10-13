import axios from "axios";

// Leave VITE_API_BASE_URI empty to call "/api" on the frontend's own domain
// (e.g. through a hosting rewrite to the backend). That keeps the login cookie
// first-party, which Safari requires; a cookie from another domain is blocked.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URI ?? ""}/api`,
  withCredentials: true,
});

let handleSessionExpired = () => false;

// Registers what to do when the login is gone (cookie missing or token
// expired). The handler returns true when it dealt with it, e.g. by signing out.
export const onSessionExpired = (handler) => {
  handleSessionExpired = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // a 401 from login/signup means wrong credentials, not an expired session
    const isAuthRequest = error.config?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && !isAuthRequest && handleSessionExpired()) {
      // the app is redirecting to login, so callers don't need to show this error
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);
