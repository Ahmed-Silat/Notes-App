import React from "react";
import { MdCreate, MdDelete, MdOutlinePushPin } from "react-icons/md";
import moment from "moment";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onPinNote,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out w-full max-w-sm sm:max-w-md md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h6 className="text-sm font-medium break-words">{title}</h6>
          <span className="text-xs text-green-700">
            {moment(date).format("Do MMM YYYY")}
          </span>
        </div>

        <MdOutlinePushPin
          className={`icon-btn self-start sm:self-center ${
            isPinned ? "text-[#2B85FF]" : "text-slate-300"
          }`}
          onClick={onPinNote}
        />
      </div>

      <p className="text-xs text-slate-600 mt-2 break-words">
        {content?.slice(0, 60)}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
        <div className="text-xs text-slate-500 flex flex-wrap gap-1">
          {tags.map((item, idx) => (
            <span key={idx}>#{item}</span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <MdCreate
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover:text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
