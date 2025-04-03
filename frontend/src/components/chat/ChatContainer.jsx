import React, { useState, useEffect, useRef } from "react";
import ConversationList from "./ConversationList";
import ChatMessages from "./ChatMessages";
import { useChat } from "../../context/ChatContext";
import {
  Volume2,
  VolumeX,
  Settings,
  Bell,
  X,
  Check,
  Moon,
  Sun,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Style cho container chiếm toàn bộ màn hình
const containerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

// Style cho header
const headerStyle = {
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid var(--border-color, #e5e7eb)",
};

// Style cho phần nội dung chat
const contentStyle = {
  display: "flex",
  flexDirection: "row",
  height: "calc(100% - 60px)", // Trừ đi chiều cao của header
  overflow: "hidden",
};

const ChatContainer = () => {
  const { soundEnabled, toggleSound, markAllAsRead, updateReadStatus } =
    useChat();
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [notificationMuted, setNotificationMuted] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showReadStatus, setShowReadStatus] = useState(true);

  const notificationsButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const notificationsMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  // Khởi tạo trạng thái từ localStorage khi component mount
  useEffect(() => {
    // Khởi tạo chế độ tối
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkModeEnabled(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Khởi tạo trạng thái hiển thị đã xem
    const savedShowReadStatus =
      localStorage.getItem("showReadStatus") !== "false"; // Mặc định là true
    setShowReadStatus(savedShowReadStatus);

    // Khởi tạo trạng thái thông báo
    const savedNotificationMuted =
      localStorage.getItem("notificationMuted") === "true";
    setNotificationMuted(savedNotificationMuted);
  }, []);

  // Xử lý sự kiện nhấp chuột ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng menu thông báo khi nhấp chuột ra ngoài
      if (
        showNotificationsMenu &&
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(event.target) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(event.target)
      ) {
        setShowNotificationsMenu(false);
      }

      // Đóng menu cài đặt khi nhấp chuột ra ngoài
      if (
        showSettingsMenu &&
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationsMenu, showSettingsMenu]);

  // Xử lý chức năng thông báo
  const toggleNotificationsMenu = () => {
    setShowNotificationsMenu(!showNotificationsMenu);
    if (showSettingsMenu) setShowSettingsMenu(false);
  };

  // Xử lý chức năng cài đặt
  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
    if (showNotificationsMenu) setShowNotificationsMenu(false);
  };

  // Bật/tắt thông báo
  const toggleNotifications = () => {
    const newValue = !notificationMuted;
    setNotificationMuted(newValue);
    localStorage.setItem("notificationMuted", newValue);
    toast.success(newValue ? "Đã tắt thông báo" : "Đã bật thông báo");
  };

  // Bật/tắt chế độ tối
  const toggleDarkMode = () => {
    const newValue = !darkModeEnabled;
    setDarkModeEnabled(newValue);
    localStorage.setItem("darkMode", newValue);

    if (newValue) {
      document.documentElement.classList.add("dark");
      toast.success("Đã bật chế độ tối");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Đã bật chế độ sáng");
    }
  };

  // Bật/tắt hiển thị đã xem
  const toggleReadStatus = () => {
    const newValue = !showReadStatus;
    setShowReadStatus(newValue);
    localStorage.setItem("showReadStatus", newValue);

    // Gọi hàm cập nhật trạng thái đã xem trong context
    if (updateReadStatus) {
      updateReadStatus(newValue);
    }

    toast.success(
      newValue ? "Đã bật hiển thị tin đã xem" : "Đã tắt hiển thị tin đã xem"
    );
  };

  // Đánh dấu tất cả là đã xem
  const handleMarkAllAsRead = () => {
    if (markAllAsRead) {
      markAllAsRead();
      toast.success("Đã đánh dấu tất cả là đã xem");
    }
  };

  return (
    <div
      style={containerStyle}
      className="bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <div
        style={headerStyle}
        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      >
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
            Trò chuyện
          </h1>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            Beta
          </span>
        </div>

        <div className="flex items-center space-x-2 relative">
          <button
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            title={
              soundEnabled ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"
            }
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-blue-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
          </button>

          <button
            ref={notificationsButtonRef}
            onClick={toggleNotificationsMenu}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              showNotificationsMenu
                ? "bg-blue-100 dark:bg-blue-900 text-blue-500"
                : "text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Cài đặt thông báo"
          >
            <Bell className="w-5 h-5 hover:text-blue-500 transition-colors" />
            <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            ref={settingsButtonRef}
            onClick={toggleSettingsMenu}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              showSettingsMenu
                ? "bg-blue-100 dark:bg-blue-900 text-blue-500"
                : "text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Cài đặt tin nhắn"
          >
            <Settings className="w-5 h-5 hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>

      <div
        style={contentStyle}
        className="divide-x divide-gray-200 dark:divide-gray-700"
      >
        <ConversationList showReadStatus={showReadStatus} />
        <ChatMessages showReadStatus={showReadStatus} />
      </div>

      {/* Đặt menu vào cấp cao nhất của DOM để tránh bị khuất */}
      {showNotificationsMenu && (
        <div
          ref={notificationsMenuRef}
          className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[1000]"
          style={{
            top: `${
              notificationsButtonRef.current?.getBoundingClientRect().bottom +
              10
            }px`,
            right: `${
              window.innerWidth -
              notificationsButtonRef.current?.getBoundingClientRect().right
            }px`,
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Thông báo
            </h3>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Tắt thông báo
              </span>
              <button
                onClick={toggleNotifications}
                className={`p-1 rounded-full ${
                  notificationMuted ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {notificationMuted ? (
                  <X size={14} className="text-white" />
                ) : (
                  <Check size={14} className="text-white" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Âm thanh thông báo
              </span>
              <button
                onClick={toggleSound}
                className={`p-1 rounded-full ${
                  soundEnabled ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {soundEnabled ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <X size={14} className="text-white" />
                )}
              </button>
            </div>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <button
              onClick={handleMarkAllAsRead}
              className="w-full text-sm text-center p-2 mt-1 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          </div>
        </div>
      )}

      {/* Menu cài đặt ở cấp cao nhất */}
      {showSettingsMenu && (
        <div
          ref={settingsMenuRef}
          className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[1000]"
          style={{
            top: `${
              settingsButtonRef.current?.getBoundingClientRect().bottom + 10
            }px`,
            right: `${
              window.innerWidth -
              settingsButtonRef.current?.getBoundingClientRect().right
            }px`,
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Cài đặt
            </h3>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <div className="flex items-center">
                {darkModeEnabled ? (
                  <Moon className="w-4 h-4 mr-2 text-blue-500" />
                ) : (
                  <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Chế độ tối
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-1 rounded-full ${
                  darkModeEnabled
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                {darkModeEnabled ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <X size={14} className="text-white" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Hiển thị tin đã xem
                </span>
              </div>
              <button
                onClick={toggleReadStatus}
                className={`p-1 rounded-full ${
                  showReadStatus
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                {showReadStatus ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <X size={14} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
