import * as noteRepository from "../repositories/note.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { encodeCursor } from "../utils/cursor.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getOwnedNote = async (userId, noteId) => {
  const note = await noteRepository.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (note.userId !== userId) {
    // 403, not 401: the user is logged in, just not allowed to touch this note
    throw new ApiError(403, "You can only update your own note!");
  }

  return note;
};

export const createNote = (userId, { title, content, tags }) =>
  noteRepository.create({ title, content, tags, userId });

export const updateNote = async (userId, noteId, changes) => {
  const note = await getOwnedNote(userId, noteId);

  for (const [key, value] of Object.entries(changes)) {
    if (value !== undefined) note[key] = value;
  }
  // as in updateNotePinned: a pinned note can't stay archived
  if (changes.isPinned) note.isArchived = false;

  return noteRepository.save(note);
};

export const updateNotePinned = async (userId, noteId, isPinned) => {
  const note = await getOwnedNote(userId, noteId);

  note.isPinned = isPinned;
  // pinning an archived note brings it back to the main list
  if (isPinned) note.isArchived = false;

  return noteRepository.save(note);
};

export const updateNoteArchived = async (userId, noteId, isArchived) => {
  const note = await getOwnedNote(userId, noteId);

  note.isArchived = isArchived;
  // archived notes aren't pinned (the Archive page has no pinned section)
  if (isArchived) note.isPinned = false;

  return noteRepository.save(note);
};

const getPage = async (userId, { search, archived, tag, cursor, limit }) => {
  const [notes, total] = await Promise.all([
    noteRepository.findPageByUser(userId, {
      search,
      archived,
      tag,
      cursor,
      limit,
    }),
    noteRepository.countByUser(userId, { search, archived, tag }),
  ]);

  const hasMore = notes.length > limit;
  const page = hasMore ? notes.slice(0, limit) : notes;

  return {
    notes: page,
    total,
    nextCursor: hasMore ? encodeCursor(page.at(-1)) : null,
  };
};

export const getNotes = (userId, { archived, tag, cursor, limit }) =>
  getPage(userId, { archived, tag, cursor, limit });

export const deleteNote = async (userId, noteId) => {
  const note = await noteRepository.findByIdAndUser(noteId, userId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  await noteRepository.deleteById(noteId);
};

// "note  description" matches "Note Description": the words must appear in
// order, with any amount of whitespace between them.
const buildSearchRegex = (query) =>
  new RegExp(query.trim().split(/\s+/).map(escapeRegex).join("\\s+"), "i");

export const searchNotes = (userId, query, { archived, tag, cursor, limit }) =>
  getPage(userId, {
    search: buildSearchRegex(query),
    archived,
    tag,
    cursor,
    limit,
  });
