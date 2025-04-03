import React from "react";

const UserManagement = () => {
  const usersDemo = [
    {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      role: "Admin",
      status: "Đang hoạt động",
    },
    {
      id: 2,
      username: "user1",
      email: "user1@example.com",
      role: "User",
      status: "Đang hoạt động",
    },
    {
      id: 3,
      username: "user2",
      email: "user2@example.com",
      role: "User",
      status: "Đang hoạt động",
    },
    {
      id: 4,
      username: "moderator",
      email: "mod@example.com",
      role: "Moderator",
      status: "Tạm khóa",
    },
    {
      id: 5,
      username: "user3",
      email: "user3@example.com",
      role: "User",
      status: "Đang hoạt động",
    },
  ];

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersDemo.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Đang hoạt động"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
