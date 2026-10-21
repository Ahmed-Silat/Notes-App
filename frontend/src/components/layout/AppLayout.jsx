import { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageLoader from "@/components/PageLoader";
import BackToTop from "@/components/BackToTop";

// Shell for the signed-in pages; sends signed-out users to the login page.
const AppLayout = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-svh">
      {/* inert: nothing behind the overlay can be clicked, focused or typed into */}
      <div inert={isLoggingOut} aria-busy={isLoggingOut}>
        <Navbar onLoggingOutChange={setIsLoggingOut} />
        <main
          id="main-content"
          // focusable from code, so "Back to top" can move keyboard focus here
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-6 sm:py-10"
        >
          {/* the navbar stays while a page's code loads the first time */}
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
        <BackToTop focusTargetId="main-content" />
      </div>

      {isLoggingOut && <LoadingOverlay label="Logging out..." />}
    </div>
  );
};

export default AppLayout;
