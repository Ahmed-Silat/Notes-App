import { NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

const Logo = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
        <NotebookPen className="size-4.5" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-semibold tracking-tight">Good Notes</span>
    </div>
  );
};

export default Logo;
