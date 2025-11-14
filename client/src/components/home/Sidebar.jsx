import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUserFriends, FaBars } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { BsCollectionPlayFill } from "react-icons/bs";
import { FaCircleUser } from "react-icons/fa6";
import { FaSquarePlus } from "react-icons/fa6";
import { IoIosChatboxes } from "react-icons/io";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSelector } from "react-redux";
const navItems = () => [
  { to: "/", icon: FaHome, text: "Home" },
  { to: "/search", icon: IoSearchSharp, text: "Discover" },
  { to: "/create-post", icon: FaSquarePlus, text: " Create" },
  { to: "/library", icon: BsCollectionPlayFill, text: "Library" },
  { to: "/all-users", icon: FaUserFriends, text: "Users" },
  { to: "/chats", icon: IoIosChatboxes, text: "Chats" },
];

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentAuthUser } = useSelector((state) => state.user);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const displayUser = currentAuthUser || user;

  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between sm:hidden fixed top-0 left-0 right-0 bg-[#111827] text-gray-100 px-4 py-3 border-b border-gray-700 z-50">
        <motion.h1
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-xl font-extrabold uppercase bg-linear-to-r from-amber-400 via-yellow-300 to-orange-500 
      bg-clip-text text-transparent tracking-wider drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)]"
        >
          Socially
        </motion.h1>

        <div className="relative">
          {displayUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {displayUser.profileImage ? (
                  <img
                    src={displayUser.profileImage}
                    alt={displayUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                    {displayUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate(`/profile/${displayUser._id}`);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                    Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <FaCircleUser
              className="w-8 h-8 cursor-pointer"
              onClick={() => navigate("/login")}
            />
          )}
        </div>
      </div>

      {/* Sidebar for medium and large screens */}
      <div
        className={`hidden sm:flex md:flex h-screen flex-col fixed left-0 bg-[#111827] text-gray-100 border-r border-gray-700 transition-all duration-300 ease-in-out z-40 
  ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Logo + Menu Toggle */}
        <div className="flex items-center gap-3 pl-4 mt-2">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-700 hover:text-amber-400 transition-all duration-200 focus:ring-2 focus:ring-amber-400 focus:outline-none shrink-0"
          >
            <FaBars className="text-xl" />
          </button>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {isSidebarOpen && (
              <motion.h1
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-2xl font-extrabold uppercase bg-linear-to-r from-amber-400 via-yellow-300 to-orange-500 
             bg-clip-text text-transparent tracking-wider whitespace-nowrap 
             drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)] animate-gradient"
              >
                Socially
              </motion.h1>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="p-4 flex flex-col flex-1">
          <nav className="mt-2 flex-1 flex flex-col space-y-2">
            {navItems().map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 hover:text-amber-400 transition-all duration-300 focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                    isActive ? "bg-gray-800 text-amber-400" : "text-gray-300"
                  } ${isSidebarOpen ? "justify-start" : "justify-center"}`
                }
              >
                <item.icon className="text-xl" />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm"
                  >
                    {item.text}
                  </motion.span>
                )}
                {!isSidebarOpen && (
                  <span className="absolute left-full ml-2 whitespace-nowrap bg-gray-800 text-gray-100 text-sm py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    {item.text}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Button */}
          <div className="mt-auto flex justify-center md:justify-start mb-4">
            {displayUser ? (
              <div className="relative w-full">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isSidebarOpen ? "justify-start" : "justify-center"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                    {displayUser.profileImage ? (
                      <img
                        src={displayUser.profileImage}
                        alt={displayUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-sm">
                        {displayUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white truncate">
                        {displayUser.fullName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        @{displayUser.username || "user"}
                      </p>
                    </div>
                  )}
                </button>
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate(`/profile/${displayUser._id}`);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                      >
                      Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <FaCircleUser
                className="w-10 h-10 cursor-pointer"
                onClick={() => navigate("/login")}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar for Mobile */}
      <div className=" sm:hidden  fixed bottom-0 left-0 right-0 bg-[#111827] text-gray-100 z-50 shadow-lg border-t border-gray-700">
        <nav className="flex justify-around items-center p-2">
          {navItems().map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg hover:bg-gray-800 hover:text-amber-400 transition-all duration-300 focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                  isActive ? "text-amber-400" : "text-gray-300"
                }`
              }
            >
              <item.icon className="text-xl" />
              <span className="text-xs">{item.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}

export default Sidebar;