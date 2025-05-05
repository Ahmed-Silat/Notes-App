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
import axios from "axios";

const Navbar = ({ userInfo }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleSearch = () => {};

  const onClearSearch = () => {
    setSearchQuery("");
  };

  const onLogout = async () => {
    try {
      dispatch(signoutStart());

      const res = await axios.get("http://localhost:3000/api/auth/signout", {
        withCredentials: true,
      });

      if (res.data.success === false) {
        dispatch(signoutFailure(res.data.message));
        return;
      }

      dispatch(signoutSuccess());
      navigate("/login");
    } catch (error) {
      dispatch(signoutFailure(error.message));
    }
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <Link to={"/"}>
        <h2 className="text-xl font-medium text-black py-2">
          <span className="text-slate-500">Good</span>
          <span className="text-slate-900">Notes</span>
        </h2>
      </Link>

      <SearchBar
        value={searchQuery}
        onChange={({ target }) => setSearchQuery(target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
};

export default Navbar;
