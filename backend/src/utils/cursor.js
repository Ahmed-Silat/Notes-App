import { z } from "zod";
import { NOTE_SORTS, NOTE_SORT_NAMES } from "./noteSort.js";

// A cursor marks the last note of a page by its sort keys, so the next page
// starts right after it even if notes were added or deleted in between. It
// records which sort it belongs to, so it can't be reused with another one.
const isoDate = z.iso.datetime();

const cursorSchema = z
  .object({
    sort: z.enum(NOTE_SORT_NAMES),
    isPinned: z.boolean(),
    // the sort field's value: an ISO date, or the title for the title sort
    value: z.string(),
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  })
  .refine(
    ({ sort, value }) =>
      NOTE_SORTS[sort].field === "title" || isoDate.safeParse(value).success
  );

export const encodeCursor = (note, sort) => {
  const value = note[NOTE_SORTS[sort].field];

  return Buffer.from(
    JSON.stringify({
      sort,
      isPinned: note.isPinned,
      value: value instanceof Date ? value.toISOString() : value,
      id: String(note._id),
    })
  ).toString("base64url");
};

// Returns the decoded cursor, or null when it is malformed or tampered with.
export const decodeCursor = (value) => {
  try {
    const json = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    const result = cursorSchema.safeParse(json);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
