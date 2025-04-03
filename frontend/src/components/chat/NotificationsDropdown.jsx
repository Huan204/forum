import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-hot-toast";

const NotificationsDropdown = () => {
  const {
    notifications,
    markNotificationAsRead,
    selectConversation,
    createConversation,
  } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đếm thông báo chưa đọc
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Format thời gian
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  // Xử lý khi click vào thông báo
  const handleNotificationClick = async (notification) => {
    try {
      if (
        !markNotificationAsRead ||
        typeof markNotificationAsRead !== "function"
      ) {
        console.error(
          "markNotificationAsRead không phải là một hàm",
          markNotificationAsRead
        );
        setIsOpen(false);
        return;
      }

      // Đánh dấu thông báo đã đọc
      markNotificationAsRead(notification.id);

      if (notification.type === "new_message" && notification.data) {
        const sender = notification.data.sender;

        if (!sender || !sender._id) {
          toast.error("Không thể xác định người gửi tin nhắn");
          setIsOpen(false);
          return;
        }

        // Tạo hoặc tìm cuộc trò chuyện với người gửi
        const conversation = await createConversation(sender._id);

        if (!conversation) {
          toast.error("Không thể tạo cuộc trò chuyện");
          setIsOpen(false);
          return;
        }

        // Chọn cuộc trò chuyện và chuyển hướng đến trang tin nhắn
        selectConversation(conversation);
        navigate("/messages");
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo:", error);
      toast.error("Có lỗi xảy ra khi xử lý thông báo");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 min-w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Thông báo</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Không có thông báo mới
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification, index) => (
                  <li
                    key={index}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      notification.read ? "opacity-70" : "font-medium"
                    }`}
                  >
                    <div className="flex items-start">
                      {notification.data?.sender?.avatar && (
                        <img
                          src={
                            notification.data.sender.avatar ||
                            "/default-avatar.png"
                          }
                          alt=""
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(notification.timestamp || new Date())}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                onClick={() => {
                  notifications.forEach((n) => markNotificationAsRead(n.id));
                  setIsOpen(false);
                }}
              >
                Đánh dấu tất cả là đã đọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
