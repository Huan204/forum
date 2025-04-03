const mongoose = require("mongoose");

/**
 * Schema cho thông báo người dùng
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người dùng không được để trống"],
    },
    type: {
      type: String,
      required: [true, "Loại thông báo không được để trống"],
      enum: {
        values: [
          "comment",
          "like",
          "mention",
          "follow",
          "system",
          "post",
          "admin",
        ],
        message: "Loại thông báo không hợp lệ",
      },
    },
    message: {
      type: String,
      required: [true, "Nội dung thông báo không được để trống"],
      trim: true,
      maxlength: [200, "Nội dung thông báo không được vượt quá 200 ký tự"],
    },
    relatedTo: {
      type: {
        type: String,
        enum: {
          values: ["post", "comment", "user", "system"],
          message: "Loại đối tượng liên quan không hợp lệ",
        },
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedTo.type",
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    link: {
      type: String,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actorName: {
      type: String,
    },
    icon: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Map các loại thông báo đến loại đối tượng tương ứng
notificationSchema.pre("save", function (next) {
  // Thiết lập icon mặc định dựa trên loại thông báo
  if (!this.icon) {
    const iconMap = {
      comment: "comment",
      like: "heart",
      mention: "at",
      follow: "user-plus",
      system: "bell",
      post: "file-text",
      admin: "shield",
    };
    this.icon = iconMap[this.type] || "bell";
  }

  next();
});

// Tạo lược đồ để biến đổi ID quan hệ thành đối tượng thực sự
notificationSchema.virtual("relatedObject", {
  refPath: "relatedTo.type",
  localField: "relatedTo.id",
  foreignField: "_id",
  justOne: true,
});

// Tạo lược đồ để biến đổi actorId thành đối tượng User
notificationSchema.virtual("actor", {
  ref: "User",
  localField: "actorId",
  foreignField: "_id",
  justOne: true,
});

// Phương thức đánh dấu đã đọc
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  await this.save();
  return this;
};

// Phương thức tĩnh để tạo thông báo mới
notificationSchema.statics.create = async function (data) {
  return await this.create(data);
};

// Phương thức tĩnh để đánh dấu tất cả thông báo của người dùng là đã đọc
notificationSchema.statics.markAllAsRead = async function (userId) {
  await this.updateMany({ user: userId, isRead: false }, { isRead: true });
};

// Phương thức tĩnh để xóa thông báo theo điều kiện
notificationSchema.statics.deleteNotifications = async function (conditions) {
  await this.deleteMany(conditions);
};

// Phương thức tĩnh để lấy thông báo chưa đọc của người dùng
notificationSchema.statics.getUnread = async function (userId) {
  return await this.find({ user: userId, isRead: false }).sort({
    createdAt: -1,
  });
};

// Phương thức tĩnh để lấy số lượng thông báo chưa đọc của người dùng
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ user: userId, isRead: false });
};

// Index để tìm kiếm hiệu quả
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ "relatedTo.id": 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
