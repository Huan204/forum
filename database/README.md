# Cấu trúc Cơ sở dữ liệu MongoDB cho Dự án Diễn đàn

Dự án sử dụng MongoDB làm cơ sở dữ liệu chính, với các collection được thiết kế để hỗ trợ tất cả các chức năng của diễn đàn.

## Các Collection

### 1. Users

Lưu trữ thông tin người dùng, bao gồm:

- Thông tin đăng nhập (email, mật khẩu)
- Thông tin cá nhân (họ tên, avatar)
- Vai trò (user, moderator, admin)
- Cài đặt người dùng
- Danh hiệu và điểm uy tín

### 2. Posts

Lưu trữ bài viết của người dùng:

- Tiêu đề, nội dung và thông tin tác giả
- Danh mục và thẻ
- Thời gian tạo và cập nhật
- Trạng thái (nháp, chờ duyệt, đã xuất bản, từ chối)
- Thống kê (lượt xem, bình luận, lượt thích)

### 3. Comments

Lưu trữ bình luận:

- Nội dung và thông tin người bình luận
- Liên kết đến bài viết
- Trạng thái (đã duyệt, chờ duyệt, từ chối, báo cáo)
- Hỗ trợ nested comments (bình luận lồng nhau)

### 4. Categories

Quản lý danh mục:

- Tên và mô tả danh mục
- Biểu tượng và màu sắc
- Thứ tự hiển thị
- Thống kê số bài viết

### 5. Settings

Lưu trữ cài đặt hệ thống:

- Cài đặt chung (tên diễn đàn, số bài viết mỗi trang)
- Cài đặt email (SMTP, template)
- Tùy chọn đăng ký và kiểm duyệt

### 6. Notifications

Quản lý thông báo cho người dùng:

- Loại thông báo (bình luận, thích, đề cập, hệ thống)
- Trạng thái đã đọc
- Liên kết đến đối tượng liên quan

### 7. Announcements

Quản lý thông báo hệ thống:

- Tiêu đề và nội dung
- Thời gian bắt đầu và kết thúc
- Đối tượng nhận thông báo

## Cách khởi tạo Cơ sở dữ liệu

### Sử dụng MongoDB Shell

1. Đảm bảo đã cài đặt MongoDB và đang chạy dịch vụ MongoDB
2. Mở terminal và kết nối đến MongoDB shell:

```bash
mongosh
```

3. Tạo và sử dụng database forum:

```javascript
use forum
```

4. Chạy script khởi tạo:

```bash
load("./scripts/init-db.js")
```

### Sử dụng MongoDB Compass

1. Kết nối đến MongoDB server trong MongoDB Compass
2. Tạo database mới tên "forum"
3. Vào tab "Mongosh" trong Compass
4. Chạy script khởi tạo:

```javascript
load("/đường_dẫn_đầy_đủ/scripts/init-db.js");
```

### Kiểm tra dữ liệu đã tạo

Sau khi chạy script, bạn có thể kiểm tra các collection đã được tạo thành công:

```javascript
db.getCollectionNames();
```

Và kiểm tra dữ liệu mẫu:

```javascript
db.users.find().pretty();
db.posts.find().pretty();
db.categories.find().pretty();
```

## Lược đồ (Schema)

### Users

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  fullName: String,
  avatar: String,
  role: String, // "user", "moderator", "admin"
  bio: String,
  joined: Date,
  lastActive: Date,
  isVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  settings: {
    notifications: Boolean,
    newsletter: Boolean,
    darkMode: Boolean
  },
  badges: [{
    type: String,
    earnedAt: Date
  }],
  reputation: Number
}
```

### Posts

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: {
    _id: ObjectId,
    name: String
  },
  category: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  status: String, // "draft", "pending", "published", "rejected"
  viewCount: Number,
  upvotes: Number,
  downvotes: Number,
  voters: [{
    user: ObjectId,
    vote: Number // 1 hoặc -1
  }],
  featured: Boolean,
  commentCount: Number,
  images: [String],
  pinned: Boolean
}
```

### Comments

```javascript
{
  _id: ObjectId,
  post: ObjectId,
  content: String,
  author: {
    _id: ObjectId,
    name: String
  },
  createdAt: Date,
  updatedAt: Date,
  status: String, // "pending", "approved", "rejected", "reported"
  likes: Number,
  parentComment: ObjectId, // Cho phép trả lời bình luận
  reports: [{
    user: ObjectId,
    reason: String,
    createdAt: Date
  }]
}
```

### Categories

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  color: String,
  postCount: Number,
  slug: String,
  parentCategory: ObjectId, // Cho phép danh mục lồng nhau
  order: Number
}
```

### Settings

```javascript
{
  _id: ObjectId,
  key: String, // Ví dụ: "general", "email", "appearance"
  settings: {
    // Các cài đặt tùy theo loại
  }
}
```

### Notifications

```javascript
{
  _id: ObjectId,
  user: ObjectId,
  type: String, // "comment", "like", "mention", "system"
  message: String,
  relatedTo: {
    type: String, // "post", "comment", "user"
    id: ObjectId
  },
  isRead: Boolean,
  createdAt: Date
}
```

### Announcements

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: ObjectId,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  priority: Number, // 1-5 (5 = cao nhất)
  targetAudience: String, // "all", "users", "moderators", "admins"
  createdAt: Date
}
```
