import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaNewspaper,
  FaFolderOpen,
  FaSearch,
  FaTrophy,
  FaSignInAlt,
  FaUserPlus,
  FaUser,
  FaPen,
  FaCog,
  FaBolt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaRegBell,
  FaEnvelope,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import NotificationsDropdown from "./chat/NotificationsDropdown";
import { Menu, X, Moon, Sun } from "lucide-react";
import { toast } from "react-hot-toast";

// Thêm component nút chuyển đổi Dark Mode
const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Khởi tạo trạng thái từ localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      toast.success("Đã bật chế độ tối");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Đã bật chế độ sáng");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-500" />
      )}
    </button>
  );
};

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Log thông tin người dùng khi component re-render
  useEffect(() => {
    console.log("NavMenu: Trạng thái hiện tại:", {
      isAuthenticated,
      user,
      userId: user?._id || user?.id,
      userEmail: user?.email,
      userRole: user?.role,
    });
  }, [user, isAuthenticated]);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
    setSearchActive(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Đóng profileMenu khi nhấp bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // Hiệu ứng khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Chuyển đến trang tìm kiếm với search params
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  // Danh sách menu chính
  const mainMenuItems = [
    { path: "/", label: "Trang chủ", icon: <FaHome className="text-lg" /> },
    {
      path: "/posts",
      label: "Bài viết",
      icon: <FaNewspaper className="text-lg" />,
    },
    {
      path: "/categories",
      label: "Danh mục",
      icon: <FaFolderOpen className="text-lg" />,
    },
    {
      path: "/leaderboard",
      label: "Xếp hạng",
      icon: <FaTrophy className="text-lg" />,
    },
    {
      path: "/messages",
      label: "Tin nhắn",
      icon: <FaEnvelope className="text-lg" />,
      loggedIn: true,
    },
  ];

  // Danh sách menu người dùng
  const userMenuItems = [
    {
      path: "/login",
      label: "Đăng nhập",
      icon: <FaSignInAlt className="text-lg" />,
      loggedOut: true,
    },
    {
      path: "/register",
      label: "Đăng ký",
      icon: <FaUserPlus className="text-lg" />,
      loggedOut: true,
    },
    {
      path: "/posts/create",
      label: "Viết bài",
      icon: <FaPen className="text-lg" />,
      loggedIn: true,
      buttonStyle: true,
    },
  ];

  // Menu Admin
  const adminMenuItems = [
    {
      path: "/admin",
      label: "Quản trị",
      icon: <FaBolt className="text-lg" />,
      adminOnly: true,
    },
  ];

  // ProfileMenu dropdown items
  const profileMenuItems = [
    {
      path: "/profile",
      label: "Hồ sơ",
      icon: <FaUser className="text-lg" />,
    },
    {
      path: "/my-posts",
      label: "Bài viết của tôi",
      icon: <FaNewspaper className="text-lg" />,
    },
    {
      path: "/messages",
      label: "Tin nhắn",
      icon: <FaEnvelope className="text-lg" />,
    },
    {
      path: "/settings",
      label: "Cài đặt",
      icon: <FaCog className="text-lg" />,
    },
    {
      divider: true,
    },
    {
      action: handleLogout,
      label: "Đăng xuất",
      icon: <FaSignOutAlt className="text-lg" />,
      danger: true,
    },
  ];

  // Check nếu user là admin
  const isAdmin = user?.role === "admin";

  // Tạo URL đầy đủ cho avatar
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/images/default-avatar.png"; // Ảnh mặc định
    if (avatarPath.startsWith("http")) return avatarPath;
    return `http://localhost:5002${
      avatarPath.startsWith("/") ? "" : "/"
    }${avatarPath}`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md
                  ${
                    scrolled ? "bg-white/90 shadow-lg py-2" : "bg-white/80 py-3"
                  } dark:bg-gray-900/90`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink
              to="/"
              className="text-blue-600 text-xl font-bold flex items-center group"
            >
              <div
                className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2 
                            transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
              >
                <span className="font-bold">D</span>
              </div>
              <span
                className="hidden xs:inline-block relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 
                              group-hover:after:w-full after:transition-all after:duration-300"
              >
                DIỄN ĐÀN
              </span>
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
            <ul className="flex items-center space-x-1">
              {mainMenuItems.map((item) => {
                // Không hiển thị nếu mục yêu cầu đăng nhập và người dùng chưa đăng nhập
                if (item.loggedIn && !isAuthenticated) return null;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "text-blue-600 font-medium flex items-center px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all nav-link-hover"
                      }
                    >
                      <span className="mr-1.5">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}

              {/* Nút tìm kiếm */}
              <li>
                <button
                  onClick={() => setSearchActive(!searchActive)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  aria-label="Tìm kiếm"
                >
                  <FaSearch className="text-lg" />
                </button>
              </li>
            </ul>
          </div>

          {/* Tablet Menu - Chỉ hiển thị trên tablet */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            <ul className="flex items-center space-x-1">
              {mainMenuItems.slice(0, 3).map((item) => {
                // Không hiển thị nếu mục yêu cầu đăng nhập và người dùng chưa đăng nhập
                if (item.loggedIn && !isAuthenticated) return null;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "text-blue-600 font-medium flex items-center px-2 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-2 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                      }
                    >
                      <span className="mr-1">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}

              {/* Nút tìm kiếm trên tablet */}
              <li>
                <button
                  onClick={() => setSearchActive(!searchActive)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-2 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  aria-label="Tìm kiếm"
                >
                  <FaSearch className="text-lg" />
                </button>
              </li>
            </ul>
          </div>

          {/* Search Bar (chỉ hiển thị khi active) */}
          <div
            className={`absolute left-0 right-0 top-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 
                          ${
                            searchActive
                              ? "opacity-100 visible"
                              : "opacity-0 invisible"
                          }`}
          >
            <form
              onSubmit={handleSearch}
              className="container mx-auto px-4 py-2"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <FaSearch />
                </button>
                <button
                  type="button"
                  onClick={() => setSearchActive(false)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - User Area */}
          <div className="flex items-center space-x-2">
            {/* Notifications - Hiển thị khi đăng nhập */}
            {isAuthenticated && (
              <div className="relative">
                <NotificationsDropdown />
              </div>
            )}

            {/* Menu người dùng chưa đăng nhập */}
            {!isAuthenticated && (
              <ul className="hidden sm:flex items-center space-x-1">
                {userMenuItems
                  .filter((item) => item.loggedOut)
                  .map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          isActive
                            ? "text-blue-600 font-medium flex items-center px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30"
                            : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all nav-link-hover"
                        }
                      >
                        <span className="mr-1.5">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            )}

            {/* Menu đăng nhập/đăng ký trên mobile */}
            {!isAuthenticated && (
              <div className="sm:hidden flex space-x-1">
                <Link
                  to="/login"
                  className="text-sm p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                >
                  <FaSignInAlt />
                </Link>
                <Link
                  to="/register"
                  className="text-sm p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md"
                >
                  <FaUserPlus />
                </Link>
              </div>
            )}

            {/* Nút "Viết bài" - hiển thị phù hợp với kích thước màn hình */}
            {isAuthenticated && (
              <NavLink
                to="/posts/create"
                className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-all shadow-sm hover:shadow-md text-sm"
              >
                <FaPen className="mr-1.5" />
                <span className="hidden sm:inline">Viết bài</span>
              </NavLink>
            )}

            {/* Profile dropdown - chỉ hiển thị khi đăng nhập */}
            {isAuthenticated && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-1 transition-colors focus:outline-none"
                >
                  <div className="relative flex items-center">
                    {user?.avatar ? (
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt={user?.username || "Người dùng"}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                        onError={(e) => {
                          console.log(
                            "NavMenu: Avatar không tải được, src:",
                            e.target.src
                          );
                          e.target.onerror = null; // Tránh lặp vô hạn
                          e.target.src = "/images/default-avatar.png";
                        }}
                      />
                    ) : (
                      <FaUserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="hidden sm:flex items-center">
                    <span className="text-xs sm:text-sm font-medium max-w-[80px] sm:max-w-[100px] truncate">
                      {user?.username ||
                        user?.email?.split("@")[0] ||
                        "Người dùng"}
                    </span>
                    <FaChevronDown
                      className={`ml-1 text-gray-500 dark:text-gray-400 text-xs transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute right-0 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-all duration-200 transform ${
                    profileOpen
                      ? "scale-100 opacity-100"
                      : "scale-95 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-t-md">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.fullName || user?.username || "Người dùng"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {user?.email || ""}
                    </p>
                  </div>
                  <div className="py-1">
                    {profileMenuItems.map((item, index) =>
                      item.divider ? (
                        <hr
                          key={`divider-${index}`}
                          className="my-1 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div key={item.path || item.label}>
                          {item.path ? (
                            <Link
                              to={item.path}
                              className={`flex items-center px-4 py-2 text-sm ${
                                item.danger
                                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                              onClick={() => setProfileOpen(false)}
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </Link>
                          ) : (
                            <button
                              className={`w-full text-left flex items-center px-4 py-2 text-sm ${
                                item.danger
                                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                              onClick={item.action}
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Menu Admin - hiển thị ở footer của dropdown nếu là admin */}
                  {isAdmin && (
                    <div className="py-1 bg-gray-50 dark:bg-gray-900 rounded-b-md">
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaBolt className="mr-2" />
                        Trang quản trị
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dark Mode Toggle Button */}
            <DarkModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <NavLink
                to="/posts/create"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-2 py-1.5 text-xs rounded-md transition-all mr-2"
                aria-label="Viết bài mới"
              >
                <FaPen className="text-xs" />
              </NavLink>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
              aria-label={isOpen ? "Đóng menu" : "Mở menu"}
            >
              {isOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`fixed top-[57px] left-0 right-0 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 transform ${
              isOpen
                ? "translate-y-0 opacity-100 visible"
                : "-translate-y-full opacity-0 invisible"
            } md:hidden max-h-[calc(100vh-57px)] overflow-y-auto z-50`}
          >
            <div className="container mx-auto px-4 py-4">
              {/* Menu chính */}
              <ul className="space-y-1">
                {mainMenuItems.map((item) => {
                  // Không hiển thị nếu mục yêu cầu đăng nhập và người dùng chưa đăng nhập
                  if (item.loggedIn && !isAuthenticated) return null;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          isActive
                            ? "text-blue-600 font-medium flex items-center px-4 py-3 rounded-md bg-blue-50 dark:bg-blue-900/30"
                            : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-4 py-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        }
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
                {/* Thêm nút tìm kiếm vào menu mobile */}
                <li>
                  <button
                    onClick={() => {
                      setSearchActive(!searchActive);
                      setIsOpen(false);
                    }}
                    className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-4 py-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <span className="mr-2">
                      <FaSearch className="text-lg" />
                    </span>
                    Tìm kiếm
                  </button>
                </li>
              </ul>

              <hr className="my-4 border-gray-200 dark:border-gray-700" />

              {/* Profile Info - Mobile */}
              {!isAuthenticated ? (
                /* Menu đăng nhập, đăng ký */
                <ul className="space-y-1 mb-4">
                  {userMenuItems
                    .filter((item) => item.loggedOut)
                    .map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            isActive
                              ? "text-blue-600 font-medium flex items-center px-4 py-3 rounded-md bg-blue-50 dark:bg-blue-900/30"
                              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-4 py-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          }
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="relative">
                      {user?.avatar ? (
                        <img
                          src={getAvatarUrl(user.avatar)}
                          alt={user?.username || "Người dùng"}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                          onError={(e) => {
                            console.log(
                              "NavMenu Mobile: Avatar không tải được, src:",
                              e.target.src
                            );
                            e.target.onerror = null; // Tránh lặp vô hạn
                            e.target.src = "/images/default-avatar.png";
                          }}
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium dark:text-white">
                        {user?.username ||
                          user?.email?.split("@")[0] ||
                          "Người dùng"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>

                  {/* Menu profile + đăng xuất */}
                  <ul className="mt-2 space-y-1">
                    {profileMenuItems
                      .filter((item) => !item.divider)
                      .map((item, index) => (
                        <li key={item.path || `action-${index}`}>
                          {item.path ? (
                            <Link
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center px-4 py-3 text-sm rounded-md ${
                                item.danger
                                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </Link>
                          ) : (
                            <button
                              className={`w-full text-left flex items-center px-4 py-3 text-sm rounded-md ${
                                item.danger
                                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                              onClick={() => {
                                item.action();
                                setIsOpen(false);
                              }}
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </button>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Admin section - mobile */}
              {isAdmin && (
                <>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <ul className="space-y-1">
                    {adminMenuItems.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium flex items-center px-4 py-3 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavMenu;
