import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Shown while a page's code downloads, the first time it's opened. Moving
// between pages keeps the current one on screen instead (React Router waits
// for the next page in a transition).
const PageLoader = ({ className }) => (
  <div
    role="status"
    className={cn("flex min-h-[50svh] items-center justify-center", className)}
  >
    <Loader2 className="size-6 animate-spin text-brand" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default PageLoader;
