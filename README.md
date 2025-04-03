# Forum Project

Một ứng dụng diễn đàn đơn giản được xây dựng với React, Node.js, và MongoDB.

## Tính năng

- Xác thực người dùng (đăng ký, đăng nhập)
- Quản lý bài viết (tạo, xem, sửa, xóa)
- Bình luận trên bài viết
- Thích/bỏ thích bài viết và bình luận
- Hồ sơ người dùng
- Phân trang và tìm kiếm

## Công nghệ sử dụng

### Frontend

- React (với Vite)
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Token)

## Cài đặt

### Yêu cầu

- Node.js
- npm hoặc yarn
- MongoDB

### Hướng dẫn

1. Clone repository

```
git clone https://github.com/username/forum-project.git
cd forum-project
```

2. Cài đặt dependencies

```
npm run install-all
```

3. Cấu hình môi trường

- Tạo file `.env` trong thư mục `backend`

```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/forum
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

4. Chạy ứng dụng

```
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Cấu trúc dự án

```
forum-project/
│── backend/                    # Thư mục backend (Node.js, Express, MongoDB)
│   │── controllers/            # Xử lý logic API
│   │── models/                 # Định nghĩa schema MongoDB
│   │── routes/                 # Định nghĩa API endpoints
│   │── middleware/             # Middleware (Xác thực, xử lý lỗi)
│   │── config/                 # Cấu hình backend
│   │── index.js                # Điểm khởi chạy backend
│
│── frontend/                   # Thư mục frontend (React + Vite + Tailwind CSS)
    │── src/
        │── components/         # Các thành phần UI
        │── pages/              # Các trang chính
        │── services/           # Quản lý API calls
        │── hooks/              # Custom hooks
        │── context/            # Context API (Quản lý trạng thái)
```

## API Endpoints

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `GET /api/posts` - Lấy danh sách bài viết
- `GET /api/posts/:id` - Lấy chi tiết bài viết
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/:id` - Cập nhật bài viết
- `DELETE /api/posts/:id` - Xóa bài viết
- `GET /api/comments/post/:postId` - Lấy bình luận của bài viết
- `POST /api/comments` - Thêm bình luận mới

## Giấy phép

MIT
