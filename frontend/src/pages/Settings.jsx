import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Định nghĩa Button component cơ bản
const Button = ({
  children,
  type = "button",
  disabled = false,
  isLoading = false,
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
      {isLoading ? (
        <div className="flex items-center">
          <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          <span>Đang xử lý...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

const Settings = () => {
  const { user, updateProfile, updatePassword, error, setError } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" hoặc "password"

  // Form hồ sơ
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    avatar: "",
  });

  // Form mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  // Cập nhật profileData khi user thay đổi
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setMessage("");
    setError("");

    // Validate form
    if (!profileData.username) {
      setFormError("Vui lòng nhập tên người dùng");
      return;
    }

    if (profileData.username.length < 3) {
      setFormError("Tên người dùng phải có ít nhất 3 ký tự");
      return;
    }

    setIsUpdating(true);

    try {
      // Chỉ cập nhật username, bio và avatar, không cập nhật email
      const dataToUpdate = {
        username: profileData.username,
        bio: profileData.bio,
        avatar: profileData.avatar,
      };

      const success = await updateProfile(dataToUpdate);
      if (success) {
        setMessage("Cập nhật hồ sơ thành công");
      }
    } catch (err) {
      setFormError(err.message || "Đã xảy ra lỗi khi cập nhật hồ sơ");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setMessage("");
    setError("");

    // Validate form
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setFormError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setFormError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError("Mật khẩu mới không khớp");
      return;
    }

    setIsUpdating(true);

    try {
      const success = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (success) {
        setMessage("Cập nhật mật khẩu thành công");
        // Reset form sau khi cập nhật thành công
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setFormError(err.message || "Đã xảy ra lỗi khi cập nhật mật khẩu");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
//bài viết đã lưu
// thao tác đã thực hiện ví dụ như, vừa thực hiện hoạt động bình luận thì sẽ hiện thị lịch sử thao tác đó hoặc tim một bài viết cũng sẽ hiển thị.
  return (
    <div className="max-w-4xl mx-auto px-4 pt-20">
      
      <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>
      

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium border-b-2 ${
            activeTab === "profile"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Thông tin cá nhân
        </button>
        <button
          className={`py-3 px-6 font-medium border-b-2 ${
            activeTab === "password"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("password")}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Error và Success message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {formError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {formError}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
          {message}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên người dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isUpdating}
              />
            </div>

            <div className="mb-5">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                disabled={true}
              />
              <p className="text-sm text-gray-500 mt-1">
                Email không thể thay đổi
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL ảnh đại diện
              </label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={profileData.avatar}
                onChange={handleProfileChange}
                placeholder="https://example.com/avatar.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isUpdating}
              />
              <p className="text-sm text-gray-500 mt-1">
                Nhập URL hình ảnh trực tuyến
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiểu sử
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Hãy chia sẻ đôi điều về bạn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isUpdating}
              ></textarea>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                Cập nhật hồ sơ
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-5">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isUpdating}
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isUpdating}
              />
              <p className="text-sm text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isUpdating}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
