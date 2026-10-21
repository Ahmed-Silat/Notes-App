import { api } from "@/lib/api";

// One page of notes, only those with `tag` if given, in `sort` order (newest
// first by default): { notes, total, nextCursor }
export const getUserAllNotes = async ({ limit, cursor, tag, sort } = {}) => {
  const data = await api.get("/note/all", {
    params: { limit, cursor, tag, sort },
  });
  return data;
};

// One page of archived notes: { notes, total, nextCursor }
export const getUserArchivedNotes = async ({ limit, cursor } = {}) => {
  const data = await api.get("/note/all", {
    params: { limit, cursor, archived: true },
  });
  return data;
};

export const createNotes = async (title, content, tags, color) => {
  const res = await api.post("/note/add", { title, content, tags, color });
  return res;
};

export const updateUserNotes = async (noteId, title, content, tags, color) => {
  const data = await api.put(`/note/edit/${noteId}`, {
    title,
    content,
    tags,
    color,
  });
  return data;
};

// Moves the note to Trash; restoreNote brings it back
export const deleteUserNotes = async (noteId) => {
  const data = await api.delete(`/note/delete/${noteId}`);
  return data;
};

// One page of the notes in Trash, most recently deleted first:
// { notes, total, nextCursor }
export const getUserTrashedNotes = async ({ limit, cursor } = {}) => {
  const data = await api.get("/note/all", {
    params: { limit, cursor, trashed: true },
  });
  return data;
};

export const restoreNote = async (noteId) => {
  const data = await api.put(`/note/restore/${noteId}`);
  return data;
};

// Only for notes in Trash; can't be undone
export const deleteNoteForever = async (noteId) => {
  const data = await api.delete(`/note/delete-forever/${noteId}`);
  return data;
};

// Deletes every note in Trash: { deletedCount }
export const emptyTrash = async () => {
  const data = await api.delete("/note/empty-trash");
  return data;
};

export const getUserSearchNotes = async (
  query,
  { limit, cursor, tag, sort } = {},
) => {
  const data = await api.get("/note/search", {
    params: { query, limit, cursor, tag, sort },
  });
  return data;
};

export const updatePinnedNotes = async (noteData) => {
  const data = await api.put(`/note/update-note-pinned/${noteData._id}`, {
    isPinned: !noteData.isPinned,
  });
  return data;
};

export const updateNoteColor = async (noteId, color) => {
  const data = await api.put(`/note/update-note-color/${noteId}`, { color });
  return data;
};

// Turns on the note's public link (or keeps the one it has): { note }, with
// the link's id in note.shareId
export const shareNote = async (noteId) => {
  const data = await api.put(`/note/share/${noteId}`);
  return data;
};

// Turns the link off; it stops working right away
export const stopSharingNote = async (noteId) => {
  const data = await api.delete(`/note/share/${noteId}`);
  return data;
};

// A shared note, no login needed: { note } with title, content, tags, color
// and dates. 404 (or 400 for a malformed link) when it isn't shared.
export const getSharedNote = async (shareId) => {
  const data = await api.get(`/public/notes/${encodeURIComponent(shareId)}`);
  return data;
};

export const updateArchivedNotes = async (noteData) => {
  const data = await api.put(`/note/update-note-archived/${noteData._id}`, {
    isArchived: !noteData.isArchived,
  });
  return data;
};
