import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import postService from "../services/postService";

// Hàm xử lý URL video
const formatVideoUrl = (videoUrl) => {
  if (!videoUrl) return "";

  // Loại bỏ khoảng trắng thừa
  videoUrl = videoUrl.trim();

  // Xử lý các trường hợp đặc biệt
  if (videoUrl === "video_uploaded") {
    return "";
  }

  // Nếu đã là URL đầy đủ thì giữ nguyên
  if (videoUrl.startsWith("blob:") || videoUrl.startsWith("http")) {
    return videoUrl;
  }

  // Thêm domain API nếu là đường dẫn tương đối
  const apiUrl = "http://localhost:5000";
  return videoUrl.startsWith("/")
    ? `${apiUrl}${videoUrl}`
    : `${apiUrl}/${videoUrl}`;
};

const UserPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Các thống kê
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    likes: 0,
    comments: 0,
  });

  // Thêm state cho video preview
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      fetchUserPosts();
    } else if (!user) {
      navigate("/login");
    } else {
      setError("Không thể xác định ID người dùng. Vui lòng đăng nhập lại.");
    }
  }, [user, navigate]);

  // Lọc và sắp xếp bài viết khi có thay đổi
  useEffect(() => {
    if (posts.length > 0) {
      filterAndSortPosts();
    }
  }, [posts, searchTerm, filterCategory, sortBy]);

  // Tính toán thống kê khi posts thay đổi
  useEffect(() => {
    if (posts.length > 0) {
      const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
      const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
      const totalComments = posts.reduce(
        (sum, post) => sum + post.commentsCount,
        0
      );

      setStats({
        total: posts.length,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
      });
    }
  }, [posts]);

  const fetchUserPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user || !user._id) {
        setError("Không thể xác định ID người dùng. Vui lòng đăng nhập lại.");
        setIsLoading(false);
        return;
      }

      const response = await postService.getUserPosts(user._id);
      const postsData = response.posts || response.data || [];
      setPosts(postsData);
      setFilteredPosts(postsData);
    } catch (err) {
      console.error("Lỗi khi tải bài viết:", err);
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    // Bước 1: Lọc theo từ khóa tìm kiếm
    let result = [...posts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term)
      );
    }

    // Bước 2: Lọc theo danh mục
    if (filterCategory) {
      result = result.filter((post) => post.category === filterCategory);
    }

    // Bước 3: Sắp xếp
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "most_viewed":
        result.sort((a, b) => b.views - a.views);
        break;
      case "most_liked":
        result.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case "most_commented":
        result.sort((a, b) => b.commentsCount - a.commentsCount);
        break;
      default:
        break;
    }

    setFilteredPosts(result);
  };

  const handleDeletePost = async (postId) => {
    try {
      setIsDeleting(true);
      await postService.deletePost(postId);
      setPosts(posts.filter((post) => post._id !== postId));
      setShowDeleteModal(null);
    } catch (err) {
      console.error("Lỗi khi xóa bài viết:", err);
      setError("Không thể xóa bài viết. Vui lòng thử lại sau.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Xử lý khi người dùng nhấp vào nút xóa
  const confirmDelete = (postId) => {
    setShowDeleteModal(postId);
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Danh sách các danh mục
  const categories = [...new Set(posts.map((post) => post.category))];

  // Xử lý khi click vào video
  const handleVideoClick = (videoUrl) => {
    setPreviewVideo(formatVideoUrl(videoUrl));
  };

  if (!user) {
    return null; // Redirect to login handled by useEffect
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Quản lý bài viết của tôi</h1>
          <p className="text-gray-600">
            Bạn đã đăng {stats.total} bài viết với tổng cộng {stats.views} lượt
            xem
          </p>
        </div>
        <Link
          to="/posts/create"
          className="mt-4 md:mt-0 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
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
            />
          </svg>
          Tạo bài viết mới
        </Link>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {stats.total}
          </div>
          <div className="text-gray-600">Bài viết</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {stats.views}
          </div>
          <div className="text-gray-600">Lượt xem</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl font-bold text-red-500 mb-2">
            {stats.likes}
          </div>
          <div className="text-gray-600">Lượt thích</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-4xl font-bold text-blue-500 mb-2">
            {stats.comments}
          </div>
          <div className="text-gray-600">Bình luận</div>
        </div>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              placeholder="Tìm kiếm bài viết theo tiêu đề hoặc nội dung..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Danh mục
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sắp xếp theo
            </label>
            <select
              id="sort"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="most_viewed">Lượt xem nhiều nhất</option>
              <option value="most_liked">Lượt thích nhiều nhất</option>
              <option value="most_commented">Bình luận nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Media
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Bài viết
                </th>
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
                  Ngày đăng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lượt xem
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {post.thumbnail && (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                      )}
                      {post.video && (
                        <div
                          className="relative w-20 h-20 cursor-pointer"
                          onClick={() => handleVideoClick(post.video)}
                        >
                          <video
                            src={formatVideoUrl(post.video)}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              console.error("Lỗi tải video:", e);
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
                            <svg
                              className="w-8 h-8 text-white opacity-80"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                      {!post.thumbnail && !post.video && (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-0">
                        <Link
                          to={`/posts/${post._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="flex items-center mr-3">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            {post.likesCount}
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M17 11v3l-3-3H8a2 2 0 01-2-2V2c0-1.1.9-2 2-2h10a2 2 0 012 2v7a2 2 0 01-2 2h-1zm-3 2v2a2 2 0 01-2 2H6l-3 3v-3H2a2 2 0 01-2-2V8c0-1.1.9-2 2-2h2v3a4 4 0 004 4h6z" />
                            </svg>
                            {post.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.views}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center">
                    <div className="flex justify-center space-x-3">
                      <Link
                        to={`/posts/${post._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="Chỉnh sửa bài viết"
                      >
                        <div className="p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </div>
                      </Link>
                      <button
                        onClick={() => confirmDelete(post._id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        title="Xóa bài viết"
                      >
                        <div className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Không tìm thấy bài viết nào
          </h3>
          <p className="text-gray-500 mb-6">
            {posts.length === 0
              ? "Bạn chưa tạo bài viết nào. Hãy bắt đầu viết bài ngay bây giờ!"
              : "Không tìm thấy bài viết nào phù hợp với bộ lọc của bạn."}
          </p>
          {posts.length === 0 && (
            <Link
              to="/create-post"
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Tạo bài viết đầu tiên
            </Link>
          )}
        </div>
      )}

      {/* Modal xác nhận xóa bài viết */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                      Xác nhận xóa bài viết
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa bài viết này? Hành động này
                        không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeletePost(showDeleteModal)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xóa...
                    </div>
                  ) : (
                    "Xóa bài viết"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
            <div className="inline-block align-bottom bg-black rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="relative">
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <video src={previewVideo} className="w-full" controls autoPlay>
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPosts;
