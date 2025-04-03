import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const PostActions = ({ post, currentUser, onDelete, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  // Kiểm tra người dùng có phải là tác giả không
  const isAuthor =
    currentUser && post.author && currentUser._id === post.author._id;
  const isAdmin = currentUser && currentUser.role === "admin";

  useEffect(() => {
    // Kiểm tra trạng thái lưu bài viết
    const checkSavedStatus = async () => {
      if (currentUser && post._id && isAuthenticated) {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        try {
          const response = await axios.get("/api/users/me");
          const savedPosts = response.data.data.savedPosts || [];
          setIsSaved(savedPosts.includes(post._id));
        } catch (error) {
          // Chỉ ghi log lỗi không phải 401
          if (error.response && error.response.status !== 401) {
            console.error("Lỗi khi kiểm tra trạng thái lưu:", error);
          }
        }
      }
    };

    // Kiểm tra trạng thái ẩn bài viết
    const checkHiddenStatus = async () => {
      if (currentUser && post._id && isAuthenticated) {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        try {
          const response = await axios.get("/api/users/me");
          const hiddenPosts = response.data.data.hiddenPosts || [];
          setIsHidden(hiddenPosts.includes(post._id));
        } catch (error) {
          // Chỉ ghi log lỗi không phải 401
          if (error.response && error.response.status !== 401) {
            console.error("Lỗi khi kiểm tra trạng thái ẩn:", error);
          }
        }
      }
    };

    // Chỉ kiểm tra khi có người dùng đăng nhập, có post ID và đã xác thực
    if (currentUser && post._id && isAuthenticated) {
      checkSavedStatus();
      checkHiddenStatus();
    }
  }, [currentUser, post._id, isAuthenticated]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest(".post-actions-menu")) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Xử lý chỉnh sửa bài viết
  const handleEdit = () => {
    setShowMenu(false);
    navigate(`/posts/edit/${post._id}`);
  };

  // Xử lý xóa bài viết
  const handleDelete = async () => {
    setShowMenu(false);
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        await axios.delete(`/api/posts/${post._id}`);
        toast.success("Đã xóa bài viết thành công");
        if (onDelete) onDelete(post._id);
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        toast.error("Không thể xóa bài viết");
      }
    }
  };

  // Xử lý lưu bài viết
  const handleSavePost = async () => {
    setShowMenu(false);
    try {
      const response = await axios.post(`/api/posts/${post._id}/save`);
      setIsSaved(response.data.isSaved);

      if (response.data.isSaved) {
        toast.success("Đã lưu bài viết");
      } else {
        toast.info("Đã hủy lưu bài viết");
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Lỗi khi lưu bài viết:", error);
      toast.error("Không thể lưu bài viết");
    }
  };

  // Xử lý ẩn bài viết
  const handleHidePost = async () => {
    setShowMenu(false);
    try {
      const response = await axios.post(`/api/posts/${post._id}/hide`);
      setIsHidden(response.data.isHidden);

      if (response.data.isHidden) {
        toast.info("Đã ẩn bài viết này");
      } else {
        toast.success("Đã hiển thị lại bài viết");
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Lỗi khi ẩn bài viết:", error);
      toast.error("Không thể ẩn bài viết");
    }
  };

  // Xử lý báo cáo bài viết
  const handleReport = () => {
    setShowMenu(false);
    // Hỏi lý do báo cáo
    const reason = prompt("Vui lòng cho biết lý do báo cáo bài viết này:");

    if (reason) {
      axios
        .post(`/api/posts/${post._id}/report`, { reason })
        .then(() => {
          toast.success("Đã gửi báo cáo bài viết thành công");
        })
        .catch((error) => {
          console.error("Lỗi khi báo cáo bài viết:", error);
          toast.error(
            error.response?.data?.error || "Không thể báo cáo bài viết"
          );
        });
    }
  };

  // Xử lý chia sẻ bài viết
  const handleShare = () => {
    setShowMenu(false);
    const shareUrl = window.location.origin + `/posts/${post._id}`;

    // Sử dụng Web Share API nếu trình duyệt hỗ trợ
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: `Xem bài viết: ${post.title}`,
          url: shareUrl,
        })
        .then(() => toast.success("Đã chia sẻ thành công"))
        .catch((error) => {
          console.error("Lỗi khi chia sẻ:", error);
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => toast.success("Đã sao chép liên kết vào clipboard"))
            .catch(() => toast.error("Không thể sao chép liên kết"));
        });
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => toast.success("Đã sao chép liên kết vào clipboard"))
        .catch(() => toast.error("Không thể sao chép liên kết"));
    }
  };

  return (
    <div className="relative post-actions-menu">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Tùy chọn bài viết"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* Tùy chọn cho tác giả */}
            {(isAuthor || isAdmin) && (
              <>
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Xóa
                </button>
              </>
            )}

            {/* Tùy chọn cho tất cả người dùng */}
            {currentUser && (
              <>
                <button
                  onClick={handleSavePost}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 mr-2 ${
                      isSaved
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-blue-500"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {isSaved ? "Hủy lưu" : "Lưu bài viết"}
                </button>

                {!isAuthor && (
                  <>
                    <button
                      onClick={handleHidePost}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      {isHidden ? "Hiện bài viết" : "Ẩn bài viết"}
                    </button>

                    <button
                      onClick={handleReport}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-orange-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Báo cáo
                    </button>
                  </>
                )}
              </>
            )}

            {/* Tùy chọn chia sẻ cho tất cả */}
            <button
              onClick={handleShare}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Chia sẻ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostActions;
