import React, { useState, useEffect } from "react";

// Định nghĩa component Button
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

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6", // mặc định màu xanh primary
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/categories');
      // setCategories(response.data.categories);

      // Dữ liệu mẫu
      const mockCategories = [
        {
          _id: "1",
          name: "React",
          description: "Thảo luận về React và các thư viện liên quan",
          icon: "react",
          color: "#61DAFB",
          postCount: 45,
        },
        {
          _id: "2",
          name: "Node.js",
          description: "Thảo luận về Node.js và phát triển backend",
          icon: "node",
          color: "#539E43",
          postCount: 32,
        },
        {
          _id: "3",
          name: "Angular",
          description: "Thảo luận về Angular framework",
          icon: "angular",
          color: "#DD0031",
          postCount: 18,
        },
        {
          _id: "4",
          name: "Vue.js",
          description: "Thảo luận về Vue.js framework",
          icon: "vue",
          color: "#4FC08D",
          postCount: 25,
        },
        {
          _id: "5",
          name: "CSS & UI",
          description: "Thảo luận về CSS, Thiết kế UI/UX",
          icon: "css",
          color: "#2965F1",
          postCount: 38,
        },
      ];

      setCategories(mockCategories);
    } catch (err) {
      setError("Không thể tải danh sách danh mục");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.post('/api/admin/categories', formData);
      // const newCategory = response.data.category;

      // Mô phỏng thêm danh mục mới
      const newCategory = {
        _id: `${categories.length + 1}`,
        ...formData,
        postCount: 0,
      };

      setCategories([...categories, newCategory]);
      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "#3B82F6",
      });
    } catch (err) {
      setError("Không thể thêm danh mục");
      console.error(err);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.put(`/api/admin/categories/${categoryToEdit._id}`, formData);

      // Mô phỏng cập nhật danh mục
      setCategories(
        categories.map((cat) =>
          cat._id === categoryToEdit._id
            ? { ...cat, ...formData, postCount: cat.postCount }
            : cat
        )
      );
      setShowEditModal(false);
      setCategoryToEdit(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "#3B82F6",
      });
    } catch (err) {
      setError("Không thể cập nhật danh mục");
      console.error(err);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.delete(`/api/admin/categories/${categoryToDelete._id}`);

      // Mô phỏng xóa danh mục
      setCategories(
        categories.filter((cat) => cat._id !== categoryToDelete._id)
      );
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError("Không thể xóa danh mục");
      console.error(err);
    }
  };

  const openEditModal = (category) => {
    setCategoryToEdit(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const renderCategoryIcon = (icon) => {
    // Đây là một cách đơn giản để hiển thị biểu tượng, bạn có thể thay thế bằng thư viện biểu tượng thực tế
    switch (icon) {
      case "react":
        return "⚛️";
      case "node":
        return "🟢";
      case "angular":
        return "🅰️";
      case "vue":
        return "🟩";
      case "css":
        return "🎨";
      default:
        return "📁";
    }
  };

  return (
    <>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Thêm danh mục mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Bảng danh mục */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Không có danh mục nào
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Danh mục
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mô tả
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số bài viết
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
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <span className="text-xl">
                            {renderCategoryIcon(category.icon)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.postCount} bài viết
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="text-red-600 hover:text-red-900"
                          disabled={category.postCount > 0}
                          title={
                            category.postCount > 0
                              ? "Không thể xóa danh mục đã có bài viết"
                              : ""
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal thêm danh mục */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddCategory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Thêm danh mục mới
                    </h3>
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label
                          htmlFor="icon"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Icon
                        </label>
                        <select
                          name="icon"
                          id="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Chọn icon</option>
                          <option value="react">React ⚛️</option>
                          <option value="node">Node 🟢</option>
                          <option value="angular">Angular 🅰️</option>
                          <option value="vue">Vue 🟩</option>
                          <option value="css">CSS 🎨</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Màu sắc
                        </label>
                        <input
                          type="color"
                          name="color"
                          id="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="h-10 w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        name: "",
                        description: "",
                        icon: "",
                        color: "#3B82F6",
                      });
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa danh mục */}
      {showEditModal && categoryToEdit && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditCategory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Sửa danh mục
                    </h3>
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="edit-name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        id="edit-description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label
                          htmlFor="icon"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Icon
                        </label>
                        <select
                          name="icon"
                          id="edit-icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Chọn icon</option>
                          <option value="react">React ⚛️</option>
                          <option value="node">Node 🟢</option>
                          <option value="angular">Angular 🅰️</option>
                          <option value="vue">Vue 🟩</option>
                          <option value="css">CSS 🎨</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Màu sắc
                        </label>
                        <input
                          type="color"
                          name="color"
                          id="edit-color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="h-10 w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowEditModal(false);
                      setCategoryToEdit(null);
                      setFormData({
                        name: "",
                        description: "",
                        icon: "",
                        color: "#3B82F6",
                      });
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa danh mục */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
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
                      Xóa danh mục
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa danh mục "
                        {categoryToDelete.name}"? Hành động này không thể hoàn
                        tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteCategory}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
                  }}
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

export default CategoryManagement;
