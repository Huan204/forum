import axios from "axios";
import { API_BASE_URL } from "../config/constants";

/**
 * Cấu hình Axios instance cho toàn bộ API calls
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Kiểm tra kết nối đến server
 * @returns {Promise<boolean>} True nếu kết nối thành công, False nếu thất bại
 */
export const checkServerConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health-check`, {
      timeout: 5000,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("[CONNECTION] Không thể kết nối đến server:", error.message);
    return false;
  }
};

// Interceptor thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Lỗi request:", error);
    return Promise.reject(error);
  }
);

// Xử lý response và các lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý các loại lỗi phổ biến
    if (error.response) {
      // Máy chủ trả về response với status code nằm ngoài phạm vi 2xx
      console.error(
        `Lỗi response (${error.response.status}):`,
        error.response.data
      );

      // Xử lý 401 Unauthorized - token không hợp lệ
      if (error.response.status === 401) {
        console.warn("Token không hợp lệ hoặc đã hết hạn");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error("Lỗi kết nối, không nhận được phản hồi từ server");
    } else {
      // Lỗi trong quá trình thiết lập request
      console.error("Lỗi thiết lập request:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
