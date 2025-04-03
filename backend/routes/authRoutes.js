const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  adminLogin,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Route đăng ký và đăng nhập
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);

// Route bảo vệ bởi middleware
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

// Route kiểm tra trạng thái đăng nhập cho người dùng
router.get("/status", protect, (req, res) => {
  res.status(200).json({
    success: true,
    isAuthenticated: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Route admin
router.get("/admin/status", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    isAuthenticated: true,
    isAdmin: true,
  });
});

module.exports = router;
