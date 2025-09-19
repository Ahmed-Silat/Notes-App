import { Layout, Dropdown, Avatar, Menu } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getInitials } from "../lib/helper";
import { useNavigate } from "react-router-dom";
import {
  signoutFailure,
  signoutStart,
  signoutSuccess,
} from "../redux/user/userSlice";
import { signout } from "../Service/AuthService";
import toast from "react-hot-toast";

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const userName = currentUser?.rest?.username || "--";
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  return (
    <div className="flex justify-between items-center p-2 bg-gray-200">
      <div className="font-bold text-xl">Good Notes</div>

      <div>
        <h1 className="text-lg font-semibold text-gray-700 m-0 capitalize">
          {userName}
        </h1>
      </div>

      <div className="flex items-center">
        <Dropdown overlay={dropdownMenu} placement="bottomRight" arrow>
          <Avatar className="cursor-pointer ml-auto bg-[#1890ff]">
            {getInitials(userName)}
          </Avatar>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;
