import { Loader2 } from "lucide-react";

// Full-screen blocking loader, e.g. while the user is being logged out.
const LoadingOverlay = ({ label }) => {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm animate-in fade-in-0"
    >
      <Loader2 className="size-8 animate-spin text-brand" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};

export default LoadingOverlay;
