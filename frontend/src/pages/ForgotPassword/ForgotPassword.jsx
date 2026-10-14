import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/Service/AuthService";
import { getErrorMessage } from "@/lib/helper";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/layout/AuthLayout";
import FormField from "@/components/Input/FormField";
import { Button } from "@/components/ui/button";

const BackToLogin = () => (
  <p className="mt-8 text-center text-sm text-muted-foreground">
    <Link
      to="/login"
      className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-4" />
      Back to login
    </Link>
  </p>
);

const ForgotPassword = () => {
  const [sentTo, setSentTo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ email }) => {
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        description="If an account exists for that email, a reset link is on its way."
        redirectIfSignedIn={false}
      >
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <MailCheck className="size-6 text-brand" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent it to <span className="font-medium text-foreground">{sentTo}</span>.
            The link expires in 1 hour. Don&apos;t see it? Check your spam folder.
          </p>
          <Button variant="outline" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
        <BackToLogin />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email you signed up with and we'll send you a link to reset it."
      // also reachable from an expired reset link while logged in
      redirectIfSignedIn={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* disables every input and button while the request is in flight */}
        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-5">
          <FormField
            {...register("email")}
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
          />

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Send reset link
          </Button>
        </fieldset>
      </form>

      <BackToLogin />
    </AuthLayout>
  );
};

export default ForgotPassword;
