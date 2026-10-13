import * as noteRepository from "../repositories/note.repository.js";
import { ApiError } from "../utils/ApiError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getOwnedNote = async (userId, noteId) => {
  const note = await noteRepository.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (note.userId !== userId) {
    throw new ApiError(401, "You can only update your own note!");
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

  return noteRepository.save(note);
};

export const updateNotePinned = async (userId, noteId, isPinned) => {
  const note = await getOwnedNote(userId, noteId);

  note.isPinned = isPinned;

  return noteRepository.save(note);
};

export const getAllNotes = (userId) => noteRepository.findAllByUser(userId);

export const deleteNote = async (userId, noteId) => {
  const note = await noteRepository.findByIdAndUser(noteId, userId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  await noteRepository.deleteById(noteId);
};

export const searchNotes = (userId, query) =>
  noteRepository.searchByUser(userId, new RegExp(escapeRegex(query), "i"));
