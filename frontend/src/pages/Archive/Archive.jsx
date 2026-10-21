import { useState } from "react";
import { Archive as ArchiveIcon } from "lucide-react";
import { getUserArchivedNotes } from "@/Service/NotesService";
import { useNoteActions } from "@/hooks/useNoteActions";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import { useNotesList } from "@/hooks/useNotesList";
import NoteCard from "@/components/Cards/NoteCard";
import EmptyState from "@/components/EmptyState/EmptyState";
import NoteDialog from "@/components/Notes/NoteDialog";
import ShareNoteDialog from "@/components/Notes/ShareNoteDialog";
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

  const { busyNotes, deleteNote, toggleArchived, changeColor } =
    useNoteActions(reload);
  const noteDialog = useNoteDialog();
  const [shareDialog, setShareDialog] = useState({ open: false, note: null });

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
            isShared={Boolean(note.shareId)}
            color={note.color}
            busyLabel={busyNotes[note._id]}
            onOpen={() => noteDialog.openView(note)}
            onEdit={() => noteDialog.openEdit(note)}
            onDelete={() => deleteNote(note)}
            onColorChange={(color) => changeColor(note, color)}
            onShare={() => setShareDialog({ open: true, note })}
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

      <ShareNoteDialog
        note={shareDialog.note}
        open={shareDialog.open}
        onOpenChange={(open) =>
          setShareDialog((dialog) => ({ ...dialog, open }))
        }
        onShareChange={(note) => {
          setShareDialog((dialog) => ({ ...dialog, note }));
          reload();
        }}
      />
    </>
  );
};

export default Archive;
