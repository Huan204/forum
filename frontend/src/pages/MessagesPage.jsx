import React, { useEffect, useState } from "react";
import ChatContainer from "../components/chat/ChatContainer";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

// Thêm CSS để cố định toàn màn hình và loại bỏ thanh cuộn bên ngoài
const messagesPageStyle = {
  position: "fixed",
  top: 64, // Chiều cao của NavMenu
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "calc(100vh - 64px)", // Trừ đi chiều cao của NavMenu
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--bg-color, #f9fafb)",
  zIndex: 40, // Đảm bảo nằm dưới NavMenu (z-index: 50) nhưng trên các phần tử khác
};

const MessagesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", {
        state: { from: "/messages" },
        replace: true,
      });
    }

    // Thêm class để ẩn thanh cuộn khi vào trang tin nhắn
    document.body.style.overflow = "hidden";

    // Animation khi mount
    setMounted(true);

    // Dọn dẹp khi rời trang
    return () => {
      document.body.style.overflow = "";
    };
  }, [user, loading, navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      style={messagesPageStyle}
      className="bg-white dark:bg-gray-900 shadow-lg transition-all duration-500"
    >
      <div className="container mx-auto h-full px-0 sm:px-4 md:px-6 lg:px-8 xl:px-0 max-w-7xl">
        <div className="h-full rounded-lg overflow-hidden shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
