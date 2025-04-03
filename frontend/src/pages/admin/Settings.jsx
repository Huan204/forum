import React, { useState, useEffect } from "react";


// Định nghĩa Button component
const Button = ({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-600 hover:bg-primary-700 text-white";
      case "secondary":
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
      case "outline":
        return "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
      default:
        return "bg-primary-600 hover:bg-primary-700 text-white";
    }
  };

  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    forumName: "Diễn đàn",
    forumDescription: "Nơi thảo luận và chia sẻ kiến thức về lập trình",
    postsPerPage: 10,
    commentsPerPage: 20,
    allowUserRegistration: true,
    requireEmailVerification: true,
    allowGuestComments: false,
    moderationEnabled: true,
    defaultUserRole: "user",
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "admin@example.com",
    smtpPassword: "",
    emailFromAddress: "no-reply@example.com",
    emailFromName: "Diễn đàn",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Mô phỏng việc lấy cài đặt từ API
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value,
    });
  };

  const handleSaveGeneralSettings = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.put('/api/admin/settings/general', generalSettings);

      // Mô phỏng lưu thành công
      setSuccessMessage("Cài đặt chung đã được lưu thành công");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError("Không thể lưu cài đặt chung");
      console.error(err);
    }
  };

  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.put('/api/admin/settings/email', emailSettings);

      // Mô phỏng lưu thành công
      setSuccessMessage("Cài đặt email đã được lưu thành công");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError("Không thể lưu cài đặt email");
      console.error(err);
    }
  };

  const handleTestEmail = async () => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.post('/api/admin/settings/email/test', emailSettings);

      // Mô phỏng gửi thành công
      setSuccessMessage("Email kiểm tra đã được gửi thành công");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError("Không thể gửi email kiểm tra");
      console.error(err);
    }
  };

  return (
    
      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold mb-6">Cài đặt hệ thống</h1>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}

            {/* Cài đặt chung */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Cài đặt chung</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveGeneralSettings}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="forumName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên diễn đàn
                      </label>
                      <input
                        type="text"
                        id="forumName"
                        name="forumName"
                        value={generalSettings.forumName}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="forumDescription"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mô tả diễn đàn
                      </label>
                      <textarea
                        id="forumDescription"
                        name="forumDescription"
                        rows="2"
                        value={generalSettings.forumDescription}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      ></textarea>
                    </div>

                    <div>
                      <label
                        htmlFor="postsPerPage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Số bài viết mỗi trang
                      </label>
                      <input
                        type="number"
                        id="postsPerPage"
                        name="postsPerPage"
                        min="5"
                        max="50"
                        value={generalSettings.postsPerPage}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="commentsPerPage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Số bình luận mỗi trang
                      </label>
                      <input
                        type="number"
                        id="commentsPerPage"
                        name="commentsPerPage"
                        min="5"
                        max="100"
                        value={generalSettings.commentsPerPage}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="defaultUserRole"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vai trò mặc định cho người dùng mới
                      </label>
                      <select
                        id="defaultUserRole"
                        name="defaultUserRole"
                        value={generalSettings.defaultUserRole}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="user">Người dùng</option>
                        <option value="moderator">Người kiểm duyệt</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowUserRegistration"
                        name="allowUserRegistration"
                        checked={generalSettings.allowUserRegistration}
                        onChange={handleGeneralSettingsChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowUserRegistration"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Cho phép đăng ký người dùng mới
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        name="requireEmailVerification"
                        checked={generalSettings.requireEmailVerification}
                        onChange={handleGeneralSettingsChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="requireEmailVerification"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Yêu cầu xác minh email
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowGuestComments"
                        name="allowGuestComments"
                        checked={generalSettings.allowGuestComments}
                        onChange={handleGeneralSettingsChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowGuestComments"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Cho phép khách bình luận
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="moderationEnabled"
                        name="moderationEnabled"
                        checked={generalSettings.moderationEnabled}
                        onChange={handleGeneralSettingsChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="moderationEnabled"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Bật kiểm duyệt bài viết và bình luận
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button type="submit" variant="primary">
                      Lưu cài đặt chung
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Cài đặt email */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Cài đặt email</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveEmailSettings}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="smtpServer"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Máy chủ SMTP
                      </label>
                      <input
                        type="text"
                        id="smtpServer"
                        name="smtpServer"
                        value={emailSettings.smtpServer}
                        onChange={handleEmailSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="smtpPort"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cổng SMTP
                      </label>
                      <input
                        type="number"
                        id="smtpPort"
                        name="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={handleEmailSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="smtpUsername"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên đăng nhập SMTP
                      </label>
                      <input
                        type="text"
                        id="smtpUsername"
                        name="smtpUsername"
                        value={emailSettings.smtpUsername}
                        onChange={handleEmailSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="smtpPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mật khẩu SMTP
                      </label>
                      <input
                        type="password"
                        id="smtpPassword"
                        name="smtpPassword"
                        value={emailSettings.smtpPassword}
                        onChange={handleEmailSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="emailFromAddress"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Địa chỉ email gửi
                      </label>
                      <input
                        type="email"
                        id="emailFromAddress"
                        name="emailFromAddress"
                        value={emailSettings.emailFromAddress}
                        onChange={handleEmailSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="emailFromName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên người gửi
                      </label>
                      <input
                        type="text"
                        id="emailFromName"
                        name="emailFromName"
                        value={emailSettings.emailFromName}
                        onChange={handleEmailSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <Button type="submit" variant="primary">
                      Lưu cài đặt email
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleTestEmail}
                    >
                      Kiểm tra email
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
 
  );
};

export default Settings;
