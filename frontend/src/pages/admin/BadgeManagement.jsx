import React, { useState, useEffect } from "react";

const BadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    requiredPoints: 0,
    requiredPosts: 0,
    requiredComments: 0,
    isFeatured: false,
    category: "achievement", // achievement, participation, special
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/badges');
      // setBadges(response.data);

      // Dữ liệu mẫu
      const mockBadges = [
        {
          _id: "1",
          name: "Người đóng góp mới",
          description: "Đăng 5 bài viết đầu tiên",
          icon: "🌱",
          color: "#4CAF50",
          requiredPoints: 0,
          requiredPosts: 5,
          requiredComments: 0,
          category: "achievement",
          isFeatured: true,
          dateCreated: "2023-05-10",
          usersAwarded: 120,
        },
        {
          _id: "2",
          name: "Chuyên gia bình luận",
          description: "Đăng 50 bình luận trên diễn đàn",
          icon: "💬",
          color: "#2196F3",
          requiredPoints: 0,
          requiredPosts: 0,
          requiredComments: 50,
          category: "achievement",
          isFeatured: true,
          dateCreated: "2023-05-10",
          usersAwarded: 45,
        },
        {
          _id: "3",
          name: "Nhà sáng tạo nội dung",
          description: "Đăng 20 bài viết chất lượng cao",
          icon: "✍️",
          color: "#9C27B0",
          requiredPoints: 500,
          requiredPosts: 20,
          requiredComments: 0,
          category: "achievement",
          isFeatured: false,
          dateCreated: "2023-05-15",
          usersAwarded: 12,
        },
        {
          _id: "4",
          name: "Thành viên 1 năm",
          description: "Đã là thành viên của diễn đàn trong 1 năm",
          icon: "🎂",
          color: "#FF9800",
          requiredPoints: 0,
          requiredPosts: 0,
          requiredComments: 0,
          category: "participation",
          isFeatured: false,
          dateCreated: "2023-06-01",
          usersAwarded: 75,
        },
        {
          _id: "5",
          name: "Người đóng góp đặc biệt",
          description:
            "Được quản trị viên trao tặng cho những đóng góp đặc biệt",
          icon: "🏆",
          color: "#F44336",
          requiredPoints: 0,
          requiredPosts: 0,
          requiredComments: 0,
          category: "special",
          isFeatured: true,
          dateCreated: "2023-06-10",
          usersAwarded: 3,
        },
      ];

      setBadges(mockBadges);
    } catch (err) {
      setError("Không thể tải danh sách huy hiệu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.put(`/api/admin/badges/${currentBadge._id}`, formData);

        // Cập nhật danh sách huy hiệu
        setBadges(
          badges.map((badge) =>
            badge._id === currentBadge._id ? { ...badge, ...formData } : badge
          )
        );
      } else {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // const response = await axios.post('/api/admin/badges', formData);
        // const newBadge = response.data;

        // Thêm huy hiệu mới
        const newBadge = {
          _id: Date.now().toString(),
          ...formData,
          dateCreated: new Date().toISOString().slice(0, 10),
          usersAwarded: 0,
        };
        setBadges([...badges, newBadge]);
      }

      resetForm();
    } catch (err) {
      setError(
        editMode ? "Không thể cập nhật huy hiệu" : "Không thể tạo huy hiệu mới"
      );
      console.error(err);
    }
  };

  const handleDelete = async (badgeId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa huy hiệu này?")) {
      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.delete(`/api/admin/badges/${badgeId}`);

        // Xóa huy hiệu khỏi danh sách
        setBadges(badges.filter((badge) => badge._id !== badgeId));
      } catch (err) {
        setError("Không thể xóa huy hiệu");
        console.error(err);
      }
    }
  };

  const handleEdit = (badge) => {
    setEditMode(true);
    setCurrentBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      requiredPoints: badge.requiredPoints,
      requiredPosts: badge.requiredPosts,
      requiredComments: badge.requiredComments,
      isFeatured: badge.isFeatured,
      category: badge.category,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentBadge(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#3B82F6",
      requiredPoints: 0,
      requiredPosts: 0,
      requiredComments: 0,
      isFeatured: false,
      category: "achievement",
    });
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "achievement":
        return "Thành tựu";
      case "participation":
        return "Tham gia";
      case "special":
        return "Đặc biệt";
      default:
        return "Khác";
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý huy hiệu</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Thêm huy hiệu mới
        </button>
      </div>

      {/* Danh sách huy hiệu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div
            key={badge._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div
              className="h-20 flex items-center justify-center text-4xl"
              style={{ backgroundColor: badge.color }}
            >
              {badge.icon}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{badge.name}</h2>
                {badge.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Nổi bật
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{badge.description}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <p>Loại huy hiệu:</p>
                  <p>{getCategoryLabel(badge.category)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Yêu cầu điểm:</p>
                  <p>{badge.requiredPoints}</p>
                </div>
                <div className="flex justify-between">
                  <p>Yêu cầu bài viết:</p>
                  <p>{badge.requiredPosts}</p>
                </div>
                <div className="flex justify-between">
                  <p>Yêu cầu bình luận:</p>
                  <p>{badge.requiredComments}</p>
                </div>
                <div className="flex justify-between">
                  <p>Người được trao:</p>
                  <p>{badge.usersAwarded}</p>
                </div>
                <div className="flex justify-between">
                  <p>Ngày tạo:</p>
                  <p>{badge.dateCreated}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(badge)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(badge._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thêm/Sửa Huy hiệu Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? "Sửa huy hiệu" : "Thêm huy hiệu mới"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên huy hiệu</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Biểu tượng (emoji)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Màu sắc</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full p-1 h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Loại huy hiệu
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="achievement">Thành tựu</option>
                  <option value="participation">Tham gia</option>
                  <option value="special">Đặc biệt</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Điểm yêu cầu
                  </label>
                  <input
                    type="number"
                    name="requiredPoints"
                    value={formData.requiredPoints}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Số bài viết
                  </label>
                  <input
                    type="number"
                    name="requiredPosts"
                    value={formData.requiredPosts}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Số bình luận
                  </label>
                  <input
                    type="number"
                    name="requiredComments"
                    value={formData.requiredComments}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isFeatured" className="text-gray-700">
                  Hiển thị nổi bật
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editMode ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeManagement;
