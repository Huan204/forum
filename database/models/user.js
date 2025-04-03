const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username không được để trống"],
      trim: true,
      unique: true,
      minlength: [3, "Username phải có ít nhất 3 ký tự"],
      maxlength: [20, "Username không được vượt quá 20 ký tự"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username chỉ được chứa chữ cái, số và dấu gạch dưới",
      ],
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu không được để trống"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Họ tên không được để trống"],
      trim: true,
      maxlength: [50, "Họ tên không được vượt quá 50 ký tự"],
    },
    avatar: {
      type: String,
      default: function () {
        return `https://ui-avatars.com/api/?name=${this.fullName.replace(
          / /g,
          "+"
        )}&background=random&color=fff`;
      },
    },
    role: {
      type: String,
      enum: {
        values: ["user", "moderator", "admin"],
        message: "Vai trò không hợp lệ",
      },
      default: "user",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [200, "Giới thiệu không được vượt quá 200 ký tự"],
      default: "",
    },
    joined: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
    },
    badges: [
      {
        type: {
          type: String,
          enum: ["admin", "moderator", "founder", "contributor", "newcomer"],
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reputation: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Thiết lập virtual fields
userSchema.virtual("postCount", {
  ref: "Post",
  localField: "_id",
  foreignField: "author._id",
  count: true,
});

userSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "author._id",
  count: true,
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  // Chỉ hash mật khẩu nếu nó được sửa đổi (hoặc mới)
  if (!this.isModified("password")) return next();

  try {
    // Tạo salt và hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Phương thức tạo JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "forum_secret_key_dev",
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
};

// Phương thức cập nhật thời gian hoạt động cuối cùng
userSchema.methods.updateLastActive = async function () {
  this.lastActive = Date.now();
  await this.save();
};

// Phương thức tăng/giảm điểm uy tín
userSchema.methods.updateReputation = async function (points) {
  this.reputation += points;
  await this.save();
};

// Index để tìm kiếm
userSchema.index({ username: "text", fullName: "text" });

const User = mongoose.model("User", userSchema);

module.exports = User;
