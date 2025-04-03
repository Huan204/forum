const mongoose = require("mongoose");

/**
 * Schema cho thông báo hệ thống
 */
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề không được để trống"],
      trim: true,
      maxlength: [100, "Tiêu đề không được vượt quá 100 ký tự"],
    },
    content: {
      type: String,
      required: [true, "Nội dung không được để trống"],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tác giả không được để trống"],
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu không được để trống"],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc không được để trống"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      enum: {
        values: [1, 2, 3, 4, 5],
        message: "Mức độ ưu tiên phải từ 1 đến 5",
      },
      default: 3,
    },
    targetAudience: {
      type: String,
      enum: {
        values: ["all", "users", "moderators", "admins"],
        message: "Đối tượng không hợp lệ",
      },
      default: "all",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    background: {
      type: String,
      default: "#f8f9fa",
    },
    textColor: {
      type: String,
      default: "#212529",
    },
    icon: {
      type: String,
      default: "megaphone",
    },
    dismissible: {
      type: Boolean,
      default: true,
    },
    dismissedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual field để lấy tên tác giả
announcementSchema.virtual("authorName", {
  ref: "User",
  localField: "author",
  foreignField: "_id",
  justOne: true,
});

// Phương thức kiểm tra thông báo có đang hoạt động
announcementSchema.methods.isActiveNow = function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

// Phương thức kiểm tra người dùng có là đối tượng của thông báo
announcementSchema.methods.isTargetingUser = function (userRole) {
  if (this.targetAudience === "all") return true;
  if (
    this.targetAudience === "users" &&
    ["user", "moderator", "admin"].includes(userRole)
  )
    return true;
  if (
    this.targetAudience === "moderators" &&
    ["moderator", "admin"].includes(userRole)
  )
    return true;
  if (this.targetAudience === "admins" && userRole === "admin") return true;

  return false;
};

// Phương thức kiểm tra người dùng đã ẩn thông báo
announcementSchema.methods.isDismissedByUser = function (userId) {
  return this.dismissedBy.some((id) => id.toString() === userId.toString());
};

// Phương thức đánh dấu người dùng đã ẩn thông báo
announcementSchema.methods.dismissForUser = async function (userId) {
  if (!this.isDismissedByUser(userId)) {
    this.dismissedBy.push(userId);
    await this.save();
  }
  return this;
};

// Phương thức tĩnh để lấy tất cả thông báo đang hoạt động
announcementSchema.statics.getActive = async function () {
  const now = new Date();
  return await this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ priority: -1, startDate: -1 });
};

// Phương thức tĩnh để lấy thông báo theo đối tượng
announcementSchema.statics.getForRole = async function (role, userId = null) {
  const now = new Date();
  let query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  // Lọc theo vai trò người dùng
  if (role === "admin") {
    query.targetAudience = { $in: ["all", "users", "moderators", "admins"] };
  } else if (role === "moderator") {
    query.targetAudience = { $in: ["all", "users", "moderators"] };
  } else {
    query.targetAudience = { $in: ["all", "users"] };
  }

  // Lọc bỏ thông báo đã ẩn
  if (userId) {
    query.dismissedBy = { $ne: userId };
  }

  return await this.find(query).sort({ priority: -1, startDate: -1 });
};

// Index để tìm kiếm hiệu quả
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ priority: -1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
