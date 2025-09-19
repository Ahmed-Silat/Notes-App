import React from "react";
import { IoArchiveOutline } from "react-icons/io5";

const Archive = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[85vh] text-gray-400 overflow-hidden">
      <IoArchiveOutline size={80} className="mb-4" />
      <p className="text-lg">All your archived notes will appear here.</p>
    </div>
  );
};

export default Archive;
