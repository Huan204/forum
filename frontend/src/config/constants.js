/**
 * Cấu hình môi trường
 */

// URL của API backend
export const API_URL = "http://localhost:5002";
export const API_BASE_URL = "http://localhost:5002/api";

// URL của frontend
export const FRONTEND_URL = "http://localhost:3001";

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
