const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Vui lòng nhập tên người dùng"],
    unique: true,
    trim: true,
    minlength: [3, "Tên người dùng phải có ít nhất 3 ký tự"],
    maxlength: [30, "Tên người dùng không được vượt quá 30 ký tự"],
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Vui lòng nhập email hợp lệ",
    ],
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu"],
    minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    select: false,
  },
  avatar: {
    type: String,
    default: "default-avatar.png",
  },
  bio: {
    type: String,
    default: "",
    maxlength: [500, "Tiểu sử không được vượt quá 500 ký tự"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  hiddenPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  // Chỉ mã hóa mật khẩu khi nó bị thay đổi
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh mật khẩu người dùng với mật khẩu đã băm
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Lỗi khi so sánh mật khẩu:", error);
    return false;
  }
};

// Tạo JWT token
userSchema.methods.getSignedJwtToken = function () {
  try {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  } catch (error) {
    console.error("Lỗi khi tạo token:", error);
    throw new Error("Không thể tạo token xác thực");
  }
};

module.exports = mongoose.model("User", userSchema);
