import { ArrowLeft, FileQuestion } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

// Shown for any URL the app has no page for (the catch-all route).
const NotFound = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="flex min-h-svh flex-col p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Good Notes home">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileQuestion className="size-8" />
        </div>
        <p className="text-sm font-semibold tracking-widest text-brand uppercase">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-balance text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Check the address, or head back to safety.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to={currentUser ? "/" : "/login"}>
            <ArrowLeft />
            {currentUser ? "Back to my notes" : "Go to login"}
          </Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
