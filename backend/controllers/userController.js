const User = require("../models/User");
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer cho việc upload avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/avatars";
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)");
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }
    cb(null, true);
  },
});

// @desc    Lấy thông tin người dùng theo ID
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Lấy thông tin người dùng hiện tại
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate({
      path: "savedPosts",
      select: "title thumbnail createdAt category",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server",
    });
  }
};

// Cập nhật thông tin profile
const updateProfile = async (req, res) => {
  try {
    const { username, fullName, bio, location, website, socialLinks } =
      req.body;

    // Tìm và cập nhật user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    // Cập nhật thông tin
    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (website) user.website = website;
    if (socialLinks) user.socialLinks = socialLinks;

    await user.save();

    res.json({
      success: true,
      data: {
        user,
      },
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật thông tin",
    });
  }
};

// @desc    Cập nhật mật khẩu
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
      });
    }

    // Lấy user với mật khẩu
    const user = await User.findById(req.user.id).select("+password");

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Mật khẩu hiện tại không chính xác",
      });
    }

    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Mật khẩu đã được cập nhật",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Lấy bài viết của người dùng
// @route   GET /api/users/:id/posts
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp ID người dùng",
      });
    }

    const posts = await Post.find({ author: userId })
      .sort("-createdAt")
      .populate({
        path: "author",
        select: "username avatar",
      });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng chọn file ảnh",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Cập nhật đường dẫn avatar mới
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      data: {
        user,
        avatar: user.avatar,
      },
      message: "Upload avatar thành công",
    });
  } catch (error) {
    console.error("Lỗi khi upload avatar:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi upload avatar",
    });
  }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
  try {
    console.log(`Đang tìm người dùng có ID: ${req.params.id}`);

    // Chỉ select các trường cần thiết, không populate
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      console.log(`Không tìm thấy người dùng với ID: ${req.params.id}`);
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Chuyển đổi thành object thông thường để thêm các trường tính toán
    const userObject = user.toObject();

    // Gửi kết quả thành công
    console.log(`Đã tìm thấy người dùng: ${user.username || user.email}`);
    res.json({
      success: true,
      user: userObject,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);

    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "ID người dùng không hợp lệ" });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  upload,
  getUserById,
};
