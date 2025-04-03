import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";


import { useAuth } from "../hooks/useAuth";

const Search = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Lấy các tham số từ URL
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sortBy") || "recent";

  // Trạng thái cho form tìm kiếm
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSortBy, setSelectedSortBy] = useState(sortBy);

  // Danh sách danh mục
  const categories = [
    "Tất cả",
    "Công nghệ",
    "Đời sống",
    "Giáo dục",
    "Thể thao",
    "Giải trí",
    "Sức khỏe",
    "Du lịch",
    "Kinh doanh",
  ];

  // Danh sách sắp xếp
  const sortOptions = [
    { value: "recent", label: "Mới nhất" },
    { value: "popular", label: "Phổ biến nhất" },
    { value: "comments", label: "Nhiều bình luận nhất" },
  ];

  useEffect(() => {
    fetchSearchResults();
  }, [query, category, tag, page, sortBy]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy,
        ...(query && { keyword: query }),
        ...(category && category !== "Tất cả" && { category }),
        ...(tag && { tag }),
      };

      const response = await searchPosts(params);
      setPosts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.");
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Cập nhật URL search params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("q", searchQuery);
    if (selectedCategory && selectedCategory !== "Tất cả")
      newParams.set("category", selectedCategory);
    if (tag) newParams.set("tag", tag);
    newParams.set("page", "1"); // Reset về trang 1
    newParams.set("sortBy", selectedSortBy);

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSortBy("recent");
    setSearchParams({ page: "1" });
  };

  const handleNextPage = () => {
    if (pagination && pagination.next) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", pagination.next.page.toString());
      setSearchParams(newParams);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (pagination && pagination.prev) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", pagination.prev.page.toString());
      setSearchParams(newParams);
      window.scrollTo(0, 0);
    }
  };

  const handleLike = (postId, isLiked) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
            likes: isLiked
              ? [...post.likes, user?.id]
              : post.likes.filter((id) => id !== user?.id),
          };
        }
        return post;
      })
    );
  };

  // Tạo tiêu đề tìm kiếm
  const getSearchTitle = () => {
    if (tag) return `Kết quả tìm kiếm cho thẻ: #${tag}`;
    if (query && category && category !== "Tất cả")
      return `Kết quả tìm kiếm cho "${query}" trong ${category}`;
    if (query) return `Kết quả tìm kiếm cho "${query}"`;
    if (category && category !== "Tất cả")
      return `Bài viết trong danh mục: ${category}`;
    return "Tất cả bài viết";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getSearchTitle()}</h1>
        <p className="text-gray-600">
          {loading
            ? "Đang tìm kiếm..."
            : pagination && `Tìm thấy ${pagination.totalItems || 0} kết quả`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - Bộ lọc */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-5 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Bộ lọc tìm kiếm</h2>

            <form onSubmit={handleSearch} className="space-y-5">
              {/* Tìm kiếm */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Từ khóa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Danh mục */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Danh mục
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat === "Tất cả" ? "" : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sắp xếp */}
              <div>
                <label
                  htmlFor="sortBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sắp xếp theo
                </label>
                <select
                  id="sortBy"
                  value={selectedSortBy}
                  onChange={(e) => setSelectedSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút tìm kiếm và xóa lọc */}
              <div className="flex flex-col space-y-2">
                <Button type="submit" className="w-full">
                  Tìm kiếm
                </Button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Main content */}
        <div className="md:w-2/3 lg:w-3/4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onLike={handleLike} />
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 mb-6">
                  <Button
                    variant="secondary"
                    onClick={handlePrevPage}
                    disabled={!pagination.prev}
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
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
                  <span className="px-4 py-2 bg-gray-100 rounded-md text-gray-700">
                    Trang {page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={handleNextPage}
                    disabled={!pagination.next}
                  >
                    <span className="flex items-center">
                      Trang sau
                      <svg
                        className="w-5 h-5 ml-1"
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12a8 8 0 100 16 8 8 0 000-16"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Không tìm thấy kết quả nào
              </h3>
              <p className="text-gray-500 mb-6">
                Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn. Hãy
                thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
