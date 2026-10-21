import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteTitleHandler from "./components/RouteTitle/RouteTitleHandler";
import AppLayout from "./components/layout/AppLayout";
import PageLoader from "./components/PageLoader";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

// Each page is its own download, fetched the first time it's opened, so the
// login page doesn't load the notes pages' code (and the reverse).
const Home = lazy(() => import("./pages/Home/Home"));
const Archive = lazy(() => import("./pages/Archive/Archive"));
const Trash = lazy(() => import("./pages/Trash/Trash"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Login = lazy(() => import("./pages/Login/Login"));
const Signup = lazy(() => import("./pages/Signup/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback/AuthCallback"));
const SharedNote = lazy(() => import("./pages/SharedNote/SharedNote"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <RouteTitleHandler />
        {/* the pages outside AppLayout; AppLayout has its own, under the navbar */}
        <Suspense fallback={<PageLoader className="min-h-svh" />}>
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
        </Suspense>

        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
