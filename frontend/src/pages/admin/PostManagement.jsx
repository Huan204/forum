import React from "react";

const PostManagement = () => {
  const postsDemo = [
    {
      id: 1,
      title: "Bài viết 1",
      author: "admin",
      category: "Công nghệ",
      status: "Đã xuất bản",
      date: "01/03/2024",
    },
    {
      id: 2,
      title: "Bài viết 2",
      author: "user1",
      category: "Đời sống",
      status: "Đã xuất bản",
      date: "05/03/2024",
    },
    {
      id: 3,
      title: "Bài viết 3",
      author: "user2",
      category: "Giáo dục",
      status: "Chờ duyệt",
      date: "10/03/2024",
    },
    {
      id: 4,
      title: "Bài viết 4",
      author: "moderator",
      category: "Công nghệ",
      status: "Đã xuất bản",
      date: "15/03/2024",
    },
    {
      id: 5,
      title: "Bài viết 5",
      author: "user3",
      category: "Thể thao",
      status: "Nháp",
      date: "20/03/2024",
    },
  ];

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý bài viết</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tác giả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đăng
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {postsDemo.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">{post.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{post.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === "Đã xuất bản"
                        ? "bg-green-100 text-green-800"
                        : post.status === "Chờ duyệt"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{post.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostManagement;
