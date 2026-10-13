import { z } from "zod";

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

export const searchNoteDto = z.object({
  query: z
    .string({ error: "search query is required" })
    .trim()
    .min(1, "search query is required"),
});
