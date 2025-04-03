import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreatePostForm = ({
  initialData,
  onSubmit,
  submitButtonText = "Đăng bài",
  categories = [],
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    thumbnail: "",
  });
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "",
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : initialData.tags || "",
        thumbnail: initialData.thumbnail || "",
      };
      setFormData(formattedData);
      setOriginalData(formattedData);
    }
  }, [initialData]);

  useEffect(() => {
    // Kiểm tra nếu form đã thay đổi so với dữ liệu ban đầu
    if (originalData) {
      const hasChanged = Object.keys(formData).some(
        (key) => formData[key] !== originalData[key]
      );
      setIsFormChanged(hasChanged);
    }
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc muốn khôi phục lại dữ liệu ban đầu?")) {
      setFormData(originalData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gửi form data trực tiếp, không cần xử lý tags ở đây vì đã được xử lý trong postService
      await onSubmit(formData);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
        <h2 className="font-semibold text-blue-800 mb-2">
          Hướng dẫn chỉnh sửa
        </h2>
        <ul className="list-disc pl-5 text-blue-700 text-sm">
          <li>Chỉnh sửa thông tin trong các trường bên dưới</li>
          <li>Nhấn "Cập nhật" để lưu thay đổi</li>
          <li>Nhấn "Khôi phục" để hoàn tác các thay đổi về ban đầu</li>
        </ul>
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-base font-medium text-gray-700 mb-2"
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
          className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Nhập tiêu đề bài viết"
        />
        {originalData && originalData.title !== formData.title && (
          <p className="text-xs text-blue-600 mt-1">
            Giá trị ban đầu: {originalData.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-base font-medium text-gray-700 mb-2"
        >
          Danh mục
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {originalData && originalData.category !== formData.category && (
          <p className="text-xs text-blue-600 mt-1">
            Giá trị ban đầu: {originalData.category}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-base font-medium text-gray-700 mb-2"
        >
          Tags (phân cách bằng dấu phẩy)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Ví dụ: javascript, react, web"
        />
        {originalData && originalData.tags !== formData.tags && (
          <p className="text-xs text-blue-600 mt-1">
            Giá trị ban đầu: {originalData.tags}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="thumbnail"
          className="block text-base font-medium text-gray-700 mb-2"
        >
          Ảnh thumbnail
        </label>
        <input
          type="text"
          id="thumbnail"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Nhập URL hình ảnh"
        />
        {originalData && originalData.thumbnail !== formData.thumbnail && (
          <p className="text-xs text-blue-600 mt-1">
            Giá trị ban đầu: {originalData.thumbnail}
          </p>
        )}
        {formData.thumbnail && (
          <div className="mt-3 border rounded-md p-2 max-w-xs">
            <img
              src={formData.thumbnail}
              alt="Thumbnail preview"
              className="w-full h-auto object-cover rounded"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/600x400?text=Ảnh+không+tồn+tại";
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-base font-medium text-gray-700 mb-2"
        >
          Nội dung
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={15}
          className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Viết nội dung bài viết của bạn tại đây..."
        />
        {originalData && originalData.content !== formData.content && (
          <p className="text-xs text-blue-600 mt-1">
            Nội dung đã được thay đổi
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          {isFormChanged && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-300"
            >
              Khôi phục
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate("/posts")}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || !isFormChanged}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : submitButtonText}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreatePostForm;
