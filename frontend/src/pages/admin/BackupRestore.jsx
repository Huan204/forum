import React, { useState, useEffect } from "react";

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [backupOption, setBackupOption] = useState("full");
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState(null);
  const [restorePassword, setRestorePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/backups');
      // setBackups(response.data);

      // Dữ liệu mẫu
      const mockBackups = [
        {
          id: "1",
          name: "backup-20230512-103045",
          type: "full",
          size: "25.4 MB",
          created_at: "2023-05-12T10:30:45",
          created_by: "admin",
          status: "completed",
          notes: "Sao lưu trước khi cập nhật phiên bản 2.1.0",
        },
        {
          id: "2",
          name: "backup-20230610-143212",
          type: "database",
          size: "12.8 MB",
          created_at: "2023-06-10T14:32:12",
          created_by: "admin",
          status: "completed",
          notes: "Sao lưu định kỳ hàng tháng",
        },
        {
          id: "3",
          name: "backup-20230715-083022",
          type: "files",
          size: "18.2 MB",
          created_at: "2023-07-15T08:30:22",
          created_by: "adminuser",
          status: "completed",
          notes: "Sao lưu tập tin trước khi cập nhật theme",
        },
        {
          id: "4",
          name: "backup-20230808-213015",
          type: "full",
          size: "26.7 MB",
          created_at: "2023-08-08T21:30:15",
          created_by: "superadmin",
          status: "completed",
          notes: "Sao lưu đầy đủ hàng quý",
        },
        {
          id: "5",
          name: "backup-20230909-093012",
          type: "database",
          size: "13.5 MB",
          created_at: "2023-09-09T09:30:12",
          created_by: "admin",
          status: "completed",
          notes: "Sao lưu trước khi di chuyển server",
        },
      ];

      setBackups(mockBackups);
    } catch (err) {
      setError("Không thể tải danh sách bản sao lưu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.post('/api/admin/backups', { type: backupOption });

      // Giả lập tạo sao lưu
      setTimeout(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const newBackup = {
          id: Date.now().toString(),
          name: `backup-${year}${month}${day}-${hours}${minutes}${seconds}`,
          type: backupOption,
          size:
            backupOption === "full"
              ? "27.3 MB"
              : backupOption === "database"
              ? "13.1 MB"
              : "14.2 MB",
          created_at: now.toISOString(),
          created_by: "admin",
          status: "completed",
          notes: "",
        };

        setBackups([newBackup, ...backups]);
        setSuccess(`Đã tạo bản sao lưu mới thành công: ${newBackup.name}`);
      }, 2000);
    } catch (err) {
      setError("Không thể tạo bản sao lưu");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreClick = (backupId) => {
    setSelectedBackupId(backupId);
    setRestorePassword("");
    setPasswordError("");
    setShowRestoreConfirm(true);
  };

  const handleRestoreBackup = async () => {
    if (!restorePassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu admin để xác nhận");
      return;
    }

    setRestoring(true);
    setError(null);
    setSuccess(null);
    setPasswordError("");

    try {
      // Giả lập xác thực mật khẩu và khôi phục
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.post(`/api/admin/backups/${selectedBackupId}/restore`, {
      //   password: restorePassword
      // });

      // Mật khẩu mẫu cho demo: "admin123"
      if (restorePassword !== "admin123") {
        setPasswordError("Mật khẩu không đúng");
        setRestoring(false);
        return;
      }

      // Giả lập khôi phục
      setTimeout(() => {
        const selectedBackup = backups.find(
          (backup) => backup.id === selectedBackupId
        );
        setSuccess(
          `Đã khôi phục hệ thống từ bản sao lưu: ${selectedBackup.name}`
        );
        setShowRestoreConfirm(false);
      }, 3000);
    } catch (err) {
      setError("Không thể khôi phục từ bản sao lưu");
      console.error(err);
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa bản sao lưu này? Hành động này không thể hoàn tác."
      )
    ) {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.delete(`/api/admin/backups/${backupId}`);

        setBackups(backups.filter((backup) => backup.id !== backupId));
        setSuccess("Đã xóa bản sao lưu thành công");
      } catch (err) {
        setError("Không thể xóa bản sao lưu");
        console.error(err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleDownloadBackup = (backupId) => {
    // Trong thực tế, đây sẽ là một API call để tải bản sao lưu
    // window.location.href = `/api/admin/backups/${backupId}/download`;
    alert("Chức năng tải sao lưu sẽ được triển khai khi kết nối API");
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

  if (loading && backups.length === 0) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Sao lưu và Khôi phục</h1>

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

      {/* Phần tạo sao lưu mới */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Tạo bản sao lưu mới</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-full md:w-auto flex-1">
              <label
                htmlFor="backupType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Loại sao lưu
              </label>
              <select
                id="backupType"
                name="backupType"
                value={backupOption}
                onChange={(e) => setBackupOption(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="full">
                  Sao lưu đầy đủ (Cơ sở dữ liệu + Tập tin)
                </option>
                <option value="database">Chỉ sao lưu cơ sở dữ liệu</option>
                <option value="files">Chỉ sao lưu tập tin</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {backupOption === "full"
                  ? "Sao lưu toàn bộ cơ sở dữ liệu và tập tin media."
                  : backupOption === "database"
                  ? "Chỉ sao lưu cơ sở dữ liệu, không bao gồm tập tin media."
                  : "Chỉ sao lưu tập tin media, không bao gồm cơ sở dữ liệu."}
              </p>
            </div>

            <div className="mt-4 md:mt-7">
              <button
                onClick={handleCreateBackup}
                disabled={creating}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Đang tạo sao lưu...
                  </span>
                ) : (
                  "Tạo sao lưu mới"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách bản sao lưu */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Danh sách bản sao lưu</h2>
        </div>

        <div className="p-6">
          {backups.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Chưa có bản sao lưu nào. Tạo bản sao lưu đầu tiên ngay bây giờ.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên bản sao lưu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kích thước
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tạo bởi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {backup.name}
                        </div>
                        {backup.notes && (
                          <div className="text-sm text-gray-500">
                            {backup.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {backup.type === "full"
                            ? "Đầy đủ"
                            : backup.type === "database"
                            ? "Cơ sở dữ liệu"
                            : "Tập tin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(backup.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.created_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadBackup(backup.id)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          title="Tải xuống bản sao lưu"
                        >
                          Tải xuống
                        </button>
                        <button
                          onClick={() => handleRestoreClick(backup.id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                          title="Khôi phục từ bản sao lưu này"
                        >
                          Khôi phục
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa bản sao lưu này"
                          disabled={deleting}
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

      {/* Cảnh báo khôi phục */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-400 text-yellow-800 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Lưu ý về khôi phục dữ liệu
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Khôi phục dữ liệu sẽ ghi đè lên dữ liệu hiện tại. Tất cả dữ liệu
                được tạo sau thời điểm sao lưu sẽ bị mất.
              </p>
              <p className="mt-1">
                Nên tạo một bản sao lưu hiện trạng trước khi thực hiện khôi
                phục.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Xác nhận khôi phục Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-red-600">
                Xác nhận khôi phục
              </h3>
            </div>

            <p className="mb-4 text-gray-700">
              Bạn có chắc chắn muốn khôi phục hệ thống từ bản sao lưu này? Hành
              động này sẽ ghi đè lên tất cả dữ liệu hiện tại!
            </p>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nhập mật khẩu admin để xác nhận
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                className={`w-full p-2 border ${
                  passwordError ? "border-red-500" : "border-gray-300"
                } rounded-md`}
                placeholder="Mật khẩu admin"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                disabled={restoring}
              >
                Hủy
              </button>
              <button
                onClick={handleRestoreBackup}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={restoring}
              >
                {restoring ? "Đang khôi phục..." : "Xác nhận khôi phục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestore;
