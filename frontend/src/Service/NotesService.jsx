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

export const deleteUserNotes = async (noteId) => {
  const data = await api.delete(`/note/delete/${noteId}`);
  return data;
};

export const getUserSearchNotes = async (
  query,
  { limit, cursor, tag, sort } = {}
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

export const updateArchivedNotes = async (noteData) => {
  const data = await api.put(`/note/update-note-archived/${noteData._id}`, {
    isArchived: !noteData.isArchived,
  });
  return data;
};
