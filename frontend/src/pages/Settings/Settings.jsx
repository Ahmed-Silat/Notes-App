import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Download, Loader2, Lock, Mail, Trash2, User } from "lucide-react";
import {
  changePassword,
  deleteAccount,
  updateName,
} from "@/Service/AuthService";
import { exportAllNotesPdf } from "@/lib/exportNotes";
import { getErrorMessage } from "@/lib/helper";
import { saveStateNow } from "@/redux/store";
import { signoutSuccess, updateUserSuccess } from "@/redux/user/userSlice";
import {
  changePasswordSchema,
  deleteAccountSchema,
  NAME_MAX_LENGTH,
  profileSchema,
} from "@/schemas/auth.schema";
import FormField from "@/components/Input/FormField";
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

// Asks for the password before the account is deleted for good.
const DeleteAccountDialog = ({ open, onOpenChange }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { deletePassword: "" },
  });

  const onSubmit = async ({ deletePassword }) => {
    try {
      await deleteAccount(deletePassword);
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
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // stay open while the request is in flight
        if (isSubmitting) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <AlertDialogContent
        // start in the password field rather than on Cancel
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setFocus("deletePassword");
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="contents">
          <fieldset disabled={isSubmitting} className="contents">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Your account and all your notes will be permanently deleted.
                This can&apos;t be undone. Enter your password to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <FormField
              {...register("deletePassword")}
              label="Password"
              type="password"
              autoComplete="current-password"
              icon={Lock}
              error={errors.deletePassword?.message}
            />

            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <Button type="submit" variant="destructive">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Delete account
              </Button>
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

const DangerZone = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      <DeleteAccountDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </Card>
  );
};

const Settings = () => (
  <div className="mx-auto max-w-2xl">
    <div className="mb-8 space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Manage your profile, password, notes and account.
      </p>
    </div>

    <div className="space-y-6">
      <ProfileSection />
      <PasswordSection />
      <ExportSection />
      <DangerZone />
    </div>
  </div>
);

export default Settings;
