import React, { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Search,
  User,
  UserPlus,
  Edit,
  Users,
  Star,
  Clock,
  InboxIcon,
} from "lucide-react";
import { api } from "../../services/api";
import { toast } from "react-hot-toast";

// Style cho danh sách hội thoại
const conversationListStyle = {
  width: "320px", // Tăng chiều rộng một chút
  height: "100%", // Chiều cao 100%
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid var(--border-color, #e5e7eb)",
  overflow: "hidden", // Không cho phép overflow
};

// Style cho phần tìm kiếm
const searchContainerStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid var(--border-color, #e5e7eb)",
};

// Style cho danh sách cuộc trò chuyện
const listContainerStyle = {
  flex: 1,
  overflowY: "auto", // Chỉ cho phép thanh cuộn ở đây
  backgroundColor: "var(--bg-color, white)",
};

// Style cho chỉ báo online
const onlineIndicatorStyle = {
  position: "absolute",
  bottom: "2px",
  right: "2px",
  width: "10px",
  height: "10px",
  backgroundColor: "#10b981", // màu xanh lá
  borderRadius: "50%",
  border: "2px solid var(--bg-color, white)",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease", // Thêm hiệu ứng chuyển đổi mượt mà
};

const ConversationList = ({ showReadStatus = true }) => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    onlineUsers,
    unreadMessages,
    updateConversationList,
    createConversation,
  } = useChat();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "unread", "online", "favorites"

  useEffect(() => {
    // Cập nhật danh sách đoạn chat mỗi 30 giây
    const interval = setInterval(() => {
      updateConversationList();
    }, 30000);

    return () => clearInterval(interval);
  }, [updateConversationList]);

  // Thêm hàm tìm kiếm người dùng
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setShowSearchResults(false);
      return;
    }

    if (query.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);

      try {
        const response = await api.get(
          `/users/search?q=${encodeURIComponent(query)}`
        );
        if (response.data) {
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error);
        toast.error("Không thể tìm kiếm người dùng");
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Hàm khởi tạo cuộc trò chuyện mới với người dùng
  const handleStartConversation = async (userId) => {
    try {
      // Sử dụng hàm createConversation từ ChatContext
      const conversation = await createConversation(userId);

      if (conversation) {
        // Chọn cuộc trò chuyện mới tạo
        selectConversation(conversation);
        // Ẩn kết quả tìm kiếm
        setShowSearchResults(false);
        setSearchQuery("");
        // Cập nhật lại danh sách hội thoại
        updateConversationList();
      }
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện:", error);
      toast.error("Không thể tạo cuộc trò chuyện");
    }
  };

  const formatLastActive = (lastActive) => {
    if (!lastActive) return "Không rõ";
    return formatDistanceToNow(new Date(lastActive), {
      addSuffix: true,
      locale: vi,
    });
  };

  // Lọc cuộc trò chuyện theo bộ lọc đã chọn
  const filteredConversations = conversations.filter((conversation) => {
    if (filter === "all") return true;
    if (filter === "unread") return (unreadMessages[conversation._id] || 0) > 0;
    if (filter === "online") {
      const userStatus = onlineUsers[conversation._id] || {};
      return userStatus.isOnline;
    }
    return true;
  });

  return (
    <div style={conversationListStyle} className="bg-white dark:bg-gray-900">
      <div
        style={searchContainerStyle}
        className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 dark:text-white transition-all duration-200"
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />

          {/* Nút tạo tin nhắn mới */}
          <button
            className="absolute right-3 top-2 text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Tạo cuộc trò chuyện mới"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Kết quả tìm kiếm */}
          {showSearchResults && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {isSearching ? (
                <div className="p-3 text-center">
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent text-blue-500 rounded-full"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Đang tìm kiếm...
                  </span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  Không tìm thấy người dùng
                </div>
              ) : (
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li
                      key={user._id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between transition-colors duration-200"
                      onClick={() => handleStartConversation(user._id)}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={user.avatar || "/default-avatar.png"}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                          {user.isOnline && (
                            <div
                              className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800"
                              style={onlineIndicatorStyle}
                            ></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <button
                        className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Bắt đầu cuộc trò chuyện"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="px-2 py-1 flex space-x-1 overflow-x-auto whitespace-nowrap bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter("all")}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors duration-200 ${
            filter === "all"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <InboxIcon className="w-3 h-3 inline mr-1" />
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors duration-200 ${
            filter === "unread"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Clock className="w-3 h-3 inline mr-1" />
          Chưa đọc
        </button>
        <button
          onClick={() => setFilter("online")}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors duration-200 ${
            filter === "online"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Users className="w-3 h-3 inline mr-1" />
          Đang online
        </button>
      </div>

      <div
        style={listContainerStyle}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40 p-4">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Không có cuộc trò chuyện nào. <br />
              Hãy tìm kiếm người dùng để bắt đầu.
            </p>
          </div>
        ) : (
          <ul>
            {filteredConversations.map((conversation) => {
              const isActive =
                activeConversation &&
                activeConversation._id === conversation._id;

              // Xác định trạng thái online
              const userStatus = onlineUsers[conversation._id] || {};
              const isOnline = userStatus.isOnline === true;

              // Số tin nhắn chưa đọc
              const unreadCount = unreadMessages[conversation._id] || 0;

              return (
                <li
                  key={conversation._id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 dark:border-blue-600"
                      : "bg-white dark:bg-gray-900"
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                      <img
                        src={conversation.avatar || "/default-avatar.png"}
                        alt={conversation.name || conversation.username}
                        className={`w-10 h-10 rounded-full object-cover border ${
                          isActive
                            ? "border-blue-500 dark:border-blue-600"
                            : "border-gray-200 dark:border-gray-700"
                        } ${
                          isOnline
                            ? "ring-2 ring-green-500 ring-opacity-50"
                            : ""
                        }`}
                      />
                      {isOnline && (
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
                          style={onlineIndicatorStyle}
                        ></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3
                          className={`font-medium truncate ${
                            unreadCount > 0 ? "font-semibold" : ""
                          }`}
                        >
                          {conversation.name || conversation.username}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(
                              new Date(conversation.lastMessage.createdAt),
                              { addSuffix: true, locale: vi }
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p
                          className={`text-sm truncate ${
                            unreadCount > 0
                              ? "text-gray-800 dark:text-gray-200 font-medium"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {conversation.lastMessage
                            ? conversation.lastMessage.content
                            : "Chưa có tin nhắn"}
                        </p>
                        {unreadCount > 0 && showReadStatus && (
                          <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
