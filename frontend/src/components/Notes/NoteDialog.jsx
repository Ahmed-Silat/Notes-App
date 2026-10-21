import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getNoteColor } from "@/lib/noteColors";
import { cn } from "@/lib/utils";
import ViewNote from "./ViewNote";

// The rich-text editor is the biggest part of the app, so the add / edit form
// is a separate download: fetched in the background once a notes page is on
// screen, or when the dialog first needs it, whichever comes first.
const loadAddEditNotes = () => import("./AddEditNotes");
const AddEditNotes = lazy(loadAddEditNotes);

// Same layout as the form, in the note's color, while the form loads.
const AddEditNotesSkeleton = ({ isEdit, color, onColorChange }) => {
  useLayoutEffect(() => {
    onColorChange(color);
  }, [color, onColorChange]);

  return (
    <div className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEdit ? "Edit note" : "New note"}
        </DialogTitle>
        <DialogDescription>Loading the editor...</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-67 w-full" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
};

// The note dialog: view a note, or add / edit one. Its state comes from
// useNoteDialog; `onSaved` refreshes the list after a save. It takes the
// note's color, or while editing, the color picked in the form. Without
// `openEdit` (Trash) notes can only be viewed.
const NoteDialog = ({ dialog, openEdit, close, onSaved }) => {
  const [formColor, setFormColor] = useState("default");
  const color = dialog.type === "view" ? dialog.data?.color : formColor;

  useEffect(() => {
    // Trash only views notes, so it doesn't need the editor
    if (openEdit) loadAddEditNotes();
  }, [openEdit]);

  return (
    <Dialog open={dialog.isShown} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={cn(
          "max-h-[92svh] overflow-y-auto sm:max-w-2xl",
          getNoteColor(color).surface
        )}
        // The form focuses its title itself (AddEditNotes). This only runs when
        // it hasn't yet, i.e. while it loads: keep focus on the dialog meanwhile.
        onOpenAutoFocus={(e) => {
          if (dialog.type === "view") return;
          e.preventDefault();
          e.target.focus();
        }}
      >
        {dialog.type === "view" ? (
          <ViewNote
            note={dialog.data}
            onEdit={openEdit && (() => openEdit(dialog.data))}
          />
        ) : (
          <Suspense
            fallback={
              <AddEditNotesSkeleton
                isEdit={dialog.type === "edit"}
                color={dialog.data?.color ?? "default"}
                onColorChange={setFormColor}
              />
            }
          >
            <AddEditNotes
              key={dialog.data?._id ?? "new"}
              onClose={close}
              noteData={dialog.data}
              type={dialog.type}
              getAllNotes={onSaved}
              onColorChange={setFormColor}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
