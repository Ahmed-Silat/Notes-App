// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { toast } from "sonner";
import { onSessionExpired } from "./lib/api";
import { signoutSuccess } from "./redux/user/userSlice";

// When the server rejects the session, sign out locally: the app then sends the
// user to the login page instead of leaving them on a page that can't load.
onSessionExpired(() => {
  if (!store.getState().user.currentUser) return false;

  store.dispatch(signoutSuccess());
  // the id stops several failing requests from stacking duplicate toasts
  toast.error("Your session has expired. Please log in again.", {
    id: "session-expired",
  });
  return true;
});

createRoot(document.getElementById("root")).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
    // its inline script never runs in a client-only app (index.html sets the
    // initial theme instead); marking it as data avoids React 19's warning
    scriptProps={{ type: "application/json" }}
  >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </ThemeProvider>
);
