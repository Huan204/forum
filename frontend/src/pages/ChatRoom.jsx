import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Lấy thông tin người dùng
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    // Giả lập tin nhắn
    setMessages([
      {
        id: 1,
        senderId: "admin",
        sender: "Admin",
        message: "Xin chào! Chức năng chat đang được phát triển.",
        timestamp: new Date(),
      },
      {
        id: 2,
        senderId: "system",
        sender: "Hệ thống",
        message: "Tính năng này sẽ sớm hoàn thiện.",
        timestamp: new Date(),
      },
    ]);

    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    // Cuộn xuống tin nhắn mới nhất
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    // Thêm tin nhắn mới
    const newMsg = {
      id: messages.length + 1,
      senderId: user?.id || "unknown",
      sender: user?.username || "Người dùng",
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Phòng Chat</h1>

      <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg ${
              msg.senderId === (user?.id || "unknown")
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            <div className="font-semibold">{msg.sender}</div>
            <div>{msg.message}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
