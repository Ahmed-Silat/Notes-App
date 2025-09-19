import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar";
import { useDispatch } from "react-redux";
import {
  signoutFailure,
  signoutStart,
  signoutSuccess,
} from "../../redux/user/userSlice";
import { signout } from "../../Service/AuthService";
import toast from "react-hot-toast";
import {
  FileTextOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { IoArchiveOutline } from "react-icons/io5";

const { Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleCollapse = () => setCollapsed(!collapsed);

  const sidebarWidth = collapsed ? 80 : 220;

  const sidebarLinks = [
    { key: "1", label: "Notes", path: "/", icon: <FileTextOutlined /> },
    { key: "2", label: "Profile", path: "/profile", icon: <UserOutlined /> },
    {
      key: "3",
      label: "Reminders",
      path: "/reminders",
      icon: <BellOutlined />,
    },
    {
      key: "4",
      label: "Archive",
      path: "/archive",
      icon: <IoArchiveOutline />,
    },
  ];

  const onLogout = async () => {
    try {
      dispatch(signoutStart());
      const res = await signout();

      if (res.data.success === false) {
        dispatch(signoutFailure(res.data.message));
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      dispatch(signoutSuccess());
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      dispatch(signoutFailure(error.response?.data?.message));
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sidebar collapsed={collapsed} links={sidebarLinks} onLogout={onLogout} />

      <Layout style={{ marginLeft: sidebarWidth, transition: "all 0.3s" }}>
        <Navbar
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
          onLogout={onLogout}
        />

        <Content
          className="p-6 bg-gray-50 min-h-[85vh]"
          style={{ marginTop: 64 }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
