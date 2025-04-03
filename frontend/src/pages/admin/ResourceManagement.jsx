import React, { useState, useEffect } from "react";

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, images, documents, others
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, name, size, type
  const [sortDirection, setSortDirection] = useState("desc"); // asc, desc
  const [storageStats, setStorageStats] = useState({
    total: 0,
    used: 0,
    available: 0,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchStorageStats();
  }, [filter, sortBy, sortDirection]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/resources', {
      //   params: {
      //     filter,
      //     sort: sortBy,
      //     direction: sortDirection,
      //     search: searchTerm || undefined
      //   }
      // });
      // setResources(response.data);

      // Dữ liệu mẫu
      const mockResources = [
        {
          id: "1",
          name: "banner-homepage.jpg",
          url: "/uploads/images/banner-homepage.jpg",
          thumbnailUrl: "/uploads/thumbnails/banner-homepage.jpg",
          type: "image/jpeg",
          size: 1240000, // bytes
          dimensions: "1920x1080",
          uploadDate: "2023-06-10T08:30:00Z",
          uploadedBy: "admin",
          usedIn: ["home", "about"],
        },
        {
          id: "2",
          name: "profile-avatar.png",
          url: "/uploads/images/profile-avatar.png",
          thumbnailUrl: "/uploads/thumbnails/profile-avatar.png",
          type: "image/png",
          size: 450000,
          dimensions: "512x512",
          uploadDate: "2023-06-12T14:45:00Z",
          uploadedBy: "admin",
          usedIn: ["profiles"],
        },
        {
          id: "3",
          name: "quarterly-report-q2-2023.pdf",
          url: "/uploads/documents/quarterly-report-q2-2023.pdf",
          thumbnailUrl: "/uploads/thumbnails/pdf-icon.png",
          type: "application/pdf",
          size: 2500000,
          dimensions: null,
          uploadDate: "2023-07-01T10:00:00Z",
          uploadedBy: "admin",
          usedIn: ["reports"],
        },
        {
          id: "4",
          name: "user-guide.docx",
          url: "/uploads/documents/user-guide.docx",
          thumbnailUrl: "/uploads/thumbnails/docx-icon.png",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 1800000,
          dimensions: null,
          uploadDate: "2023-06-25T16:20:00Z",
          uploadedBy: "editor",
          usedIn: ["help", "documentation"],
        },
        {
          id: "5",
          name: "product-catalog.zip",
          url: "/uploads/archives/product-catalog.zip",
          thumbnailUrl: "/uploads/thumbnails/zip-icon.png",
          type: "application/zip",
          size: 5400000,
          dimensions: null,
          uploadDate: "2023-06-18T09:10:00Z",
          uploadedBy: "admin",
          usedIn: ["downloads"],
        },
        {
          id: "6",
          name: "background-pattern.svg",
          url: "/uploads/images/background-pattern.svg",
          thumbnailUrl: "/uploads/thumbnails/background-pattern.svg",
          type: "image/svg+xml",
          size: 25000,
          dimensions: "vector",
          uploadDate: "2023-07-05T11:30:00Z",
          uploadedBy: "designer",
          usedIn: ["all-pages"],
        },
        {
          id: "7",
          name: "intro-video.mp4",
          url: "/uploads/videos/intro-video.mp4",
          thumbnailUrl: "/uploads/thumbnails/video-thumbnail.jpg",
          type: "video/mp4",
          size: 18500000,
          dimensions: "1280x720",
          uploadDate: "2023-06-30T14:15:00Z",
          uploadedBy: "admin",
          usedIn: ["home"],
        },
        {
          id: "8",
          name: "icon-set.ai",
          url: "/uploads/design/icon-set.ai",
          thumbnailUrl: "/uploads/thumbnails/ai-icon.png",
          type: "application/illustrator",
          size: 4200000,
          dimensions: null,
          uploadDate: "2023-06-22T10:45:00Z",
          uploadedBy: "designer",
          usedIn: [],
        },
      ];

      // Áp dụng bộ lọc vào dữ liệu mẫu
      let filteredResources = [...mockResources];

      if (filter === "images") {
        filteredResources = filteredResources.filter((resource) =>
          resource.type.startsWith("image/")
        );
      } else if (filter === "documents") {
        filteredResources = filteredResources.filter(
          (resource) =>
            resource.type.includes("pdf") ||
            resource.type.includes("word") ||
            resource.type.includes("text") ||
            resource.type.includes("spreadsheet") ||
            resource.type.includes("presentation")
        );
      } else if (filter === "others") {
        filteredResources = filteredResources.filter(
          (resource) =>
            !resource.type.startsWith("image/") &&
            !resource.type.includes("pdf") &&
            !resource.type.includes("word") &&
            !resource.type.includes("text") &&
            !resource.type.includes("spreadsheet") &&
            !resource.type.includes("presentation")
        );
      }

      // Áp dụng tìm kiếm
      if (searchTerm) {
        filteredResources = filteredResources.filter((resource) =>
          resource.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sắp xếp
      filteredResources.sort((a, b) => {
        let comparison = 0;

        if (sortBy === "date") {
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
        } else if (sortBy === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === "size") {
          comparison = a.size - b.size;
        } else if (sortBy === "type") {
          comparison = a.type.localeCompare(b.type);
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });

      setResources(filteredResources);
    } catch (err) {
      setError("Không thể tải danh sách tài nguyên");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/resources/stats');
      // setStorageStats(response.data);

      // Dữ liệu mẫu
      setStorageStats({
        total: 10 * 1024 * 1024 * 1024, // 10GB
        used: 3.5 * 1024 * 1024 * 1024, // 3.5GB
        available: 6.5 * 1024 * 1024 * 1024, // 6.5GB
      });
    } catch (err) {
      console.error("Không thể tải thông tin lưu trữ:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài nguyên này?")) {
      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.delete(`/api/admin/resources/${resourceId}`);

        // Cập nhật danh sách tài nguyên
        setResources(
          resources.filter((resource) => resource.id !== resourceId)
        );

        // Cập nhật thống kê lưu trữ
        const deletedResource = resources.find(
          (resource) => resource.id === resourceId
        );
        if (deletedResource) {
          setStorageStats((prev) => ({
            ...prev,
            used: prev.used - deletedResource.size,
            available: prev.available + deletedResource.size,
          }));
        }
      } catch (err) {
        setError("Không thể xóa tài nguyên");
        console.error(err);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      alert("Vui lòng chọn file để tải lên");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Mô phỏng tải lên với tiến trình
      const totalTime = 3000; // 3 giây cho mô phỏng
      const interval = 100; // cập nhật mỗi 100ms
      const steps = totalTime / interval;
      let currentStep = 0;

      const progressInterval = setInterval(() => {
        currentStep++;
        setUploadProgress(
          Math.min(Math.floor((currentStep / steps) * 100), 99)
        );

        if (currentStep >= steps) {
          clearInterval(progressInterval);

          // Mô phỏng hoàn thành tải lên
          setTimeout(() => {
            setUploadProgress(100);

            // Thêm tài nguyên mới vào danh sách
            const newResource = {
              id: Date.now().toString(),
              name: uploadFile.name,
              url: `/uploads/${uploadFile.name}`,
              thumbnailUrl: `/uploads/thumbnails/${uploadFile.name}`,
              type: uploadFile.type,
              size: uploadFile.size,
              dimensions: uploadFile.type.startsWith("image/")
                ? "1024x768"
                : null,
              uploadDate: new Date().toISOString(),
              uploadedBy: "admin",
              usedIn: [],
            };

            setResources([newResource, ...resources]);

            // Cập nhật thống kê lưu trữ
            setStorageStats((prev) => ({
              ...prev,
              used: prev.used + uploadFile.size,
              available: prev.available - uploadFile.size,
            }));

            setIsUploading(false);
            setUploadFile(null);
            setShowUploadModal(false);

            // Fetch lại dữ liệu
            fetchResources();
            fetchStorageStats();
          }, 500);
        }
      }, interval);

      // API call sẽ được thêm sau khi tạo endpoint backend
      // const formData = new FormData();
      // formData.append('file', uploadFile);
      // await axios.post('/api/admin/resources/upload', formData, {
      //   onUploadProgress: (progressEvent) => {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     setUploadProgress(percentCompleted);
      //   }
      // });
    } catch (err) {
      setError("Không thể tải lên tài nguyên");
      console.error(err);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getFileTypeIcon = (type) => {
    if (type.startsWith("image/")) {
      return "🖼️";
    } else if (type.includes("pdf")) {
      return "📄";
    } else if (type.includes("word") || type.includes("text")) {
      return "📝";
    } else if (type.includes("spreadsheet") || type.includes("excel")) {
      return "📊";
    } else if (type.includes("presentation") || type.includes("powerpoint")) {
      return "📊";
    } else if (
      type.includes("zip") ||
      type.includes("archive") ||
      type.includes("compressed")
    ) {
      return "🗄️";
    } else if (type.includes("video")) {
      return "🎥";
    } else if (type.includes("audio")) {
      return "🔊";
    } else {
      return "📁";
    }
  };

  const getUsagePercentage = () => {
    if (storageStats.total === 0) return 0;
    return Math.round((storageStats.used / storageStats.total) * 100);
  };

  if (loading && !resources.length)
    return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý tài nguyên</h1>

      {/* Thống kê lưu trữ */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Tổng quan lưu trữ</h2>
        <div className="flex flex-col md:flex-row justify-between mb-2">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">Dung lượng đã sử dụng</p>
            <p className="text-xl font-medium">
              {formatFileSize(storageStats.used)} /{" "}
              {formatFileSize(storageStats.total)}
            </p>
          </div>
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">Dung lượng còn trống</p>
            <p className="text-xl font-medium">
              {formatFileSize(storageStats.available)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Số lượng tài nguyên</p>
            <p className="text-xl font-medium">{resources.length}</p>
          </div>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${getUsagePercentage()}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                getUsagePercentage() > 90
                  ? "bg-red-500"
                  : getUsagePercentage() > 70
                  ? "bg-yellow-500"
                  : "bg-primary-600"
              }`}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            Đã sử dụng {getUsagePercentage()}%
          </p>
        </div>
      </div>

      {/* Thanh công cụ */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Tải lên tài nguyên
          </button>
          <button
            onClick={() => fetchResources()}
            className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            title="Làm mới"
          >
            🔄
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tất cả tài nguyên</option>
            <option value="images">Hình ảnh</option>
            <option value="documents">Tài liệu</option>
            <option value="others">Khác</option>
          </select>

          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [newSortBy, newSortDirection] = e.target.value.split("-");
              setSortBy(newSortBy);
              setSortDirection(newSortDirection);
            }}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="date-desc">Mới nhất</option>
            <option value="date-asc">Cũ nhất</option>
            <option value="name-asc">Tên (A-Z)</option>
            <option value="name-desc">Tên (Z-A)</option>
            <option value="size-desc">Dung lượng (Lớn-nhỏ)</option>
            <option value="size-asc">Dung lượng (Nhỏ-lớn)</option>
            <option value="type-asc">Loại file</option>
          </select>

          <form onSubmit={handleSearch} className="flex gap-1">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* Danh sách tài nguyên */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.length === 0 ? (
          <div className="col-span-4 text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">Không có tài nguyên nào</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                {resource.type.startsWith("image/") ? (
                  <img
                    src={resource.thumbnailUrl}
                    alt={resource.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-5xl">
                    {getFileTypeIcon(resource.type)}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3
                  className="font-medium text-gray-900 truncate"
                  title={resource.name}
                >
                  {resource.name}
                </h3>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>Loại: {resource.type}</p>
                  <p>Kích thước: {formatFileSize(resource.size)}</p>
                  {resource.dimensions && (
                    <p>Kích thước: {resource.dimensions}</p>
                  )}
                  <p>Ngày tải lên: {formatDate(resource.uploadDate)}</p>
                  <p>Người tải lên: {resource.uploadedBy}</p>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Xem
                  </a>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tải lên tài nguyên</h2>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadProgress(0);
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
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

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Chọn file</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isUploading}
                />
              </div>

              {uploadFile && (
                <div className="mt-2">
                  <p className="text-sm font-medium">File đã chọn:</p>
                  <p className="text-sm">
                    {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                </div>
              )}

              {isUploading && (
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                          Đang tải lên
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary-600">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                      <div
                        style={{ width: `${uploadProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (!isUploading) {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadProgress(0);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  disabled={isUploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? "Đang tải lên..." : "Tải lên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
