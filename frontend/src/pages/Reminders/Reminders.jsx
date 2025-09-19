import React from "react";
import { FaRegBell } from "react-icons/fa";

const Reminders = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[85vh] text-gray-400 overflow-hidden">
      <FaRegBell size={80} className="mb-4" />
      <p className="text-lg">All your reminders will appear here.</p>
    </div>
  );
};

export default Reminders;
