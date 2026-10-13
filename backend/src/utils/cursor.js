import { z } from "zod";

// A cursor marks the last note of a page by its sort keys, so the next page
// starts right after it even if notes were added or deleted in between.
const cursorSchema = z.object({
  isPinned: z.boolean(),
  createdAt: z.iso.datetime(),
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const encodeCursor = (note) =>
  Buffer.from(
    JSON.stringify({
      isPinned: note.isPinned,
      createdAt: note.createdAt.toISOString(),
      id: String(note._id),
    })
  ).toString("base64url");

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
