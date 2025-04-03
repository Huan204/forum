import React, { useState, useEffect } from "react";

const SeoSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteTitle: "",
    siteDescription: "",
    defaultImage: "",
    googleAnalyticsId: "",
    facebookAppId: "",
  });

  const [pageSettings, setPageSettings] = useState([]);
  const [currentPage, setCurrentPage] = useState({
    id: "",
    path: "",
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
    noIndex: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/seo');
      // setGeneralSettings(response.data.general);
      // setPageSettings(response.data.pages);

      // Dữ liệu mẫu
      const mockGeneralSettings = {
        siteTitle: "Diễn đàn Công nghệ",
        siteDescription:
          "Diễn đàn thảo luận về công nghệ, lập trình và chia sẻ kiến thức IT",
        defaultImage: "/images/default-og-image.jpg",
        googleAnalyticsId: "UA-123456789-1",
        facebookAppId: "123456789012345",
      };

      const mockPageSettings = [
        {
          id: "1",
          path: "/",
          title: "Trang chủ | Diễn đàn Công nghệ",
          description:
            "Diễn đàn thảo luận lớn nhất dành cho cộng đồng công nghệ Việt Nam",
          keywords: "công nghệ, lập trình, forum, it, developer",
          ogImage: "/images/home-og.jpg",
          noIndex: false,
        },
        {
          id: "2",
          path: "/posts",
          title: "Danh sách bài viết | Diễn đàn Công nghệ",
          description: "Khám phá tất cả bài viết mới nhất từ cộng đồng",
          keywords: "bài viết, blog, chia sẻ kiến thức, mẹo hay",
          ogImage: "/images/posts-og.jpg",
          noIndex: false,
        },
        {
          id: "3",
          path: "/categories",
          title: "Danh mục | Diễn đàn Công nghệ",
          description: "Khám phá tất cả các danh mục bài viết trên diễn đàn",
          keywords: "danh mục, chủ đề, phân loại, chuyên mục",
          ogImage: "/images/categories-og.jpg",
          noIndex: false,
        },
        {
          id: "4",
          path: "/auth/login",
          title: "Đăng nhập | Diễn đàn Công nghệ",
          description: "Đăng nhập vào tài khoản diễn đàn của bạn",
          keywords: "đăng nhập, tài khoản, xác thực",
          ogImage: "/images/login-og.jpg",
          noIndex: true,
        },
        {
          id: "5",
          path: "/auth/register",
          title: "Đăng ký | Diễn đàn Công nghệ",
          description: "Tạo tài khoản mới trên diễn đàn công nghệ",
          keywords: "đăng ký, tài khoản mới, thành viên",
          ogImage: "/images/register-og.jpg",
          noIndex: true,
        },
        {
          id: "6",
          path: "/user/profile",
          title: "Hồ sơ cá nhân | Diễn đàn Công nghệ",
          description: "Quản lý hồ sơ cá nhân của bạn",
          keywords: "hồ sơ, profile, tài khoản, cá nhân",
          ogImage: "/images/profile-og.jpg",
          noIndex: true,
        },
        {
          id: "7",
          path: "/badges",
          title: "Huy hiệu | Diễn đàn Công nghệ",
          description: "Khám phá hệ thống huy hiệu và cách đạt được chúng",
          keywords: "huy hiệu, thành tựu, gamification, phần thưởng",
          ogImage: "/images/badges-og.jpg",
          noIndex: false,
        },
        {
          id: "8",
          path: "/leaderboard",
          title: "Bảng xếp hạng | Diễn đàn Công nghệ",
          description: "Xem bảng xếp hạng thành viên tích cực nhất",
          keywords: "bảng xếp hạng, thành viên nổi bật, đóng góp",
          ogImage: "/images/leaderboard-og.jpg",
          noIndex: false,
        },
      ];

      setGeneralSettings(mockGeneralSettings);
      setPageSettings(mockPageSettings);
    } catch (err) {
      setError("Không thể tải cài đặt SEO");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPage((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveGeneralSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.put('/api/admin/seo/general', generalSettings);
      setSuccessMessage("Cài đặt SEO chung đã được lưu thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Không thể lưu cài đặt SEO chung");
      console.error(err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPage = (page) => {
    setCurrentPage({ ...page });
    setEditMode(true);
    setShowPageModal(true);
  };

  const handleAddNewPage = () => {
    setCurrentPage({
      id: "",
      path: "",
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      noIndex: false,
    });
    setEditMode(false);
    setShowPageModal(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editMode) {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.put(`/api/admin/seo/pages/${currentPage.id}`, currentPage);

        // Cập nhật danh sách
        setPageSettings(
          pageSettings.map((page) =>
            page.id === currentPage.id ? currentPage : page
          )
        );
      } else {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // const response = await axios.post('/api/admin/seo/pages', currentPage);
        // const newPage = response.data;

        // Tạo ID mới cho trang mới
        const newPage = {
          ...currentPage,
          id: Date.now().toString(),
        };

        // Thêm vào danh sách
        setPageSettings([...pageSettings, newPage]);
      }

      setSuccessMessage(
        `Cài đặt SEO cho trang ${
          editMode ? currentPage.path : "mới"
        } đã được lưu!`
      );
      setShowPageModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Không thể lưu cài đặt SEO cho trang`);
      console.error(err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa cài đặt SEO cho trang này?")
    ) {
      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.delete(`/api/admin/seo/pages/${pageId}`);

        // Cập nhật danh sách
        setPageSettings(pageSettings.filter((page) => page.id !== pageId));
        setSuccessMessage("Đã xóa cài đặt SEO thành công!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError("Không thể xóa cài đặt SEO");
        console.error(err);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredPages = pageSettings.filter(
    (page) =>
      page.path.toLowerCase().includes(searchTerm) ||
      page.title.toLowerCase().includes(searchTerm)
  );

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Cài đặt SEO</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Cài đặt SEO chung */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Cài đặt SEO chung</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveGeneralSettings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="siteTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tiêu đề trang web
                </label>
                <input
                  type="text"
                  id="siteTitle"
                  name="siteTitle"
                  value={generalSettings.siteTitle}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="defaultImage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ảnh mặc định cho Open Graph
                </label>
                <input
                  type="text"
                  id="defaultImage"
                  name="defaultImage"
                  value={generalSettings.defaultImage}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="siteDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mô tả trang web
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="googleAnalyticsId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID Google Analytics
                </label>
                <input
                  type="text"
                  id="googleAnalyticsId"
                  name="googleAnalyticsId"
                  value={generalSettings.googleAnalyticsId}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="facebookAppId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID Ứng dụng Facebook
                </label>
                <input
                  type="text"
                  id="facebookAppId"
                  name="facebookAppId"
                  value={generalSettings.facebookAppId}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cài đặt SEO cho từng trang */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Cài đặt SEO cho từng trang</h2>
          <button
            onClick={handleAddNewPage}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Thêm trang mới
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm trang..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đường dẫn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No Index
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không tìm thấy trang nào
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr key={page.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.path}
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-xs" title={page.title}>
                          {page.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="truncate max-w-xs"
                          title={page.description}
                        >
                          {page.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.noIndex ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Có
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Không
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
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
      </div>

      {/* Page Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? "Chỉnh sửa" : "Thêm"} cài đặt SEO cho trang
              </h2>
              <button
                onClick={() => setShowPageModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={saving}
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

            <form onSubmit={handleSavePage} className="space-y-4">
              <div>
                <label
                  htmlFor="path"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Đường dẫn (URL)
                </label>
                <input
                  type="text"
                  id="path"
                  name="path"
                  value={currentPage.path}
                  onChange={handlePageInputChange}
                  placeholder="/duong-dan"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tiêu đề (Title)
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentPage.title}
                  onChange={handlePageInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Đề xuất: Tối đa 60 ký tự
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mô tả (Meta Description)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentPage.description}
                  onChange={handlePageInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">
                  Đề xuất: Tối đa 160 ký tự
                </p>
              </div>

              <div>
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Từ khóa (Meta Keywords)
                </label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={currentPage.keywords}
                  onChange={handlePageInputChange}
                  placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="ogImage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ảnh Open Graph
                </label>
                <input
                  type="text"
                  id="ogImage"
                  name="ogImage"
                  value={currentPage.ogImage}
                  onChange={handlePageInputChange}
                  placeholder="/images/og-image.jpg"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noIndex"
                  name="noIndex"
                  checked={currentPage.noIndex}
                  onChange={handlePageInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="noIndex"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Không cho phép Google lập chỉ mục trang này (noindex)
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoSettings;
