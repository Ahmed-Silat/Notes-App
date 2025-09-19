// import { useState } from "react";
// import SearchBar from "./SearchBar/SearchBar";
// import ProfileInfo from "./Cards/ProfileInfo";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import {
//   signoutFailure,
//   signoutStart,
//   signoutSuccess,
// } from "../redux/user/userSlice";
// import toast from "react-hot-toast";
// import { signout } from "../Service/AuthService";

// const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleSearch = () => {
//     if (searchQuery) onSearchNote(searchQuery);
//   };

//   const onClearSearch = () => {
//     setSearchQuery("");
//     handleClearSearch();
//   };

//   const onLogout = async () => {
//     try {
//       dispatch(signoutStart());
//       const res = await signout();

//       if (res.data.success === false) {
//         dispatch(signoutFailure(res.data.message));
//         toast.error(res.data.message);
//         return;
//       }

//       toast.success(res.data.message);
//       dispatch(signoutSuccess());
//       navigate("/login");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong");
//       dispatch(signoutFailure(error.response?.data?.message));
//     }
//   };

//   return (
//     <div className="bg-white shadow-md sticky top-0 z-50">
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3">
//         {/* Logo */}
//         <Link to={"/"}>
//           <h2 className="text-2xl font-bold tracking-tight">
//             <span className="text-[#3B82F6]">Good</span>
//             <span className="text-gray-900">Notes</span>
//           </h2>
//         </Link>

//         {/* Search Bar */}
//         <div className="w-full sm:w-auto">
//           <SearchBar
//             value={searchQuery}
//             onChange={({ target }) => setSearchQuery(target.value)}
//             handleSearch={handleSearch}
//             onClearSearch={onClearSearch}
//           />
//         </div>

//         {/* Profile Section */}
//         <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useState } from "react";
import { Layout, Dropdown, Avatar, Button, Menu } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getInitials } from "../utils/helper";

const { Header } = Layout;

const Navbar = ({ collapsed, toggleCollapse, onLogout }) => {
  const { currentUser } = useSelector((state) => state.user);
  const userName = currentUser?.rest?.username?.toUpperCase() || "--";

  const dropdownMenu = (
    <Menu className="rounded-xl shadow-lg">
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Sidebar width depends on collapsed state
  const sidebarWidth = collapsed ? 80 : 220;

  return (
    <Header
      className="bg-white shadow-md flex justify-between items-center px-6"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: 64,
        width: `calc(100% - ${sidebarWidth}px)`,
        zIndex: 1000,
      }}
    >
      {/* Always show toggle button */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleCollapse}
        className="text-lg"
      />

      {/* User Name in center */}
      <h1 className="text-lg font-semibold text-gray-700 m-0 absolute left-1/2 transform -translate-x-1/2">
        {userName}
      </h1>

      {/* Avatar on the right */}
      <Dropdown overlay={dropdownMenu} placement="bottomRight" arrow>
        <Avatar
          style={{ backgroundColor: "#1890ff" }}
          className="cursor-pointer ml-auto"
        >
          {getInitials(userName)}
        </Avatar>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
