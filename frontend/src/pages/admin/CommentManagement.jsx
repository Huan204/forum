import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Định nghĩa component Button tái sử dụng
const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseClasses = "px-3 py-1.5 rounded-md text-sm font-medium";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    info: "bg-purple-600 text-white hover:bg-purple-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [detailViewComment, setDetailViewComment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch comments when page, search term or status changes
  useEffect(() => {
    fetchComments();
  }, [currentPage, selectedStatus]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // const response = await axios.get(
      //   `/api/admin/comments?page=${currentPage}&status=${selectedStatus}&search=${searchTerm}`
      // );
      // setComments(response.data.comments);
      // setTotalPages(response.data.totalPages);

      // Mock data for development
      const mockComments = [
        {
          _id: "c1",
          content: "Rất hữu ích, cảm ơn bạn đã chia sẻ!",
          post: {
            _id: "p1",
            title: "Giới thiệu về React Hooks",
          },
          author: {
            _id: "u1",
            username: "nguyenvan",
            avatar: "https://i.pravatar.cc/150?img=1",
          },
          likes: 5,
          status: "active",
          reports: 0,
          createdAt: "2023-06-15T08:30:00Z",
          updatedAt: "2023-06-15T08:30:00Z",
        },
        {
          _id: "c2",
          content:
            "Tôi không đồng ý với quan điểm này. TypeScript không phải lúc nào cũng cần thiết cho các dự án nhỏ.",
          post: {
            _id: "p2",
            title: "Tại sao nên sử dụng TypeScript",
          },
          author: {
            _id: "u2",
            username: "trankhanh",
            avatar: "https://i.pravatar.cc/150?img=2",
          },
          likes: 2,
          status: "reported",
          reports: 1,
          createdAt: "2023-06-14T15:20:00Z",
          updatedAt: "2023-06-14T15:20:00Z",
        },
        {
          _id: "c3",
          content:
            "Bài viết này chứa thông tin không chính xác. MongoDB không phải là SQL database.",
          post: {
            _id: "p3",
            title: "So sánh các loại database",
          },
          author: {
            _id: "u3",
            username: "lehong",
            avatar: "https://i.pravatar.cc/150?img=3",
          },
          likes: 0,
          status: "hidden",
          reports: 3,
          createdAt: "2023-06-13T10:45:00Z",
          updatedAt: "2023-06-13T14:20:00Z",
        },
        {
          _id: "c4",
          content: "Đã thực hiện theo hướng dẫn và thành công. Cảm ơn tác giả!",
          post: {
            _id: "p4",
            title: "Hướng dẫn cài đặt Node.js",
          },
          author: {
            _id: "u4",
            username: "phamlinh",
            avatar: "https://i.pravatar.cc/150?img=4",
          },
          likes: 8,
          status: "active",
          reports: 0,
          createdAt: "2023-06-12T09:15:00Z",
          updatedAt: "2023-06-12T09:15:00Z",
        },
        {
          _id: "c5",
          content:
            "Link tải xuống bị lỗi. Có thể cập nhật lại không? Xin cảm ơn!",
          post: {
            _id: "p5",
            title: "Tài nguyên học CSS Grid",
          },
          author: {
            _id: "u5",
            username: "vutrung",
            avatar: "https://i.pravatar.cc/150?img=5",
          },
          likes: 1,
          status: "active",
          reports: 0,
          createdAt: "2023-06-11T16:50:00Z",
          updatedAt: "2023-06-11T16:50:00Z",
        },
      ];

      // Filter comments by status if not 'all'
      let filteredComments = mockComments;
      if (selectedStatus !== "all") {
        filteredComments = mockComments.filter(
          (comment) => comment.status === selectedStatus
        );
      }

      // Filter by search term if provided
      if (searchTerm.trim() !== "") {
        filteredComments = filteredComments.filter(
          (comment) =>
            comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.author.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            comment.post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setComments(filteredComments);
      setTotalPages(Math.ceil(filteredComments.length / 5)); // Assuming 5 items per page
      setLoading(false);
    } catch (err) {
      setError("Không thể tải dữ liệu bình luận");
      setLoading(false);
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComments();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectStatus = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // In a real implementation, this would be an API call
      // await axios.delete(`/api/admin/comments/${commentToDelete._id}`);

      // Update state
      setComments(comments.filter((c) => c._id !== commentToDelete._id));
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (err) {
      setError("Không thể xóa bình luận");
      console.error(err);
    }
  };

  const handleStatusUpdate = async (commentId, newStatus) => {
    try {
      // In a real implementation, this would be an API call
      // await axios.patch(`/api/admin/comments/${commentId}`, {
      //   status: newStatus
      // });

      // Update state
      setComments(
        comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, status: newStatus }
            : comment
        )
      );
    } catch (err) {
      setError("Không thể cập nhật trạng thái bình luận");
      console.error(err);
    }
  };

  const handleViewDetail = (comment) => {
    setDetailViewComment(comment);
    setShowDetailModal(true);
  };

  // Format date to local string
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Get appropriate status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "hidden":
        return "bg-gray-100 text-gray-800";
      case "reported":
        return "bg-yellow-100 text-yellow-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get human-readable status text
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hiện thị";
      case "hidden":
        return "Đã ẩn";
      case "reported":
        return "Bị báo cáo";
      case "deleted":
        return "Đã xóa";
      default:
        return status;
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Quản lý bình luận</h1>

      {/* Search and filter */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm bình luận..."
            className="px-4 py-2 border border-gray-300 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button
            variant="primary"
            className="rounded-l-none px-4"
            onClick={handleSearch}
          >
            Tìm
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === "all" ? "primary" : "secondary"}
            onClick={() => handleSelectStatus("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={selectedStatus === "active" ? "primary" : "secondary"}
            onClick={() => handleSelectStatus("active")}
          >
            Hiển thị
          </Button>
          <Button
            variant={selectedStatus === "reported" ? "primary" : "secondary"}
            onClick={() => handleSelectStatus("reported")}
          >
            Bị báo cáo
          </Button>
          <Button
            variant={selectedStatus === "hidden" ? "primary" : "secondary"}
            onClick={() => handleSelectStatus("hidden")}
          >
            Đã ẩn
          </Button>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Không có bình luận nào
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={comment.author.avatar}
                            alt={comment.author.username}
                          />
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {comment.author.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {comment.content}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {comment.post.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          comment.status
                        )}`}
                      >
                        {getStatusText(comment.status)}
                      </span>
                      {comment.reports > 0 && (
                        <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {comment.reports} báo cáo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(comment.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(comment)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Chi tiết
                      </button>
                      {comment.status === "active" ? (
                        <button
                          onClick={() =>
                            handleStatusUpdate(comment._id, "hidden")
                          }
                          className="text-yellow-600 hover:text-yellow-900 mr-2"
                        >
                          Ẩn
                        </button>
                      ) : comment.status === "hidden" ? (
                        <button
                          onClick={() =>
                            handleStatusUpdate(comment._id, "active")
                          }
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Hiện
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDeleteClick(comment)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
          >
            Trang trước
          </Button>
          <span className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
              >
                Hủy bỏ
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Detail Modal */}
      {showDetailModal && detailViewComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết bình luận</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailViewComment(null);
                }}
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

            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src={detailViewComment.author.avatar}
                  alt={detailViewComment.author.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">
                    {detailViewComment.author.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(detailViewComment.createdAt)}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                      detailViewComment.status
                    )}`}
                  >
                    {getStatusText(detailViewComment.status)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-gray-500 mb-1">Bài viết:</h4>
                <p className="font-medium">{detailViewComment.post.title}</p>
              </div>

              <div>
                <h4 className="text-gray-500 mb-1">Nội dung:</h4>
                <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                  {detailViewComment.content}
                </p>
              </div>

              <div className="flex gap-3">
                <div>
                  <span className="text-gray-500">Lượt thích:</span>
                  <span className="ml-2 font-medium">
                    {detailViewComment.likes}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Báo cáo:</span>
                  <span className="ml-2 font-medium">
                    {detailViewComment.reports}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailModal(false);
                    }}
                  >
                    Xem bài viết
                  </Button>
                </div>
                <div className="flex gap-2">
                  {detailViewComment.status === "active" ? (
                    <Button
                      variant="warning"
                      onClick={() => {
                        handleStatusUpdate(detailViewComment._id, "hidden");
                        setDetailViewComment({
                          ...detailViewComment,
                          status: "hidden",
                        });
                      }}
                    >
                      Ẩn bình luận
                    </Button>
                  ) : detailViewComment.status === "hidden" ? (
                    <Button
                      variant="success"
                      onClick={() => {
                        handleStatusUpdate(detailViewComment._id, "active");
                        setDetailViewComment({
                          ...detailViewComment,
                          status: "active",
                        });
                      }}
                    >
                      Hiện bình luận
                    </Button>
                  ) : null}
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteClick(detailViewComment);
                    }}
                  >
                    Xóa bình luận
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
