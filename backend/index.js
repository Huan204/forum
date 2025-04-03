const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const commentRoutes = require("./routes/commentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Models
const Category = require("./models/Category");
const Post = require("./models/Post");

// Middleware
const errorMiddleware = require("./middleware/errorMiddleware");

// Cấu hình
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Kết nối database
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Đã kết nối đến MongoDB");
    // Đảm bảo rằng tất cả các danh mục cần thiết đã được tạo
    initializeCategories();
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err.message));

// Hàm khởi tạo danh mục
async function initializeCategories() {
  try {
    const requiredCategories = [
      "Công nghệ",
      "Giải trí",
      "Thể thao",
      "Khoa học",
      "Sức khỏe",
      "Khác",
    ];

    // Kiểm tra và tạo các danh mục nếu chưa tồn tại
    for (const categoryName of requiredCategories) {
      const existingCategory = await Category.findOne({ name: categoryName });

      if (!existingCategory) {
        await Category.create({
          name: categoryName,
          description: `Danh mục ${categoryName}`,
          slug: categoryName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-"),
        });
        console.log(`Đã tạo danh mục ${categoryName}`);
      }
    }

    // Cập nhật số lượng bài viết trong mỗi danh mục
    const categories = await Category.find();
    for (const category of categories) {
      const count = await Post.countDocuments({ category: category.name });
      await Category.findByIdAndUpdate(category._id, { postCount: count });
    }

    console.log("Khởi tạo danh mục hoàn tất");
  } catch (error) {
    console.error("Lỗi khi khởi tạo danh mục:", error);
  }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route mặc định
app.get("/", (req, res) => {
  res.send("API Forum đang hoạt động!");
});

// Health check route
app.get("/api/health-check", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server đang hoạt động bình thường",
    timestamp: new Date().toISOString(),
  });
});

// Middleware xử lý lỗi
app.use(errorMiddleware);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Lỗi server",
  });
});

// Kiểm tra file có cấu hình endpoint health-check
// Nếu chưa có, thêm vào

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
