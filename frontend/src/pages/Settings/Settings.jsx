import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Download,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Trash2,
  User,
} from "lucide-react";
import {
  changePassword,
  confirmWithGoogleToDelete,
  connectGoogle,
  deleteAccount,
  getSignInMethods,
  updateName,
} from "@/Service/AuthService";
import { exportAllNotesPdf } from "@/lib/exportNotes";
import { getGoogleErrorMessage } from "@/lib/googleAuth";
import { getErrorMessage } from "@/lib/helper";
import { useGoogleRedirect } from "@/hooks/useGoogleRedirect";
import { saveStateNow } from "@/redux/store";
import { signoutSuccess, updateUserSuccess } from "@/redux/user/userSlice";
import {
  changePasswordSchema,
  deleteAccountSchema,
  NAME_MAX_LENGTH,
  profileSchema,
} from "@/schemas/auth.schema";
import FormField from "@/components/Input/FormField";
import { GoogleIcon } from "@/components/GoogleButton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const isWrongPassword = (error) => error?.code === "INVALID_PASSWORD";

// How the user can sign in ({ hasPassword, hasGoogle }); null while loading.
// If it can't be loaded, the page behaves as for a password account.
const useSignInMethods = () => {
  const [methods, setMethods] = useState(null);

  useEffect(() => {
    let ignore = false;
    getSignInMethods()
      .then((loaded) => !ignore && setMethods(loaded))
      .catch((error) => {
        if (ignore) return;
        toast.error(getErrorMessage(error, "Couldn't load your sign-in methods"));
        setMethods({ hasPassword: true, hasGoogle: false });
      });
    return () => {
      ignore = true;
    };
  }, []);

  return methods;
};

// Coming back to Settings from Google: after connecting it (?connected=google)
// or confirming an account deletion (?confirm-delete=google), with
// &error=<code> when it didn't work. Shows the result once, cleans up the URL
// and returns whether a deletion was just confirmed (with its setter).
const useGoogleReturn = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const confirmDelete = searchParams.get("confirm-delete");
    const error = searchParams.get("error");
    if (!connected && !confirmDelete && !error) return;

    // an id, so React's development double-run can't show it twice
    const id = "google-return-result";
    if (error) {
      const fallback = confirmDelete
        ? "Couldn't confirm with Google. Please try again."
        : "Couldn't connect Google. Please try again.";
      toast.error(getGoogleErrorMessage(error, fallback), { id });
    } else if (confirmDelete === "google") {
      setIsDeleteConfirmed(true);
    } else if (connected === "google") {
      toast.success("Google connected", {
        id,
        description: "You can now log in with Google too.",
      });
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  return [isDeleteConfirmed, setIsDeleteConfirmed];
};

const MethodRow = ({ icon, title, description, action }) => (
  <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
    <div className="flex flex-1 items-start gap-3">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5">
        {icon}
      </span>
      <div className="space-y-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {action && <div className="shrink-0 self-end sm:self-auto">{action}</div>}
  </div>
);

const SignInMethodsSection = ({ methods }) => {
  const google = useGoogleRedirect(connectGoogle);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in methods</CardTitle>
        <CardDescription>The ways you can log in to Good Notes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {!methods ? (
          <>
            <Skeleton className="h-19" />
            <Skeleton className="h-19" />
          </>
        ) : (
          <>
            <MethodRow
              icon={<KeyRound />}
              title="Password"
              description={
                methods.hasPassword
                  ? "You can log in with your email and password."
                  : "Not set. You can add one with Forgot password; you'll be logged out once it's set."
              }
              action={
                !methods.hasPassword && (
                  <Button asChild variant="outline">
                    <Link to="/forgot-password">Set a password</Link>
                  </Button>
                )
              }
            />
            <MethodRow
              icon={<GoogleIcon />}
              title="Google"
              description={
                methods.hasGoogle
                  ? "You can log in with your Google account."
                  : "Log in with the Google account that uses your email address."
              }
              action={
                methods.hasGoogle ? (
                  <Badge variant="secondary">Connected</Badge>
                ) : (
                  <Button
                    variant="outline"
                    disabled={google.isRedirecting}
                    onClick={google.redirect}
                  >
                    {google.isRedirecting && <Loader2 className="animate-spin" />}
                    {google.isRedirecting ? "Redirecting..." : "Connect Google"}
                  </Button>
                )
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const SubmitButton = ({ isSubmitting, disabled, children }) => (
  <Button
    type="submit"
    className="justify-self-end"
    disabled={isSubmitting || disabled}
  >
    {isSubmitting && <Loader2 className="animate-spin" />}
    {children}
  </Button>
);

const ProfileSection = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { username = "", email } = currentUser?.rest ?? {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: username },
    mode: "onTouched",
  });

  const onSubmit = async ({ name }) => {
    try {
      const user = await updateName(name);
      dispatch(updateUserSuccess({ username: user.username }));
      await saveStateNow();
      // the field now shows the name as saved, and Save is disabled again
      reset({ name: user.username });
      toast.success("Name updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your name is shown in the navbar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset disabled={isSubmitting} className="grid min-w-0 gap-5">
            <FormField
              {...register("name")}
              label="Name"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              icon={User}
              error={errors.name?.message}
            />
            <FormField
              name="email"
              label="Email"
              type="email"
              value={email ?? ""}
              icon={Mail}
              readOnly
              disabled
            />
            <SubmitButton isSubmitting={isSubmitting} disabled={!isDirty}>
              Save name
            </SubmitButton>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
};

const PasswordSection = () => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ currentPassword, password }) => {
    try {
      await changePassword(currentPassword, password);
      reset();
      toast.success("Password changed", {
        description: "You've been logged out on your other devices.",
      });
    } catch (error) {
      if (isWrongPassword(error)) {
        setError("currentPassword", { message: "Incorrect password" });
        setFocus("currentPassword");
        return;
      }
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Changing it logs you out on your other devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset disabled={isSubmitting} className="grid min-w-0 gap-5">
            <FormField
              {...register("currentPassword")}
              label="Current password"
              type="password"
              autoComplete="current-password"
              icon={Lock}
              error={errors.currentPassword?.message}
            />
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
              icon={Lock}
              error={errors.confirmPassword?.message}
            />
            <SubmitButton isSubmitting={isSubmitting}>
              Change password
            </SubmitButton>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
};

// Asks for the password before the account is deleted for good. Accounts
// without one (Google only) first confirm with Google instead: the browser
// goes through Google and comes back with `isGoogleConfirmed`, and the server
// then allows the deletion for 5 minutes.
const DeleteAccountDialog = ({
  open,
  onOpenChange,
  requirePassword,
  isGoogleConfirmed,
  onGoogleConfirmExpired,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const google = useGoogleRedirect(confirmWithGoogleToDelete);
  const needsGoogle = !requirePassword && !isGoogleConfirmed;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: requirePassword ? zodResolver(deleteAccountSchema) : undefined,
    defaultValues: { deletePassword: "" },
  });

  const onSubmit = async ({ deletePassword }) => {
    try {
      await deleteAccount(requirePassword ? deletePassword : undefined);
      toast.success("Your account has been deleted");
      dispatch(signoutSuccess());
      await saveStateNow();
      navigate("/login", { replace: true });
    } catch (error) {
      if (isWrongPassword(error)) {
        setError("deletePassword", { message: "Incorrect password" });
        setFocus("deletePassword");
        return;
      }
      if (error?.code === "GOOGLE_CONFIRMATION_REQUIRED") {
        toast.error("Your Google confirmation expired. Please confirm again.");
        onGoogleConfirmExpired();
        return;
      }
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // stay open while the request is in flight, or on the way to Google
        if (isSubmitting || google.isRedirecting) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <AlertDialogContent
        // start in the password field rather than on Cancel
        onOpenAutoFocus={(e) => {
          if (!requirePassword) return;
          e.preventDefault();
          setFocus("deletePassword");
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="contents">
          <fieldset disabled={isSubmitting} className="contents">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                {isGoogleConfirmed && !requirePassword && "Google confirmed it's you. "}
                Your account and all your notes will be permanently deleted.
                This can&apos;t be undone.
                {requirePassword && " Enter your password to confirm."}
                {needsGoogle && " To confirm it's you, continue with Google first."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {requirePassword && (
              <FormField
                {...register("deletePassword")}
                label="Password"
                type="password"
                autoComplete="current-password"
                icon={Lock}
                error={errors.deletePassword?.message}
              />
            )}

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={google.isRedirecting}>
                Cancel
              </AlertDialogCancel>
              {needsGoogle ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={google.isRedirecting}
                  onClick={google.redirect}
                >
                  {google.isRedirecting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  {google.isRedirecting ? "Redirecting..." : "Continue with Google"}
                </Button>
              ) : (
                <Button type="submit" variant="destructive">
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Delete account
                </Button>
              )}
            </AlertDialogFooter>
          </fieldset>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// usernames are stored lowercase; the cover shows "Ahmed Silat", as the navbar
const toDisplayName = (name) => name.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

const ExportSection = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isExporting, setIsExporting] = useState(false);

  const onExport = async () => {
    setIsExporting(true);
    try {
      const count = await exportAllNotesPdf(
        toDisplayName(currentUser?.rest?.username ?? "")
      );
      if (count === 0) {
        toast.info("You don't have any notes to export yet");
      } else {
        toast.success(`Exported ${count} ${count === 1 ? "note" : "notes"}`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not export your notes"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export</CardTitle>
        <CardDescription>
          Download all your notes, archived ones included, as one PDF: a list
          of your notes first, then the notes one after another.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="self-end"
          disabled={isExporting}
          onClick={onExport}
        >
          {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
          {isExporting ? "Exporting..." : "Export all notes"}
        </Button>
      </CardContent>
    </Card>
  );
};

// `isGoogleConfirmed`: back from confirming the deletion with Google, which
// reopens the dialog; closing it ends the confirmation.
const DangerZone = ({ requirePassword, isGoogleConfirmed, onGoogleConfirmEnd }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isGoogleConfirmed) setIsDialogOpen(true);
  }, [isGoogleConfirmed]);

  const onOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) onGoogleConfirmEnd();
  };

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Deleting your account removes it and all your notes for good.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          className="self-end"
          onClick={() => setIsDialogOpen(true)}
        >
          <Trash2 />
          Delete account
        </Button>
      </CardContent>
      <DeleteAccountDialog
        // a new form when the sign-in methods load, so it validates the right fields
        key={String(requirePassword)}
        open={isDialogOpen}
        onOpenChange={onOpenChange}
        requirePassword={requirePassword}
        isGoogleConfirmed={isGoogleConfirmed}
        onGoogleConfirmExpired={onGoogleConfirmEnd}
      />
    </Card>
  );
};

const Settings = () => {
  const methods = useSignInMethods();
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useGoogleReturn();
  // while loading, assume a password, as most accounts have one
  const hasPassword = methods?.hasPassword !== false;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, sign-in, notes and account.
        </p>
      </div>

      <div className="space-y-6">
        <ProfileSection />
        <SignInMethodsSection methods={methods} />
        {/* accounts that only use Google have no password to change */}
        {hasPassword && <PasswordSection />}
        <ExportSection />
        <DangerZone
          requirePassword={hasPassword}
          // wait for the sign-in methods, so the dialog opens in the right mode
          isGoogleConfirmed={isDeleteConfirmed && methods !== null}
          onGoogleConfirmEnd={() => setIsDeleteConfirmed(false)}
        />
      </div>
    </div>
  );
};

export default Settings;
