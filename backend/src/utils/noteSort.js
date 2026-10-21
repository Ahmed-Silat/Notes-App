// The orders the notes list can be sorted in. Pinned notes always come first,
// then the sort's field; _id (in the same direction) breaks ties, so the order
// is always the same and pages never overlap or skip notes. Each order has a
// matching index on the note model.
export const NOTE_SORTS = {
  newest: { field: "createdAt", order: -1 },
  oldest: { field: "createdAt", order: 1 },
  edited: { field: "editedAt", order: -1 },
  title: { field: "title", order: 1 },
  // Trash only, which always uses it: most recently deleted first
  deleted: { field: "deletedAt", order: -1 },
};

// every order, for cursors
export const NOTE_SORT_NAMES = Object.keys(NOTE_SORTS);

// the orders users can pick for their notes and the archive
export const LIST_SORT_NAMES = NOTE_SORT_NAMES.filter((name) => name !== "deleted");

// Titles sort ignoring case, with numbers in number order ("Note 2" before
// "Note 10"). The title index uses the same collation, so the query can use it.
export const TITLE_COLLATION = {
  locale: "en",
  strength: 2,
  numericOrdering: true,
};
