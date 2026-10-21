import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import RouteTitleHandler from "./components/RouteTitle/RouteTitleHandler";
import Archive from "./pages/Archive/Archive";
import Trash from "./pages/Trash/Trash";
import NotFound from "./pages/NotFound/NotFound";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Settings from "./pages/Settings/Settings";
import SharedNote from "./pages/SharedNote/SharedNote";
import AuthCallback from "./pages/AuthCallback/AuthCallback";
import AppLayout from "./components/layout/AppLayout";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <RouteTitleHandler />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Google sends the browser back here after signing in */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* a shared note's public link; works signed in or out */}
          <Route path="/s/:shareId" element={<SharedNote />} />
          {/* any other URL (e.g. /index.html or a typo) */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
