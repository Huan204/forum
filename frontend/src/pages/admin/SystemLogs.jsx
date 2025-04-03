import React, { useState, useEffect } from "react";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logTypes, setLogTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [selectedType, selectedLevel, currentPage]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/logs', {
      //   params: {
      //     type: selectedType !== 'all' ? selectedType : undefined,
      //     level: selectedLevel !== 'all' ? selectedLevel : undefined,
      //     search: searchTerm || undefined,
      //     from: dateRange.from || undefined,
      //     to: dateRange.to || undefined,
      //     page: currentPage,
      //     limit: 20
      //   }
      // });
      // setLogs(response.data.logs);
      // setTotalPages(response.data.totalPages);

      // Dữ liệu mẫu
      const mockLogs = [
        {
          id: "log_1",
          timestamp: "2023-07-10T08:45:12Z",
          type: "auth",
          level: "info",
          message: "Đăng nhập thành công",
          details: {
            userId: "user_123",
            username: "admin",
            ip: "192.168.1.1",
            userAgent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
        {
          id: "log_2",
          timestamp: "2023-07-10T08:30:05Z",
          type: "auth",
          level: "warning",
          message: "Đăng nhập thất bại nhiều lần",
          details: {
            username: "john_doe",
            attempts: 5,
            ip: "192.168.1.2",
            userAgent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
        {
          id: "log_3",
          timestamp: "2023-07-10T07:15:42Z",
          type: "system",
          level: "error",
          message: "Lỗi kết nối cơ sở dữ liệu",
          details: {
            errorCode: "DB_CONN_ERROR",
            errorMessage: "Unable to connect to database",
            stack:
              "Error: Unable to connect to database\n  at Database.connect (/app/services/db.js:45:15)",
          },
        },
        {
          id: "log_4",
          timestamp: "2023-07-09T22:10:33Z",
          type: "content",
          level: "warning",
          message: "Bài viết bị báo cáo",
          details: {
            postId: "post_456",
            reportedBy: "user_789",
            reason: "Nội dung không phù hợp",
          },
        },
        {
          id: "log_5",
          timestamp: "2023-07-09T20:05:18Z",
          type: "system",
          level: "info",
          message: "Hệ thống khởi động lại thành công",
          details: {
            uptime: "0:00:15",
            memoryUsage: "256MB",
          },
        },
        {
          id: "log_6",
          timestamp: "2023-07-09T18:30:00Z",
          type: "backup",
          level: "info",
          message: "Sao lưu dữ liệu tự động thành công",
          details: {
            backupId: "backup_123",
            fileSize: "125MB",
            completedIn: "00:02:15",
          },
        },
        {
          id: "log_7",
          timestamp: "2023-07-09T15:22:55Z",
          type: "content",
          level: "info",
          message: "Bài viết mới được tạo",
          details: {
            postId: "post_789",
            title: "Cách tối ưu hiệu suất trong React",
            authorId: "user_456",
          },
        },
        {
          id: "log_8",
          timestamp: "2023-07-09T14:15:30Z",
          type: "auth",
          level: "critical",
          message: "Phát hiện xâm nhập",
          details: {
            attempts: 20,
            ip: "198.51.100.1",
            targetUser: "admin",
            status: "IP bị chặn",
          },
        },
        {
          id: "log_9",
          timestamp: "2023-07-09T12:05:10Z",
          type: "system",
          level: "error",
          message: "Lỗi xử lý tác vụ nền",
          details: {
            taskId: "task_123",
            errorCode: "TASK_TIMEOUT",
            taskType: "email_sending",
          },
        },
        {
          id: "log_10",
          timestamp: "2023-07-09T10:00:00Z",
          type: "backup",
          level: "error",
          message: "Sao lưu tự động thất bại",
          details: {
            reason: "Không đủ dung lượng lưu trữ",
            availableSpace: "50MB",
            requiredSpace: "200MB",
          },
        },
      ];

      const mockLogTypes = [
        { id: "auth", label: "Xác thực" },
        { id: "system", label: "Hệ thống" },
        { id: "content", label: "Nội dung" },
        { id: "backup", label: "Sao lưu" },
      ];

      // Áp dụng bộ lọc vào dữ liệu mẫu
      let filteredLogs = [...mockLogs];
      if (selectedType !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.type === selectedType);
      }
      if (selectedLevel !== "all") {
        filteredLogs = filteredLogs.filter(
          (log) => log.level === selectedLevel
        );
      }
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(log.details)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }
      if (dateRange.from) {
        filteredLogs = filteredLogs.filter(
          (log) => new Date(log.timestamp) >= new Date(dateRange.from)
        );
      }
      if (dateRange.to) {
        filteredLogs = filteredLogs.filter(
          (log) => new Date(log.timestamp) <= new Date(dateRange.to)
        );
      }

      setLogs(filteredLogs);
      setLogTypes(mockLogTypes);
      setTotalPages(Math.ceil(filteredLogs.length / 20));
    } catch (err) {
      setError("Không thể tải nhật ký hệ thống");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedLevel("all");
    setSearchTerm("");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type) => {
    const foundType = logTypes.find((t) => t.id === type);
    return foundType ? foundType.label : type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading && !logs.length)
    return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Nhật ký hệ thống</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Loại nhật ký
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tất cả</option>
                {logTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mức độ
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tất cả</option>
                <option value="info">Thông tin</option>
                <option value="warning">Cảnh báo</option>
                <option value="error">Lỗi</option>
                <option value="critical">Nghiêm trọng</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Từ ngày
              </label>
              <input
                type="date"
                id="dateFrom"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Đến ngày
              </label>
              <input
                type="date"
                id="dateTo"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm trong nhật ký..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Xóa bộ lọc
            </button>
          </div>
        </form>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mức độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông điệp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy nhật ký nào
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getTypeLabel(log.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(
                          log.level
                        )}`}
                      >
                        {log.level === "info"
                          ? "Thông tin"
                          : log.level === "warning"
                          ? "Cảnh báo"
                          : log.level === "error"
                          ? "Lỗi"
                          : log.level === "critical"
                          ? "Nghiêm trọng"
                          : log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
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
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Trước
            </button>
            <span className="px-4 py-1">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sau
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
