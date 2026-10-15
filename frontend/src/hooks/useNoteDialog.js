import { useState } from "react";

// Open/close state for <NoteDialog>: viewing, adding or editing a note.
export const useNoteDialog = () => {
  const [dialog, setDialog] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  return {
    dialog,
    openAdd: () => setDialog({ isShown: true, type: "add", data: null }),
    openView: (note) => setDialog({ isShown: true, type: "view", data: note }),
    openEdit: (note) => setDialog({ isShown: true, type: "edit", data: note }),
    // keeps type and data, so the content stays while the dialog animates out
    close: () => setDialog((current) => ({ ...current, isShown: false })),
  };
};
