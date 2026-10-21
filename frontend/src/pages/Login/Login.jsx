import { saveStateNow } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { useDispatch } from "react-redux";
import { login, signInWithGoogle } from "@/Service/AuthService";
import { useGoogleRedirect } from "@/hooks/useGoogleRedirect";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "@/redux/user/userSlice";
import { getErrorMessage } from "@/lib/helper";
import { loginSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/layout/AuthLayout";
import FormField from "@/components/Input/FormField";
import GoogleButton, { OrDivider } from "@/components/GoogleButton";
import TextLink from "@/components/TextLink";
import { Button } from "@/components/ui/button";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const google = useGoogleRedirect(signInWithGoogle);
  // the form and links are disabled while logging in or going to Google
  const isBusy = isSubmitting || google.isRedirecting;

  const onSubmit = async (values) => {
    try {
      dispatch(signInStart());

      const res = await login(values.email, values.password);

      if (res.data.success === false) {
        toast.error(res.data.message);
        dispatch(signInFailure(res.data.message));
        return;
      }

      toast.success("Welcome back!");
      dispatch(signInSuccess(res.data));
      await saveStateNow();
      navigate("/");
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      dispatch(signInFailure(message));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your account to pick up where you left off."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* disables every input and button while the request is in flight */}
        <fieldset disabled={isBusy} className="grid min-w-0 gap-5">
          <FormField
            {...register("email")}
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
          />

          <FormField
            {...register("password")}
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={Lock}
            error={errors.password?.message}
          />

          <TextLink
            to="/forgot-password"
            disabled={isBusy}
            className="-mt-3 justify-self-end text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </TextLink>

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={isBusy}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Log in
          </Button>
        </fieldset>
      </form>

      <OrDivider />
      <GoogleButton
        isRedirecting={google.isRedirecting}
        disabled={isSubmitting}
        onClick={google.redirect}
      />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <TextLink
          to="/signup"
          disabled={isBusy}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up
        </TextLink>
      </p>
    </AuthLayout>
  );
};

export default Login;
