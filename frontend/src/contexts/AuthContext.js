import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login,
  register,
  logout,
  getCurrentUser,
  updateUserProfile,
  updateUserPassword,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await getCurrentUser();
        if (response.success) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error("Lỗi kiểm tra xác thực:", error);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (credentials) => {
    try {
      setError(null);
      const response = await login(credentials);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
    } catch (error) {
      setError(error.error || "Lỗi đăng nhập");
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      setError(null);
      const response = await register(userData);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
    } catch (error) {
      setError(error.error || "Lỗi đăng ký");
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setUser(null);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await updateUserProfile(userData);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
    } catch (error) {
      setError(error.error || "Lỗi cập nhật thông tin");
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await updateUserPassword(currentPassword, newPassword);
      if (response.success) {
        return response;
      }
    } catch (error) {
      setError(error.error || "Lỗi cập nhật mật khẩu");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};
