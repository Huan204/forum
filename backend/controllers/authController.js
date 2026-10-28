const User = require("../models/User");

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const usernameValue = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const emailValue = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const passwordValue = typeof req.body.password === "string" ? req.body.password : "";

    if (!usernameValue || !emailValue || !passwordValue) {
      return res.status(400).json({ success: false, error: "Vui lòng cung cấp đầy đủ thông tin đăng ký" });
    }
    if (usernameValue.length < 3 || usernameValue.length > 30) {
      return res.status(400).json({ success: false, error: "Tên người dùng phải từ 3 đến 30 ký tự" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập email hợp lệ" });
    }
    if (passwordValue.length < 6) {
      return res.status(400).json({ success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email: emailValue });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "Email đã được sử dụng",
      });
    }

    // Kiểm tra username đã tồn tại
    const usernameExists = await User.findOne({ username: usernameValue });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        error: "Tên người dùng đã được sử dụng",
      });
    }

    // Tạo người dùng mới
    const user = await User.create({
      username: usernameValue,
      email: emailValue,
      password: passwordValue,
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({ success: false, error: duplicateField === "username" ? "Tên người dùng đã được sử dụng" : "Email đã được sử dụng" });
    }
    console.error("Lỗi đăng ký:", error.message);
    return res.status(500).json({ success: false, error: "Lỗi server khi đăng ký người dùng" });
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const emailValue = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const passwordValue = typeof req.body.password === "string" ? req.body.password : "";

    if (!emailValue || !passwordValue) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp email và mật khẩu",
      });
    }

    // Kiểm tra người dùng tồn tại
    const user = await User.findOne({ email: emailValue }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(passwordValue);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác",
      });
    }

    // Gửi response với token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi đăng nhập",
    });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// @desc    Đăng xuất người dùng / xóa cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Đăng nhập dành cho admin
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp email và mật khẩu",
      });
    }

    // Kiểm tra người dùng tồn tại
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Thông tin đăng nhập không hợp lệ",
      });
    }

    // Kiểm tra vai trò admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập vào khu vực quản trị",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Thông tin đăng nhập không hợp lệ",
      });
    }

    // Gửi response với token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function để tạo token, set cookie và gửi response
const sendTokenResponse = (user, statusCode, res) => {
  // Tạo token
  const token = user.getSignedJwtToken();

  // Chuẩn bị dữ liệu người dùng an toàn (không bao gồm mật khẩu)
  const userData = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };

  // Gửi response với token và dữ liệu người dùng
  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};
