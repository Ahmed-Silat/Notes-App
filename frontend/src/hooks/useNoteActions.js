import { useState } from "react";
import { toast } from "sonner";
import {
  deleteUserNotes,
  updateArchivedNotes,
  updatePinnedNotes,
} from "@/Service/NotesService";
import { getErrorMessage } from "@/lib/helper";

// The per-card note actions (delete, pin, archive). `reload` refreshes the
// list; each card shows a loader until the refreshed list has arrived.
export const useNoteActions = (reload) => {
  // note id -> label shown on that card while it is being changed
  const [busyNotes, setBusyNotes] = useState({});

  const runAction = async (note, busyLabel, request, onSuccess) => {
    setBusyNotes((busy) => ({ ...busy, [note._id]: busyLabel }));

    try {
      const res = await request();
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      await reload();
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyNotes((busy) => {
        const rest = { ...busy };
        delete rest[note._id];
        return rest;
      });
    }
  };

  const deleteNote = (note) =>
    runAction(
      note,
      "Deleting...",
      () => deleteUserNotes(note._id),
      () => toast.success("Note deleted")
    );

  const togglePinned = (note) =>
    runAction(
      note,
      note.isPinned ? "Unpinning..." : "Pinning...",
      () => updatePinnedNotes(note),
      () => toast.success(note.isPinned ? "Note unpinned" : "Note pinned")
    );

  // The note leaves the list it is shown in, so the toast offers an undo.
  const toggleArchived = (note, { undoable = true } = {}) =>
    runAction(
      note,
      note.isArchived ? "Unarchiving..." : "Archiving...",
      () => updateArchivedNotes(note),
      () =>
        toast.success(note.isArchived ? "Note unarchived" : "Note archived", {
          ...(undoable && {
            action: {
              label: "Undo",
              onClick: () =>
                toggleArchived(
                  { ...note, isArchived: !note.isArchived },
                  { undoable: false }
                ),
            },
          }),
        })
    );

  return { busyNotes, deleteNote, togglePinned, toggleArchived };
};
