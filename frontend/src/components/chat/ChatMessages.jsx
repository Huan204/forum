import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-hot-toast";
import {
  Send,
  Smile,
  ChevronDown,
  Image,
  Paperclip,
  Mic,
  MoreHorizontal,
  Phone,
  Video,
  Search,
  User,
  AlertTriangle,
  Delete,
  Archive,
  XCircle,
  File,
  Download,
  Palette,
  Check,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import ThemeSelector from "./ThemeSelector";

// Style cho container chính của tin nhắn
const chatMessagesContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  backgroundColor: "var(--bg-secondary, #f9fafb)",
};

// Style cho header
const headerStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid var(--border-color, #e5e7eb)",
  backgroundColor: "var(--bg-primary, white)",
  zIndex: 10,
};

// Style cho khu vực tin nhắn
const getMessagesAreaStyle = (theme) => {
  return {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    backgroundColor: theme ? theme.lightBg : "var(--bg-secondary, #f9fafb)",
    backgroundImage:
      'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.343-3 3 1.343 3 3 3zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E\')',
  };
};

// Style cho khu vực nhập tin nhắn
const inputAreaStyle = {
  padding: "0.75rem",
  borderTop: "1px solid var(--border-color, #e5e7eb)",
  backgroundColor: "var(--bg-primary, white)",
  zIndex: 10,
};

const ChatMessages = ({ showReadStatus = true }) => {
  const {
    activeConversation,
    messages,
    loadingMessages,
    sendMessage,
    sendImages,
    sendFile,
    typing,
    sendTypingStatus,
    changeConversationTheme,
    getConversationTheme,
  } = useChat();
  const { user } = useAuth();

  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [imageInputKey, setImageInputKey] = useState("image-input-key");
  const [fileInputKey, setFileInputKey] = useState("file-input-key");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState([]);

  // Kiểm tra xem có đang ở chế độ tối hay không
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Cuộn xuống cuối khi có tin nhắn mới hoặc đổi đoạn chat
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);

  // Kiểm tra vị trí cuộn để hiển thị nút cuộn xuống
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Hiện nút khi người dùng cuộn lên trên (cách đáy 300px)
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Theo dõi trạng thái đang nhập
  useEffect(() => {
    if (activeConversation) {
      const isUserTyping = typing[activeConversation._id];
      setIsTyping(isUserTyping);
    }
  }, [typing, activeConversation]);

  // Xử lý đếm thời gian ghi âm
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Hàm cuộn xuống cuối cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Bắt đầu/dừng ghi âm
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (showMoreMenu) setShowMoreMenu(false);

    if (!isRecording) {
      // Logic bắt đầu ghi âm ở đây
      toast.success("Đã bắt đầu ghi âm");
    } else {
      // Logic dừng và gửi ghi âm ở đây
      toast.success("Đã gửi ghi âm");
    }
  };

  // Hiển thị menu More
  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  // Bắt đầu cuộc gọi thoại
  const startVoiceCall = () => {
    toast.info("Đang bắt đầu cuộc gọi thoại...");
    setShowMoreMenu(false);
  };

  // Bắt đầu cuộc gọi video
  const startVideoCall = () => {
    toast.info("Đang bắt đầu cuộc gọi video...");
    setShowMoreMenu(false);
  };

  // Tìm kiếm trong tin nhắn
  const toggleSearchMode = () => {
    setSearchMode(!searchMode);
    setShowMoreMenu(false);
    if (!searchMode) {
      setTimeout(() => {
        document.getElementById("message-search-input")?.focus();
      }, 100);
    }
  };

  // Xem thông tin người dùng
  const viewUserProfile = () => {
    toast.info("Đang mở thông tin người dùng...");
    setShowMoreMenu(false);
  };

  // Báo cáo người dùng
  const reportUser = () => {
    toast.warning("Chức năng báo cáo đang được phát triển");
    setShowMoreMenu(false);
  };

  // Xóa cuộc trò chuyện
  const deleteConversation = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) {
      toast.success("Đã xóa cuộc trò chuyện");
    }
    setShowMoreMenu(false);
  };

  // Lưu trữ cuộc trò chuyện
  const archiveConversation = () => {
    toast.success("Đã lưu trữ cuộc trò chuyện");
    setShowMoreMenu(false);
  };

  // Xử lý chọn ảnh
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Hiển thị preview ảnh đã chọn
    const newPreviewImages = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviewImages.push({
          file: file,
          url: e.target.result,
          name: file.name,
        });
        if (newPreviewImages.length === files.length) {
          setPreviewImages([...previewImages, ...newPreviewImages]);
          setSelectedImages([...selectedImages, ...files]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Xử lý gửi ảnh
  const handleSendImages = async () => {
    if (selectedImages.length === 0) return;

    try {
      setUploadingMedia(true);
      const result = await sendImages(selectedImages);

      if (result) {
        // Xóa preview và danh sách ảnh đã chọn sau khi gửi thành công
        setPreviewImages([]);
        setSelectedImages([]);
        toast.success(`Đã gửi ${selectedImages.length} ảnh`);
      } else {
        // Nếu không có kết quả trả về nhưng không có lỗi
        toast.error("Không thể gửi ảnh do lỗi không xác định");
      }
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error);

      // Xử lý thông báo lỗi cụ thể
      if (error.response) {
        // Lỗi từ server
        const errorMessage =
          error.response.data?.message || "Không thể gửi ảnh";
        toast.error(errorMessage);

        if (error.response.data?.error) {
          console.error("Chi tiết lỗi:", error.response.data.error);
        }
      } else if (error.request) {
        // Không nhận được phản hồi
        toast.error("Không thể kết nối đến máy chủ, vui lòng thử lại sau");
      } else {
        // Lỗi trong quá trình thiết lập request
        toast.error("Không thể gửi ảnh, vui lòng thử lại");
      }
    } finally {
      setUploadingMedia(false);

      // Nếu gặp lỗi, đặt lại input để người dùng có thể thử lại
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  // Xử lý xóa ảnh khỏi preview
  const handleRemoveImage = (index) => {
    const newPreviewImages = [...previewImages];
    const newSelectedImages = [...selectedImages];
    newPreviewImages.splice(index, 1);
    newSelectedImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    setSelectedImages(newSelectedImages);
  };

  // Xử lý chọn file
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      const result = await sendFile(file);

      if (result) {
        toast.success(`Đã gửi tệp: ${file.name}`);
      } else {
        toast.error("Không thể gửi tệp do lỗi không xác định");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tệp:", error);

      // Xử lý thông báo lỗi cụ thể
      if (error.response) {
        // Lỗi từ server
        const errorMessage =
          error.response.data?.message || "Không thể gửi tệp";
        toast.error(errorMessage);

        if (error.response.data?.error) {
          console.error("Chi tiết lỗi:", error.response.data.error);
        }
      } else if (error.request) {
        // Không nhận được phản hồi
        toast.error("Không thể kết nối đến máy chủ, vui lòng thử lại sau");
      } else {
        // Lỗi trong quá trình thiết lập request
        toast.error("Không thể gửi tệp, vui lòng thử lại");
      }
    } finally {
      setUploadingMedia(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Hàm hiển thị nội dung tin nhắn dựa vào loại
  const renderMessageContent = (message) => {
    const isCurrentUser = message.sender._id === user._id;
    const theme = getConversationTheme(activeConversation._id);

    // Style cho tin nhắn dựa trên chủ đề và người gửi
    const messageStyle = isCurrentUser
      ? {
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          color: "white",
          boxShadow: "none",
          border: "none",
          outline: "none",
          borderWidth: "0px",
          borderStyle: "none",
          borderColor: "transparent",
        }
      : {
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          color: "#1F2937",
          boxShadow: "none",
          border: "none",
          outline: "none",
          borderWidth: "0px",
          borderStyle: "none",
          borderColor: "transparent",
        };

    // Xác định lớp CSS cho tin nhắn dựa vào người gửi
    const determineRoundedClass = () => {
      // Xác định góc bo cho tin nhắn dựa vào vị trí trong nhóm
      const messagesArray = messages; // Đặt một tên khác cho biến messages
      const index = messagesArray.findIndex((m) => m._id === message._id);

      let isFirstInGroup = false;
      let isLastInGroup = false;

      if (index >= 0) {
        isFirstInGroup =
          index === 0 ||
          (messagesArray[index - 1] &&
            messagesArray[index - 1].sender._id !== message.sender._id);

        isLastInGroup =
          index === messagesArray.length - 1 ||
          (messagesArray[index + 1] &&
            messagesArray[index + 1].sender._id !== message.sender._id);
      }

      if (isCurrentUser) {
        if (isFirstInGroup) return "rounded-t-lg rounded-bl-lg";
        if (isLastInGroup) return "rounded-b-lg rounded-bl-lg";
        return "rounded-l-lg";
      } else {
        if (isFirstInGroup) return "rounded-t-lg rounded-br-lg";
        if (isLastInGroup) return "rounded-b-lg rounded-br-lg";
        return "rounded-r-lg";
      }
    };

    const messageContentClass = `
      ${message.isLoading ? "opacity-70" : ""}
      relative rounded-lg p-3 break-words px-3 py-2 ${determineRoundedClass()}
      ${message.sender._id === user._id ? "ml-auto mr-2" : "mr-auto ml-2"}
    `;

    // Tin nhắn đang trong quá trình gửi
    if (message.isLoading) {
      if (
        message.type === "image" &&
        message.images &&
        message.images.length > 0
      ) {
        // Hiển thị placeholder cho ảnh đang tải
        return (
          <div className={messageContentClass} style={messageStyle}>
            <div className="message-images">
              <div
                className={`grid ${
                  message.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                } gap-1`}
              >
                {message.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Ảnh ${index + 1}`}
                      className="rounded-md object-cover w-full h-auto max-h-60 opacity-70"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                Đang gửi...
              </p>
            </div>
            <div className="flex items-center justify-end mt-1 space-x-1">
              <p className="text-xs opacity-70">
                {formatMessageTime(message.createdAt)}
              </p>
              {showReadStatus && message.sender._id === user._id && (
                <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
              )}
            </div>
          </div>
        );
      } else if (message.type === "file" && message.file) {
        // Hiển thị placeholder cho file đang tải
        return (
          <div className={messageContentClass} style={messageStyle}>
            <div className="file-message">
              <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md opacity-70">
                <File className="w-8 h-8 text-blue-500 mr-2" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {message.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(message.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                Đang gửi...
              </p>
            </div>
            <div className="flex items-center justify-end mt-1 space-x-1">
              <p className="text-xs opacity-70">
                {formatMessageTime(message.createdAt)}
              </p>
              {showReadStatus && message.sender._id === user._id && (
                <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
              )}
            </div>
          </div>
        );
      }
    }

    // Tin nhắn chứa ảnh
    if (
      message.type === "image" &&
      message.images &&
      message.images.length > 0
    ) {
      return (
        <div className={messageContentClass} style={messageStyle}>
          <div
            className={`grid ${
              message.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            } gap-1`}
          >
            {message.images.map((img, index) => {
              // Đảm bảo URL ảnh đúng định dạng
              let imageUrl = img.url;
              if (!imageUrl.startsWith("http")) {
                imageUrl = `http://localhost:5000${img.url}`;
              }

              console.log("Hiển thị ảnh với URL:", imageUrl);

              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Ảnh ${index + 1}`}
                    className="rounded-md object-cover w-full h-auto max-h-60 cursor-pointer"
                    onClick={() => window.open(imageUrl, "_blank")}
                    onError={(e) => {
                      console.error("Lỗi tải ảnh:", imageUrl);
                      e.target.onerror = null;
                      e.target.src = "/images/image-error.png";
                      e.target.style.opacity = "0.5";
                      toast.error(
                        `Không thể tải ảnh: ${img.name || "Ảnh không xác định"}`
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
          {message.content && <p className="text-sm mt-1">{message.content}</p>}
          <div className="flex items-center justify-end mt-1 space-x-1">
            <p className="text-xs opacity-70">
              {formatMessageTime(message.createdAt)}
            </p>
            {showReadStatus && message.sender._id === user._id && (
              <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
            )}
          </div>
        </div>
      );
    }

    // Tin nhắn chứa file
    else if (message.type === "file" && message.file) {
      // Đảm bảo URL file đúng định dạng
      let fileUrl = message.file.url;
      if (!fileUrl.startsWith("http")) {
        fileUrl = `http://localhost:5000${message.file.url}`;
      }

      console.log("Hiển thị file với URL:", fileUrl);

      return (
        <div className={messageContentClass} style={messageStyle}>
          <div className="flex items-center p-2 bg-opacity-70 bg-white dark:bg-gray-700 dark:bg-opacity-70 rounded-md">
            <File className="w-8 h-8 text-blue-500 mr-2" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-gray-800 dark:text-white">
                {message.file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(message.file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="ml-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                // Xác nhận URL trước khi tải
                console.log("Đang tải file:", fileUrl);
                // Kiểm tra xem URL có tồn tại không
                const testLink = new Image();
                testLink.onerror = () => {
                  e.preventDefault();
                  toast.error(
                    `Không thể tải file: ${
                      message.file.name || "File không xác định"
                    }`
                  );
                };
                testLink.src = fileUrl;
              }}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
          {message.content && <p className="text-sm mt-1">{message.content}</p>}
          <div className="flex items-center justify-end mt-1 space-x-1">
            <p className="text-xs opacity-70">
              {formatMessageTime(message.createdAt)}
            </p>
            {showReadStatus && message.sender._id === user._id && (
              <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
            )}
          </div>
        </div>
      );
    }

    // Tin nhắn văn bản thông thường
    else {
      return (
        <div className={messageContentClass} style={messageStyle}>
          {message.content}
          <div className="flex items-center justify-end mt-1 space-x-1">
            <p className="text-xs opacity-70">
              {formatMessageTime(message.createdAt)}
            </p>
            {showReadStatus && message.sender._id === user._id && (
              <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
            )}
          </div>
        </div>
      );
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    // Nếu có ảnh được chọn, gửi ảnh
    if (selectedImages.length > 0) {
      handleSendImages();
      return;
    }

    // Nếu không, gửi tin nhắn văn bản
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
      // Dừng trạng thái đang nhập
      sendTypingStatus(false);
      // Đảm bảo cuộn xuống sau khi gửi tin nhắn
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Gửi trạng thái đang nhập
    if (e.target.value.trim() !== "") {
      sendTypingStatus(true);

      // Xóa timeout hiện tại nếu có
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Đặt timeout mới để dừng trạng thái đang nhập sau 2 giây không nhập
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 2000);
    } else {
      sendTypingStatus(false);
    }
  };

  // Format thời gian tin nhắn
  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  // Format thời gian ghi âm
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const toggleEmojiPicker = () => {
    setEmojiPickerVisible(!emojiPickerVisible);
  };

  const toggleThemeSelector = () => {
    console.log("Đang mở bảng chọn chủ đề", showThemeSelector);
    setShowThemeSelector(!showThemeSelector);
    setShowMoreMenu(false);
    console.log("Sau khi cập nhật:", !showThemeSelector);
  };

  const handleThemeChange = (themeKey) => {
    if (activeConversation?._id) {
      changeConversationTheme(activeConversation._id, themeKey);
      toast.success(
        `Chủ đề đã được thay đổi thành ${AVAILABLE_THEMES[themeKey].name}`
      );
      setShowThemeSelector(false);
    }
  };

  // Lấy chủ đề hiện tại của cuộc trò chuyện
  const currentTheme = activeConversation
    ? getConversationTheme(activeConversation._id)
    : null;

  // Thiết lập styles dựa trên theme
  const messagesAreaStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    backgroundColor: currentTheme
      ? currentTheme.lightBg
      : "var(--bg-secondary, #f9fafb)",
    backgroundImage: currentTheme
      ? `linear-gradient(to bottom, ${currentTheme.lightBg}, ${currentTheme.lightBg}), url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.343-3 3 1.343 3 3 3zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E')`
      : 'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.343-3 3 1.343 3 3 3zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E\')',
  };

  // Lấy tất cả chủ đề có sẵn từ context
  const AVAILABLE_THEMES = {
    blue: {
      name: "Xanh dương",
      primary: "#3B82F6",
      gradient: "from-blue-400 to-blue-600",
      lightBg: "#EFF6FF",
      darkBg: "#1E3A8A",
    },
    purple: {
      name: "Tím",
      primary: "#8B5CF6",
      gradient: "from-purple-400 to-purple-600",
      lightBg: "#F5F3FF",
      darkBg: "#4C1D95",
    },
    green: {
      name: "Xanh lá",
      primary: "#10B981",
      gradient: "from-green-400 to-green-600",
      lightBg: "#ECFDF5",
      darkBg: "#064E3B",
    },
    pink: {
      name: "Hồng",
      primary: "#EC4899",
      gradient: "from-pink-400 to-pink-600",
      lightBg: "#FDF2F8",
      darkBg: "#831843",
    },
    orange: {
      name: "Cam",
      primary: "#F59E0B",
      gradient: "from-orange-400 to-orange-600",
      lightBg: "#FEF3C7",
      darkBg: "#7C2D12",
    },
    red: {
      name: "Đỏ",
      primary: "#EF4444",
      gradient: "from-red-400 to-red-600",
      lightBg: "#FEE2E2",
      darkBg: "#7F1D1D",
    },
    gray: {
      name: "Xám",
      primary: "#6B7280",
      gradient: "from-gray-400 to-gray-600",
      lightBg: "#F3F4F6",
      darkBg: "#1F2937",
    },
    indigo: {
      name: "Chàm",
      primary: "#6366F1",
      gradient: "from-indigo-400 to-indigo-600",
      lightBg: "#EEF2FF",
      darkBg: "#312E81",
    },
  };

  if (!activeConversation) {
    return (
      <div
        style={chatMessagesContainerStyle}
        className="flex items-center justify-center dark:bg-gray-800"
      >
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Send className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trò chuyện mới
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chọn một đoạn chat từ danh sách hoặc tìm kiếm người dùng để bắt đầu
            cuộc trò chuyện mới
          </p>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
            Tìm thêm bạn bè
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={chatMessagesContainerStyle} className="dark:bg-gray-800">
      {/* Header */}
      <div
        style={headerStyle}
        className="dark:bg-gray-900 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      >
        {searchMode ? (
          <div className="flex items-center">
            <button
              onClick={toggleSearchMode}
              className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                id="message-search-input"
                type="text"
                placeholder="Tìm kiếm trong cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 px-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 dark:text-white text-sm"
              />
              <Search className="absolute right-3 top-1.5 text-gray-400 w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={activeConversation.avatar || "/default-avatar.png"}
                  alt={activeConversation.name || activeConversation.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
              </div>
              <div className="ml-3">
                <h3 className="font-medium">
                  {activeConversation.name || activeConversation.username}
                </h3>
                {isTyping ? (
                  <p className="text-xs animate-pulse flex items-center">
                    <span
                      className="font-medium"
                      style={{
                        color: currentTheme ? currentTheme.primary : "#3B82F6",
                      }}
                    >
                      Đang nhập
                    </span>
                    <span className="flex space-x-1 ml-1">
                      <span
                        className="w-1 h-1 rounded-full animate-bounce"
                        style={{
                          backgroundColor: currentTheme
                            ? currentTheme.primary
                            : "#3B82F6",
                          animationDelay: "0ms",
                        }}
                      ></span>
                      <span
                        className="w-1 h-1 rounded-full animate-bounce"
                        style={{
                          backgroundColor: currentTheme
                            ? currentTheme.primary
                            : "#3B82F6",
                          animationDelay: "150ms",
                        }}
                      ></span>
                      <span
                        className="w-1 h-1 rounded-full animate-bounce"
                        style={{
                          backgroundColor: currentTheme
                            ? currentTheme.primary
                            : "#3B82F6",
                          animationDelay: "300ms",
                        }}
                      ></span>
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeConversation.isOnline
                      ? "Đang hoạt động"
                      : "Không hoạt động"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-1 relative">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  isRecording
                    ? "bg-red-100 text-red-500 dark:bg-red-900 animate-pulse"
                    : "text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Mic className="w-5 h-5" />
                {isRecording && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {formatRecordingTime(recordingTime)}
                  </span>
                )}
              </button>

              <button
                onClick={toggleMoreMenu}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  showMoreMenu
                    ? "bg-blue-100 text-blue-500 dark:bg-blue-900"
                    : "text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Menu điều hướng */}
              {showMoreMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={startVoiceCall}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Gọi thoại
                    </button>
                    <button
                      onClick={startVideoCall}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Gọi video
                    </button>
                    <button
                      onClick={toggleSearchMode}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Tìm kiếm tin nhắn
                    </button>
                    <button
                      onClick={viewUserProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Xem hồ sơ
                    </button>

                    <button
                      onClick={toggleThemeSelector}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Thay đổi chủ đề
                    </button>

                    <hr className="my-1 border-gray-200 dark:border-gray-700" />

                    <button
                      onClick={reportUser}
                      className="flex items-center w-full px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Báo cáo
                    </button>
                    <button
                      onClick={archiveConversation}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Lưu trữ
                    </button>
                    <button
                      onClick={deleteConversation}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Delete className="w-4 h-4 mr-2" />
                      Xóa cuộc trò chuyện
                    </button>
                  </div>
                </div>
              )}

              {/* Theme Selector Popup */}
              {showThemeSelector && (
                <ThemeSelector
                  onThemeChange={handleThemeChange}
                  currentTheme={currentTheme}
                  themes={AVAILABLE_THEMES}
                  onClose={() => setShowThemeSelector(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        style={messagesAreaStyle}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 dark:bg-gray-800"
      >
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Không có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
              </p>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-l-lg hover:bg-blue-50 focus:z-10 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
                  onClick={() => setEmojiPickerVisible(true)}
                >
                  <Smile className="w-4 h-4 mr-2 inline" />
                  Gửi emoji
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border-t border-b border-r border-blue-200 rounded-r-lg hover:bg-blue-50 focus:z-10 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
                  onClick={() => imageInputRef.current.click()}
                >
                  <Image className="w-4 h-4 mr-2 inline" />
                  Gửi ảnh
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => {
              // Kiểm tra xem tin nhắn có phải do người dùng hiện tại gửi không
              const senderId =
                typeof message.sender === "object"
                  ? message.sender._id
                  : message.sender;
              const isSender = user && senderId === user._id;

              // Xác định nếu là nhóm tin nhắn đầu tiên từ cùng người gửi
              const isFirstInGroup =
                index === 0 ||
                (messages[index - 1] &&
                  (typeof messages[index - 1].sender === "object"
                    ? messages[index - 1].sender._id
                    : messages[index - 1].sender) !== senderId);

              // Xác định nếu là nhóm tin nhắn cuối cùng từ cùng người gửi
              const isLastInGroup =
                index === messages.length - 1 ||
                (messages[index + 1] &&
                  (typeof messages[index + 1].sender === "object"
                    ? messages[index + 1].sender._id
                    : messages[index + 1].sender) !== senderId);

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div className="flex items-end space-x-2">
                    {!isSender && (
                      <img
                        src={
                          message.sender.avatar || "/images/default-avatar.png"
                        }
                        alt={message.sender.username}
                        className={`w-8 h-8 rounded-full object-cover ${
                          !isFirstInGroup && "invisible"
                        }`}
                      />
                    )}
                    {renderMessageContent(message)}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Nút cuộn xuống */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors z-10 animate-bounce"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input form */}
      <div
        style={inputAreaStyle}
        className="dark:bg-gray-900 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      >
        {/* Preview ảnh đã chọn */}
        {previewImages.length > 0 && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {previewImages.length} ảnh đã chọn
              </span>
              <button
                onClick={() => {
                  setPreviewImages([]);
                  setSelectedImages([]);
                }}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {previewImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-20 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-0.5"
                  >
                    <XCircle className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isRecording ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Đang ghi âm... {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={toggleRecording}
              >
                Hủy
              </button>
              <button
                className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600"
                onClick={toggleRecording}
              >
                Gửi
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none"
            >
              <Smile className="w-6 h-6" />
            </button>

            {emojiPickerVisible && (
              <div className="absolute bottom-16 left-2">
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setMessageInput((prev) => prev + emoji.emoji)
                  }
                  lazyLoadEmojis={true}
                  searchDisabled={false}
                  skinTonesDisabled={true}
                  categories={[
                    "smileys_people",
                    "animals_nature",
                    "food_drink",
                    "travel_places",
                    "activities",
                    "objects",
                    "symbols",
                    "flags",
                  ]}
                />
              </div>
            )}

            <div className="flex-1 relative mx-1">
              <input
                type="text"
                id="message-input"
                placeholder={
                  uploadingMedia
                    ? "Đang tải lên..."
                    : isTyping
                    ? "Đối phương đang nhập..."
                    : "Nhập tin nhắn..."
                }
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isRecording) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={uploadingMedia || isRecording}
                className={`w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-600 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  isRecording ? "opacity-50" : ""
                }`}
              />
            </div>

            <div className="flex items-center gap-1 relative">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageSelect}
                className="hidden"
                multiple
                accept="image/*"
                disabled={uploadingMedia || isRecording}
                key={imageInputKey}
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
                disabled={uploadingMedia || isRecording}
                key={fileInputKey}
              />

              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none disabled:opacity-50"
                disabled={uploadingMedia || isRecording}
              >
                <Image className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none disabled:opacity-50"
                disabled={uploadingMedia || isRecording}
              >
                <Paperclip className="w-6 h-6" />
              </button>

              <button
                type="submit"
                className="p-2 rounded-full disabled:opacity-50 focus:outline-none"
                style={{
                  backgroundColor: currentTheme?.primary || "#3B82F6",
                  color: "white",
                }}
                disabled={
                  (messageInput.trim() === "" && selectedImages.length === 0) ||
                  uploadingMedia ||
                  isRecording
                }
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
