import { useState } from "react";
import SearchBar from "./SearchBar/SearchBar";
import ProfileInfo from "./Cards/ProfileInfo";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  signoutFailure,
  signoutStart,
  signoutSuccess,
} from "../redux/user/userSlice";
// import axios from "axios";
import { toast } from "react-toastify";
import { signout } from "../Service/AuthService";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const onLogout = async () => {
    try {
      dispatch(signoutStart());

      // const res = await axios.get("http://localhost:3000/api/auth/signout", {
      //   withCredentials: true,
      // });

      const res = await signout();

      if (res.data.success === false) {
        dispatch(signoutFailure(res.data.message));
        toast.error("res.data.message");
        return;
      }

      toast.success(res.data.message);
      dispatch(signoutSuccess());
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
      dispatch(signoutFailure(error.message));
    }
  };

  return (
    <div className="bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 drop-shadow">
      <Link to={"/"}>
        <h2 className="text-xl font-medium text-black text-center sm:text-left">
          <span className="text-slate-500">Good</span>
          <span className="text-slate-900">Notes</span>
        </h2>
      </Link>

      <div className="w-full sm:w-auto">
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      </div>

      <div className="flex justify-end sm:justify-start items-center gap-2">
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default Navbar;
