import { z } from "zod";
import { decodeCursor } from "../utils/cursor.js";

const title = z
  .string({ error: "Title is required" })
  .trim()
  .min(1, "Title is required");

const content = z
  .string({ error: "Content is required" })
  .trim()
  .min(1, "Content is required");

const tags = z.array(z.string().trim().min(1), {
  error: "Tags must be an array of strings",
});

const isPinned = z.boolean({ error: "isPinned must be true or false" });

export const noteIdParamDto = z.object({
  noteId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid note id"),
});

export const createNoteDto = z.object({
  title,
  content,
  tags: tags.default([]),
});

export const updateNoteDto = z
  .object({
    title: title.optional(),
    content: content.optional(),
    tags: tags.optional(),
    isPinned: isPinned.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    error: "No changes provided",
  });

export const updateNotePinnedDto = z.object({ isPinned });

export const updateNoteArchivedDto = z.object({
  isArchived: z.boolean({ error: "isArchived must be true or false" }),
});

export const NOTES_PAGE_SIZE = 24;
export const NOTES_PAGE_SIZE_MAX = 100;

const cursor = z.string().transform((value, ctx) => {
  const decoded = decodeCursor(value);
  if (!decoded) {
    ctx.addIssue({ code: "custom", message: "Invalid cursor" });
    return z.NEVER;
  }
  return decoded;
});

export const listNotesDto = z.object({
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int("limit must be a whole number")
    .min(1, "limit must be at least 1")
    .max(NOTES_PAGE_SIZE_MAX, `limit can be at most ${NOTES_PAGE_SIZE_MAX}`)
    .default(NOTES_PAGE_SIZE),
  cursor: cursor.optional(),
  // ?archived=true lists (or searches) the archived notes instead
  archived: z
    .stringbool({ error: "archived must be true or false" })
    .default(false),
  // ?tag=work lists (or searches) only the notes with that exact tag
  tag: z.string().trim().min(1, "tag can't be empty").optional(),
});

export const searchNoteDto = listNotesDto.extend({
  query: z
    .string({ error: "search query is required" })
    .trim()
    .min(1, "search query is required"),
});
