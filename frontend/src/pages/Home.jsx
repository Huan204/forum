import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import postService from "../services/postService";
import { toast } from "react-toastify";
import Banner from "../components/Banner";
import PostActions from "../components/PostActions";
import { useAuth } from "../hooks/useAuth";
import {
  FaPlay,
  FaHeart,
  FaComment,
  FaEye,
  FaShareAlt,
  FaDownload,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState(null);
  const [videoPopup, setVideoPopup] = useState(null);
  const [videoTime, setVideoTime] = useState("00:00");

  // Dữ liệu mẫu cho danh mục
  const categories = [
    { id: 1, name: "Công nghệ", icon: "💻", count: 120 },
    { id: 2, name: "Đời sống", icon: "🏠", count: 85 },
    { id: 3, name: "Giáo dục", icon: "📚", count: 64 },
    { id: 4, name: "Thể thao", icon: "⚽", count: 42 },
    { id: 5, name: "Giải trí", icon: "🎬", count: 93 },
  ];

  // Dữ liệu mẫu cho thống kê
  const stats = {
    users: 1250,
    posts: 3842,
    comments: 12568,
    views: 42895,
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getPosts();
        setPosts(response.data);
      } catch (error) {
        toast.error("Không thể tải danh sách bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      await postService.likePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(user?._id)
                  ? post.likes.filter((id) => id !== user?._id)
                  : [...post.likes, user?._id],
              }
            : post
        )
      );
    } catch (error) {
      toast.error("Không thể thực hiện thao tác thích");
    }
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + "...",
          url: `${window.location.origin}/posts/${post._id}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/posts/${post._id}`
        );
        toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await postService.deletePost(postId);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        toast.success("Bài viết đã được xóa");
      } catch (error) {
        toast.error("Không thể xóa bài viết");
      }
    }
  };

  // Helper function để format URL
  const formatUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Thêm hàm xử lý url video
  const getVideoUrl = (videoUrl) => {
    return formatUrl(videoUrl);
  };

  // Thêm hàm xử lý url thumbnail
  const getThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return null;

    if (
      thumbnailUrl.startsWith("data:image") ||
      thumbnailUrl.startsWith("http")
    ) {
      return thumbnailUrl;
    }

    return `http://localhost:5000${
      thumbnailUrl.startsWith("/") ? "" : "/"
    }${thumbnailUrl}`;
  };

  // Thêm hàm xử lý khi click vào video
  const handleVideoClick = (e, post) => {
    // Bỏ qua nếu đang nhấp vào PostActions
    if (e.target.closest(".post-actions-menu")) {
      e.stopPropagation();
      return;
    }

    e.stopPropagation();
    if (!post.video) return;

    const getBaseUrl = () => "http://localhost:5000";
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

  // Hàm đóng popup video
  const closeVideoPopup = () => {
    setVideoPopup(null);
  };

  // Thêm hàm tải xuống video
  const handleDownloadVideo = (e, videoUrl, filename = "video") => {
    e.preventDefault();
    // Ngăn chặn sự kiện mặc định
    e.stopPropagation();

    // Hiển thị thông báo đang tải xuống
    toast.info("Đang chuẩn bị tải xuống video...");

    // Tạo một link tải xuống ẩn
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${filename || "video"}.mp4`;
    link.target = "_blank";

    // Thêm vào DOM và kích hoạt sự kiện click
    document.body.appendChild(link);
    link.click();

    // Xóa link sau khi đã click
    setTimeout(() => {
      document.body.removeChild(link);
      toast.success("Bắt đầu tải xuống video!");
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Khám phá & Chia sẻ <br />
                <span className="text-indigo-200">
                  kiến thức cùng cộng đồng
                </span>
              </h1>
              <p className="text-indigo-100 text-lg max-w-xl mb-8">
                Nền tảng chia sẻ ý tưởng, kiến thức và kết nối với những người
                có cùng đam mê và sở thích
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
                <Link
                  to="/posts"
                  className="flex items-center bg-indigo-600 bg-opacity-30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-40 transition-colors"
                >
                  <FaEye className="mr-2" />
                  Xem tất cả bài viết
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-end">
              <img
                src="/images/hero-illustration.svg"
                alt="Hero"
                className="max-w-full h-auto"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-12 -mt-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-bold text-indigo-600 mb-1">
                {stats.posts.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Bài viết</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-1">
                {stats.users.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Người dùng</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-bold text-pink-500 mb-1">
                {stats.comments.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Bình luận</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-bold text-blue-500 mb-1">
                {stats.views.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Lượt xem</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Danh mục nổi bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các chủ đề phổ biến và tìm kiếm nội dung phù hợp với sở
              thích của bạn
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md hover:border-indigo-100 transition-all transform hover:-translate-y-1 group"
              >
                <div className="text-5xl mb-4 transition-transform group-hover:scale-110 duration-300">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {category.count} bài viết
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Bài viết mới nhất
              </h2>
              <p className="text-gray-600 mt-2">
                Cập nhật những nội dung mới nhất từ cộng đồng
              </p>
            </div>
            <Link
              to="/posts"
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              Xem tất cả
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.slice(0, 8).map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1 hover:scale-[1.02] flex flex-col h-full group relative backdrop-blur-sm perspective-1000"
                style={{
                  transformStyle: "preserve-3d",
                }}
                onClick={(e) => {
                  if (e.target.closest(".post-actions-menu")) {
                    e.stopPropagation();
                    return;
                  }
                  if (!post.video) {
                    window.location.href = `/posts/${post._id}`;
                  }
                }}
              >
                <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden transform-gpu">
                  {post.video ? (
                    <div
                      className="relative w-full h-full cursor-pointer group"
                      onClick={(e) => handleVideoClick(e, post)}
                    >
                      <video
                        src={
                          post.video.startsWith("blob:")
                            ? post.video
                            : post.video.startsWith("http")
                            ? post.video
                            : `${formatUrl(post.video)}`
                        }
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 transform-gpu"
                        poster={
                          post.thumbnail
                            ? getThumbnailUrl(post.thumbnail)
                            : null
                        }
                        controls={false}
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => {
                          e.target
                            .play()
                            .catch(() =>
                              console.log("Không thể tự động phát video")
                            );
                        }}
                        onMouseOut={(e) => e.target.pause()}
                        onError={(e) => {
                          console.error("Lỗi tải video:", post.video);
                          e.target.style.display = "none";
                        }}
                      >
                        Video không được hỗ trợ
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/10 to-black/50 opacity-60 group-hover:opacity-40 transition-opacity">
                        <div className="bg-white/95 rounded-full p-4 transform scale-90 group-hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-200/50 group-hover:translate-z-10">
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
                      <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur text-white px-3.5 py-1.5 text-xs font-medium rounded-full shadow-lg transform hover:translate-z-5 transition-transform">
                        {post.category || "Bài viết"}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-red-500/90 backdrop-blur text-white px-3.5 py-1.5 text-xs font-medium rounded-full flex items-center shadow-lg transform hover:translate-z-5 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1.5"
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
                        <span>Video</span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/posts/${post._id}`}
                      className="block w-full h-full group"
                    >
                      <img
                        src={
                          post.thumbnail
                            ? getThumbnailUrl(post.thumbnail)
                            : `https://source.unsplash.com/random/600x400?${
                                post.category || "blog"
                              }`
                        }
                        alt={post.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 transform-gpu"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/random/600x400?${
                            post.category || "blog"
                          }`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur text-white px-3.5 py-1.5 text-xs font-medium rounded-full shadow-lg transform hover:translate-z-5 transition-transform">
                        {post.category || "Bài viết"}
                      </div>
                    </Link>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col transform-gpu">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <Link to={`/posts/${post._id}`} className="block">
                        <h3 className="text-lg font-bold text-gray-800 mb-2.5 line-clamp-2 group-hover:text-indigo-600 transition-colors transform hover:translate-z-5">
                          {post.title}
                        </h3>
                      </Link>
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 transform hover:translate-z-5"
                    >
                      <PostActions
                        post={post}
                        currentUser={user}
                        onDelete={() => window.location.reload()}
                        onRefresh={() => window.location.reload()}
                      />
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 font-normal leading-relaxed">
                    {post.content?.replace(/<[^>]*>/g, "") || ""}
                  </p>

                  <div className="flex items-center mt-auto pt-5 border-t border-gray-100">
                    <Link
                      to={`/profileusers/${post.author?._id}`}
                      className="flex items-center mr-auto group/author"
                    >
                      <div className="relative transform hover:translate-z-5 transition-transform">
                        <img
                          src={
                            post.author?.avatar
                              ? getThumbnailUrl(post.author.avatar)
                              : "/default-avatar.png"
                          }
                          alt={post.author?.username || "Người dùng"}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-lg group-hover/author:ring-indigo-200 transition-all duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              post.author?.username || "U"
                            )}&background=random`;
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 ml-2.5 group-hover/author:text-indigo-600 transition-colors transform hover:translate-z-5">
                        {post.author?.username || "Ẩn danh"}
                      </span>
                    </Link>

                    <div className="flex items-center space-x-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleLike(post._id);
                        }}
                        className={`flex items-center text-sm ${
                          post.likes?.includes(user?._id)
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        } transition-all duration-300 hover:scale-110 transform hover:translate-z-5`}
                      >
                        <FaHeart
                          className={`mr-1.5 ${
                            post.likes?.includes(user?._id)
                              ? "animate-like"
                              : ""
                          }`}
                        />
                        <span className="font-medium">
                          {post.likes?.length || 0}
                        </span>
                      </button>

                      <Link
                        to={`/posts/${post._id}`}
                        className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-all duration-300 hover:scale-110 transform hover:translate-z-5"
                      >
                        <FaComment className="mr-1.5" />
                        <span className="font-medium">
                          {post.comments?.length || 0}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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
                  <FaDownload className="mr-2" />
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

export default Home;
