const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Vui lòng nhập nội dung bình luận"],
    minlength: [1, "Bình luận không được để trống"],
    maxlength: [1000, "Bình luận không được vượt quá 1000 ký tự"],
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware khi tạo comment mới - tăng commentsCount trong bài viết
commentSchema.post("save", async function () {
  try {
    const Post = mongoose.model("Post");
    await Post.findByIdAndUpdate(this.post, {
      $inc: { commentsCount: 1 },
    });
  } catch (error) {
    console.error("Lỗi cập nhật commentsCount:", error);
  }
});

// Middleware khi xóa comment - giảm commentsCount trong bài viết
commentSchema.post("remove", async function () {
  try {
    const Post = mongoose.model("Post");
    await Post.findByIdAndUpdate(this.post, {
      $inc: { commentsCount: -1 },
    });
  } catch (error) {
    console.error("Lỗi cập nhật commentsCount:", error);
  }
});

module.exports = mongoose.model("Comment", commentSchema, "commentusers");
