import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../config/constants";
import { api } from "../services/api.js";
import { useParams } from "react-router-dom";

// Comment các import không tồn tại và thêm định nghĩa trực tiếp
// import { Button } from "../components/ui/Button"; // Import Button hoặc thay đổi tùy theo cấu trúc dự án
// import { EnhancedPostCard } from "../components/post/EnhancedPostCard"; // Import EnhancedPostCard
// import { getUserPosts } from "../services/postService"; // Import hàm getUserPosts

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Định nghĩa Button component cơ bản
const Button = ({
  children,
  type = "button",
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Định nghĩa EnhancedPostCard component tạm thời
const EnhancedPostCard = ({ post, onLike }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(post._id, !post.likes.includes(post.userId))}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{post.likesCount || 0}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span>{post.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hàm getUserPosts tạm thời
const getUserPosts = async (userId) => {
  try {
    // Thay thế bằng URL API thật khi có
    // const response = await axios.get(`/api/posts/user/${userId}`);
    // return { success: true, data: response.data };

    // Trả về dữ liệu giả để test
    return {
      success: true,
      data: [
        {
          _id: "post1",
          title: "Bài viết mẫu 1",
          content: "Nội dung bài viết mẫu 1",
          createdAt: new Date(),
          likesCount: 5,
          commentsCount: 3,
          likes: [],
          userId,
        },
        {
          _id: "post2",
          title: "Bài viết mẫu 2",
          content: "Nội dung bài viết mẫu 2",
          createdAt: new Date(),
          likesCount: 2,
          commentsCount: 1,
          likes: [],
          userId,
        },
      ],
    };
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    return { success: false, error: error.message || "Lỗi không xác định" };
  }
};

// Tab Button Component - Di chuyển lên trước component Profile
const TabButton = ({ isActive, onClick, children, icon }) => {
  return (
    <motion.button
      className={`py-3 px-6 font-medium border-b-2 flex items-center ${
        isActive
          ? "border-primary-600 text-primary-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
      onClick={onClick}
      whileHover={{ y: isActive ? 0 : -2 }}
      whileTap={{ y: 2 }}
    >
      {icon}
      {children}
    </motion.button>
  );
};

const Profile = () => {
  const { user, updateProfile, error: authError, setError } = useAuth();
  const fileInputRef = useRef(null);
  const { id } = useParams(); // Lấy ID từ URL nếu có
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    fullName: "",
    location: "",
    website: "",
    avatar: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
    },
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    joinedDate: "",
  });

  // Cập nhật profileData và stats khi user thay đổi
  useEffect(() => {
    if (id) {
      // Nếu có ID trong URL, đây là profile của người dùng khác
      setIsOwnProfile(false);
      fetchUserProfile(id);
    } else if (user && user.data) {
      // Đây là profile của người dùng hiện tại
      setIsOwnProfile(true);
      const userData = user.data;
      setProfileData({
        username: userData.username || "",
        email: userData.email || "",
        bio: userData.bio || "",
        fullName: userData.fullName || "",
        location: userData.location || "",
        website: userData.website || "",
        avatar: userData.avatar || "",
        socialLinks: userData.socialLinks || {
          facebook: "",
          twitter: "",
          linkedin: "",
        },
      });

      // Nếu user có avatar, lưu luôn vào previewImage để hiển thị
      if (userData.avatar) {
        const avatarUrl = userData.avatar.startsWith("http")
          ? userData.avatar
          : `${API_URL}${userData.avatar.startsWith("/") ? "" : "/"}${
              userData.avatar
            }`;
        setPreviewImage(avatarUrl);
        console.log("Đã set previewImage từ user:", avatarUrl);
      }

      // Cập nhật thống kê
      setStats({
        totalPosts: userPosts.length,
        totalLikes: userPosts.reduce(
          (acc, post) => acc + (post.likesCount || 0),
          0
        ),
        totalComments: userPosts.reduce(
          (acc, post) => acc + (post.commentsCount || 0),
          0
        ),
        joinedDate: new Date(userData.createdAt).toLocaleDateString("vi-VN"),
      });
    }
  }, [user, userPosts, id]);

  // Lấy bài viết của người dùng khi tab được chọn
  useEffect(() => {
    if (activeTab === "posts") {
      if (id) {
        fetchUserPosts(id);
      } else if (user) {
        fetchUserPosts(user.id);
      }
    }
  }, [activeTab, user, id]);

  const fetchUserPosts = async (userId) => {
    if (!userId) {
      console.log("Chưa có thông tin người dùng hoặc ID không hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getUserPosts(userId);
      if (response.success) {
        setUserPosts(response.data);
      } else {
        console.error("Lỗi khi tải bài viết:", response.error);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error.message || error);
      setError("Đã xảy ra lỗi khi tải bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    // Chỉ cho phép thay đổi khi đây là profile của chính người dùng
    if (!isOwnProfile) return;

    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    // Chỉ cho phép submit khi đây là profile của chính người dùng
    if (!isOwnProfile) return;

    e.preventDefault();
    setIsUpdating(true);
    setFormError("");

    try {
      console.log("Cập nhật thông tin:", profileData);

      // Chỉ gửi các thông tin đã được thay đổi, không gửi toàn bộ profileData
      const dataToUpdate = {
        username: profileData.username,
        fullName: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        socialLinks: profileData.socialLinks,
        // Không gửi avatar và email nếu không cần thiết
      };

      console.log("Dữ liệu gửi lên server:", dataToUpdate);

      // Gọi API trực tiếp thay vì qua updateProfile của context
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        dataToUpdate,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage("Cập nhật thông tin thành công");

        // Tạo một bản sao của user hiện tại để cập nhật thông tin mới
        const updatedUser = {
          ...user,
          username: profileData.username,
          fullName: profileData.fullName,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          socialLinks: profileData.socialLinks,
          // Đảm bảo giữ nguyên các thông tin khác
        };

        console.log("User sau khi cập nhật:", updatedUser);

        // Lưu thông tin user vào localStorage để đảm bảo dữ liệu được giữ lại
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        // Cập nhật state user trong context nếu có
        if (typeof updateProfile === "function") {
          updateProfile(updatedUser);
        }
      } else {
        setFormError(response.data.message || "Lỗi khi cập nhật thông tin");
      }
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      setFormError(
        error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLike = (postId, isLiked) => {
    setUserPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
            likes: isLiked
              ? [...post.likes, user.id]
              : post.likes.filter((id) => id !== user.id),
          };
        }
        return post;
      })
    );
  };

  const handleAvatarClick = () => {
    // Chỉ cho phép thay đổi avatar khi đây là profile của chính người dùng
    if (!isOwnProfile) return;

    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Đặt hình preview tạm thời từ file đã chọn
      setPreviewImage(URL.createObjectURL(file));

      // Tạm vô hiệu hóa chức năng upload đến server
      setMessage(
        "Tính năng đang được cập nhật. Bạn đã thay đổi ảnh đại diện trong phiên hiện tại nhưng chưa được lưu vào cơ sở dữ liệu."
      );

      // Tạo FormData
      const formData = new FormData();
      formData.append("avatar", file);

      // Reset uploadProgress và formError
      setUploadProgress(0);
      setFormError("");

      // Chỉ hiển thị preview mà không gửi lên server
      console.log(
        "Avatar preview đã được cập nhật. Upload tạm thời bị vô hiệu hóa."
      );
      return;

      // Code cũ được giữ lại để tham khảo
      /* --- PHẦN CODE UPLOAD CŨ ĐANG BỊ VÔ HIỆU HÓA ---
      try {
        // Sử dụng axios trực tiếp với URL đầy đủ
        const res = await axios.post(`${API_URL}/api/users/avatar`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token") || (user?.token || "")}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            console.log(`Upload tiến trình: ${percentCompleted}%`);
          }
        });
        
        console.log("Upload avatar thành công:", res.data);
        
        // Nếu server trả về URL mới, cập nhật previewImage
        if (res.data.success && res.data.avatarUrl) {
          const newAvatarUrl = res.data.avatarUrl.startsWith('http') 
            ? res.data.avatarUrl 
            : `${API_URL}${res.data.avatarUrl.startsWith('/') ? '' : '/'}${res.data.avatarUrl}`;
            
          setPreviewImage(newAvatarUrl);
          console.log("Avatar URL mới:", newAvatarUrl);
          
          // Cập nhật dữ liệu user trong state hoặc context (nếu có)
          if (user && user.data) {
            const updatedUserData = { 
              ...user.data, 
              avatar: res.data.avatarUrl 
            };
            
            // Cập nhật profileData
            setProfileData(prev => ({
              ...prev,
              avatar: res.data.avatarUrl
            }));
            
            // TODO: Cập nhật user context nếu cần
          }
          
          // Hiển thị thông báo thành công
          setMessage("Cập nhật ảnh đại diện thành công!");
        }
      } catch (error) {
        console.error("Lỗi khi upload avatar:", error);
        
        // Xử lý lỗi chi tiết hơn
        let errorMessage = "Đã xảy ra lỗi khi tải lên ảnh đại diện.";
        
        if (error.response) {
          // Server trả về response với status code ngoài 2xx
          console.error("Server response error:", error.response.data);
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          // Request đã được gửi nhưng không nhận được response
          console.error("Network error - không nhận được response");
          errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.";
        } else {
          // Lỗi khi thiết lập request
          console.error("Request setup error:", error.message);
        }
        
        // Hiển thị lỗi cho người dùng
        setFormError(errorMessage);
        setUploadProgress(0);
      }
      */
    }
  };

  // Thêm hàm để lấy thông tin profile người dùng khác
  const fetchUserProfile = async (userId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/users/${userId}`);
      if (response.data && response.data.success) {
        const userData = response.data.data;
        setProfileData({
          username: userData.username || "",
          email: userData.email || "",
          bio: userData.bio || "",
          fullName: userData.fullName || "",
          location: userData.location || "",
          website: userData.website || "",
          avatar: userData.avatar || "",
          socialLinks: userData.socialLinks || {
            facebook: "",
            twitter: "",
            linkedin: "",
          },
        });

        // Xử lý avatar
        if (userData.avatar) {
          const avatarUrl = userData.avatar.startsWith("http")
            ? userData.avatar
            : `${API_URL}${userData.avatar.startsWith("/") ? "" : "/"}${
                userData.avatar
              }`;
          setPreviewImage(avatarUrl);
        }

        // Lấy bài viết của người dùng nếu đang ở tab posts
        if (activeTab === "posts") {
          fetchUserPosts(userId);
        }
      } else {
        setError("Không thể tải thông tin người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      setError("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  // Component con để hiển thị thông báo
  const Notification = ({ type, message }) => {
    const colors = {
      error: "bg-red-50 text-red-600 border-red-200",
      success: "bg-green-50 text-green-600 border-green-200",
      warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
    };

    return (
      <motion.div
        className={`p-4 rounded-md border mb-4 ${colors[type]}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {message}
      </motion.div>
    );
  };

  // Nếu chưa có user, hiển thị trạng thái loading
  if (!user) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hiển thị thông báo lỗi nếu có */}
      {(formError || message) && (
        <Notification
          type={formError ? "error" : "success"}
          message={formError || message}
        />
      )}

      {/* Tab navigation */}
      <div className="border-b mb-6">
        <div className="flex overflow-x-auto">
          <TabButton
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            }
          >
            Hồ sơ
          </TabButton>
          <TabButton
            isActive={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
            icon={
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                ></path>
              </svg>
            }
          >
            Bài viết
          </TabButton>
          {isOwnProfile && (
            <TabButton
              isActive={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              }
            >
              Cài đặt
            </TabButton>
          )}
        </div>
      </div>

      {/* Nội dung các tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Avatar và thông tin cơ bản */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    <img
                      src={
                        previewImage ||
                        "https://via.placeholder.com/128?text=User"
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                      onClick={isOwnProfile ? handleAvatarClick : undefined}
                      style={
                        isOwnProfile
                          ? { cursor: "pointer" }
                          : { cursor: "default" }
                      }
                    />
                    {isOwnProfile && (
                      <div
                        className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <h2 className="text-xl font-bold mb-1">
                    {profileData.fullName || profileData.username}
                  </h2>
                  <p className="text-gray-500 mb-4">@{profileData.username}</p>

                  {profileData.bio && (
                    <p className="text-gray-600 mb-6 italic">
                      {profileData.bio}
                    </p>
                  )}

                  <div className="flex justify-center space-x-3 mb-6">
                    {profileData.socialLinks?.facebook && (
                      <a
                        href={profileData.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                        </svg>
                      </a>
                    )}
                    {profileData.socialLinks?.twitter && (
                      <a
                        href={profileData.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                        </svg>
                      </a>
                    )}
                    {profileData.socialLinks?.linkedin && (
                      <a
                        href={profileData.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Thống kê người dùng */}
                  <div className="grid grid-cols-2 divide-x">
                    <div className="px-4">
                      <div className="text-xl font-bold text-primary-600">
                        {stats.totalPosts || 0}
                      </div>
                      <div className="text-sm text-gray-500">Bài viết</div>
                    </div>
                    <div className="px-4">
                      <div className="text-xl font-bold text-primary-600">
                        {stats.joinedDate && <span>{stats.joinedDate}</span>}
                      </div>
                      <div className="text-sm text-gray-500">Tham gia</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Thông tin cá nhân
                  </h3>

                  {isOwnProfile ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="username"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tên người dùng
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={profileData.username}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          readOnly
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          readOnly
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Giới thiệu
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleChange}
                          rows="3"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Địa chỉ
                          </label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={profileData.location}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="website"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Website
                          </label>
                          <input
                            type="url"
                            id="website"
                            name="website"
                            value={profileData.website}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          />
                        </div>
                      </div>

                      <h4 className="text-md font-medium mt-4 mb-2">
                        Liên kết mạng xã hội
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="facebook"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Facebook
                          </label>
                          <input
                            type="url"
                            id="facebook"
                            name="socialLinks.facebook"
                            value={profileData.socialLinks?.facebook || ""}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="twitter"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Twitter
                          </label>
                          <input
                            type="url"
                            id="twitter"
                            name="socialLinks.twitter"
                            value={profileData.socialLinks?.twitter || ""}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="linkedin"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            LinkedIn
                          </label>
                          <input
                            type="url"
                            id="linkedin"
                            name="socialLinks.linkedin"
                            value={profileData.socialLinks?.linkedin || ""}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="w-full sm:w-auto"
                        >
                          {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* Hiển thị thông tin chỉ đọc cho profile người dùng khác */
                    <div className="space-y-4">
                      {profileData.fullName && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Họ và tên
                          </h4>
                          <p className="text-gray-800">
                            {profileData.fullName}
                          </p>
                        </div>
                      )}

                      {profileData.bio && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Giới thiệu
                          </h4>
                          <p className="text-gray-800">{profileData.bio}</p>
                        </div>
                      )}

                      {profileData.location && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Địa chỉ
                          </h4>
                          <p className="text-gray-800">
                            {profileData.location}
                          </p>
                        </div>
                      )}

                      {profileData.website && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Website
                          </h4>
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            {profileData.website}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab bài viết */}
          {activeTab === "posts" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Bài viết của {isOwnProfile ? "tôi" : profileData.username}
              </h3>

              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-gray-500">Đang tải bài viết...</p>
                </div>
              ) : userPosts && userPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userPosts.map((post) => (
                    <EnhancedPostCard
                      key={post._id}
                      post={post}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Chưa có bài viết nào
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {isOwnProfile
                      ? "Bạn chưa đăng bài viết nào. Hãy bắt đầu chia sẻ kiến thức của bạn!"
                      : "Người dùng này chưa đăng bài viết nào."}
                  </p>

                  {isOwnProfile && (
                    <div className="mt-6">
                      <Link
                        to="/posts/create"
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          ></path>
                        </svg>
                        Tạo bài viết mới
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab cài đặt - chỉ hiển thị cho profile của chính mình */}
          {isOwnProfile && activeTab === "settings" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Cài đặt tài khoản</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Bảo mật</h4>
                  <Button>Đổi mật khẩu</Button>
                </div>

                <div>
                  <h4 className="text-md font-medium mb-2">Thông báo</h4>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotification"
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="emailNotification" className="ml-2">
                      Nhận thông báo qua email
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium mb-2 text-red-600">
                    Vùng nguy hiểm
                  </h4>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Xóa tài khoản
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Profile;
