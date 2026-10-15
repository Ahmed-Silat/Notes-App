import { useState } from "react";
import { Archive as ArchiveIcon } from "lucide-react";
import { getUserArchivedNotes } from "@/Service/NotesService";
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
import { Skeleton } from "@/components/ui/skeleton";

const Archive = () => {
  const {
    notes,
    total,
    nextCursor,
    isLoading,
    isLoadingMore,
    reload,
    loadMore,
  } = useNotesList(getUserArchivedNotes);

  const { busyNotes, deleteNote, toggleArchived } = useNoteActions(reload);
  const noteDialog = useNoteDialog();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, note: null });

  const confirmDelete = () => {
    setDeleteDialog((dialog) => ({ ...dialog, open: false }));
    deleteNote(deleteDialog.note);
  };

  const renderNotes = () => {
    if (isLoading) {
      return <NotesSkeleton />;
    }

    if (notes.length === 0) {
      return (
        <EmptyState
          icon={ArchiveIcon}
          title="No archived notes"
          description="Notes you archive leave your main list and wait here until you need them again."
        />
      );
    }

    return (
      <NotesGrid>
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            title={note.title}
            date={note.createdAt}
            content={note.content}
            tags={note.tags}
            isArchived
            busyLabel={busyNotes[note._id]}
            onOpen={() => noteDialog.openView(note)}
            onEdit={() => noteDialog.openEdit(note)}
            onDelete={() => setDeleteDialog({ open: true, note })}
            onArchive={() => toggleArchived(note)}
          />
        ))}
      </NotesGrid>
    );
  };

  return (
    <>
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Archive</h1>
        {isLoading ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {total} archived {total === 1 ? "note" : "notes"}
          </p>
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

      <NoteDialog
        dialog={noteDialog.dialog}
        openEdit={noteDialog.openEdit}
        close={noteDialog.close}
        onSaved={reload}
      />

      <DeleteNoteDialog
        note={deleteDialog.note}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((dialog) => ({ ...dialog, open }))}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default Archive;
