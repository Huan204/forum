import { api } from "./api";
import { API_URL } from "../config/constants";

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Thông tin người dùng
 * @param {string} userData.username - Tên người dùng
 * @param {string} userData.email - Email người dùng
 * @param {string} userData.password - Mật khẩu
 * @returns {Promise<Object>} Kết quả đăng ký
 */
export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Đăng ký thất bại",
    };
  }
};

/**
 * Đăng nhập người dùng
 * @param {Object} credentials - Thông tin đăng nhập
 * @param {string} credentials.email - Email người dùng
 * @param {string} credentials.password - Mật khẩu
 * @returns {Promise<Object>} Kết quả đăng nhập, bao gồm token và thông tin người dùng
 */
export const login = async (credentials) => {
  try {
    // Thêm timeout dài hơn cho yêu cầu đăng nhập
    const response = await api.post("/auth/login", credentials, {
      timeout: 15000, // Tăng timeout lên 15 giây
    });

    // Lưu token vào localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return {
      success: true,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      // Lỗi từ server (có response)
      return {
        success: false,
        error:
          error.response.data.error || "Thông tin đăng nhập không chính xác",
      };
    } else if (error.request) {
      // Lỗi không có response (network error)
      return {
        success: false,
        error:
          "Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy và cổng kết nối chính xác.",
      };
    } else {
      // Lỗi khác
      return {
        success: false,
        error: error.message || "Đăng nhập thất bại",
      };
    }
  }
};

/**
 * Đăng nhập với quyền admin
 * @param {Object} credentials - Thông tin đăng nhập admin
 * @param {string} credentials.email - Email admin
 * @param {string} credentials.password - Mật khẩu
 * @returns {Promise<Object>} Kết quả đăng nhập admin
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post("/auth/admin/login", credentials);

    // Lưu token vào localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return {
      success: true,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    console.error("Lỗi đăng nhập admin:", error);

    if (error.response) {
      return {
        success: false,
        error:
          error.response.data.error ||
          "Thông tin đăng nhập admin không chính xác",
      };
    } else {
      return {
        success: false,
        error: "Không thể kết nối đến server",
      };
    }
  }
};

/**
 * Đăng xuất người dùng
 * @returns {Promise<Object>} Kết quả đăng xuất
 */
export const logout = async () => {
  try {
    await api.get("/auth/logout");
    // Xóa token và thông tin người dùng
    localStorage.removeItem("token");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    // Vẫn xóa token ở phía client
    localStorage.removeItem("token");
    return {
      success: false,
      error: error.message || "Đăng xuất thất bại",
    };
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise<Object>} Thông tin người dùng
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);

    if (error.response && error.response.status === 401) {
      return {
        success: false,
        invalidToken: true,
        error: "Token không hợp lệ hoặc đã hết hạn",
      };
    } else if (error.request) {
      return {
        success: false,
        networkError: true,
        error: "Không thể kết nối đến server",
      };
    } else {
      return {
        success: false,
        error: error.message || "Không thể lấy thông tin người dùng",
      };
    }
  }
};

/**
 * Kiểm tra trạng thái xác thực
 * @returns {Promise<Object>} Trạng thái xác thực
 */
export const checkAuthStatus = async () => {
  try {
    const response = await api.get("/auth/status");
    return {
      isAuthenticated: response.data.isAuthenticated,
      user: response.data.user,
    };
  } catch (error) {
    console.error("Lỗi kiểm tra xác thực:", error);
    return {
      isAuthenticated: false,
      error: error.message || "Kiểm tra xác thực thất bại",
    };
  }
};

/**
 * Cập nhật thông tin người dùng
 * @param {Object} profileData - Thông tin cần cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/auth/profile", profileData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cập nhật thông tin thất bại",
    };
  }
};

/**
 * Cập nhật mật khẩu người dùng
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 * @returns {Promise<Object>} Kết quả cập nhật mật khẩu
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put("/auth/password", {
      currentPassword,
      newPassword,
    });
    return {
      success: true,
      message: response.data.message || "Cập nhật mật khẩu thành công",
    };
  } catch (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cập nhật mật khẩu thất bại",
    };
  }
};

/**
 * Lấy thông tin người dùng theo ID
 * @param {string} userId - ID của người dùng cần tìm
 * @returns {Promise<Object>} Thông tin của người dùng
 */
export const getUserById = async (userId) => {
  try {
    if (!userId || userId === ":id") {
      return {
        success: false,
        message: "ID người dùng không hợp lệ",
      };
    }

    const response = await api.get(`/users/${userId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, error);

    if (error.response && error.response.status === 404) {
      return {
        success: false,
        message: "Không tìm thấy người dùng với ID đã cung cấp",
      };
    } else if (error.response && error.response.status === 401) {
      return {
        success: false,
        message: "Không có quyền truy cập thông tin người dùng này",
      };
    } else {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Không thể lấy thông tin người dùng",
      };
    }
  }
};

/**
 * Debug helper để kiểm tra trạng thái xác thực
 * @returns {Object} Thông tin cấu hình xác thực
 */
export const debugAuth = () => {
  const token = localStorage.getItem("token");
  console.log("==== Debug Auth Info ====");
  console.log("Token exists:", !!token);

  return {
    hasToken: !!token,
    apiUrl: API_URL,
  };
};
