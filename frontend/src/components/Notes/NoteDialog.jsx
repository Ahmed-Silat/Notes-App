import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddEditNotes from "./AddEditNotes";
import ViewNote from "./ViewNote";

// The note dialog: view a note, or add / edit one. Its state comes from
// useNoteDialog; `onSaved` refreshes the list after a save.
const NoteDialog = ({ dialog, openEdit, close, onSaved }) => (
  <Dialog open={dialog.isShown} onOpenChange={(open) => !open && close()}>
    <DialogContent
      className="max-h-[92svh] overflow-y-auto sm:max-w-2xl"
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
          onEdit={() => {
            openEdit(dialog.data);
            // the Edit button is gone after the switch; move focus to the form
            requestAnimationFrame(() =>
              document.getElementById("note-title")?.focus()
            );
          }}
        />
      ) : (
        <AddEditNotes
          key={dialog.data?._id ?? "new"}
          onClose={close}
          noteData={dialog.data}
          type={dialog.type}
          getAllNotes={onSaved}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default NoteDialog;
