import React from "react";
import { MdCreate, MdDelete, MdOutlinePushPin } from "react-icons/md";
import moment from "moment";
import { Tooltip } from "antd";
import { IoArchiveOutline } from "react-icons/io5";
import { BiBellPlus } from "react-icons/bi";

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
    <div className="relative border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200 ease-in-out w-full max-w-sm sm:max-w-md md:max-w-full bg-[#f5f5dc]">
      {/* Pin Button */}
      <Tooltip title={isPinned ? "Unpin Note" : "Pin Note"}>
        <button
          onClick={onPinNote}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isPinned ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
          } hover:bg-blue-200`}
        >
          <MdOutlinePushPin size={18} />
        </button>
      </Tooltip>

      {/* Title & Date */}
      <div className="mb-3">
        <h6 className="text-base font-semibold text-gray-800 break-words pr-8 truncate">
          {title}
        </h6>
        <span className="text-xs text-[#415d43]">
          {moment(date).format("Do MMM YYYY")}
        </span>
      </div>

      {/* Content Preview */}
      <p
        className="text-sm text-gray-700 line-clamp-1"
        dangerouslySetInnerHTML={{ __html: content }}
      ></p>

      {/* Tags & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
        {/* Tags */}
        <div className="flex gap-2 overflow-hidden whitespace-nowrap text-ellipsis">
          {tags.map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded-full inline-block"
            >
              #{item}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Tooltip title="Set Reminder">
            <button className="p-2 rounded-full hover:bg-yellow-100 text-gray-900 hover:text-yellow-600 transition">
              <BiBellPlus size={18} className="font-bold" />
            </button>
          </Tooltip>

          <Tooltip title="Archive Note">
            <button className="p-2 rounded-full hover:bg-blue-100 text-gray-900 hover:text-blue-600 transition">
              <IoArchiveOutline size={18} className="font-bold" />
            </button>
          </Tooltip>

          <Tooltip title="Edit Note">
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-green-100 text-gray-600 hover:text-green-600 transition"
            >
              <MdCreate size={18} />
            </button>
          </Tooltip>

          <Tooltip title="Delete Note">
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition"
            >
              <MdDelete size={18} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
