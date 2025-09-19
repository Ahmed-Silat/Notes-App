import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import NoteCard from "../../components/Cards/NoteCard";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import AddEditNotes from "./AddEditNotes";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import {
  deleteUserNotes,
  getUserSearchNotes,
  getUserAllNotes,
  updatePinnedNotes,
} from "../../Service/NotesService";
import { Tooltip } from "antd";
import SearchBar from "../../components/SearchBar/SearchBar";

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      getAllNotes();
    }
  }, []);

  const getAllNotes = async () => {
    try {
      const res = await getUserAllNotes();
      if (res.data.success) {
        setAllNotes(res.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const deleteNote = async (data) => {
    try {
      const res = await deleteUserNotes(data._id);
      if (res.data.success === false) {
        toast.error(res.data.message);
        return;
      }
      toast("Deleted Successfully", {
        icon: <DeleteOutlined style={{ color: "red" }} />,
        style: { background: "#fff", color: "#000" },
      });
      getAllNotes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSearch = () => {
    if (searchQuery) onSearchNote(searchQuery);
  };

  const onSearchNote = async (query) => {
    try {
      const res = await getUserSearchNotes(query);
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      setIsSearch(true);
      setAllNotes(res.data.notes);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  const updateIsPinned = async (noteData) => {
    try {
      const res = await updatePinnedNotes(noteData);
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      toast.success(res.data.message);
      getAllNotes();
    } catch (error) {
      console.log(error.message);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    <>
      <div className="w-full flex justify-center mt-6 mb-12">
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      </div>

      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 max-md:m-5 pb-10">
            {allNotes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={note.createdAt}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => handleEdit(note)}
                onDelete={() => deleteNote(note)}
                onPinNote={() => updateIsPinned(note)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={
              isSearch
                ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtakcQoMFXwFwnlochk9fQSBkNYkO5rSyY9A&s"
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDCtZLuixBFGTqGKdWGLaSKiO3qyhW782aZA&s"
            }
            message={
              isSearch
                ? "Oops! No Notes found matching your search"
                : "Ready to capture your ideas? Click the '+' button to start noting down your thoughts, inspiration and reminders."
            }
          />
        )}
      </div>

      {/* Floating Add Button */}
      <Tooltip title="Create New Note">
        <button
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#2B85FF] hover:bg-blue-600 shadow-lg fixed right-8 bottom-8 transition-all"
          onClick={() =>
            setOpenAddEditModal({ isShown: true, type: "add", data: null })
          }
        >
          <PlusOutlined className="text-white text-2xl" />
        </button>
      </Tooltip>

      {/* Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        }
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(5px)", // blurred background
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          },
        }}
        className="w-[40%] max-lg:w-[60%] max-md:w-[80%] max-sm:w-[95%] max-h-[85vh] rounded-xl bg-white shadow-lg outline-none"
      >
        <div className="overflow-y-auto max-h-[85vh] rounded-xl scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <AddEditNotes
            onClose={() =>
              setOpenAddEditModal({ isShown: false, type: "add", data: null })
            }
            noteData={openAddEditModal.data}
            type={openAddEditModal.type}
            getAllNotes={getAllNotes}
          />
        </div>
      </Modal>
    </>
  );
};

export default Home;
