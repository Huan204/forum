import React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { File, Download } from "lucide-react";
import { toast } from "react-hot-toast";

// Hằng số cho URL server backend
const API_BASE_URL = "http://localhost:5000";
const DEFAULT_ERROR_IMAGE = "/default_avatar.png";

const ChatMessage = ({
  message,
  isSender,
  showReadStatus,
  isFirstInGroup,
  isLastInGroup,
}) => {
  // Format thời gian tin nhắn
  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  // Hàm hiển thị nội dung tin nhắn dựa vào loại
  const renderMessageContent = () => {
    // Tin nhắn chứa ảnh
    if (
      message.type === "image" &&
      message.images &&
      message.images.length > 0
    ) {
      return (
        <div className="message-images">
          <div
            className={`grid ${
              message.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            } gap-1`}
          >
            {message.images.map((img, index) => {
              // Đảm bảo URL ảnh đúng định dạng
              let imageUrl = img.url;
              if (!imageUrl.startsWith("http")) {
                imageUrl = `${API_BASE_URL}${img.url}`;
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
                      e.target.src = DEFAULT_ERROR_IMAGE;
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
        </div>
      );
    }

    // Tin nhắn chứa file
    else if (message.type === "file" && message.file) {
      // Đảm bảo URL file đúng định dạng
      let fileUrl = message.file.url;
      if (!fileUrl.startsWith("http")) {
        fileUrl = `${API_BASE_URL}${message.file.url}`;
      }

      console.log("Hiển thị file với URL:", fileUrl);

      return (
        <div className="file-message">
          <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <File className="w-8 h-8 text-blue-500 mr-2" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
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
        </div>
      );
    }

    // Tin nhắn văn bản thông thường
    else {
      return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>
      <div className="flex items-end space-x-2">
        {!isSender && message.sender && (
          <img
            src={message.sender.avatar || "/default_avatar.png"}
            alt={message.sender.username || "Người dùng"}
            className={`w-8 h-8 rounded-full object-cover ${
              !isFirstInGroup && "invisible"
            }`}
          />
        )}
        <div
          className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-3 py-2 ${
            isSender
              ? isFirstInGroup
                ? "rounded-t-lg rounded-bl-lg"
                : isLastInGroup
                ? "rounded-b-lg rounded-bl-lg"
                : "rounded-l-lg"
              : isFirstInGroup
              ? "rounded-t-lg rounded-br-lg"
              : isLastInGroup
              ? "rounded-b-lg rounded-br-lg"
              : "rounded-r-lg"
          } ${
            isSender
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          } shadow-sm transition-all hover:shadow-md`}
        >
          {renderMessageContent()}
          {isLastInGroup && (
            <div className="flex items-center justify-end mt-1 space-x-1">
              <p className="text-xs opacity-70">
                {formatMessageTime(message.createdAt)}
              </p>
              {isSender && showReadStatus && (
                <span className="text-xs">{message.isRead ? "✓✓" : "✓"}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
