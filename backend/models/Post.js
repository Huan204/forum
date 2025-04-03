const mongoose = require("mongoose");
const Category = require("./Category");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Vui lòng nhập tiêu đề bài viết"],
    trim: true,
    maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
  },
  content: {
    type: String,
    required: [true, "Vui lòng nhập nội dung bài viết"],
    minlength: [10, "Nội dung phải có ít nhất 10 ký tự"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  thumbnail: {
    type: String,
    default: "",
  },
  video: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["draft", "published", "pending", "rejected", "reported"],
    default: "published",
  },
  category: {
    type: String,
    required: [true, "Vui lòng chọn danh mục"],
    enum: ["Công nghệ", "Giải trí", "Thể thao", "Khoa học", "Sức khỏe", "Khác"],
  },
  tags: [String],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  uniqueViewers: {
    type: [String],
    default: [],
    select: false, // Không trả về trường này khi query bình thường
  },
  reports: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cập nhật updatedAt khi có thay đổi
postSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Cập nhật số lượng bài viết trong danh mục sau khi tạo bài viết
postSchema.post("save", async function () {
  try {
    if (this.category) {
      // Tìm danh mục tương ứng
      let category = await Category.findOne({ name: this.category });

      // Nếu danh mục tồn tại, cập nhật số lượng bài viết
      if (category) {
        const count = await mongoose
          .model("Post")
          .countDocuments({ category: this.category });
        await Category.findByIdAndUpdate(category._id, { postCount: count });
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng bài viết trong danh mục:", error);
  }
});

// Cập nhật số lượng bài viết trong danh mục sau khi xóa bài viết
postSchema.post("remove", async function () {
  try {
    if (this.category) {
      // Tìm danh mục tương ứng
      let category = await Category.findOne({ name: this.category });

      // Nếu danh mục tồn tại, cập nhật số lượng bài viết
      if (category) {
        const count = await mongoose
          .model("Post")
          .countDocuments({ category: this.category });
        await Category.findByIdAndUpdate(category._id, { postCount: count });
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng bài viết trong danh mục:", error);
  }
});

module.exports = mongoose.model("Post", postSchema);
