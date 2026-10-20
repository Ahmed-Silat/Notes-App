// The orders the notes list can be sorted in; the values match NOTE_SORTS in
// backend/src/utils/noteSort.js. Pinned notes always stay on top.
export const NOTE_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "edited", label: "Recently edited" },
  { value: "title", label: "Title (A–Z)" },
];

export const DEFAULT_SORT = "newest";

// The sort named in the URL, or the default for a missing or unknown one.
export const parseSort = (value) =>
  NOTE_SORTS.some((sort) => sort.value === value) ? value : DEFAULT_SORT;
