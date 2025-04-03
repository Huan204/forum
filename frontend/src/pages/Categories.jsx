import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { FaHeart, FaComment, FaPlay, FaEye } from "react-icons/fa";
import PostActions from "../components/PostActions";

// Component PostCard - Thiết kế hiện đại tương tự trang chủ
const PostCard = ({ post }) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có ngày";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Không xác định";
    }
  };

  const getBaseUrl = () => {
    return "http://localhost:5002"; // Thay đổi URL backend nếu cần
  };

  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("data:image")) return path;
    if (path.startsWith("http")) return path;
    return `${getBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const handleCardClick = (e) => {
    // Ngăn chặn hành vi mặc định nếu click vào PostActions
    if (e.target.closest(".post-actions-menu")) {
      e.stopPropagation();
      return;
    }

    if (post.video) {
      setShowVideoPopup(true);
    } else {
      // Chuyển đến trang chi tiết bài viết
      window.location.href = `/posts/${post._id || post.id || post.postId}`;
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    try {
      // Thực hiện API call để like/unlike bài viết
      const newLikeState = !isLiked;
      setIsLiked(newLikeState);
      setLikesCount((prev) => (newLikeState ? prev + 1 : prev - 1));

      // Giả lập API call, thay thế bằng API thực tế của bạn
      // await axios.post(...);
    } catch (error) {
      console.error("Lỗi khi thích bài viết:", error);
      // Khôi phục trạng thái ban đầu nếu có lỗi
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  // Xử lý hiển thị ảnh với fallback
  const getImageUrl = (post) => {
    // Kiểm tra xem post có nhiều loại ảnh khác nhau không
    if (post.image) {
      return post.image.startsWith("http") ||
        post.image.startsWith("data:image")
        ? post.image
        : getThumbnailUrl(post.image);
    } else if (post.thumbnail) {
      return post.thumbnail.startsWith("http") ||
        post.thumbnail.startsWith("data:image")
        ? post.thumbnail
        : getThumbnailUrl(post.thumbnail);
    } else {
      // Fallback to placeholder
      return `https://source.unsplash.com/random/600x400?${
        post.category || post.categoryName || "blog"
      }`;
    }
  };

  const handleImageError = (e) => {
    console.log("Lỗi tải ảnh:", post.image || post.thumbnail);
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = `https://source.unsplash.com/random/600x400?${
      post.category || post.categoryName || "blog"
    }`;
    setImageError(true);
  };

  return (
    <div
      className="relative rounded-lg shadow-md bg-white overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      {post.thumbnail && !imageError && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={getThumbnailUrl(post.thumbnail)}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {post.video && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="rounded-full bg-white bg-opacity-80 p-3 transform transition-transform hover:scale-110">
                <FaPlay className="text-indigo-600 text-xl" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 flex-grow">
            {post.title}
          </h3>

          {/* Thêm PostActions component */}
          <div onClick={(e) => e.stopPropagation()} className="ml-2">
            <PostActions
              post={post}
              currentUser={user}
              onDelete={() => window.location.reload()}
              onRefresh={() => window.location.reload()}
            />
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {post.excerpt ||
            (post.content &&
              post.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...") ||
            "Không có nội dung"}
        </p>

        <div className="flex items-center mt-4 mb-3 pb-3 border-b border-gray-100">
          <img
            src={
              avatarError
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.author?.username || "U"
                  )}&background=random`
                : post.author?.avatar
                ? post.author.avatar.startsWith("data:image")
                  ? post.author.avatar
                  : post.author.avatar.startsWith("http")
                  ? post.author.avatar
                  : `${getBaseUrl()}${
                      post.author.avatar.startsWith("/") ? "" : "/"
                    }${post.author.avatar}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.author?.username || "U"
                  )}&background=random`
            }
            alt={post.author?.username || "Người dùng"}
            className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-white shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                post.author?.username || "U"
              )}&background=random`;
              setAvatarError(true);
            }}
            loading="lazy"
          />

          <div>
            <Link
              to={`/profile/${post.author?._id}`}
              className="text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {post.author?.username || "Người dùng ẩn danh"}
            </Link>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike(e);
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                isLiked
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"
              } transition-colors`}
            >
              <FaHeart className="h-4 w-4" />
              <span>{likesCount}</span>
            </button>

            <Link
              to={`/posts/${post._id || post.id || post.postId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
            >
              <FaComment className="h-4 w-4" />
              <span>{post.commentsCount || post.comments?.length || 0}</span>
            </Link>
          </div>

          <Link
            to={`/posts/${post._id || post.id || post.postId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
          >
            Chi tiết
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Button component - Nâng cấp
const Button = ({ children, variant = "primary", onClick, disabled }) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-full transition-all duration-300 font-medium flex items-center ${
        variants[variant]
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 transform"
      }`}
    >
      {children}
    </button>
  );
};

// Định nghĩa các biểu tượng cho danh mục
const categoryIcons = {
  "Công nghệ": "💻",
  "Đời sống": "🏠",
  "Giáo dục": "📚",
  "Thể thao": "⚽",
  "Giải trí": "🎬",
  "Sức khỏe": "🩺",
  "Du lịch": "✈️",
  "Kinh doanh": "💼",
  "Khoa học": "🔬",
  "Ẩm thực": "🍽️",
  "Thời trang": "👗",
  "Làm đẹp": "💄",
};

const Categories = () => {
  const { category } = useParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [decodedCategory, setDecodedCategory] = useState("");
  const [videoPopup, setVideoPopup] = useState(null);
  const [videoTime, setVideoTime] = useState("00:00");

  // Xử lý video popup
  const closeVideoPopup = () => {
    setVideoPopup(null);
    setVideoTime("00:00");
  };

  const handleVideoClick = (e, post) => {
    e.stopPropagation();
    if (!post.video) return;

    const getBaseUrl = () => "http://localhost:5002";
    const getThumbnailUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return `${getBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    setVideoPopup({
      title: post.title,
      url: post.video.startsWith("blob:")
        ? post.video
        : post.video.startsWith("http")
        ? post.video
        : `${getBaseUrl()}${post.video.startsWith("/") ? "" : "/"}${
            post.video
          }`,
      poster: post.thumbnail ? getThumbnailUrl(post.thumbnail) : null,
      postId: post._id || post.id || post.postId,
    });
  };

  const handleDownloadVideo = async (e, videoUrl, title) => {
    e.stopPropagation();
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi tải video:", error);
      alert("Không thể tải video. Vui lòng thử lại sau!");
    }
  };

  // Danh mục mặc định
  const defaultCategories = [
    { name: "Công nghệ" },
    { name: "Đời sống" },
    { name: "Giáo dục" },
    { name: "Thể thao" },
    { name: "Giải trí" },
    { name: "Sức khỏe" },
    { name: "Du lịch" },
    { name: "Kinh doanh" },
  ];

  useEffect(() => {
    // Giải mã tên danh mục từ URL
    if (category) {
      setDecodedCategory(decodeURIComponent(category));
    } else {
      setDecodedCategory("");
    }

    fetchCategories();
  }, [category]);

  // Khi decodedCategory thay đổi, cập nhật lại bài viết
  useEffect(() => {
    fetchCategoryPosts();
  }, [decodedCategory, page]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get("http://localhost:5002/api/categories");

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        console.log("Danh mục từ API:", response.data.data);
        setCategories(response.data.data);
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response.data);
        // Sử dụng danh mục mặc định
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      // Sử dụng danh mục mặc định nếu API lỗi
      setCategories(defaultCategories);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5002/api/posts";

      if (decodedCategory) {
        // Nếu có danh mục, lọc bài viết theo danh mục
        url = `http://localhost:5002/api/posts?category=${encodeURIComponent(
          decodedCategory
        )}`;
      }

      const response = await axios.get(url, {
        params: { page },
      });

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        setPosts(response.data.data);
        // Thiết lập phân trang từ API nếu có
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          // Thiết lập giả lập phân trang nếu API không trả về
          setPagination({
            totalPages: Math.ceil(response.data.data.length / 10),
            currentPage: page,
            prev: page > 1 ? { page: page - 1 } : null,
            next:
              page < Math.ceil(response.data.data.length / 10)
                ? { page: page + 1 }
                : null,
          });
        }
      } else {
        setPosts([]);
        setPagination(null);
      }
    } catch (error) {
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.next) {
      setPage(pagination.next.page);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (pagination && pagination.prev) {
      setPage(pagination.prev.page);
      window.scrollTo(0, 0);
    }
  };

  // Hàm lấy icon cho danh mục
  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || "📄";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-10">
      {/* Header - Nâng cấp với gradient và ảnh nền */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-xl p-8 md:p-10 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute right-0 bottom-0 w-64 h-64 -mb-10 -mr-10 opacity-20">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="white"
              d="M45.3,-51.2C59.4,-34.7,72,-17.3,74.3,2.3C76.6,21.9,68.5,43.8,54.4,58.8C40.3,73.8,20.1,81.9,-0.9,83C-21.9,84,-43.9,77.9,-55.1,63C-66.3,48.2,-66.9,24.1,-65.3,2.5C-63.8,-19.1,-60.1,-38.1,-48.9,-54.7C-37.6,-71.2,-18.8,-85.2,-0.2,-85C18.5,-84.7,37.1,-70.2,49.1,-57.2C61.1,-44.2,73.3,-32.6,45.3,-51.2Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              {decodedCategory
                ? `Danh mục: ${decodedCategory}`
                : "Khám phá theo danh mục"}
            </h1>
            <p className="text-indigo-100 text-lg max-w-xl mb-4 leading-relaxed">
              {decodedCategory
                ? `Khám phá các bài viết trong danh mục ${decodedCategory}`
                : "Chọn một danh mục từ danh sách để xem các bài viết phù hợp với sở thích của bạn"}
            </p>
          </div>

          {user && (
            <Link
              to="/posts/create"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-medium transition-all duration-300 inline-flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
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
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Danh sách danh mục - Nâng cấp */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            <div className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
              <h2 className="text-lg font-bold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Danh mục
              </h2>
            </div>
            {loadingCategories ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                <li>
                  <Link
                    to="/categories"
                    className={`block px-5 py-3.5 transition-all duration-200 ${
                      !decodedCategory
                        ? "bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-600"
                        : "text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                      <span>Tất cả danh mục</span>
                    </div>
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id || cat.id || cat.categoryId}>
                    <Link
                      to={`/categories/${encodeURIComponent(
                        cat.categoryName || cat.name
                      )}`}
                      className={`block px-5 py-3.5 transition-all duration-200 ${
                        decodedCategory === (cat.categoryName || cat.name)
                          ? "bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-600"
                          : "text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getCategoryIcon(cat.categoryName || cat.name)}
                        </span>
                        <span>{cat.categoryName || cat.name}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Thêm section thống kê nhỏ */}
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Thông tin
              </h3>
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng danh mục:</span>
                  <span className="font-medium text-indigo-600">
                    {categories.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng bài viết:</span>
                  <span className="font-medium text-indigo-600">
                    {posts.length > 0
                      ? pagination?.totalDocs || posts.length
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content - Nâng cấp */}
        <div className="md:w-2/3 lg:w-3/4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex items-center">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center my-12 bg-white p-10 rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500">Đang tải bài viết...</p>
            </div>
          ) : posts.length > 0 ? (
            <div>
              {decodedCategory && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">
                      {getCategoryIcon(decodedCategory)}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {decodedCategory}
                      </h2>
                      <p className="text-gray-500">{posts.length} bài viết</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {Array.isArray(posts) ? (
                  posts.map((post) => (
                    <PostCard
                      key={post._id || post.id || post.postId}
                      post={post}
                    />
                  ))
                ) : (
                  <p className="text-center p-6 bg-white rounded-xl shadow-sm">
                    Không có bài viết nào.
                  </p>
                )}
              </div>

              {/* Pagination - Nâng cấp */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-10 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <Button
                    variant="secondary"
                    onClick={handlePrevPage}
                    disabled={!pagination.prev}
                  >
                    <span className="flex items-center">
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Trang trước
                    </span>
                  </Button>
                  <div className="flex items-center space-x-2">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const pageNum =
                          pagination.totalPages <= 5
                            ? i + 1
                            : page > 3
                            ? Math.min(
                                pagination.totalPages - 4 + i,
                                pagination.totalPages
                              )
                            : i + 1;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => pageNum !== page && setPage(pageNum)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              pageNum === page
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleNextPage}
                    disabled={!pagination.next}
                  >
                    <span className="flex items-center">
                      Trang sau
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png"
                alt="Không có bài viết"
                className="w-28 h-28 mx-auto mb-6 opacity-70"
              />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                {decodedCategory
                  ? `Chưa có bài viết nào trong danh mục "${decodedCategory}"`
                  : "Vui lòng chọn một danh mục"}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {decodedCategory
                  ? "Bạn có thể tạo bài viết đầu tiên trong danh mục này để chia sẻ kiến thức của bạn."
                  : "Chọn một danh mục từ menu bên trái để khám phá các bài viết phù hợp với sở thích của bạn."}
              </p>
              {user && decodedCategory && (
                <Link
                  to="/posts/create"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video popup */}
      {videoPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-medium truncate">{videoPopup.title}</h3>
              <button
                onClick={closeVideoPopup}
                className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="bg-black">
              <video
                src={videoPopup.url}
                poster={videoPopup.poster}
                controls
                autoPlay
                className="w-full max-h-[70vh]"
                onTimeUpdate={(e) => {
                  const minutes = Math.floor(e.target.currentTime / 60);
                  const seconds = Math.floor(e.target.currentTime % 60);
                  setVideoTime(
                    `${minutes.toString().padStart(2, "0")}:${seconds
                      .toString()
                      .padStart(2, "0")}`
                  );
                }}
              />
            </div>
            <div className="p-4 flex justify-between items-center bg-gray-50">
              <div className="text-gray-500 text-sm">{videoTime}</div>
              <div className="flex space-x-3">
                <Link
                  to={`/posts/${videoPopup.postId}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <FaEye className="mr-2" />
                  Xem bài viết
                </Link>
                <button
                  onClick={(e) =>
                    handleDownloadVideo(e, videoPopup.url, videoPopup.title)
                  }
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Tải xuống
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
