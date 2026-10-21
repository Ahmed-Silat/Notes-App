import crypto from "node:crypto";
import * as noteRepository from "../repositories/note.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { encodeCursor } from "../utils/cursor.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The user's note, if it's in Trash (`trashed`) or not. Notes in Trash can
// only be restored or deleted forever, so for anything else they count as
// not found.
const getOwnedNote = async (userId, noteId, { trashed = false } = {}) => {
  const note = await noteRepository.findById(noteId);

  if (!note || Boolean(note.deletedAt) !== trashed) {
    throw new ApiError(404, "Note not found");
  }

  if (note.userId !== userId) {
    // 403, not 401: the user is logged in, just not allowed to touch this note
    throw new ApiError(403, "You can only update your own note!");
  }

  return note;
};

// Content that was nothing but unsafe HTML is empty once cleaned.
const cleanContent = (content) => {
  const clean = sanitizeHtml(content).trim();
  if (!clean) throw new ApiError(400, "Content is required");
  return clean;
};

export const createNote = (userId, { title, content, tags, color }) =>
  noteRepository.create({
    title,
    content: cleanContent(content),
    tags,
    color,
    userId,
  });

export const updateNote = async (userId, noteId, changes) => {
  const note = await getOwnedNote(userId, noteId);

  if (changes.content !== undefined) {
    changes = { ...changes, content: cleanContent(changes.content) };
  }

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

export const updateNoteColor = async (userId, noteId, color) => {
  const note = await getOwnedNote(userId, noteId);

  note.color = color;

  return noteRepository.save(note);
};

// Turns on the note's public read-only link, or keeps the one it has, so
// sharing twice gives the same link.
export const shareNote = async (userId, noteId) => {
  const note = await getOwnedNote(userId, noteId);

  if (!note.shareId) {
    note.shareId = crypto.randomBytes(16).toString("base64url");
    await noteRepository.save(note);
  }

  return note;
};

// The link stops working right away. Sharing again later makes a new one.
export const stopSharingNote = async (userId, noteId) => {
  const note = await getOwnedNote(userId, noteId);

  if (note.shareId) {
    note.shareId = undefined;
    await noteRepository.save(note);
  }

  return note;
};

export const getSharedNote = async (shareId) => {
  const note = await noteRepository.findSharedByShareId(shareId);

  if (!note) {
    throw new ApiError(404, "This note isn't shared anymore");
  }

  return note;
};

const getPage = async (
  userId,
  { search, archived, trashed, tag, sort: requestedSort, cursor, limit },
) => {
  // Trash is always most recently deleted first
  const sort = trashed ? "deleted" : requestedSort;

  // a cursor only works with the sort it came from
  if (cursor && cursor.sort !== sort) {
    throw new ApiError(400, "Invalid cursor");
  }

  const [notes, total] = await Promise.all([
    noteRepository.findPageByUser(userId, {
      search,
      archived,
      trashed,
      tag,
      sort,
      cursor,
      limit,
    }),
    noteRepository.countByUser(userId, { search, archived, trashed, tag }),
  ]);

  const hasMore = notes.length > limit;
  const page = hasMore ? notes.slice(0, limit) : notes;

  return {
    notes: page,
    total,
    nextCursor: hasMore ? encodeCursor(page.at(-1), sort) : null,
  };
};

export const getNotes = (
  userId,
  { archived, trashed, tag, sort, cursor, limit },
) => getPage(userId, { archived, trashed, tag, sort, cursor, limit });

// Moves the note to Trash, where MongoDB deletes it for good after
// TRASH_DAYS (models/note.model.js) unless it's restored first.
export const deleteNote = async (userId, noteId) => {
  const note = await getOwnedNote(userId, noteId);

  note.deletedAt = new Date();
  // Trash has no pinned section, and a trashed note can't stay public
  note.isPinned = false;
  note.shareId = undefined;

  return noteRepository.save(note);
};

// Takes the note out of Trash, back to the notes or the archive, wherever it
// was. It comes back unpinned and unshared.
export const restoreNote = async (userId, noteId) => {
  const note = await getOwnedNote(userId, noteId, { trashed: true });

  note.deletedAt = null;

  return noteRepository.save(note);
};

// Only for notes already in Trash, so a note can't be lost in one step.
export const deleteNoteForever = async (userId, noteId) => {
  await getOwnedNote(userId, noteId, { trashed: true });
  await noteRepository.deleteById(noteId);
};

// Deletes every note in the user's Trash. Returns how many.
export const emptyTrash = (userId) => noteRepository.deleteTrashedByUser(userId);

// "note  description" matches "Note Description": the words must appear in
// order, with any amount of whitespace between them.
const buildSearchRegex = (query) =>
  new RegExp(query.trim().split(/\s+/).map(escapeRegex).join("\\s+"), "i");

export const searchNotes = (
  userId,
  query,
  { archived, trashed, tag, sort, cursor, limit },
) =>
  getPage(userId, {
    search: buildSearchRegex(query),
    archived,
    trashed,
    tag,
    sort,
    cursor,
    limit,
  });
