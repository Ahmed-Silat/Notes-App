import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronDown,
  Loader2,
  NotebookPen,
  Plus,
  SearchX,
} from "lucide-react";
import {
  deleteUserNotes,
  getUserSearchNotes,
  getUserAllNotes,
  updatePinnedNotes,
} from "@/Service/NotesService";
import { getErrorMessage, getGreeting } from "@/lib/helper";
import { useDebounce } from "@/hooks/useDebounce";
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

const SEARCH_DEBOUNCE_MS = 1000;
const SEARCH_PARAM = "search";
// 24 fills whole rows in the 1-, 2- and 3-column layouts
const NOTES_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100; // the API's upper limit per request

const fetchNotesPage = (query, page) =>
  query ? getUserSearchNotes(query, page) : getUserAllNotes(page);

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

const NotesSkeleton = ({ count = 6 }) => (
  <NotesGrid>
    {Array.from({ length: count }, (_, i) => (
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

  // The applied search lives in the URL (?search=...), so it survives a refresh
  // and can be shared; the input keeps its own state while the user types.
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedQuery = (searchParams.get(SEARCH_PARAM) ?? "").trim();
  const [searchQuery, setSearchQuery] = useState(appliedQuery);
  const syncedQuery = useRef(appliedQuery);
  const isOwnNavigation = useRef(false);
  const location = useLocation();

  const [allNotes, setAllNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadedCount = useRef(0);
  // note id -> label shown on that card while it is being pinned/unpinned/deleted
  const [busyNotes, setBusyNotes] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, note: null });
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const latestRequest = useRef(0);

  // (Re)loads the list from the start: the notes, or the search results when a
  // query is active. A new search starts with one page; a refresh after a
  // change (pin, save, delete) reloads as many notes as were already shown,
  // so the list doesn't collapse back to the first page.
  const getAllNotes = useCallback(
    async ({ showLoading = false } = {}) => {
      const requestId = ++latestRequest.current;
      if (showLoading) setIsSearching(true);
      const wanted = showLoading
        ? NOTES_PAGE_SIZE
        : Math.max(NOTES_PAGE_SIZE, loadedCount.current);

      try {
        const notes = [];
        let cursor;
        let count = 0;

        do {
          const res = await fetchNotesPage(appliedQuery, {
            limit: Math.min(wanted - notes.length, MAX_PAGE_SIZE),
            cursor,
          });

          // ignore responses that arrive after a newer request was made
          if (requestId !== latestRequest.current) return;

          if (!res.data.success) {
            toast.error(res.data.message);
            return;
          }

          notes.push(...res.data.notes);
          cursor = res.data.nextCursor;
          count = res.data.total;
        } while (cursor && notes.length < wanted);

        loadedCount.current = notes.length;
        setAllNotes(notes);
        setNextCursor(cursor ?? null);
        setTotal(count);
      } catch (error) {
        if (requestId === latestRequest.current) {
          toast.error(getErrorMessage(error, "Could not load your notes"));
        }
      } finally {
        if (requestId === latestRequest.current) {
          setIsLoading(false);
          setIsSearching(false);
        }
      }
    },
    [appliedQuery]
  );

  useEffect(() => {
    getAllNotes({ showLoading: true });
  }, [getAllNotes]);

  // Appends the next page under the notes already shown.
  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    // a newer list request (new search, refresh) makes this page outdated
    const requestId = latestRequest.current;
    setIsLoadingMore(true);

    try {
      const res = await fetchNotesPage(appliedQuery, {
        limit: NOTES_PAGE_SIZE,
        cursor: nextCursor,
      });
      if (requestId !== latestRequest.current) return;

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      setAllNotes((notes) => {
        const merged = [...notes, ...res.data.notes];
        loadedCount.current = merged.length;
        return merged;
      });
      setNextCursor(res.data.nextCursor);
      setTotal(res.data.total);
    } catch (error) {
      if (requestId === latestRequest.current) {
        toast.error(getErrorMessage(error, "Could not load more notes"));
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const updateSearchParam = useCallback(
    (query) => {
      syncedQuery.current = query;
      isOwnNavigation.current = true;
      // replace, so typing doesn't add a history entry per search
      setSearchParams(query ? { [SEARCH_PARAM]: query } : {}, { replace: true });
    },
    [setSearchParams]
  );

  const debouncedQuery = useDebounce(searchQuery.trim(), SEARCH_DEBOUNCE_MS);

  // input -> URL, once the user pauses typing
  useEffect(() => {
    // the debounced value lags behind the input; wait until it has caught up,
    // so a stale value can't overwrite a cleared search
    if (debouncedQuery !== searchQuery.trim()) return;
    if (debouncedQuery === syncedQuery.current) return;

    updateSearchParam(debouncedQuery);
  }, [debouncedQuery, searchQuery, updateSearchParam]);

  // URL -> input on any navigation we didn't make ourselves (e.g. the logo
  // link to "/"), even to the same URL, so it also drops a half-typed search
  useEffect(() => {
    if (isOwnNavigation.current) {
      isOwnNavigation.current = false;
      return;
    }
    syncedQuery.current = appliedQuery;
    setSearchQuery(appliedQuery);
  }, [location.key, appliedQuery]);

  // Shows a loader on one card until the refreshed list has arrived.
  const withBusyNote = async (noteId, label, action) => {
    setBusyNotes((busy) => ({ ...busy, [noteId]: label }));
    try {
      await action();
    } finally {
      setBusyNotes((busy) => {
        const rest = { ...busy };
        delete rest[noteId];
        return rest;
      });
    }
  };

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

    await withBusyNote(note._id, "Deleting...", async () => {
      try {
        const res = await deleteUserNotes(note._id);
        if (res.data.success === false) {
          toast.error(res.data.message);
          return;
        }
        await getAllNotes();
        toast.success("Note deleted");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const updateIsPinned = async (noteData) => {
    const label = noteData.isPinned ? "Unpinning..." : "Pinning...";

    await withBusyNote(noteData._id, label, async () => {
      try {
        const res = await updatePinnedNotes(noteData);
        if (!res.data.success) {
          toast.error(res.data.message);
          return;
        }
        await getAllNotes();
        toast.success(noteData.isPinned ? "Note unpinned" : "Note pinned");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const onClearSearch = () => {
    setSearchQuery("");
    updateSearchParam("");
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
        busyLabel={busyNotes[note._id]}
        onEdit={() => handleEdit(note)}
        onDelete={() => setDeleteDialog({ open: true, note })}
        onPinNote={() => updateIsPinned(note)}
      />
    ));

  const pinnedNotes = allNotes.filter((note) => note.isPinned);
  const otherNotes = allNotes.filter((note) => !note.isPinned);

  const renderNotes = () => {
    if (isLoading || isSearching) {
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
          {isLoading || isSearching ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "note" : "notes"}
            </p>
          )}
        </div>

        {/* search and "New note" stay unavailable until the first load finishes */}
        <div className="flex w-full gap-2 md:w-auto">
          {isLoading ? (
            <>
              <Skeleton className="h-10 flex-1 md:w-80" />
              <Skeleton className="h-10 w-9.5 sm:w-27" />
            </>
          ) : (
            <>
              <SearchBar
                className="flex-1 md:w-80"
                value={searchQuery}
                onChange={({ target }) => setSearchQuery(target.value)}
                onClearSearch={onClearSearch}
                // spin while waiting for the typing pause and while results load
                isSearching={isSearching || searchQuery.trim() !== appliedQuery}
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
            </>
          )}
        </div>
      </div>

      {renderNotes()}

      {/* Show more: appends the next page of notes or search results */}
      {!isLoading && !isSearching && nextCursor && (
        <div className="mt-4 space-y-8">
          {isLoadingMore && <NotesSkeleton count={3} />}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {allNotes.length} of {total} notes
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ChevronDown />
              )}
              {isLoadingMore ? "Loading..." : "Show more"}
            </Button>
          </div>
        </div>
      )}

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
