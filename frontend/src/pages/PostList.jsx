import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import postService from "../services/postService";
import PostActions from "../components/PostActions";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSyncAlt,
} from "react-icons/fa";

// Thêm hàm helper để lấy API URL
const getBaseUrl = () => {
  try {
    return process.env.REACT_APP_API_BASE_URL || "http://localhost:5002"; // URL mặc định
  } catch (error) {
    console.error("Lỗi khi lấy URL:", error);
    return "http://localhost:5002"; // URL mặc định
  }
};

// Tạo một component PostCard trực tiếp trong file này để tránh lỗi import
const PostCard = ({ post, onLikeUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Xử lý avatar ngay khi component được tạo
  useEffect(() => {
    if (post.author && post.author.avatar) {
      const img = new Image();
      img.src = post.author.avatar.startsWith("data:image")
        ? post.author.avatar
        : post.author.avatar.startsWith("http")
        ? post.author.avatar
        : `${getBaseUrl()}${post.author.avatar.startsWith("/") ? "" : "/"}${
            post.author.avatar
          }`;

      img.onload = () => {
        console.log("Đã tải thành công avatar cho bài viết:", post._id);
      };
      img.onerror = () => {
        console.log("Lỗi tải avatar, sử dụng ảnh mặc định");
        setAvatarError(true);
      };
    } else {
      setAvatarError(true);
    }
  }, [post._id, post.author]);

  // Xử lý ảnh thumbnail ngay khi component được tạo
  useEffect(() => {
    if (post.thumbnail) {
      const img = new Image();
      img.src = post.thumbnail;
      img.onload = () => {
        console.log("Đã tải thành công hình ảnh cho bài viết:", post._id);
      };
      img.onerror = () => {
        console.log("Lỗi tải thumbnail, hiển thị placeholder");
        setImageError(true);
      };
    }
  }, [post._id, post.thumbnail]);

  useEffect(() => {
    // Kiểm tra trạng thái like của người dùng hiện tại
    if (user && post.likes && post.likes.includes(user._id)) {
      setIsLiked(true);
    }

    // Cập nhật số lượt thích từ bài viết
    setLikesCount(post.likesCount || 0);
  }, [post, user]);

  const handleCardClick = (e) => {
    // Ngăn chặn hành vi mặc định nếu click vào PostActions
    if (e.target.closest(".post-actions-menu")) {
      e.stopPropagation();
      return;
    }
    navigate(`/post/${post._id}`);
  };

  const handleLike = async () => {
    if (!user) {
      // Chưa đăng nhập - chuyển hướng tới trang đăng nhập
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      if (!isLiked) {
        // Thực hiện thích bài viết
        await postService.likePost(post._id);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        toast.success("Đã thích bài viết", { autoClose: 1500 });
      } else {
        // Thực hiện bỏ thích bài viết
        await postService.unlikePost(post._id);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        toast.success("Đã bỏ thích bài viết", { autoClose: 1500 });
      }

      // Thông báo cho component cha về sự thay đổi
      if (onLikeUpdate) {
        onLikeUpdate(post._id, {
          isLiked: !isLiked,
          likesCount: isLiked ? likesCount - 1 : likesCount + 1,
        });
      }
    } catch (error) {
      console.error("Lỗi khi thích/bỏ thích bài viết:", error);
      toast.error("Không thể thực hiện hành động. Vui lòng đăng nhập lại.", {
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative"
      onClick={handleCardClick}
    >
      {post.video ? (
        // Video content
        <div className="relative w-full h-52 overflow-hidden">
          <video
            src={
              post.video.startsWith("blob:")
                ? post.video
                : post.video.startsWith("http")
                ? post.video
                : `${getBaseUrl()}${post.video.startsWith("/") ? "" : "/"}${
                    post.video
                  }`
            }
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            poster={post.thumbnail || null}
            controls={false}
          >
            Video không được hỗ trợ
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-900/40 opacity-70 group-hover:opacity-50 transition-opacity">
            <div className="bg-white/80 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#4F46E5"
                className="w-8 h-8"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-xs font-medium rounded-full flex items-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Video
          </div>
        </div>
      ) : post.thumbnail && !imageError ? (
        <div className="relative w-full h-52 overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative w-full h-52 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-indigo-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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

      <div className="p-5 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {post.title}
            </h2>
          </div>
          <div className="flex items-center flex-shrink-0">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full flex-shrink-0 whitespace-nowrap">
              {post.category}
            </span>
            <div onClick={(e) => e.stopPropagation()} className="ml-2">
              <PostActions
                post={post}
                currentUser={user}
                onDelete={() => navigate("/posts")}
                onRefresh={() => onLikeUpdate && onLikeUpdate(post._id)}
              />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4 line-clamp-2">
          {post.content
            ? post.content.replace(/<[^>]*>/g, "").substring(0, 150) +
              (post.content.length > 150 ? "..." : "")
            : ""}
        </div>

        <div className="flex items-center mt-4 mb-3 pb-3 border-b border-gray-100">
          <img
            src={
              avatarError
                ? "/default-avatar.png"
                : post.author?.avatar
                ? post.author.avatar.startsWith("data:image")
                  ? post.author.avatar
                  : post.author.avatar.startsWith("http")
                  ? post.author.avatar
                  : `${getBaseUrl()}${
                      post.author.avatar.startsWith("/") ? "" : "/"
                    }${post.author.avatar}`
                : "/default-avatar.png"
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
              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
              disabled={isLoading}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                isLiked
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"
              } transition-colors`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={isLiked ? "0" : "2"}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              )}
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-medium">
                {post.commentsCount || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{post.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const postsPerPage = 9;

  const location = useLocation();
  const navigate = useNavigate();

  // Xử lý query params từ URL khi component được tải
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Lấy các tham số từ URL nếu có
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    const sortParam = params.get("sort");
    const pageParam = params.get("page");

    if (categoryParam) setCurrentCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (sortParam) setSortBy(sortParam);
    if (pageParam) setCurrentPage(parseInt(pageParam, 10));

    // Gọi API để lấy danh sách danh mục
    fetchCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await postService.getCategories();
      // Thêm tùy chọn "Tất cả" vào đầu danh sách
      setCategories([
        { id: "all", name: "Tất cả" },
        ...response.data.map((cat) => ({
          id: cat.slug || cat._id,
          name: cat.name,
        })),
      ]);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      // Sử dụng danh mục mặc định nếu API lỗi
      setCategories([
        { id: "all", name: "Tất cả" },
        { id: "tech", name: "Công nghệ" },
        { id: "life", name: "Đời sống" },
        { id: "edu", name: "Giáo dục" },
        { id: "sport", name: "Thể thao" },
        { id: "entertainment", name: "Giải trí" },
      ]);
    }
  };

  // Lấy dữ liệu bài viết từ server dựa trên bộ lọc hiện tại
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory, sortBy, currentPage]);

  // Cập nhật URL với tham số tìm kiếm và bộ lọc
  useEffect(() => {
    const params = new URLSearchParams();

    if (currentCategory !== "all") {
      params.append("category", currentCategory);
    }

    if (searchTerm) {
      params.append("search", searchTerm);
    }

    if (sortBy !== "newest") {
      params.append("sort", sortBy);
    }

    if (currentPage > 1) {
      params.append("page", currentPage.toString());
    }

    // Cập nhật URL không làm tải lại trang
    const newUrl = `${location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    navigate(newUrl, { replace: true });
  }, [
    currentCategory,
    searchTerm,
    sortBy,
    currentPage,
    navigate,
    location.pathname,
  ]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Xây dựng tham số tìm kiếm
      const filters = {
        page: currentPage,
        limit: postsPerPage,
      };

      // Thêm bộ lọc category nếu không phải "all"
      if (currentCategory !== "all") {
        filters.category = currentCategory;
      }

      // Thêm tìm kiếm nếu có
      if (searchTerm) {
        filters.search = searchTerm;
      }

      // Chuyển đổi sortBy sang định dạng mà backend có thể hiểu
      switch (sortBy) {
        case "newest":
          filters.sort = "-createdAt"; // Dấu - là sắp xếp giảm dần
          break;
        case "oldest":
          filters.sort = "createdAt";
          break;
        case "nameAZ":
          filters.sort = "title";
          break;
        case "nameZA":
          filters.sort = "-title";
          break;
        default:
          filters.sort = "-createdAt";
      }

      const response = await postService.getPosts(filters);

      // Cập nhật state với dữ liệu từ server
      setPosts(response.data);
      setTotalPosts(response.total || response.data.length);

      // Tính tổng số trang
      const pages =
        response.totalPages ||
        Math.ceil((response.total || response.data.length) / postsPerPage);
      setTotalPages(pages);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
      toast.error("Không thể tải danh sách bài viết");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset về trang 1 khi tìm kiếm
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (categoryId) => {
    setCurrentCategory(categoryId);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi danh mục
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi sắp xếp
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCurrentCategory("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Hàm xử lý cập nhật khi thích bài viết
  const handleLikeUpdate = (postId, { isLiked, likesCount }) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, isLiked, likesCount } : post
      )
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Tạo mảng trang để hiển thị phân trang
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Khám phá bài viết <br />
                <span className="text-indigo-200">từ cộng đồng</span>
              </h1>
              <p className="text-indigo-100 text-lg max-w-xl mb-6">
                Chia sẻ kiến thức, tìm hiểu các chủ đề mới và kết nối với những
                người có cùng sở thích
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Link
                  to="/create-post"
                  className="flex items-center bg-white text-indigo-600 px-6 py-3 rounded-full font-medium hover:bg-indigo-50 transition-colors shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tạo bài viết mới
                </Link>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 400, behavior: "smooth" })
                  }
                  className="flex items-center bg-indigo-600 bg-opacity-30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-40 transition-colors"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="hidden md:block w-1/3">
              <img
                src="/images/illustration.svg"
                alt="Illustration"
                className="w-full"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl -mt-8">
        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex-shrink-0"
              >
                Tìm kiếm
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                title="Bộ lọc"
              >
                <FaFilter className="text-gray-700" />
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                title="Đặt lại bộ lọc"
              >
                <FaSyncAlt className="text-gray-700" />
              </button>
            </div>
          </form>

          {isFiltersVisible && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Danh mục
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        currentCategory === category.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="sortBy"
                  className="block text-gray-700 mb-3 font-medium"
                >
                  Sắp xếp theo
                </label>
                <div className="relative">
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full p-3 pr-10 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="nameAZ">Tên (A-Z)</option>
                    <option value="nameZA">Tên (Z-A)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FaSortAmountDown className="text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Posts display */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-block p-4 bg-indigo-50 rounded-full mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-5 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <FaSyncAlt className="mr-2" /> Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {totalPosts} {totalPosts === 1 ? "bài viết" : "bài viết"}{" "}
                {currentCategory !== "all" &&
                categories.find((c) => c.id === currentCategory)
                  ? `trong ${
                      categories.find((c) => c.id === currentCategory).name
                    }`
                  : ""}
              </h2>
              <div className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav
              className="inline-flex shadow-sm rounded-lg overflow-hidden"
              aria-label="Phân trang"
            >
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  currentPage === 1
                    ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <span className="sr-only">Trang trước</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {[...Array(totalPages).keys()].map((number) => {
                const page = number + 1;
                // Show first page, last page, current page, and pages next to current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === page
                          ? "z-10 bg-indigo-600 border-indigo-600 text-white font-medium"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }

                // Show ellipsis
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <span
                      key={page}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                    >
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  currentPage === totalPages
                    ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <span className="sr-only">Trang sau</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center text-gray-500 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Trang web cộng đồng. Tất cả các
              quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostList;
