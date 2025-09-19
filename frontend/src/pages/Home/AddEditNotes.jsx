import { useFormik } from "formik";
import * as Yup from "yup";
import { CloseOutlined } from "@ant-design/icons";
import TagInput from "../../components/Input/TagInput";
import toast from "react-hot-toast";
import { createNotes, updateUserNotes } from "../../Service/NotesService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const AddEditNotes = ({ onClose, noteData, type, getAllNotes }) => {
  const validation = useFormik({
    initialValues: {
      title: noteData?.title || "",
      content: noteData?.content || "",
      tags: noteData?.tags || [],
    },
    
    validationSchema: Yup.object({
      title: Yup.string().required("Please enter the title"),
      content: Yup.string().required("Please enter the content"),
    }),

    onSubmit: async (values) => {
      try {
        let res;
        if (type === "edit") {
          res = await updateUserNotes(
            noteData._id,
            values.title,
            values.content,
            values.tags
          );
        } else {
          res = await createNotes(values.title, values.content, values.tags);
        }

        if (!res.data.success) {
          toast.error(res.data.message);
          return;
        }

        toast.success(res.data.message);
        getAllNotes();
        onClose();
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  return (
    <form className="relative p-6" onSubmit={validation.handleSubmit}>
      {/* Close Button */}
      <button
        type="button"
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        onClick={onClose}
      >
        <CloseOutlined className="text-gray-500 text-lg" />
      </button>

      {/* Title */}
      <div className="flex flex-col gap-2 mt-6">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Title
        </label>
        <input
          type="text"
          className="text-lg border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Enter note title..."
          name="title"
          value={validation.values.title}
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
        />
        {validation.touched.title && validation.errors.title && (
          <p className="text-red-500 text-sm">{validation.errors.title}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 mt-4">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Content
        </label>
        <ReactQuill
          value={validation.values.content}
          onChange={(val) => validation.setFieldValue("content", val)}
          onBlur={() => validation.setFieldTouched("content", true)}
          className="min-h-[200px]"
          theme="snow"
          modules={modules}
        />
        {validation.touched.content && validation.errors.content && (
          <p className="text-red-500 text-sm">{validation.errors.content}</p>
        )}
      </div>

      {/* Tags */}
      <div className="mt-4">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Tags
        </label>
        <TagInput
          tags={validation.values.tags}
          setTags={(newTags) => validation.setFieldValue("tags", newTags)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full mt-5 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition"
      >
        {type === "edit" ? "Update Note" : "Add Note"}
      </button>
    </form>
  );
};

export default AddEditNotes;
