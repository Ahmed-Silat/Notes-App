import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { emptyTrash, getUserTrashedNotes } from "@/Service/NotesService";
import { getErrorMessage } from "@/lib/helper";
import { useNoteActions } from "@/hooks/useNoteActions";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import { useNotesList } from "@/hooks/useNotesList";
import NoteCard from "@/components/Cards/NoteCard";
import EmptyState from "@/components/EmptyState/EmptyState";
import DeleteNoteDialog from "@/components/Notes/DeleteNoteDialog";
import NoteDialog from "@/components/Notes/NoteDialog";
import {
  NotesGrid,
  NotesSkeleton,
  ShowMoreNotes,
} from "@/components/Notes/NotesGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// matches TRASH_DAYS in backend/src/models/note.model.js
const TRASH_DAYS = 30;

const notesLabel = (count) => `${count} ${count === 1 ? "note" : "notes"}`;

// Deleted notes, most recently deleted first. They can be viewed, restored
// or deleted forever, and are deleted for good after TRASH_DAYS.
const Trash = () => {
  const {
    notes,
    total,
    nextCursor,
    isLoading,
    isLoadingMore,
    reload,
    loadMore,
  } = useNotesList(getUserTrashedNotes);

  const { busyNotes, restore, deleteForever } = useNoteActions(reload);
  const noteDialog = useNoteDialog();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, note: null });
  const [isEmptyDialogOpen, setIsEmptyDialogOpen] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  const confirmDelete = () => {
    setDeleteDialog((dialog) => ({ ...dialog, open: false }));
    deleteForever(deleteDialog.note);
  };

  const confirmEmpty = async () => {
    setIsEmptyDialogOpen(false);
    setIsEmptying(true);
    try {
      const res = await emptyTrash();
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      await reload();
      toast.success(`${notesLabel(res.data.deletedCount)} deleted forever`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsEmptying(false);
    }
  };

  const renderNotes = () => {
    if (isLoading) {
      return <NotesSkeleton />;
    }

    if (notes.length === 0) {
      return (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description={`Notes you delete wait here for ${TRASH_DAYS} days, in case you change your mind.`}
        />
      );
    }

    return (
      <NotesGrid>
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            title={note.title}
            date={note.deletedAt}
            datePrefix="Deleted"
            content={note.content}
            tags={note.tags}
            color={note.color}
            busyLabel={busyNotes[note._id]}
            onOpen={() => noteDialog.openView(note)}
            onRestore={() => restore(note)}
            onDelete={() => setDeleteDialog({ open: true, note })}
          />
        ))}
      </NotesGrid>
    );
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Trash</h1>
          {isLoading ? (
            <Skeleton className="h-5 w-64" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {notesLabel(total)} · deleted for good after {TRASH_DAYS} days
            </p>
          )}
        </div>

        {!isLoading && total > 0 && (
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isEmptying}
            onClick={() => setIsEmptyDialogOpen(true)}
          >
            {isEmptying ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {isEmptying ? "Emptying..." : "Empty trash"}
          </Button>
        )}
      </div>

      {renderNotes()}

      {!isLoading && nextCursor && (
        <ShowMoreNotes
          shown={notes.length}
          total={total}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      )}

      {/* no openEdit: notes in Trash open read-only */}
      <NoteDialog
        dialog={noteDialog.dialog}
        close={noteDialog.close}
        onSaved={reload}
      />

      <DeleteNoteDialog
        note={deleteDialog.note}
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((dialog) => ({ ...dialog, open }))
        }
        onConfirm={confirmDelete}
      />

      <DeleteNoteDialog
        open={isEmptyDialogOpen}
        onOpenChange={setIsEmptyDialogOpen}
        onConfirm={confirmEmpty}
        title="Empty trash?"
        description={`All ${notesLabel(total)} in Trash will be permanently deleted. This can't be undone.`}
        confirmLabel="Empty trash"
      />
    </>
  );
};

export default Trash;
