import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 400;

// Floating button that appears once the page is scrolled down and takes the
// user back to the top. `focusTargetId` gets keyboard focus afterwards, so
// focus doesn't get lost when the button hides.
const BackToTop = ({ focusTargetId }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsVisible(window.scrollY > SHOW_AFTER_PX);
    };
    // at most one check per animation frame while scrolling
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    document.getElementById(focusTargetId)?.focus({ preventScroll: true });
  };

  return (
    <div
      // hidden: not clickable, not focusable, not announced
      inert={!isVisible}
      className={cn(
        "fixed right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 transition-all duration-300 ease-out motion-reduce:transition-none sm:right-6",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-lg"
            aria-label="Back to top"
            onClick={scrollToTop}
            className="rounded-full shadow-lg"
          >
            <ArrowUp />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Back to top</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default BackToTop;
