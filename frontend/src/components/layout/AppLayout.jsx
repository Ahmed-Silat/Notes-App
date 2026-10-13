import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Shell for the signed-in pages; sends signed-out users to the login page.
const AppLayout = () => {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-svh">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
