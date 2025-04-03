import React, { createContext, useState, useEffect } from "react";
import { adminLogin as adminLoginApi } from "../services/authService";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    postCount: 0,
    commentCount: 0,
    recentUsers: [],
    recentPosts: [],
  });

  // Kiểm tra token admin
  useEffect(() => {
    const loadAdminUser = async () => {
      if (token) {
        setLoading(true);
        try {
          // Đặt thông tin admin từ localStorage nếu có
          const adminData = localStorage.getItem("adminData");
          if (adminData) {
            setAdmin(JSON.parse(adminData));
          }
        } catch (err) {
          console.error("Lỗi khi load admin user:", err);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          setToken(null);
          setAdmin(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAdminUser();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Kiểm tra dữ liệu đầu vào
      if (!credentials.email || !credentials.password) {
        throw new Error("Vui lòng cung cấp email và mật khẩu");
      }

      const response = await adminLoginApi(credentials);

      if (response.success) {
        localStorage.setItem("adminToken", response.token);
        localStorage.setItem("adminData", JSON.stringify(response.user));

        setToken(response.token);
        setAdmin(response.user);
        return true;
      } else {
        setError(response.error || "Đăng nhập quản trị thất bại");
        return false;
      }
    } catch (err) {
      console.error("Lỗi đăng nhập admin:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Thông tin đăng nhập không hợp lệ";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setToken(null);
    setAdmin(null);
    setError(null);
  };

  // Fetch admin stats
  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Gọi API lấy thống kê
      // const response = await axiosInstance.get("/api/admin/stats");
      // setStats(response.data);

      // Dữ liệu mẫu
      setStats({
        userCount: 100,
        postCount: 50,
        commentCount: 200,
        recentUsers: [
          { name: "User 1", email: "user1@example.com" },
          { name: "User 2", email: "user2@example.com" },
        ],
        recentPosts: [
          { title: "Post 1", author: "Author 1", date: "2024-01-01" },
          { title: "Post 2", author: "Author 2", date: "2024-01-02" },
        ],
      });
    } catch (err) {
      console.error("Lỗi khi lấy thống kê:", err);
      setError("Không thể lấy thông tin thống kê");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        loading,
        error,
        stats,
        login,
        logout,
        setError,
        fetchAdminStats,
        isAdminAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
