import axios from "axios";
import { API_URL } from "./constants";

// Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm token vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Có thể thêm logic đăng xuất hoặc refresh token ở đây
      console.error("Lỗi xác thực: ", error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
