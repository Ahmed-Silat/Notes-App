import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { singnUp } from "@/Service/AuthService";
import { getErrorMessage } from "@/lib/helper";
import { signupSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/layout/AuthLayout";
import FormField from "@/components/Input/FormField";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      const res = await singnUp(values.name, values.email, values.password);

      if (res.data.success === false) {
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      reset();
      navigate("/login");
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
        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-5">
          <FormField
            {...fieldProps("name")}
            label="Full name"
            autoComplete="name"
            placeholder="John Doe"
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
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Create account
          </Button>
        </fieldset>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
