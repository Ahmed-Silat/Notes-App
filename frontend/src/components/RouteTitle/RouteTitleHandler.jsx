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
      default:
        title = "Notes App";
    }

    document.title = title;
  }, [location.pathname]);

  return null;
};

export default RouteTitleHandler;
