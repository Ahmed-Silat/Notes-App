import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/helper";

// Runs `start` (e.g. signInWithGoogle), which sends the browser to Google.
// `isRedirecting` stays true until the page is gone, so the page can disable
// its buttons and links meanwhile; it resets if starting fails, or if the
// user comes back with the browser's Back button.
export const useGoogleRedirect = (start) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Back from Google can restore this page as it was, still "redirecting"
    const onPageShow = (event) => {
      if (event.persisted) setIsRedirecting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const redirect = async () => {
    setIsRedirecting(true);
    try {
      await start();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsRedirecting(false);
    }
  };

  return { isRedirecting, redirect };
};
