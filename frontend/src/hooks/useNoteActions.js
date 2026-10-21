import { useState } from "react";
import { toast } from "sonner";
import {
  deleteNoteForever,
  deleteUserNotes,
  restoreNote,
  updateArchivedNotes,
  updateNoteColor,
  updatePinnedNotes,
} from "@/Service/NotesService";
import { getErrorMessage } from "@/lib/helper";

// The per-card note actions (delete, pin, archive, color, and restore and
// delete forever in Trash). `reload` refreshes the list; each card shows a
// loader until the refreshed list has arrived.
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

  // Moves the note to Trash, with an undo in the toast. Trash unpins and
  // unshares notes; undo pins it again, but a share link is gone for good.
  const deleteNote = (note) =>
    runAction(
      note,
      "Moving to Trash...",
      () => deleteUserNotes(note._id),
      () =>
        toast.success("Moved to Trash", {
          ...(note.shareId && { description: "Its share link was turned off." }),
          action: {
            label: "Undo",
            onClick: () =>
              runAction(
                note,
                "Restoring...",
                async () => {
                  const res = await restoreNote(note._id);
                  if (!res.data.success || !note.isPinned) return res;
                  return updatePinnedNotes(res.data.note);
                },
                () => toast.success("Note restored")
              ),
          },
        })
    );

  // Trash page: back to the notes or the archive, wherever it was
  const restore = (note) =>
    runAction(
      note,
      "Restoring...",
      () => restoreNote(note._id),
      () =>
        toast.success(
          note.isArchived ? "Note restored to Archive" : "Note restored"
        )
    );

  // Trash page, after a confirmation
  const deleteForever = (note) =>
    runAction(
      note,
      "Deleting...",
      () => deleteNoteForever(note._id),
      () => toast.success("Note deleted forever")
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

  // the card's new color is feedback enough, so no toast
  const changeColor = (note, color) => {
    if (color === (note.color ?? "default")) return;
    return runAction(
      note,
      "Saving color...",
      () => updateNoteColor(note._id, color),
      () => {}
    );
  };

  return {
    busyNotes,
    deleteNote,
    togglePinned,
    toggleArchived,
    changeColor,
    restore,
    deleteForever,
  };
};
