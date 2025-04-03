import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Components
import NavMenu from "./components/NavMenu";
import Footer from "./components/Footer";
import AdminLayout from "./components/admin/AdminLayout";
import Layout from "./components/Layout";
import ConnectionStatus from "./components/ConnectionStatus";
// Import AuthProvider
import { AuthProvider } from "./context/AuthContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

// Pages
import Home from "./pages/Home";
import PostList from "./pages/PostList";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Badges from "./pages/Badges";
import MessagesPage from "./pages/MessagesPage";

import Categories from "./pages/Categories";
import Search from "./pages/Search";
import EditPost from "./pages/EditPost";
import UserPosts from "./pages/UserPosts";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import PostManagement from "./pages/admin/PostManagement";
import CommentManagement from "./pages/admin/CommentManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import Announcements from "./pages/admin/Announcements";
import Analytics from "./pages/admin/Analytics";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSettings from "./pages/admin/Settings";

// Thêm các trang admin mới
import ReportManagement from "./pages/admin/ReportManagement";
import BadgeManagement from "./pages/admin/BadgeManagement";
import RoleManagement from "./pages/admin/RoleManagement";
import SystemLogs from "./pages/admin/SystemLogs";
import ResourceManagement from "./pages/admin/ResourceManagement";
import SeoSettings from "./pages/admin/SeoSettings";
import BackupRestore from "./pages/admin/BackupRestore";
import EmailNotifications from "./pages/admin/EmailNotifications";
import DraftSchedule from "./pages/admin/DraftSchedule";
import ChatRoom from "./pages/ChatRoom";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Thêm useEffect để khởi tạo dark mode từ localStorage khi ứng dụng bắt đầu
  useEffect(() => {
    // Kiểm tra giá trị dark mode từ localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";

    // Nếu người dùng đã bật dark mode trước đó
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <NavMenu />}

      <main className={`flex-grow ${!isAdminRoute ? "pt-20" : ""}`}>
        <ConnectionStatus />

        {!isAdminRoute ? (
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Client Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/posts" element={<PostList />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profileusers/:id" element={<Profile />} />
              <Route path="/posts/create" element={<CreatePost />} />
              <Route path="/posts/:id/edit" element={<EditPost />} />
              <Route path="/search" element={<Search />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:category" element={<Categories />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/posts/edit/:id" element={<EditPost />} />
              <Route path="/my-posts" element={<UserPosts />} />
              <Route path="/chatroom" element={<ChatRoom />} />
              <Route path="/messages" element={<MessagesPage />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="posts" element={<PostManagement />} />
                    <Route path="comments" element={<CommentManagement />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="leaderboard" element={<Leaderboard />} />

                    {/* Thêm Routes mới */}
                    <Route path="reports" element={<ReportManagement />} />
                    <Route path="badges" element={<BadgeManagement />} />
                    <Route path="roles" element={<RoleManagement />} />
                    <Route path="system-logs" element={<SystemLogs />} />
                    <Route path="resources" element={<ResourceManagement />} />
                    <Route path="seo" element={<SeoSettings />} />
                    <Route path="backup" element={<BackupRestore />} />
                    <Route path="email" element={<EmailNotifications />} />
                    <Route path="drafts" element={<DraftSchedule />} />
                  </Routes>
                </AdminLayout>
              }
            />
          </Routes>
        )}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
