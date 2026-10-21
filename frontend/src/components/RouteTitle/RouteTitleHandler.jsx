import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteTitleHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    let title = "Notes App";

    switch (path) {
      case "/":
        title = "Home | Notes App";
        break;
      case "/login":
        title = "Login | Notes App";
        break;
      case "/signup":
        title = "Sign Up | Notes App";
        break;
      case "/forgot-password":
        title = "Forgot Password | Notes App";
        break;
      case "/reset-password":
        title = "Reset Password | Notes App";
        break;
      case "/auth/callback":
        title = "Signing In | Notes App";
        break;
      case "/archive":
        title = "Archive | Notes App";
        break;
      case "/trash":
        title = "Trash | Notes App";
        break;
      case "/settings":
        title = "Settings | Notes App";
        break;
      // /s/<id> is a shared note (its page shows the note's title once
      // loaded); every other path renders the NotFound page
      default:
        title = path.startsWith("/s/")
          ? "Shared Note | Notes App"
          : "Page Not Found | Notes App";
    }

    document.title = title;
  }, [location.pathname]);

  return null;
};

export default RouteTitleHandler;
