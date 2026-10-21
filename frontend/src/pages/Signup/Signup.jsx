import { saveStateNow } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess } from "@/redux/user/userSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { signInWithGoogle, singnUp } from "@/Service/AuthService";
import { useGoogleRedirect } from "@/hooks/useGoogleRedirect";
import { getErrorMessage } from "@/lib/helper";
import { NAME_MAX_LENGTH, signupSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/layout/AuthLayout";
import FormField from "@/components/Input/FormField";
import GoogleButton, { OrDivider } from "@/components/GoogleButton";
import TextLink from "@/components/TextLink";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const google = useGoogleRedirect(signInWithGoogle);
  // the form and links are disabled while signing up or going to Google
  const isBusy = isSubmitting || google.isRedirecting;

  const onSubmit = async (values) => {
    try {
      const res = await singnUp(values.name, values.email, values.password);

      if (res.data.success === false) {
        toast.error(res.data.message);
        return;
      }

      // signing up also logged the user in, so go straight to their notes
      dispatch(signInSuccess(res.data));
      await saveStateNow();
      toast.success("Welcome to Good Notes!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const fieldProps = (name) => ({
    ...register(name),
    error: errors[name]?.message,
  });

  return (
    <AuthLayout
      title="Create an account"
      description="Start capturing your ideas in less than a minute."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* disables every input and button while the request is in flight */}
        <fieldset disabled={isBusy} className="grid min-w-0 gap-5">
          <FormField
            {...fieldProps("name")}
            label="Full name"
            autoComplete="name"
            placeholder="John Doe"
            maxLength={NAME_MAX_LENGTH}
            icon={User}
          />

          <FormField
            {...fieldProps("email")}
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
          />

          <FormField
            {...fieldProps("password")}
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            icon={Lock}
          />

          <FormField
            {...fieldProps("confirmPassword")}
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            icon={Lock}
          />

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={isBusy}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Create account
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
        Already have an account?{" "}
        <TextLink
          to="/login"
          disabled={isBusy}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </TextLink>
      </p>
    </AuthLayout>
  );
};

export default Signup;
