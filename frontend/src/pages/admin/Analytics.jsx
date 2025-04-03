import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
// Định nghĩa Button component
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-600 hover:bg-primary-700 text-white";
      case "outline":
        return "bg-white border border-gray-300 hover:border-primary-600 hover:text-primary-600 text-gray-700";
      default:
        return "bg-primary-600 hover:bg-primary-700 text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-5 py-2.5 text-lg";
      default:
        return "px-4 py-2";
    }
  };

  return (
    <button
      type={type}
      className={`rounded-md font-medium transition-colors ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Analytics = () => {
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalPosts: 0,
      totalComments: 0,
      activeUsers: 0,
    },
    traffic: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    popular: {
      posts: [],
      categories: [],
    },
    engagement: {
      commentsPerPost: 0,
      likesPerPost: 0,
      avgSessionDuration: 0,
    },
    devices: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("week"); // day, week, month, year
  const [chartView, setChartView] = useState("traffic"); // traffic, users, posts, comments

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get(`/api/admin/analytics?timeRange=${timeRange}`);
      // setStats(response.data);

      // Dữ liệu mẫu
      const mockData = {
        overview: {
          totalUsers: 2450,
          totalPosts: 8723,
          totalComments: 15420,
          activeUsers: 876,
        },
        traffic: {
          daily: [
            { date: "2023-07-01", pageViews: 1200, uniqueVisitors: 450 },
            { date: "2023-07-02", pageViews: 1300, uniqueVisitors: 480 },
            { date: "2023-07-03", pageViews: 1100, uniqueVisitors: 420 },
            { date: "2023-07-04", pageViews: 1400, uniqueVisitors: 520 },
            { date: "2023-07-05", pageViews: 1600, uniqueVisitors: 550 },
            { date: "2023-07-06", pageViews: 1500, uniqueVisitors: 530 },
            { date: "2023-07-07", pageViews: 1350, uniqueVisitors: 500 },
          ],
          weekly: [
            { date: "Tuần 1", pageViews: 7500, uniqueVisitors: 2800 },
            { date: "Tuần 2", pageViews: 8200, uniqueVisitors: 3100 },
            { date: "Tuần 3", pageViews: 7800, uniqueVisitors: 2900 },
            { date: "Tuần 4", pageViews: 8500, uniqueVisitors: 3200 },
          ],
          monthly: [
            { date: "Tháng 1", pageViews: 28000, uniqueVisitors: 12000 },
            { date: "Tháng 2", pageViews: 32000, uniqueVisitors: 13500 },
            { date: "Tháng 3", pageViews: 35000, uniqueVisitors: 14200 },
            { date: "Tháng 4", pageViews: 31000, uniqueVisitors: 13000 },
            { date: "Tháng 5", pageViews: 33000, uniqueVisitors: 13800 },
            { date: "Tháng 6", pageViews: 36000, uniqueVisitors: 15000 },
          ],
        },
        popular: {
          posts: [
            {
              id: "1",
              title: "Hướng dẫn sử dụng React Hooks",
              views: 3500,
              comments: 85,
              likes: 420,
            },
            {
              id: "2",
              title: "Tối ưu hóa hiệu suất cho ứng dụng Node.js",
              views: 2800,
              comments: 62,
              likes: 350,
            },
            {
              id: "3",
              title: "Thiết kế UI/UX hiệu quả với Figma",
              views: 2500,
              comments: 54,
              likes: 310,
            },
            {
              id: "4",
              title: "Tìm hiểu về Microservices Architecture",
              views: 2200,
              comments: 48,
              likes: 280,
            },
            {
              id: "5",
              title: "Bảo mật trong ứng dụng web hiện đại",
              views: 2100,
              comments: 45,
              likes: 270,
            },
          ],
          categories: [
            { name: "Công nghệ", count: 2500, percentage: 28 },
            { name: "Đời sống", count: 1800, percentage: 20 },
            { name: "Giáo dục", count: 1500, percentage: 16 },
            { name: "Thể thao", count: 1200, percentage: 13 },
            { name: "Giải trí", count: 1100, percentage: 12 },
            { name: "Khác", count: 1000, percentage: 11 },
          ],
        },
        engagement: {
          commentsPerPost: 5.3,
          likesPerPost: 12.7,
          avgSessionDuration: 480, // seconds
        },
        devices: {
          mobile: 58,
          desktop: 37,
          tablet: 5,
        },
      };

      setStats(mockData);
    } catch (err) {
      setError("Không thể tải dữ liệu phân tích");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${
      remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds
    }`;
  };

  const getChartData = () => {
    switch (timeRange) {
      case "day":
        return stats.traffic.daily;
      case "week":
        return stats.traffic.weekly;
      case "month":
      default:
        return stats.traffic.monthly;
    }
  };

  const renderBarChart = () => {
    const data = getChartData();
    const maxValue = Math.max(...data.map((item) => item.pageViews));

    return (
      <div className="mt-4">
        <div className="flex justify-between items-end mb-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              <div className="text-xs text-gray-500 mb-1">{item.date}</div>
              <div className="relative w-full flex flex-col items-center">
                <div
                  className="bg-primary-600 rounded-t-sm w-8"
                  style={{
                    height: `${(item.pageViews / maxValue) * 200}px`,
                    minHeight: "20px",
                  }}
                ></div>
                <div
                  className="bg-primary-300 rounded-t-sm w-8 absolute bottom-0 opacity-80"
                  style={{
                    height: `${(item.uniqueVisitors / maxValue) * 200}px`,
                    minHeight: "10px",
                  }}
                ></div>
              </div>
              <div className="text-xs font-medium mt-1">
                {formatNumber(item.pageViews)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-primary-600 rounded-sm mr-2"></div>
            <span className="text-xs text-gray-600">Lượt xem trang</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-primary-300 rounded-sm mr-2"></div>
            <span className="text-xs text-gray-600">Người dùng duy nhất</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDevicesPieChart = () => {
    const { mobile, desktop, tablet } = stats.devices;
    const total = mobile + desktop + tablet;

    return (
      <div className="flex flex-col items-center mt-6">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 36 36" className="h-40 w-40">
            {/* Mobile */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2"
              strokeDasharray={`${mobile}, 100`}
              strokeLinecap="round"
              transform="rotate(-90, 18, 18)"
            />
            {/* Desktop */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#818CF8"
              strokeWidth="2"
              strokeDasharray={`${desktop}, 100`}
              strokeLinecap="round"
              transform={`rotate(${mobile * 3.6 - 90}, 18, 18)`}
            />
            {/* Tablet */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#C7D2FE"
              strokeWidth="2"
              strokeDasharray={`${tablet}, 100`}
              strokeLinecap="round"
              transform={`rotate(${(mobile + desktop) * 3.6 - 90}, 18, 18)`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold">
              {formatNumber(total)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 w-full">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <div className="h-3 w-3 bg-primary-600 rounded-sm mr-2"></div>
              <span className="text-sm">Mobile</span>
            </div>
            <div className="text-lg font-semibold">{mobile}%</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <div className="h-3 w-3 bg-primary-400 rounded-sm mr-2"></div>
              <span className="text-sm">Desktop</span>
            </div>
            <div className="text-lg font-semibold">{desktop}%</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <div className="h-3 w-3 bg-primary-200 rounded-sm mr-2"></div>
              <span className="text-sm">Tablet</span>
            </div>
            <div className="text-lg font-semibold">{tablet}%</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Phân tích và thống kê</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Tổng người dùng</div>
              <div className="text-2xl font-semibold">
                {formatNumber(stats.overview.totalUsers)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Tổng bài viết</div>
              <div className="text-2xl font-semibold">
                {formatNumber(stats.overview.totalPosts)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Tổng bình luận</div>
              <div className="text-2xl font-semibold">
                {formatNumber(stats.overview.totalComments)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">
                Người dùng hoạt động
              </div>
              <div className="text-2xl font-semibold">
                {formatNumber(stats.overview.activeUsers)}
              </div>
            </div>
          </div>

          {/* Biểu đồ và bộ lọc */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Lưu lượng truy cập</h2>
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === "day" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("day")}
                >
                  Ngày
                </Button>
                <Button
                  variant={timeRange === "week" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("week")}
                >
                  Tuần
                </Button>
                <Button
                  variant={timeRange === "month" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("month")}
                >
                  Tháng
                </Button>
              </div>
            </div>

            {renderBarChart()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Thiết bị truy cập */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thiết bị truy cập</h2>
              {renderDevicesPieChart()}
            </div>

            {/* Chỉ số tương tác */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Chỉ số tương tác</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Bình luận / Bài viết
                    </span>
                    <span className="text-sm font-medium">
                      {stats.engagement.commentsPerPost}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          stats.engagement.commentsPerPost * 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Lượt thích / Bài viết
                    </span>
                    <span className="text-sm font-medium">
                      {stats.engagement.likesPerPost}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          stats.engagement.likesPerPost * 5,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Thời gian xem trung bình
                    </span>
                    <span className="text-sm font-medium">
                      {formatTime(stats.engagement.avgSessionDuration)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats.engagement.avgSessionDuration / 600) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bài viết phổ biến */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Bài viết phổ biến</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tiêu đề
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Lượt xem
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bình luận
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Lượt thích
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.popular.posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNumber(post.views)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNumber(post.comments)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNumber(post.likes)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân bố danh mục */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
              Phân bố theo danh mục
            </h2>
            <div className="space-y-4">
              {stats.popular.categories.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {category.percentage}% ({formatNumber(category.count)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
