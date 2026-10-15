import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/helper";

// 24 fills whole rows in the 1-, 2- and 3-column layouts
export const NOTES_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100; // the API's upper limit per request

// A paged list of notes. `fetchPage({ limit, cursor })` requests one page from
// the API; give it a stable identity (useCallback) that changes only when the
// list itself changes (e.g. a new search), which reloads it from the start.
export const useNotesList = (fetchPage) => {
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadedCount = useRef(0);
  const latestRequest = useRef(0);

  // (Re)loads the list from the start. With showLoading (a new list, e.g. a
  // new search) it starts with one page and shows the loading state; a quiet
  // refresh after a change (pin, save, delete) reloads as many notes as were
  // already shown, so the list doesn't collapse back to the first page.
  const reload = useCallback(
    async ({ showLoading = false } = {}) => {
      const requestId = ++latestRequest.current;
      if (showLoading) setIsReloading(true);
      const wanted = showLoading
        ? NOTES_PAGE_SIZE
        : Math.max(NOTES_PAGE_SIZE, loadedCount.current);

      try {
        const loaded = [];
        let cursor;
        let count = 0;

        do {
          const res = await fetchPage({
            limit: Math.min(wanted - loaded.length, MAX_PAGE_SIZE),
            cursor,
          });

          // ignore responses that arrive after a newer request was made
          if (requestId !== latestRequest.current) return;

          if (!res.data.success) {
            toast.error(res.data.message);
            return;
          }

          loaded.push(...res.data.notes);
          cursor = res.data.nextCursor;
          count = res.data.total;
        } while (cursor && loaded.length < wanted);

        loadedCount.current = loaded.length;
        setNotes(loaded);
        setNextCursor(cursor ?? null);
        setTotal(count);
      } catch (error) {
        if (requestId === latestRequest.current) {
          toast.error(getErrorMessage(error, "Could not load your notes"));
        }
      } finally {
        if (requestId === latestRequest.current) {
          setIsLoading(false);
          setIsReloading(false);
        }
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    reload({ showLoading: true });
  }, [reload]);

  // Appends the next page under the notes already shown.
  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    // a newer list request (new search, refresh) makes this page outdated
    const requestId = latestRequest.current;
    setIsLoadingMore(true);

    try {
      const res = await fetchPage({ limit: NOTES_PAGE_SIZE, cursor: nextCursor });
      if (requestId !== latestRequest.current) return;

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      setNotes((shown) => {
        const merged = [...shown, ...res.data.notes];
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

  return {
    notes,
    total,
    nextCursor,
    isLoading,
    isReloading,
    isLoadingMore,
    reload,
    loadMore,
  };
};
