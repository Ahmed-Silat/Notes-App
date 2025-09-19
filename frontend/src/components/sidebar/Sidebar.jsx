import React from "react";
import { Layout, Menu, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Sider } = Layout;

// const iconMap = {
//   HomeOutlined: <HomeOutlined />,
//   FileTextOutlined: <FileTextOutlined />,
//   UserOutlined: <UserOutlined />,
// };

const Sidebar = ({ collapsed, links, onLogout }) => {
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      breakpoint="lg"
      width={220}
      className="bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        height: "100vh",
        zIndex: 1000,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center py-6 text-2xl font-extrabold tracking-wide text-white">
          <span className="text-blue-400">{collapsed ? "G" : "Good"}</span>
          <span className="text-pink-400">{collapsed ? "N" : "Notes"}</span>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          defaultSelectedKeys={[links[0]?.key]}
          theme="dark"
          className="flex-1 border-0 font-medium"
        >
          {links.map((link) => (
            <Menu.Item key={link.key} icon={link.icon}>
              <Link to={link.path}>{link.label}</Link>
            </Menu.Item>
          ))}
        </Menu>

        {/* Logout Button */}
        <div className="p-4">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            block
            onClick={onLogout}
          >
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
