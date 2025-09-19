import { getInitials } from "../../utils/helper";
import { FiLogOut } from "react-icons/fi";

const ProfileInfo = ({ onLogout, userInfo }) => {
  return (
    <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-full shadow-sm">
      {/* Avatar */}
      <div className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold bg-blue-500">
        {getInitials(userInfo?.username)}
      </div>

      {/* Username */}
      <p className="text-sm font-medium text-gray-800 hidden sm:block">
        {userInfo?.username}
      </p>

      {/* Logout */}
      <button
        className="flex items-center gap-1 text-sm px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
        onClick={onLogout}
      >
        <FiLogOut className="text-lg" />
        <span className="hidden sm:block">Logout</span>
      </button>
    </div>
  );
};

export default ProfileInfo;
