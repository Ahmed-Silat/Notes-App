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
    "http://localhost:3000/api/note/add",
    { title, content, tags },
    { withCredentials: true }
  );
  return res;
};

export const updateUserNotes = async (noteId, title, content, tags) => {
  const data = await axios.put(
    `http://localhost:3000/api/note/edit/${noteId}`,
    { title, content, tags },
    { withCredentials: true }
  );
  return data;
};

export const deleteUserNotes = async (noteId) => {
  const data = await axios.delete(
    `http://localhost:3000/api/note/delete/${noteId}`,
    { withCredentials: true }
  );
  return data;
};

export const getSearchNotes = async (query) => {
  const data = await axios.get("http://localhost:3000/api/note/search", {
    params: { query },
    withCredentials: true,
  });
  return data;
};
