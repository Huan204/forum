import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Tổng quan", icon: "📊" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "👥" },
    { path: "/admin/posts", label: "Quản lý bài viết", icon: "📝" },
    { path: "/admin/comments", label: "Quản lý bình luận", icon: "💬" },
    { path: "/admin/categories", label: "Quản lý danh mục", icon: "📂" },
    { path: "/admin/reports", label: "Quản lý báo cáo", icon: "🚩" },
    { path: "/admin/badges", label: "Quản lý huy hiệu", icon: "🏆" },
    { path: "/admin/roles", label: "Phân quyền", icon: "🔐" },
    { path: "/admin/system-logs", label: "Nhật ký hệ thống", icon: "📋" },
    { path: "/admin/resources", label: "Quản lý tài nguyên", icon: "📦" },
    { path: "/admin/seo", label: "Cài đặt SEO", icon: "🔍" },
    { path: "/admin/backup", label: "Sao lưu & Phục hồi", icon: "💾" },
    { path: "/admin/email", label: "Email & Thông báo", icon: "📧" },
    { path: "/admin/drafts", label: "Bản nháp & Lịch đăng", icon: "📅" },
    { path: "/admin/analytics", label: "Thống kê", icon: "📈" },
    { path: "/admin/settings", label: "Cài đặt", icon: "⚙️" },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gray-800 text-white transition-all duration-300 h-screen sticky top-0 overflow-y-auto`}
    >
      <div className="p-4 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
        {!collapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white p-1 rounded hover:bg-gray-700"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      <nav className="mt-4 pb-20">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 hover:bg-gray-700 ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
