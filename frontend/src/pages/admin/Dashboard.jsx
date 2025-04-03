import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const statsDemo = {
    userCount: 1024,
    postCount: 302,
    commentCount: 1598,
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Tổng quan</h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Người dùng</p>
              <p className="text-2xl font-semibold">{statsDemo.userCount}</p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Quản lý người dùng →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Bài viết</p>
              <p className="text-2xl font-semibold">{statsDemo.postCount}</p>
            </div>
          </div>
          <Link
            to="/admin/posts"
            className="mt-4 inline-block text-sm text-green-600 hover:underline"
          >
            Quản lý bài viết →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Bình luận</p>
              <p className="text-2xl font-semibold">{statsDemo.commentCount}</p>
            </div>
          </div>
          <Link
            to="/admin/comments"
            className="mt-4 inline-block text-sm text-yellow-600 hover:underline"
          >
            Quản lý bình luận →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
