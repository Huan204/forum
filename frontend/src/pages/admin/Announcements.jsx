import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info", // info, warning, error, success
    isActive: true,
    expiresAt: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/announcements');
      // setAnnouncements(response.data);

      // Dữ liệu mẫu
      const mockAnnouncements = [
        {
          _id: "1",
          title: "Bảo trì hệ thống",
          content:
            "Hệ thống sẽ được bảo trì vào ngày 15/7/2023 từ 23:00 đến 02:00 ngày 16/7/2023",
          type: "warning",
          isActive: true,
          createdAt: "2023-07-10",
          expiresAt: "2023-07-16",
          createdBy: "Admin",
        },
        {
          _id: "2",
          title: "Tính năng mới: Dark Mode",
          content:
            "Chúng tôi vừa ra mắt tính năng Dark Mode. Kiểm tra trong phần cài đặt để trải nghiệm!",
          type: "info",
          isActive: true,
          createdAt: "2023-07-05",
          expiresAt: "2023-08-05",
          createdBy: "Admin",
        },
        {
          _id: "3",
          title: "Cập nhật điều khoản sử dụng",
          content:
            "Điều khoản sử dụng đã được cập nhật. Vui lòng đọc kỹ để biết thêm chi tiết.",
          type: "info",
          isActive: false,
          createdAt: "2023-06-20",
          expiresAt: "2023-07-20",
          createdBy: "Admin",
        },
      ];

      setAnnouncements(mockAnnouncements);
    } catch (err) {
      setError("Không thể tải danh sách thông báo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.post('/api/admin/announcements', formData);

      // Thêm thông báo mới vào danh sách
      const newAnnouncement = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().slice(0, 10),
        createdBy: "Admin",
      };

      setAnnouncements([newAnnouncement, ...announcements]);
      setShowModal(false);
      setFormData({
        title: "",
        content: "",
        type: "info",
        isActive: true,
        expiresAt: "",
      });
    } catch (err) {
      setError("Không thể tạo thông báo");
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = (announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.delete(`/api/admin/announcements/${announcementToDelete._id}`);

      setAnnouncements(
        announcements.filter((a) => a._id !== announcementToDelete._id)
      );
      setShowDeleteModal(false);
      setAnnouncementToDelete(null);
    } catch (err) {
      setError("Không thể xóa thông báo");
      console.error(err);
    }
  };

  const toggleActiveStatus = async (id, currentStatus) => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.patch(`/api/admin/announcements/${id}/toggle-status`);

      setAnnouncements(
        announcements.map((a) =>
          a._id === id ? { ...a, isActive: !currentStatus } : a
        )
      );
    } catch (err) {
      setError("Không thể cập nhật trạng thái thông báo");
      console.error(err);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "success":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý thông báo</h1>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Tạo thông báo mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Danh sách thông báo */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Không có thông báo nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tiêu đề
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Loại
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ngày tạo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Hết hạn
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {announcements.map((announcement) => (
                    <tr key={announcement._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {announcement.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeStyle(
                            announcement.type
                          )}`}
                        >
                          {announcement.type === "info" && "Thông tin"}
                          {announcement.type === "warning" && "Cảnh báo"}
                          {announcement.type === "error" && "Lỗi"}
                          {announcement.type === "success" && "Thành công"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            toggleActiveStatus(
                              announcement._id,
                              announcement.isActive
                            )
                          }
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            announcement.isActive
                              ? "bg-primary-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                              announcement.isActive
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></span>
                        </button>
                        <span className="ml-2 text-sm text-gray-500">
                          {announcement.isActive ? "Đang hiển thị" : "Đã tắt"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {announcement.expiresAt
                          ? new Date(announcement.expiresAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Không có"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/announcements/${announcement._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal tạo thông báo mới */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Tạo thông báo mới
                    </h3>
                    <div className="mb-4">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nội dung
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="type"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Loại thông báo
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="info">Thông tin</option>
                          <option value="warning">Cảnh báo</option>
                          <option value="error">Lỗi</option>
                          <option value="success">Thành công</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="expiresAt"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Ngày hết hạn
                        </label>
                        <input
                          type="date"
                          id="expiresAt"
                          name="expiresAt"
                          value={formData.expiresAt}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label
                        htmlFor="isActive"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Hiển thị ngay (Kích hoạt thông báo)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    className="sm:ml-3 sm:w-auto"
                  >
                    Tạo thông báo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="mt-3 sm:mt-0 sm:w-auto"
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xóa thông báo
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa thông báo "
                        {announcementToDelete?.title}"? Hành động này không thể
                        hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Xóa
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAnnouncementToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Announcements;
