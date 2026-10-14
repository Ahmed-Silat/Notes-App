import { saveStateNow } from "@/redux/store";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, TriangleAlert } from "lucide-react";
import { resetPassword } from "@/Service/AuthService";
import { getErrorMessage } from "@/lib/helper";
import { signoutSuccess } from "@/redux/user/userSlice";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/layout/AuthLayout";
import FormField from "@/components/Input/FormField";
import { Button } from "@/components/ui/button";

// Reached from the emailed link: the backend checks the link and sends the
// user here with ?token=..., or with ?error=INVALID_TOKEN if it has expired.
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const linkIsInvalid = !token || searchParams.get("error");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ password }) => {
    try {
      await resetPassword(token, password);
      // the reset logged this account out everywhere, including here
      dispatch(signoutSuccess());
      await saveStateNow();
      toast.success("Password updated. Log in with your new password.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (linkIsInvalid) {
    return (
      <AuthLayout
        title="Link expired"
        description="This reset link is invalid or has expired."
        redirectIfSignedIn={false}
      >
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <TriangleAlert className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            Reset links work once and expire after 1 hour. Request a new one to
            continue.
          </p>
          <Button asChild>
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      description="Enter a new password for your account."
      redirectIfSignedIn={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* disables every input and button while the request is in flight */}
        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-5">
          <FormField
            {...register("password")}
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            icon={Lock}
            error={errors.password?.message}
          />

          <FormField
            {...register("confirmPassword")}
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            icon={Lock}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Reset password
          </Button>
        </fieldset>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
