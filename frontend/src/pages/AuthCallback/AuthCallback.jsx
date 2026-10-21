import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getSignedInUser } from "@/Service/AuthService";
import { getGoogleErrorMessage } from "@/lib/googleAuth";
import { saveStateNow } from "@/redux/store";
import { signInSuccess } from "@/redux/user/userSlice";
import LoadingOverlay from "@/components/LoadingOverlay";

// a Google sign-in this soon after the account was created is a new user
const NEW_USER_MS = 5 * 60 * 1000;

// Where Google sends the browser back to (/auth/callback). Better Auth has set
// the session cookie by now, but Redux doesn't know the user yet: fetch them,
// save them like a normal login, and go to the notes. On ?error=<code> (e.g.
// cancelled, or an email account that hasn't connected Google), explain it on
// the login page.
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // React's development double-run would otherwise do all of this twice
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const failed = (code) => {
      toast.error(getGoogleErrorMessage(code), {
        // the "connect Google in Settings" advice takes a moment to read
        duration: code === "account_not_linked" ? 10000 : undefined,
      });
      navigate("/login", { replace: true });
    };

    const finish = async () => {
      const error = searchParams.get("error");
      if (error) return failed(error);

      try {
        const user = await getSignedInUser();
        if (!user) return failed();

        dispatch(signInSuccess({ success: true, message: "Login Successful", rest: user }));
        await saveStateNow();
        const isNew = Date.now() - new Date(user.createdAt) < NEW_USER_MS;
        toast.success(isNew ? "Welcome to Good Notes!" : "Welcome back!");
        navigate("/", { replace: true });
      } catch {
        failed();
      }
    };

    finish();
  }, [searchParams, dispatch, navigate]);

  return <LoadingOverlay label="Signing you in..." />;
};

export default AuthCallback;
