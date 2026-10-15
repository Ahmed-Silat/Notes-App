import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import { NotebookPen, Plus, SearchX } from "lucide-react";
import { getUserSearchNotes, getUserAllNotes } from "@/Service/NotesService";
import { getGreeting } from "@/lib/helper";
import { useDebounce } from "@/hooks/useDebounce";
import { useNoteActions } from "@/hooks/useNoteActions";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import { useNotesList } from "@/hooks/useNotesList";
import NoteCard from "@/components/Cards/NoteCard";
import EmptyState from "@/components/EmptyState/EmptyState";
import SearchBar from "@/components/SearchBar/SearchBar";
import DeleteNoteDialog from "@/components/Notes/DeleteNoteDialog";
import NoteDialog from "@/components/Notes/NoteDialog";
import {
  NotesGrid,
  NotesSkeleton,
  ShowMoreNotes,
} from "@/components/Notes/NotesGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SEARCH_DEBOUNCE_MS = 1000;
const SEARCH_PARAM = "search";

const NotesSection = ({ label, children }) => (
  <section className="space-y-3">
    <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {label}
    </h2>
    {children}
  </section>
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

  // The notes, or the search results when a query is active; a new query
  // reloads the list from the start.
  const fetchPage = useCallback(
    (page) =>
      appliedQuery
        ? getUserSearchNotes(appliedQuery, page)
        : getUserAllNotes(page),
    [appliedQuery]
  );
  const {
    notes: allNotes,
    total,
    nextCursor,
    isLoading,
    isReloading: isSearching,
    isLoadingMore,
    reload: getAllNotes,
    loadMore,
  } = useNotesList(fetchPage);

  const { busyNotes, deleteNote, togglePinned, toggleArchived } =
    useNoteActions(getAllNotes);
  const noteDialog = useNoteDialog();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, note: null });

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

  const confirmDelete = () => {
    setDeleteDialog((dialog) => ({ ...dialog, open: false }));
    deleteNote(deleteDialog.note);
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
        onOpen={() => noteDialog.openView(note)}
        onEdit={() => noteDialog.openEdit(note)}
        onDelete={() => setDeleteDialog({ open: true, note })}
        onPinNote={() => togglePinned(note)}
        onArchive={() => toggleArchived(note)}
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
            <Button onClick={noteDialog.openAdd}>
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
                onClick={noteDialog.openAdd}
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
        <ShowMoreNotes
          shown={allNotes.length}
          total={total}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      )}

      <NoteDialog
        dialog={noteDialog.dialog}
        openEdit={noteDialog.openEdit}
        close={noteDialog.close}
        onSaved={getAllNotes}
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

export default Home;
