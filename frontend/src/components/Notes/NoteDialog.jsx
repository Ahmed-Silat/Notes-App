import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getNoteColor } from "@/lib/noteColors";
import { cn } from "@/lib/utils";
import AddEditNotes from "./AddEditNotes";
import ViewNote from "./ViewNote";

// The note dialog: view a note, or add / edit one. Its state comes from
// useNoteDialog; `onSaved` refreshes the list after a save. It takes the
// note's color, or while editing, the color picked in the form. Without
// `openEdit` (Trash) notes can only be viewed.
const NoteDialog = ({ dialog, openEdit, close, onSaved }) => {
  const [formColor, setFormColor] = useState("default");
  const color = dialog.type === "view" ? dialog.data?.color : formColor;

  return (
    <Dialog open={dialog.isShown} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={cn(
          "max-h-[92svh] overflow-y-auto sm:max-w-2xl",
          getNoteColor(color).surface
        )}
        // focus the title without selecting it, so it is not overwritten by accident
        onOpenAutoFocus={(e) => {
          if (dialog.type === "view") return;
          e.preventDefault();
          document.getElementById("note-title")?.focus();
        }}
      >
        {dialog.type === "view" ? (
          <ViewNote
            note={dialog.data}
            onEdit={
              openEdit &&
              (() => {
                openEdit(dialog.data);
                // the Edit button is gone after the switch; move focus to the form
                requestAnimationFrame(() =>
                  document.getElementById("note-title")?.focus()
                );
              })
            }
          />
        ) : (
          <AddEditNotes
            key={dialog.data?._id ?? "new"}
            onClose={close}
            noteData={dialog.data}
            type={dialog.type}
            getAllNotes={onSaved}
            onColorChange={setFormColor}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
