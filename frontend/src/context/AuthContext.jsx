import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
  updateUserProfile,
  updateUserPassword,
  checkAuthStatus,
  logout as logoutApi,
} from "../services/authService";
import { checkServerConnection } from "../services/api";

// Tạo context để sử dụng trong toàn bộ ứng dụng
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  // Kiểm tra kết nối server
  const checkApiConnection = async () => {
    try {
      const isConnected = await checkServerConnection();
      setApiConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error("Lỗi kiểm tra kết nối:", error);
      setApiConnected(false);
      return false;
    }
  };

  // Kiểm tra kết nối khi khởi tạo
  useEffect(() => {
    checkApiConnection();
    // Thay đổi thời gian kiểm tra kết nối từ 30 giây lên 5 phút
    const intervalId = setInterval(checkApiConnection, 300000);
    return () => clearInterval(intervalId);
  }, []);

  // Load thông tin người dùng khi có token
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
          setIsAuthenticated(true);
        } else {
          // Xử lý token không hợp lệ
          if (result.invalidToken) {
            localStorage.removeItem("token");
            setToken(null);
          }
          setError(result.error || "Lỗi xác thực");
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        setError("Có lỗi xảy ra khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Đăng ký tài khoản mới
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerApi(userData);

      if (result.success && result.token) {
        setToken(result.token);
        setUser(result.user || null);
        setIsAuthenticated(true);
        setError(null);

        if (result.user) {
          localStorage.setItem("userId", result.user.id || result.user._id);
          localStorage.setItem("username", result.user.username || "");
          localStorage.setItem("role", result.user.role || "user");
        }

        return { success: true, token: result.token, user: result.user };
      }

      const registrationError = result.error || "Đăng ký thất bại";
      setUser(null);
      setIsAuthenticated(false);
      setError(registrationError);
      return { success: false, error: registrationError };
    } catch (err) {
      const registrationError = err.error || err.message || "Đăng ký thất bại";
      setError(registrationError);
      return { success: false, error: registrationError };
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    // Kiểm tra kết nối trước khi đăng nhập
    const connected = await checkApiConnection();
    if (!connected) {
      setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      setLoading(false);
      return false;
    }

    try {
      const result = await loginApi(credentials);

      if (result.success && result.token) {
        setToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);

        // Lưu thêm userId và role vào localStorage
        if (result.user) {
          localStorage.setItem("userId", result.user._id);
          localStorage.setItem("username", result.user.username);
          localStorage.setItem("role", result.user.role || "user");

          console.log("Đã lưu thông tin người dùng vào localStorage:", {
            userId: result.user._id,
            username: result.user.username,
            role: result.user.role || "user",
          });
        }

        return true;
      } else {
        setError(result.error || "Đăng nhập thất bại");
        return false;
      }
    } catch (err) {
      setError(err.error || err.message || "Đăng nhập thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    } finally {
      // Xóa token và thông tin người dùng
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("role");

      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Cập nhật thông tin người dùng
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateUserProfile(profileData);

      if (response.success) {
        // Cập nhật thông tin người dùng
        setUser((prev) => ({ ...prev, ...response.data }));
        return { success: true, data: response.data };
      } else {
        setError(response.error || "Cập nhật thông tin thất bại");
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.error || "Cập nhật thông tin thất bại");
      return { success: false, error: err.error };
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra trạng thái xác thực
  const checkAuth = async () => {
    if (!token) return false;

    try {
      const result = await checkAuthStatus();
      if (result.isAuthenticated) {
        setIsAuthenticated(true);
        if (result.user && !user) {
          setUser(result.user);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi kiểm tra xác thực:", error);
      return false;
    }
  };

  // Giá trị context được cung cấp cho toàn bộ ứng dụng
  const contextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    apiConnected,
    register,
    login,
    logout,
    updateProfile,
    checkAuth,
    setError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  return (
    context || {
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      apiConnected: false,
      login: async () => ({ success: false, error: "AuthProvider chưa sẵn sàng" }),
      register: async () => ({ success: false, error: "AuthProvider chưa sẵn sàng" }),
      logout: () => {},
    }
  );
};
