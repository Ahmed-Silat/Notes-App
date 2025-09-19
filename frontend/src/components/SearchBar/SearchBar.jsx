import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="flex items-center w-full sm:w-[28rem] md:w-[40rem] px-3 py-2 bg-gray-100 rounded-full shadow-inner">
      <input
        type="text"
        placeholder="Search notes..."
        className="w-full text-sm bg-transparent outline-none placeholder-gray-500"
        value={value}
        onChange={onChange}
      />

      {value && (
        <IoMdClose
          className="text-gray-500 text-lg cursor-pointer hover:text-black mx-1 transition-colors"
          onClick={onClearSearch}
        />
      )}

      <FaMagnifyingGlass
        className="text-gray-500 text-lg cursor-pointer hover:text-black transition-colors"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
