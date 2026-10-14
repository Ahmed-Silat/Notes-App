import { Pin } from "lucide-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const PreviewNote = ({ title, lines, tag, pinned, className }) => (
  <div
    className={cn(
      "absolute w-64 rounded-xl border border-white/10 bg-neutral-900 p-5 shadow-2xl",
      className
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <p className="font-semibold text-neutral-50">{title}</p>
      {pinned && <Pin className="size-4 shrink-0 fill-brand text-brand" />}
    </div>
    <div className="mt-3 space-y-2">
      {lines.map((width) => (
        <div
          key={width}
          className="h-2 rounded-full bg-neutral-700"
          style={{ width }}
        />
      ))}
    </div>
    <span className="mt-4 inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
      #{tag}
    </span>
  </div>
);

// Split-screen layout for the login, sign-up and password pages.
const AuthLayout = ({
  title,
  description,
  children,
  // the reset-password link must work even for someone logged in on this device
  redirectIfSignedIn = true,
}) => {
  const { currentUser } = useSelector((state) => state.user);

  if (currentUser && redirectIfSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-10 text-neutral-50 lg:flex">
        <Logo />

        <div className="relative mx-auto h-80 w-full max-w-md" aria-hidden="true">
          <PreviewNote
            title="Weekend plans"
            lines={["90%", "70%", "80%"]}
            tag="personal"
            className="top-4 left-0 -rotate-6"
          />
          <PreviewNote
            title="Project ideas"
            lines={["85%", "60%"]}
            tag="work"
            pinned
            className="top-20 right-0 rotate-3 border-brand/40"
          />
          <PreviewNote
            title="Reading list"
            lines={["75%", "95%", "50%"]}
            tag="books"
            className="bottom-0 left-12 -rotate-1"
          />
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-semibold tracking-tight">
            Capture ideas the moment they happen.
          </p>
          <p className="text-neutral-400">
            Write, tag and pin your notes — all in one calm place.
          </p>
        </div>
      </aside>

      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
