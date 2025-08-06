import axios from "axios";

const EXPRESS_API_URI = import.meta.env.VITE_API_BASE_URI;

export const getUserAllNotes = async () => {
  const data = await axios.get(`${EXPRESS_API_URI}/api/note/all`, {
    withCredentials: true,
  });
  return data;
};

export const createNotes = async (title, content, tags) => {
  const res = await axios.post(
    `${EXPRESS_API_URI}/api/note/add`,
    { title, content, tags },
    { withCredentials: true }
  );
  return res;
};

export const updateUserNotes = async (noteId, title, content, tags) => {
  const data = await axios.put(
    `${EXPRESS_API_URI}/api/note/edit/${noteId}`,
    { title, content, tags },
    { withCredentials: true }
  );
  return data;
};

export const deleteUserNotes = async (noteId) => {
  const data = await axios.delete(
    `${EXPRESS_API_URI}/api/note/delete/${noteId}`,
    { withCredentials: true }
  );
  return data;
};

export const getUserSearchNotes = async (query) => {
  const data = await axios.get(`${EXPRESS_API_URI}/api/note/search`, {
    params: { query },
    withCredentials: true,
  });
  return data;
};

export const updatePinnedNotes = async (noteData) => {
  const noteId = noteData._id;

  const data = await axios.put(
    `${EXPRESS_API_URI}/api/note/update-note-pinned/${noteId}`,
    { isPinned: !noteData.isPinned },
    { withCredentials: true }
  );
  return data;
};
