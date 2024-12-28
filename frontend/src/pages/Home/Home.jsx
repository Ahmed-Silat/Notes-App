import { MdAdd } from "react-icons/md";
import NoteCard from "../../components/Cards/NoteCard";
import { useState } from "react";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  return (
    <>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 max-md:m-5">
          <NoteCard
            title={"wakeup at 6 a.m."}
            date={"5th June, 2021"}
            content={"You know nothing, Jon Snow"}
            tags={"#jhonsnow"}
            isPinned={true}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />

          <NoteCard
            title={"wakeup at 6 a.m."}
            date={"5th June, 2021"}
            content={"You know nothing, Jon Snow"}
            tags={"#jhonsnow"}
            isPinned={true}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />

          <NoteCard
            title={"wakeup at 6 a.m."}
            date={"5th June, 2021"}
            content={"You know nothing, Jon Snow"}
            tags={"#jhonsnow"}
            isPinned={true}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />

          <NoteCard
            title={"wakeup at 6 a.m."}
            date={"5th June, 2021"}
            content={"You know nothing, Jon Snow"}
            tags={"#jhonsnow"}
            isPinned={true}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />

          <NoteCard
            title={"wakeup at 6 a.m."}
            date={"5th June, 2021"}
            content={"You know nothing, Jon Snow"}
            tags={"#jhonsnow"}
            isPinned={true}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />

          <NoteCard
            title={"wakeup at 6 a.m."}
            date={"5th June, 2021"}
            content={"You know nothing, Jon Snow"}
            tags={"#jhonsnow"}
            isPinned={false}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />
        </div>
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#2B85FF] hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
    </>
  );
};

export default Home;
