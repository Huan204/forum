const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const {
  getCurrentUser,
  updateProfile,
  getUserById,
} = require("../controllers/userController");

// --- START: Cấu hình Multer cho Avatar ---
const AVATAR_UPLOAD_DIR = path.join(__dirname, "../uploads/avatars");

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
  fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    // req.user sẽ có sẵn do middleware protect chạy trước
    cb(null, `user-${req.user.id}-${uniqueSuffix}${extension}`);
  },
});

const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)!"), false);
  }
};

const upload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: avatarFileFilter,
});
// --- END: Cấu hình Multer cho Avatar ---

// Routes cho profile
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);

// --- START: Route Upload Avatar MỚI ---
router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    // Middleware upload.single('avatar') đã chạy và xử lý file
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng chọn file ảnh." });
    }

    // Tìm user (đã được xác thực bởi protect)
    const user = await User.findById(req.user.id);
    if (!user) {
      // Trường hợp hiếm gặp nếu user bị xóa sau khi xác thực
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    }

    // (Tùy chọn) Xóa avatar cũ nếu có
    if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
      // Chỉ xóa nếu là file do hệ thống upload
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
          console.log(`Deleted old avatar: ${oldAvatarPath}`);
        } catch (unlinkErr) {
          console.error(
            `Error deleting old avatar ${oldAvatarPath}:`,
            unlinkErr
          );
          // Không cần chặn quá trình, chỉ log lỗi
        }
      }
    }

    // Tạo đường dẫn URL tương đối để lưu vào DB
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Cập nhật DB
    user.avatar = avatarUrl;
    await user.save();

    console.log(`Avatar updated for user ${user.id}: ${avatarUrl}`);

    // Trả về thông tin thành công và URL mới
    res.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công!",
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error("Error in POST /api/users/avatar:", error);
    // Xử lý lỗi chung
    let statusCode = 500;
    let message = "Lỗi server khi cập nhật ảnh đại diện.";

    // Kiểm tra lỗi cụ thể từ multer hoặc các lỗi khác nếu cần
    if (error instanceof multer.MulterError) {
      statusCode = 400;
      if (error.code === "LIMIT_FILE_SIZE") {
        message = "Kích thước file không được vượt quá 5MB.";
      }
    } else if (error.message.includes("Chỉ chấp nhận file ảnh")) {
      statusCode = 400;
      message = error.message;
    }

    res.status(statusCode).json({ success: false, message: message });
  }
});
// --- END: Route Upload Avatar MỚI ---

// Thêm endpoint tìm kiếm người dùng - đặt trước route param /:id
router.get("/search", protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm là bắt buộc",
      });
    }

    // Tìm kiếm tất cả người dùng khi q="."
    let query;
    if (q === ".") {
      query = {
        _id: { $ne: req.user._id }, // Chỉ loại trừ người dùng hiện tại
      };
    } else {
      // Tìm kiếm người dùng theo tên hoặc username
      query = {
        $and: [
          { _id: { $ne: req.user._id } }, // Không bao gồm người dùng hiện tại
          {
            $or: [
              { username: { $regex: q, $options: "i" } },
              { name: { $regex: q, $options: "i" } },
              { email: { $regex: q, $options: "i" } },
            ],
          },
        ],
      };
    }

    // Thực hiện truy vấn
    const users = await User.find(query)
      .select("_id username name email avatar isOnline lastActive")
      .limit(10);

    // Log kết quả cho debug
    console.log(`Tìm thấy ${users.length} người dùng với từ khóa "${q}"`);

    res.json(users);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm người dùng",
    });
  }
});

// Route để lấy thông tin người dùng theo ID - đặt sau các route cụ thể
router.get("/:id", getUserById);

module.exports = router;
