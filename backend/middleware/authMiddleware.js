const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Bảo vệ routes yêu cầu xác thực
exports.protect = async (req, res, next) => {
  let token;

  // Kiểm tra header authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Lấy token từ header
    token = req.headers.authorization.split(" ")[1];
  }

  // Đảm bảo token tồn tại
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Không có quyền truy cập vào route này",
    });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng theo ID từ token
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: "Không tìm thấy người dùng với token này",
      });
    }

    // Thêm thông tin người dùng vào request
    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Lỗi xác thực token:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token đã hết hạn, vui lòng đăng nhập lại",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token không hợp lệ, vui lòng đăng nhập lại",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Không có quyền truy cập vào route này",
    });
  }
};

// Cấp quyền cho vai trò
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Vai trò ${req.user.role} không được phép truy cập route này`,
      });
    }
    next();
  };
};
