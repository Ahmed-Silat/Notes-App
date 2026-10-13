import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { NotebookPen, Plus, SearchX } from "lucide-react";
import {
  deleteUserNotes,
  getUserSearchNotes,
  getUserAllNotes,
  updatePinnedNotes,
} from "@/Service/NotesService";
import { getErrorMessage, getGreeting } from "@/lib/helper";
import NoteCard from "@/components/Cards/NoteCard";
import EmptyState from "@/components/EmptyState/EmptyState";
import SearchBar from "@/components/SearchBar/SearchBar";
import AddEditNotes from "./AddEditNotes";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const SEARCH_DEBOUNCE_MS = 300;

const NotesGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </div>
);

const NotesSection = ({ label, children }) => (
  <section className="space-y-3">
    <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {label}
    </h2>
    {children}
  </section>
);

const NotesSkeleton = () => (
  <NotesGrid>
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="space-y-3 rounded-xl border bg-card p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-6 h-3 w-24" />
      </div>
    ))}
  </NotesGrid>
);

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  const firstName = currentUser?.rest?.username?.split(" ")[0];

  const [allNotes, setAllNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, note: null });
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const latestRequest = useRef(0);

  // Loads all notes, or the search results when a query is active.
  const getAllNotes = useCallback(async () => {
    const requestId = ++latestRequest.current;

    try {
      const res = appliedQuery
        ? await getUserSearchNotes(appliedQuery)
        : await getUserAllNotes();

      // ignore responses that arrive after a newer request was made
      if (requestId !== latestRequest.current) return;

      if (res.data.success) {
        setAllNotes(res.data.notes);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      if (requestId === latestRequest.current) {
        toast.error(getErrorMessage(error, "Could not load your notes"));
      }
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }, [appliedQuery]);

  useEffect(() => {
    getAllNotes();
  }, [getAllNotes]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setAppliedQuery(searchQuery.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const closeModal = () =>
    setOpenAddEditModal((modal) => ({ ...modal, isShown: false }));

  const openAddModal = () =>
    setOpenAddEditModal({ isShown: true, type: "add", data: null });

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const deleteNote = async () => {
    const { note } = deleteDialog;
    setDeleteDialog((dialog) => ({ ...dialog, open: false }));

    try {
      const res = await deleteUserNotes(note._id);
      if (res.data.success === false) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Note deleted");
      getAllNotes();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const updateIsPinned = async (noteData) => {
    try {
      const res = await updatePinnedNotes(noteData);
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      toast.success(noteData.isPinned ? "Note unpinned" : "Note pinned");
      getAllNotes();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    setAppliedQuery("");
  };

  const renderCards = (notes) =>
    notes.map((note) => (
      <NoteCard
        key={note._id}
        title={note.title}
        date={note.createdAt}
        content={note.content}
        tags={note.tags}
        isPinned={note.isPinned}
        onEdit={() => handleEdit(note)}
        onDelete={() => setDeleteDialog({ open: true, note })}
        onPinNote={() => updateIsPinned(note)}
      />
    ));

  const pinnedNotes = allNotes.filter((note) => note.isPinned);
  const otherNotes = allNotes.filter((note) => !note.isPinned);

  const renderNotes = () => {
    if (isLoading) {
      return <NotesSkeleton />;
    }

    if (allNotes.length === 0) {
      return appliedQuery ? (
        <EmptyState
          icon={SearchX}
          title="No matching notes"
          description={`Nothing matches “${appliedQuery}”. Try a different word or clear the search.`}
          action={
            <Button variant="outline" onClick={onClearSearch}>
              Clear search
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="Ready to capture your ideas? Create your first note to start noting down your thoughts, inspiration and reminders."
          action={
            <Button onClick={openAddModal}>
              <Plus />
              Create your first note
            </Button>
          }
        />
      );
    }

    if (pinnedNotes.length === 0) {
      return <NotesGrid>{renderCards(otherNotes)}</NotesGrid>;
    }

    return (
      <div className="space-y-10">
        <NotesSection label="Pinned">
          <NotesGrid>{renderCards(pinnedNotes)}</NotesGrid>
        </NotesSection>
        {otherNotes.length > 0 && (
          <NotesSection label="Others">
            <NotesGrid>{renderCards(otherNotes)}</NotesGrid>
          </NotesSection>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {getGreeting()}
            {firstName && <span className="capitalize">, {firstName}</span>}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {appliedQuery ? "Search results" : "Your notes"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {allNotes.length} {allNotes.length === 1 ? "note" : "notes"}
            </p>
          )}
        </div>

        <div className="flex w-full gap-2 md:w-auto">
          <SearchBar
            className="flex-1 md:w-80"
            value={searchQuery}
            onChange={({ target }) => setSearchQuery(target.value)}
            onClearSearch={onClearSearch}
          />
          <Button
            size="lg"
            className="h-10"
            aria-label="New note"
            onClick={openAddModal}
          >
            <Plus />
            <span className="hidden sm:inline">New note</span>
          </Button>
        </div>
      </div>

      {renderNotes()}

      {/* Add / edit note */}
      <Dialog
        open={openAddEditModal.isShown}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent
          className="max-h-[92svh] overflow-y-auto sm:max-w-2xl"
          // focus the title without selecting it, so it is not overwritten by accident
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            document.getElementById("note-title")?.focus();
          }}
        >
          <AddEditNotes
            key={openAddEditModal.data?._id ?? "new"}
            onClose={closeModal}
            noteData={openAddEditModal.data}
            type={openAddEditModal.type}
            getAllNotes={getAllNotes}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((dialog) => ({ ...dialog, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteDialog.note?.title}” will be permanently deleted. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={deleteNote}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Home;
