import React, { useState, useEffect } from "react";

const DraftSchedule = () => {
  const [postType, setPostType] = useState("drafts");
  const [drafts, setDrafts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("00:00");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // API calls sẽ được thêm sau khi tạo endpoint backend
      // const draftsResponse = await axios.get('/api/admin/posts/drafts');
      // const scheduledResponse = await axios.get('/api/admin/posts/scheduled');
      // setDrafts(draftsResponse.data);
      // setScheduled(scheduledResponse.data);

      // Dữ liệu mẫu
      const mockDrafts = [
        {
          id: "1",
          title: "Tổng quan về NextJS và React Framework mới nhất",
          author: "Nguyễn Văn A",
          authorId: "user123",
          category: "Frontend Development",
          categoryId: "cat1",
          tags: ["React", "NextJS", "JavaScript"],
          lastEdited: "2023-05-18T14:35:22",
          content:
            "NextJS là một framework phổ biến dựa trên React để xây dựng ứng dụng web...",
          status: "draft",
          excerpt:
            "Tìm hiểu về NextJS và các tính năng mới nhất của framework này.",
          featured: false,
          thumbnail: "/images/thumbnails/nextjs-overview.jpg",
        },
        {
          id: "2",
          title: "Hướng dẫn sử dụng Docker cơ bản",
          author: "Trần Thị B",
          authorId: "user234",
          category: "DevOps",
          categoryId: "cat2",
          tags: ["Docker", "Container", "DevOps"],
          lastEdited: "2023-05-15T10:22:15",
          content:
            "Docker là một nền tảng phần mềm cho phép bạn đóng gói ứng dụng và dependencies...",
          status: "draft",
          excerpt: "Bài viết hướng dẫn về Docker dành cho người mới bắt đầu.",
          featured: true,
          thumbnail: "/images/thumbnails/docker-basics.jpg",
        },
        {
          id: "3",
          title: "Thiết kế database hiệu quả cho ứng dụng web",
          author: "Lê Văn C",
          authorId: "user345",
          category: "Database",
          categoryId: "cat3",
          tags: ["Database", "SQL", "Performance"],
          lastEdited: "2023-05-10T08:45:30",
          content:
            "Thiết kế database hiệu quả là một trong những yếu tố quan trọng để đảm bảo...",
          status: "draft",
          excerpt: "Các nguyên tắc và kỹ thuật thiết kế database hiệu quả.",
          featured: false,
          thumbnail: "/images/thumbnails/db-design.jpg",
        },
        {
          id: "4",
          title: "5 thư viện Python hữu ích cho xử lý dữ liệu",
          author: "Phạm Thị D",
          authorId: "user456",
          category: "Python",
          categoryId: "cat4",
          tags: ["Python", "Data Processing", "Libraries"],
          lastEdited: "2023-04-28T16:12:40",
          content:
            "Python có rất nhiều thư viện hữu ích cho xử lý dữ liệu. Trong bài viết này...",
          status: "draft",
          excerpt:
            "Giới thiệu 5 thư viện Python hữu ích nhất cho xử lý dữ liệu.",
          featured: false,
          thumbnail: "/images/thumbnails/python-libs.jpg",
        },
        {
          id: "5",
          title: "Tối ưu hiệu suất website với Lighthouse",
          author: "Hoàng Văn E",
          authorId: "user567",
          category: "Web Performance",
          categoryId: "cat5",
          tags: ["Performance", "Lighthouse", "Web Development"],
          lastEdited: "2023-04-25T09:30:15",
          content:
            "Lighthouse là công cụ tuyệt vời để đánh giá và cải thiện hiệu suất website...",
          status: "draft",
          excerpt: "Hướng dẫn sử dụng Lighthouse để tối ưu hiệu suất website.",
          featured: true,
          thumbnail: "/images/thumbnails/lighthouse.jpg",
        },
      ];

      const mockScheduled = [
        {
          id: "6",
          title: "Khám phá các tính năng mới trong PHP 8.2",
          author: "Vũ Thị F",
          authorId: "user678",
          category: "PHP",
          categoryId: "cat6",
          tags: ["PHP", "PHP 8.2", "Backend"],
          scheduledDate: "2023-06-10T08:00:00",
          content:
            "PHP 8.2 mang đến nhiều tính năng và cải tiến mới so với các phiên bản trước...",
          status: "scheduled",
          excerpt: "Tổng hợp các tính năng và cải tiến mới trong PHP 8.2.",
          featured: false,
          thumbnail: "/images/thumbnails/php-8-2.jpg",
        },
        {
          id: "7",
          title: "Lộ trình học Machine Learning cho người mới bắt đầu",
          author: "Nguyễn Văn G",
          authorId: "user789",
          category: "Machine Learning",
          categoryId: "cat7",
          tags: ["Machine Learning", "AI", "Learning Path"],
          scheduledDate: "2023-06-15T10:30:00",
          content:
            "Machine Learning là một lĩnh vực rộng lớn và có thể gây choáng ngợp cho người mới bắt đầu...",
          status: "scheduled",
          excerpt:
            "Hướng dẫn từng bước để bắt đầu học Machine Learning hiệu quả.",
          featured: true,
          thumbnail: "/images/thumbnails/ml-path.jpg",
        },
        {
          id: "8",
          title: "Xây dựng RESTful API với Node.js và Express",
          author: "Trần Văn H",
          authorId: "user890",
          category: "Backend Development",
          categoryId: "cat8",
          tags: ["Node.js", "Express", "RESTful API"],
          scheduledDate: "2023-06-20T14:00:00",
          content:
            "Trong bài viết này, chúng ta sẽ tìm hiểu cách xây dựng một RESTful API sử dụng Node.js và Express...",
          status: "scheduled",
          excerpt:
            "Hướng dẫn toàn diện về xây dựng RESTful API với Node.js và Express.",
          featured: false,
          thumbnail: "/images/thumbnails/nodejs-api.jpg",
        },
        {
          id: "9",
          title: "Bảo mật ứng dụng web: Best practices",
          author: "Lê Thị I",
          authorId: "user901",
          category: "Security",
          categoryId: "cat9",
          tags: ["Security", "Web Development", "Best Practices"],
          scheduledDate: "2023-06-25T09:00:00",
          content:
            "Bảo mật là một trong những yếu tố quan trọng nhất khi phát triển ứng dụng web...",
          status: "scheduled",
          excerpt:
            "Các best practices để đảm bảo bảo mật cho ứng dụng web của bạn.",
          featured: true,
          thumbnail: "/images/thumbnails/web-security.jpg",
        },
      ];

      setDrafts(mockDrafts);
      setScheduled(mockScheduled);
    } catch (err) {
      setError("Không thể tải danh sách bài viết");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async (postId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xuất bản bài viết này ngay bây giờ?"
      )
    ) {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.patch(`/api/admin/posts/${postId}/publish`);

        // Cập nhật danh sách
        setDrafts(drafts.filter((draft) => draft.id !== postId));
        setSuccess("Bài viết đã được xuất bản thành công!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Không thể xuất bản bài viết");
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeletePost = async (postId, postType) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
      )
    ) {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.delete(`/api/admin/posts/${postId}`);

        // Cập nhật danh sách
        if (postType === "drafts") {
          setDrafts(drafts.filter((draft) => draft.id !== postId));
        } else {
          setScheduled(scheduled.filter((post) => post.id !== postId));
        }
        setSuccess("Bài viết đã được xóa thành công!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Không thể xóa bài viết");
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleOpenScheduleModal = (post) => {
    setCurrentPost(post);
    // Đặt thời gian mặc định là hiện tại + 1 ngày
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split("T")[0]);
    setScheduleTime("10:00");
    setShowScheduleModal(true);
  };

  const handleSchedulePost = async (e) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleTime) {
      setError("Vui lòng chọn ngày và giờ đăng bài");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      if (scheduledDateTime <= new Date()) {
        setError("Thời gian đăng bài phải là tương lai");
        setProcessing(false);
        return;
      }

      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.patch(`/api/admin/posts/${currentPost.id}/schedule`, {
      //   scheduledDate: scheduledDateTime.toISOString()
      // });

      // Cập nhật danh sách
      const updatedPost = {
        ...currentPost,
        status: "scheduled",
        scheduledDate: scheduledDateTime.toISOString(),
      };
      setDrafts(drafts.filter((draft) => draft.id !== currentPost.id));
      setScheduled([...scheduled, updatedPost]);

      setSuccess("Đã lên lịch đăng bài thành công!");
      setShowScheduleModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Không thể lên lịch đăng bài");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSchedule = async (postId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy lịch đăng bài? Bài viết sẽ trở về trạng thái nháp."
      )
    ) {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.patch(`/api/admin/posts/${postId}/cancel-schedule`);

        // Cập nhật danh sách
        const post = scheduled.find((post) => post.id === postId);
        if (post) {
          const updatedPost = { ...post, status: "draft" };
          delete updatedPost.scheduledDate;

          setScheduled(scheduled.filter((post) => post.id !== postId));
          setDrafts([...drafts, updatedPost]);
          setSuccess("Đã hủy lịch đăng bài thành công!");
          setTimeout(() => setSuccess(""), 3000);
        }
      } catch (err) {
        setError("Không thể hủy lịch đăng bài");
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Lọc bài viết dựa vào từ khóa tìm kiếm
  const filteredPosts =
    postType === "drafts"
      ? drafts.filter((post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : scheduled.filter((post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý bài viết và lịch đăng</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setPostType("drafts")}
                className={`px-4 py-2 rounded-md ${
                  postType === "drafts"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Bài viết nháp ({drafts.length})
              </button>
              <button
                onClick={() => setPostType("scheduled")}
                className={`px-4 py-2 rounded-md ${
                  postType === "scheduled"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Bài viết đã lên lịch ({scheduled.length})
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {postType === "drafts"
                ? "Không có bài viết nháp nào."
                : "Không có bài viết nào được lên lịch."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài viết
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyên mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {postType === "drafts"
                        ? "Chỉnh sửa lần cuối"
                        : "Lịch đăng"}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.thumbnail && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={post.thumbnail}
                                alt={post.title}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {post.excerpt}
                            </div>
                            <div className="mt-1 flex items-center">
                              {post.featured && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
                                  Nổi bật
                                </span>
                              )}
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {post.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {post.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(
                            postType === "drafts"
                              ? post.lastEdited
                              : post.scheduledDate
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`/editor/${post.id}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Chỉnh sửa
                        </a>

                        {postType === "drafts" ? (
                          <>
                            <button
                              onClick={() => handlePublishDraft(post.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                              disabled={processing}
                            >
                              Xuất bản ngay
                            </button>
                            <button
                              onClick={() => handleOpenScheduleModal(post)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              disabled={processing}
                            >
                              Lên lịch
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCancelSchedule(post.id)}
                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                            disabled={processing}
                          >
                            Hủy lịch
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePost(post.id, postType)}
                          className="text-red-600 hover:text-red-900"
                          disabled={processing}
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

      {/* Schedule Modal */}
      {showScheduleModal && currentPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Lên lịch đăng bài</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={processing}
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

            <div className="mb-4">
              <p className="text-gray-700">
                <strong>Bài viết:</strong> {currentPost.title}
              </p>
            </div>

            <form onSubmit={handleSchedulePost}>
              <div className="mb-4">
                <label
                  htmlFor="scheduleDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ngày đăng
                </label>
                <input
                  type="date"
                  id="scheduleDate"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="scheduleTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Giờ đăng
                </label>
                <input
                  type="time"
                  id="scheduleTime"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  disabled={processing}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  disabled={processing}
                >
                  {processing ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftSchedule;
