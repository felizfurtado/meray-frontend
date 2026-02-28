import React from "react";
import useAuth from "../../auth/useAuth";

const TopBar = ({
  pageTitle = "Leads Management",
  sidebarCollapsed = false,
  onLogout,
}) => {
  const { user, company } = useAuth();

  const notificationsCount = 3;
  const sidebarWidth = sidebarCollapsed ? 60 : 80;

  const avatarLetter =
    company?.name?.charAt(0) || user?.username?.charAt(0) || "U";

  return (
    <div
      className="
        fixed top-0
        h-[64px] md:h-[64px]
        bg-white
        border-b border-gray-200
        flex items-center justify-between
        px-[30px] lg:px-[20px] md:px-[16px]
        z-[1]
        shadow-[0_2px_20px_rgba(0,0,0,0.04)]
        transition-all duration-300 ease-in-out
      "
      style={{
        left: `${sidebarWidth}px`,
        right: "0",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-[30px]">
        <div className="text-[16px] font-semibold text-blue2 flex items-center gap-[8px]">
          <i className="fas fa-chevron-right text-gray-400 text-[14px]" />
          <span>{pageTitle}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-[16px] max-[480px]:gap-[8px]">
        {/* Search */}
        <button
          className="
            w-[40px] h-[40px]
            rounded-[10px]
            border border-gray-300
            bg-transparent
            text-gray-500
            flex items-center justify-center
            transition-all duration-200
            hover:bg-gray-100 hover:text-blue2 hover:border-blue2
          "
        >
          <i className="fas fa-search" />
        </button>

        {/* Notifications */}

{/* Notifications Dropdown */}
<div className="relative group">
  <button
    className="
      relative
      w-[40px] h-[40px]
      rounded-[10px]
      border border-gray-300
      bg-transparent
      text-gray-500
      flex items-center justify-center
      transition-all duration-200
      hover:bg-gray-100 hover:text-blue2 hover:border-blue2
    "
  >
    <i className="fas fa-bell" />
    {notificationsCount > 0 && (
      <span
        className="
          absolute -top-[4px] -right-[4px]
          w-[18px] h-[18px]
          bg-red-500 text-white
          text-[10px] font-semibold
          rounded-full
          flex items-center justify-center
          border-2 border-white
        "
      >
        {notificationsCount}
      </span>
    )}
  </button>

  {/* Notification Dropdown Menu */}
  <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <a 
          href="/notifications" 
          className="text-sm text-blue2 hover:text-blue1 font-medium"
        >
          View All
        </a>
      </div>
    </div>

    <div className="max-h-96 overflow-y-auto">
      {/* Notification Items */}
      <div className="p-4 border-b border-gray-200 hover:bg-blue-50/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
            <i className="fas fa-clock text-red-600 text-xs"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 text-sm">Task Due Soon</h4>
              <span className="text-xs text-red-600 font-bold">15m</span>
            </div>
            <p className="text-xs text-gray-600">Follow up with TechCorp Inc</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 hover:bg-blue-50/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
            <i className="fas fa-boxes text-amber-600 text-xs"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 text-sm">Low Stock Alert</h4>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            <p className="text-xs text-gray-600">Ball Bearings (12 units left)</p>
          </div>
        </div>
      </div>

      <div className="p-4 hover:bg-blue-50/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <i className="fas fa-check-circle text-blue2 text-xs"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 text-sm">Task Completed</h4>
              <span className="text-xs text-gray-500">1d ago</span>
            </div>
            <p className="text-xs text-gray-600">Sarah completed Q2 Report</p>
          </div>
        </div>
      </div>
    </div>

    <div className="p-4 bg-gray-50 rounded-b-xl">
      <a 
        href="/notifications" 
        className="block text-center w-full px-4 py-2 text-sm font-medium text-blue2 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <i className="fas fa-bell mr-2"></i>
        See all notifications
      </a>
    </div>
  </div>
</div>

        {/* User Profile */}
        <div className="relative group">
          <div
            className="
              flex items-center gap-[12px]
              px-[16px] py-[8px]
              bg-gray-100
              rounded-[10px]
              cursor-pointer
              transition-all duration-200
              hover:bg-gray-200
              ml-[8px]
            "
          >
            {/* Avatar */}
            <div
              className="
                w-[36px] h-[36px]
                rounded-full
                bg-gradient-to-br from-blue1 to-blue2
                text-white text-[14px] font-semibold
                flex items-center justify-center
                uppercase
              "
            >
              {avatarLetter}
            </div>

            {/* Company + Role */}
            <div className="hidden md:block">
              <h3 className="text-[15px] font-semibold text-gray-900 leading-none capitalize">
                {company?.name || "Company"}
              </h3>
             
              <p className="mt-[4px] text-[12px] text-gray-500 leading-none capitalize">
                {user?.username || "Role"}
              </p>
            </div>

            <i className="fas fa-chevron-down text-gray-500 text-xs ml-1"></i>
          </div>

          {/* Logout Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="py-1">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;