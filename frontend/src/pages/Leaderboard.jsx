import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("month"); // week, month, allTime
  const [category, setCategory] = useState("points"); // points, posts, comments, likes

  useEffect(() => {
    fetchLeaderboard();
  }, [period, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get(`/api/leaderboard?period=${period}&category=${category}`);
      // setUsers(response.data);

      // Dữ liệu mẫu
      setTimeout(() => {
        const mockUsers = generateMockData();
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Không thể tải bảng xếp hạng");
      console.error(err);
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockUsers = [
      {
        id: "1",
        name: "Nguyễn Văn A",
        avatar: null,
        points: 2850,
        posts: 48,
        comments: 156,
        likes: 437,
        rank: 1,
        badges: ["gold", "silver", "bronze"],
      },
      {
        id: "2",
        name: "Trần Thị B",
        avatar: null,
        points: 2740,
        posts: 52,
        comments: 127,
        likes: 385,
        rank: 2,
        badges: ["silver", "bronze"],
      },
      {
        id: "3",
        name: "Lê Văn C",
        avatar: null,
        points: 2580,
        posts: 45,
        comments: 132,
        likes: 362,
        rank: 3,
        badges: ["bronze"],
      },
      {
        id: "4",
        name: "Phạm Thị D",
        avatar: null,
        points: 2490,
        posts: 39,
        comments: 148,
        likes: 341,
        rank: 4,
        badges: ["bronze"],
      },
      {
        id: "5",
        name: "Hoàng Văn E",
        avatar: null,
        points: 2350,
        posts: 43,
        comments: 118,
        likes: 328,
        rank: 5,
        badges: [],
      },
      {
        id: "6",
        name: "Vũ Thị F",
        avatar: null,
        points: 2280,
        posts: 36,
        comments: 132,
        likes: 315,
        rank: 6,
        badges: ["bronze"],
      },
      {
        id: "7",
        name: "Đặng Văn G",
        avatar: null,
        points: 2150,
        posts: 31,
        comments: 125,
        likes: 302,
        rank: 7,
        badges: [],
      },
      {
        id: "8",
        name: "Bùi Thị H",
        avatar: null,
        points: 2090,
        posts: 30,
        comments: 118,
        likes: 287,
        rank: 8,
        badges: [],
      },
      {
        id: "9",
        name: "Đỗ Văn I",
        avatar: null,
        points: 1980,
        posts: 28,
        comments: 110,
        likes: 265,
        rank: 9,
        badges: [],
      },
      {
        id: "10",
        name: "Ngô Thị K",
        avatar: null,
        points: 1870,
        posts: 25,
        comments: 105,
        likes: 246,
        rank: 10,
        badges: [],
      },
    ];

    // Sắp xếp theo category
    return mockUsers
      .sort((a, b) => b[category] - a[category])
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const renderBadges = (badges) => {
    return (
      <div className="flex space-x-1">
        {badges.includes("gold") && (
          <span
            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-400"
            title="Huy chương vàng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
        {badges.includes("silver") && (
          <span
            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-300"
            title="Huy chương bạc"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
        {badges.includes("bronze") && (
          <span
            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-700"
            title="Huy chương đồng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bảng xếp hạng</h1>
          <p className="text-gray-600">
            Các thành viên tích cực nhất trên diễn đàn
          </p>
        </div>
        <Link to="/badges" className="mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md">
            Xem hệ thống huy hiệu
          </button>
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Khoảng thời gian
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="allTime">Tất cả thời gian</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Xếp hạng theo
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="points">Điểm hoạt động</option>
              <option value="posts">Bài viết</option>
              <option value="comments">Bình luận</option>
              <option value="likes">Lượt thích</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng xếp hạng */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Xếp hạng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thành viên
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {category === "points"
                      ? "Điểm"
                      : category === "posts"
                      ? "Bài viết"
                      : category === "comments"
                      ? "Bình luận"
                      : "Lượt thích"}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Huy hiệu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={user.rank <= 3 ? "bg-primary-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.rank <= 3 ? (
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-full ${
                            user.rank === 1
                              ? "bg-yellow-400"
                              : user.rank === 2
                              ? "bg-gray-300"
                              : "bg-yellow-700"
                          } text-white font-bold`}
                        >
                          {user.rank}
                        </div>
                      ) : (
                        <div className="text-center font-medium text-gray-500">
                          {user.rank}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/profile/${user.id}`}
                              className="hover:text-primary-600"
                            >
                              {user.name}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`text-sm font-semibold ${
                          user.rank <= 3 ? "text-primary-600" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(user[category])}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        {renderBadges(user.badges)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Giải thích */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Cách tính điểm</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Điểm hoạt động được tính dựa trên mức độ đóng góp của thành viên vào
            cộng đồng:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Đăng bài viết mới: +10 điểm</li>
            <li>Bình luận: +2 điểm</li>
            <li>Nhận lượt thích: +1 điểm</li>
            <li>Được đánh dấu là câu trả lời hay nhất: +15 điểm</li>
            <li>Báo cáo vi phạm được xác nhận: +5 điểm</li>
          </ul>
          <p className="mt-4">
            Người dùng đứng thứ hạng cao sẽ nhận được các huy hiệu đặc biệt và
            quyền lợi khác trong cộng đồng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
