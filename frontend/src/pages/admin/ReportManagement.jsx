import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("all"); // all, pending, resolved, dismissed
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [currentFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get(`/api/admin/reports?status=${currentFilter}`);
      // setReports(response.data.reports);

      // Dữ liệu mẫu
      const mockReports = [
        {
          _id: "1",
          type: "post",
          targetId: "101",
          targetTitle: "Thảo luận về Node.js",
          reportedBy: {
            _id: "201",
            username: "user1",
          },
          reason: "Nội dung không phù hợp",
          details: "Bài viết có chứa nội dung quảng cáo trái phép",
          status: "pending",
          createdAt: "2023-06-15T10:30:00Z",
          updatedAt: null,
          resolvedBy: null,
        },
        {
          _id: "2",
          type: "comment",
          targetId: "102",
          targetTitle: "Bình luận trong bài React Hooks",
          reportedBy: {
            _id: "202",
            username: "user2",
          },
          reason: "Ngôn từ xúc phạm",
          details: "Bình luận có chứa các từ ngữ không phù hợp với cộng đồng",
          status: "resolved",
          createdAt: "2023-06-14T08:15:00Z",
          updatedAt: "2023-06-14T14:20:00Z",
          resolvedBy: {
            _id: "301",
            username: "admin",
          },
        },
        {
          _id: "3",
          type: "user",
          targetId: "103",
          targetTitle: "spammer123",
          reportedBy: {
            _id: "203",
            username: "moderator1",
          },
          reason: "Spam",
          details:
            "Người dùng liên tục đăng bài quảng cáo và spam trong nhiều chủ đề",
          status: "pending",
          createdAt: "2023-06-13T15:45:00Z",
          updatedAt: null,
          resolvedBy: null,
        },
        {
          _id: "4",
          type: "post",
          targetId: "104",
          targetTitle: "Hướng dẫn hack website",
          reportedBy: {
            _id: "204",
            username: "user3",
          },
          reason: "Nội dung vi phạm pháp luật",
          details: "Bài viết hướng dẫn các hoạt động không hợp pháp",
          status: "dismissed",
          createdAt: "2023-06-12T11:20:00Z",
          updatedAt: "2023-06-12T16:30:00Z",
          resolvedBy: {
            _id: "302",
            username: "admin2",
          },
        },
        {
          _id: "5",
          type: "comment",
          targetId: "105",
          targetTitle: "Bình luận trong bài CSS Grid",
          reportedBy: {
            _id: "205",
            username: "user4",
          },
          reason: "Thông tin sai lệch",
          details:
            "Bình luận chứa thông tin kỹ thuật không chính xác, gây hiểu lầm",
          status: "pending",
          createdAt: "2023-06-11T09:10:00Z",
          updatedAt: null,
          resolvedBy: null,
        },
      ];

      if (currentFilter !== "all") {
        setReports(
          mockReports.filter((report) => report.status === currentFilter)
        );
      } else {
        setReports(mockReports);
      }
    } catch (err) {
      setError("Không thể tải danh sách báo cáo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.patch(`/api/admin/reports/${reportId}`, { status: 'resolved' });

      setReports(
        reports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: "resolved",
                updatedAt: new Date().toISOString(),
                resolvedBy: { _id: "301", username: "admin" },
              }
            : report
        )
      );
    } catch (err) {
      setError("Không thể cập nhật trạng thái báo cáo");
      console.error(err);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.patch(`/api/admin/reports/${reportId}`, { status: 'dismissed' });

      setReports(
        reports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: "dismissed",
                updatedAt: new Date().toISOString(),
                resolvedBy: { _id: "301", username: "admin" },
              }
            : report
        )
      );
    } catch (err) {
      setError("Không thể cập nhật trạng thái báo cáo");
      console.error(err);
    }
  };

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case "post":
        return "Bài viết";
      case "comment":
        return "Bình luận";
      case "user":
        return "Người dùng";
      default:
        return "Khác";
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Quản lý báo cáo vi phạm</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`px-3 py-1.5 rounded-md text-sm ${
            currentFilter === "all"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setCurrentFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm ${
            currentFilter === "pending"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setCurrentFilter("pending")}
        >
          Chờ xử lý
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm ${
            currentFilter === "resolved"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setCurrentFilter("resolved")}
        >
          Đã xử lý
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm ${
            currentFilter === "dismissed"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setCurrentFilter("dismissed")}
        >
          Đã bỏ qua
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày báo cáo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Không có báo cáo nào
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}
                      >
                        {getReportTypeLabel(report.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {report.targetTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.reportedBy.username}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {report.reason}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {report.status === "pending"
                          ? "Chờ xử lý"
                          : report.status === "resolved"
                          ? "Đã xử lý"
                          : report.status === "dismissed"
                          ? "Đã bỏ qua"
                          : report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(report)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Chi tiết
                      </button>
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleResolveReport(report._id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Xử lý
                          </button>
                          <button
                            onClick={() => handleDismissReport(report._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Bỏ qua
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết báo cáo</h2>
              <button
                onClick={closeDetailsModal}
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
              <div>
                <span className="text-gray-500">Loại báo cáo:</span>
                <span className="ml-2 font-medium">
                  {getReportTypeLabel(selectedReport.type)}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Tiêu đề đối tượng:</span>
                <span className="ml-2 font-medium">
                  {selectedReport.targetTitle}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Người báo cáo:</span>
                <span className="ml-2 font-medium">
                  {selectedReport.reportedBy.username}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Lý do:</span>
                <span className="ml-2 font-medium">
                  {selectedReport.reason}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Trạng thái:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                    selectedReport.status
                  )}`}
                >
                  {selectedReport.status === "pending"
                    ? "Chờ xử lý"
                    : selectedReport.status === "resolved"
                    ? "Đã xử lý"
                    : selectedReport.status === "dismissed"
                    ? "Đã bỏ qua"
                    : selectedReport.status}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Ngày báo cáo:</span>
                <span className="ml-2 font-medium">
                  {new Date(selectedReport.createdAt).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>

              {selectedReport.updatedAt && (
                <div>
                  <span className="text-gray-500">Ngày cập nhật:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedReport.updatedAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
              )}

              {selectedReport.resolvedBy && (
                <div>
                  <span className="text-gray-500">Người xử lý:</span>
                  <span className="ml-2 font-medium">
                    {selectedReport.resolvedBy.username}
                  </span>
                </div>
              )}

              <div>
                <p className="text-gray-500 mb-1">Chi tiết:</p>
                <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                  {selectedReport.details}
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <Link
                  to={`/admin/${selectedReport.type}s/${selectedReport.targetId}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Xem đối tượng
                </Link>

                {selectedReport.status === "pending" && (
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        handleResolveReport(selectedReport._id);
                        closeDetailsModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Xử lý
                    </button>
                    <button
                      onClick={() => {
                        handleDismissReport(selectedReport._id);
                        closeDetailsModal();
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Bỏ qua
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
