const express = require("express");
const router = express.Router();

// Import tất cả các routes
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const categoryRoutes = require("./categoryRoutes");
const profileRoutes = require("./profileRoutes");
const uploadRoutes = require("./uploadRoutes");
const messageRoutes = require("./messageRoutes");

// Kết hợp tất cả các routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/categories", categoryRoutes);
router.use("/profile", profileRoutes);
router.use("/uploads", uploadRoutes);
router.use("/messages", messageRoutes);

// Route kiểm tra sức khỏe máy chủ
router.get("/health-check", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server đang hoạt động bình thường",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
