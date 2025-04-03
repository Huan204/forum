// mới tạo để xử lý upload ảnh
const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User"); // Đảm bảo model User đã có field avatar
const router = express.Router();

// Cấu hình Multer để lưu file vào thư mục uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ảnh sẽ được lưu trong thư mục uploads
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// API cập nhật ảnh đại diện
router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });
    }

    // Lấy userId từ token hoặc request
    const userId = req.user.id; // Nếu bạn có middleware xác thực
    const imageUrl = `/uploads/${req.file.filename}`;

    // Cập nhật ảnh đại diện trong MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: imageUrl },
      { new: true }
    );

    res.json({ success: true, data: updatedUser, message: "Cập nhật ảnh thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
