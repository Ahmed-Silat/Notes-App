import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Confirmation before a note in Trash is deleted for good. `title`,
// `description` and `confirmLabel` replace the texts for other permanent
// deletes, e.g. emptying the trash.
const DeleteNoteDialog = ({
  note,
  open,
  onOpenChange,
  onConfirm,
  title = "Delete this note forever?",
  description = `“${note?.title}” will be permanently deleted. This can't be undone.`,
  confirmLabel = "Delete forever",
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteNoteDialog;
