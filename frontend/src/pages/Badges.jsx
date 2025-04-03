import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/badges');
      // setBadges(response.data.badges);
      // if (user) {
      //   const userResponse = await axios.get(`/api/users/${user.id}/badges`);
      //   setUserBadges(userResponse.data.badges);
      // }

      // Dữ liệu mẫu
      setTimeout(() => {
        const mockBadges = generateMockBadges();
        setBadges(mockBadges);

        if (user) {
          // Giả lập người dùng đã có một số huy hiệu
          const mockUserBadges = [
            "first-post",
            "commentator",
            "liked",
            "active-month",
          ];
          setUserBadges(mockUserBadges);
        }

        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Không thể tải dữ liệu huy hiệu");
      console.error(err);
      setLoading(false);
    }
  };

  const generateMockBadges = () => {
    return [
      {
        id: "first-post",
        name: "Tác giả mới",
        description: "Đăng bài viết đầu tiên",
        category: "posts",
        level: "bronze",
        icon: "📝",
        criteria: "Đăng ít nhất 1 bài viết",
      },
      {
        id: "prolific-author",
        name: "Tác giả chăm chỉ",
        description: "Đăng nhiều bài viết chất lượng",
        category: "posts",
        level: "silver",
        icon: "✍️",
        criteria: "Đăng ít nhất 25 bài viết",
      },
      {
        id: "master-author",
        name: "Tác giả bậc thầy",
        description: "Đăng rất nhiều bài viết có giá trị",
        category: "posts",
        level: "gold",
        icon: "🏆",
        criteria: "Đăng ít nhất 100 bài viết có ít nhất 10 lượt thích mỗi bài",
      },
      {
        id: "commentator",
        name: "Người góp ý",
        description: "Để lại bình luận trên diễn đàn",
        category: "comments",
        level: "bronze",
        icon: "💬",
        criteria: "Bình luận ít nhất 10 lần",
      },
      {
        id: "discussion-starter",
        name: "Người khởi tạo thảo luận",
        description: "Tạo nhiều cuộc thảo luận có giá trị",
        category: "comments",
        level: "silver",
        icon: "🗣️",
        criteria:
          "Có ít nhất 50 bình luận và mỗi bài viết của bạn có ít nhất 5 bình luận từ người khác",
      },
      {
        id: "liked",
        name: "Được yêu thích",
        description: "Nội dung của bạn được đánh giá cao",
        category: "likes",
        level: "bronze",
        icon: "👍",
        criteria: "Nhận được ít nhất 10 lượt thích",
      },
      {
        id: "popular",
        name: "Phổ biến",
        description: "Nội dung của bạn được nhiều người yêu thích",
        category: "likes",
        level: "silver",
        icon: "❤️",
        criteria: "Nhận được ít nhất 100 lượt thích",
      },
      {
        id: "viral",
        name: "Lan tỏa",
        description: "Bài viết của bạn tạo ra sự lan tỏa rộng rãi",
        category: "likes",
        level: "gold",
        icon: "⭐",
        criteria: "Có một bài viết nhận được ít nhất 500 lượt thích",
      },
      {
        id: "active-week",
        name: "Hoạt động tuần",
        description: "Tích cực tham gia trong một tuần",
        category: "activity",
        level: "bronze",
        icon: "📅",
        criteria: "Đăng nhập và tương tác ít nhất 5 ngày trong một tuần",
      },
      {
        id: "active-month",
        name: "Hoạt động tháng",
        description: "Tích cực tham gia trong một tháng",
        category: "activity",
        level: "silver",
        icon: "📆",
        criteria: "Đăng nhập và tương tác ít nhất 20 ngày trong một tháng",
      },
      {
        id: "active-year",
        name: "Hoạt động năm",
        description: "Tích cực tham gia trong một năm",
        category: "activity",
        level: "gold",
        icon: "🗓️",
        criteria: "Hoạt động liên tục trong ít nhất 10 tháng của một năm",
      },
      {
        id: "helper",
        name: "Người giúp đỡ",
        description: "Giúp đỡ các thành viên khác",
        category: "community",
        level: "silver",
        icon: "🤝",
        criteria: 'Được người khác đánh dấu là "Hữu ích" ít nhất 25 lần',
      },
      {
        id: "mentor",
        name: "Người hướng dẫn",
        description: "Hướng dẫn và giúp đỡ nhiều người mới",
        category: "community",
        level: "gold",
        icon: "👨‍🏫",
        criteria:
          'Được người khác đánh dấu là "Hữu ích" ít nhất 100 lần và hoạt động ít nhất 6 tháng',
      },
    ];
  };

  const getLevelClass = (level) => {
    switch (level) {
      case "gold":
        return "bg-yellow-500 text-white";
      case "silver":
        return "bg-gray-300 text-gray-800";
      case "bronze":
        return "bg-yellow-700 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const filterBadges = () => {
    if (activeCategory === "all") {
      return badges;
    }
    return badges.filter((badge) => badge.category === activeCategory);
  };

  const hasUserEarned = (badgeId) => {
    return userBadges.includes(badgeId);
  };

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "posts", name: "Bài viết" },
    { id: "comments", name: "Bình luận" },
    { id: "likes", name: "Lượt thích" },
    { id: "activity", name: "Hoạt động" },
    { id: "community", name: "Cộng đồng" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Hệ thống huy hiệu</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Huy hiệu là phần thưởng cho hoạt động và đóng góp của bạn vào cộng
          đồng. Kiếm huy hiệu để thể hiện thành tích và nâng cao uy tín của bạn!
        </p>
      </div>

      {user && userBadges.length > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Huy hiệu của bạn ({userBadges.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges
              .filter((badge) => userBadges.includes(badge.id))
              .map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-primary-100"
                >
                  <div
                    className={`flex items-center justify-center h-16 w-16 rounded-full mb-2 ${getLevelClass(
                      badge.level
                    )}`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <h3 className="font-medium text-center">{badge.name}</h3>
                  <span className="text-xs text-gray-500 mt-1 capitalize">
                    {badge.level}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bộ lọc danh mục */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === category.id
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Danh sách huy hiệu */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterBadges().map((badge) => (
            <div
              key={badge.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                hasUserEarned(badge.id)
                  ? "border-green-500"
                  : badge.level === "gold"
                  ? "border-yellow-500"
                  : badge.level === "silver"
                  ? "border-gray-400"
                  : "border-yellow-700"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-full mr-4 ${getLevelClass(
                    badge.level
                  )}`}
                >
                  <span className="text-xl">{badge.icon}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">{badge.name}</h3>
                    {hasUserEarned(badge.id) && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Đã đạt được
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Yêu cầu
                </h4>
                <p className="text-sm text-gray-700">{badge.criteria}</p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    badge.level === "gold"
                      ? "bg-yellow-100 text-yellow-800"
                      : badge.level === "silver"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {badge.level === "gold"
                    ? "Vàng"
                    : badge.level === "silver"
                    ? "Bạc"
                    : "Đồng"}
                </span>

                <span className="text-xs text-gray-500 capitalize">
                  {categories.find((c) => c.id === badge.category)?.name ||
                    badge.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thông tin thêm */}
      <div className="mt-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-4">Về hệ thống huy hiệu</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Cách thức hoạt động</h3>
            <p className="text-gray-600">
              Huy hiệu được trao tự động dựa trên hoạt động và đóng góp của bạn
              trên diễn đàn. Mỗi khi đạt được một thành tựu nhất định, bạn sẽ
              nhận được huy hiệu tương ứng.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Phân loại huy hiệu</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="h-5 w-5 rounded-full bg-yellow-500 mr-2"></div>
                  <h4 className="font-semibold">Huy hiệu Vàng</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Huy hiệu cao nhất, yêu cầu sự nỗ lực và đóng góp đáng kể để
                  đạt được.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="h-5 w-5 rounded-full bg-gray-300 mr-2"></div>
                  <h4 className="font-semibold">Huy hiệu Bạc</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Huy hiệu trung cấp, đòi hỏi hoạt động thường xuyên và đóng góp
                  có chất lượng.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="h-5 w-5 rounded-full bg-yellow-700 mr-2"></div>
                  <h4 className="font-semibold">Huy hiệu Đồng</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Huy hiệu cơ bản, dễ đạt được nhất, thường dành cho người mới
                  bắt đầu.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Lợi ích của huy hiệu</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Thể hiện thành tích và đóng góp của bạn cho cộng đồng</li>
              <li>Nâng cao uy tín và thứ hạng của bạn trên diễn đàn</li>
              <li>
                Mở khóa các tính năng đặc biệt khi đạt được một số huy hiệu nhất
                định
              </li>
              <li>
                Tăng khả năng hiển thị bài viết của bạn trong kết quả tìm kiếm
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Liên kết đến bảng xếp hạng */}
      <div className="mt-8 text-center">
        <Link
          to="/leaderboard"
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Xem bảng xếp hạng
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Badges;
