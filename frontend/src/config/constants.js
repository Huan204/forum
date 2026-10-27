/**
 * Cấu hình môi trường
 */

// URL của API backend. Khi chạy qua Vite, request tương đối sẽ đi qua proxy
// và hoạt động đúng cả trong preview lẫn trên localhost.
const configuredApiOrigin = import.meta.env.VITE_API_ORIGIN?.replace(/\/$/, "");
export const API_URL = configuredApiOrigin || "";
export const API_BASE_URL = `${API_URL}/api`;

// URL của frontend
export const FRONTEND_URL = window.location.origin;

// Cấu hình JWT
export const JWT_EXPIRATION = "30d";
export const JWT_SECRET = "your_jwt_secret_key_here";

// Giới hạn tệp tin tải lên
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Các biến môi trường khác
export const APP_NAME = "Diễn đàn";

// Cấu hình phân trang
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Thời gian tự động làm mới token (millisecond)
export const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 phút
