const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Bài viết không được để trống"],
    },
    content: {
      type: String,
      required: [true, "Nội dung bình luận không được để trống"],
      trim: true,
      minlength: [2, "Bình luận phải có ít nhất 2 ký tự"],
      maxlength: [1000, "Bình luận không được vượt quá 1000 ký tự"],
    },
    author: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "reported"],
        message: "Trạng thái không hợp lệ",
      },
      default: "pending",
    },
    likes: {
      type: Number,
      default: 0,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Thiết lập virtual field cho replies (trả lời bình luận)
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

// Phương thức like/unlike
commentSchema.methods.toggleLike = async function (userId) {
  // Nếu người dùng đã like comment này trước đó
  const likedIndex = this.likedBy ? this.likedBy.indexOf(userId) : -1;

  if (!this.likedBy) {
    this.likedBy = [];
  }

  if (likedIndex === -1) {
    // Người dùng chưa like, thêm vào danh sách
    this.likedBy.push(userId);
    this.likes += 1;
  } else {
    // Người dùng đã like, xóa khỏi danh sách
    this.likedBy.splice(likedIndex, 1);
    this.likes -= 1;
  }

  await this.save();
  return this;
};

// Phương thức báo cáo bình luận
commentSchema.methods.report = async function (userId, reason) {
  // Kiểm tra nếu người dùng đã báo cáo trước đó
  const alreadyReported = this.reports.some(
    (report) => report.user.toString() === userId.toString()
  );

  if (!alreadyReported) {
    this.reports.push({
      user: userId,
      reason,
      createdAt: Date.now(),
    });

    // Nếu có nhiều báo cáo, đổi trạng thái thành reported
    if (this.reports.length >= 3) {
      this.status = "reported";
    }

    await this.save();
  }

  return this;
};

// Tăng số bình luận của bài viết khi có comment mới
commentSchema.post("save", async function () {
  if (this.status === "approved" && this.isNew) {
    try {
      const Post = mongoose.model("Post");
      await Post.findByIdAndUpdate(this.post, { $inc: { commentCount: 1 } });
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng bình luận:", error);
    }
  }
});

// Giảm số bình luận của bài viết khi xóa comment
commentSchema.post("remove", async function () {
  if (this.status === "approved") {
    try {
      const Post = mongoose.model("Post");
      await Post.findByIdAndUpdate(this.post, { $inc: { commentCount: -1 } });
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng bình luận:", error);
    }
  }
});

// Index để tìm kiếm
commentSchema.index({ post: 1 });
commentSchema.index({ "author._id": 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ content: "text" });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
