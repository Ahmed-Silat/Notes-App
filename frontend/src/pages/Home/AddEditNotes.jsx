import { useState } from "react";
import { MdClose } from "react-icons/md";
import TagInput from "../../components/Input/TagInput";
import axios from "axios";
import { toast } from "react-toastify";
import { createNotes, updateUserNotes } from "../../Service/NotesService";

const AddEditNotes = ({ onClose, noteData, type, getAllNotes }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);

  // Edit Note
  const editNote = async () => {
    const noteId = noteData._id;

    try {
      // const res = await axios.put(
      //   `http://localhost:3000/api/note/edit/${noteId}`,
      //   { title, content, tags },
      //   { withCredentials: true }
      // );

      const res = await updateUserNotes(noteId, title, content, tags);

      if (res.data.success === false) {
        console.log(res.data.message);
        setError(res.data.message);
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      getAllNotes();
      onClose();
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
      setError(error.message);
    }
  };

  // Add Note
  const addNewNote = async () => {
    try {
      // const res = await axios.post(
      //   "http://localhost:3000/api/note/add",
      //   { title, content, tags },
      //   { withCredentials: true }
      // );

      const res = await createNotes(title, content, tags);

      if (res.data.success === false) {
        console.log(res.data.message);
        setError(res.data.message);
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      getAllNotes();
      onClose();
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
      setError(error.message);
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }

    if (!content) {
      setError("Please enter the content");
      return;
    }

    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-5 overflow-y-auto max-h-[90vh] relative">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center absolute top-2 right-2 hover:bg-slate-50"
          onClick={onClose}
        >
          <MdClose className="text-xl text-slate-400" />
        </button>

        <div className="flex flex-col gap-2 mt-8">
          <label className="input-label text-red-400 uppercase">Title</label>

          <input
            type="text"
            className="text-2xl text-slate-950 outline-none w-full"
            placeholder="Wake up at 6 a.m."
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label text-red-400 uppercase">Content</label>

          <textarea
            className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded w-full"
            placeholder="Content..."
            rows={10}
            value={content}
            onChange={({ target }) => setContent(target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="input-label text-red-400 uppercase">Tags</label>
          <TagInput tags={tags} setTags={setTags} />
        </div>

        {error && <p className="text-red-500 text-xs pt-4">{error}</p>}

        <button
          className="btn-primary font-medium mt-5 p-3 w-full"
          onClick={handleAddNote}
        >
          {type === "edit" ? "UPDATE" : "ADD"}
        </button>
      </div>
    </div>
  );
};

export default AddEditNotes;
