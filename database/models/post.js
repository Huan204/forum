const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề không được để trống"],
      trim: true,
      minlength: [5, "Tiêu đề phải có ít nhất 5 ký tự"],
      maxlength: [150, "Tiêu đề không được vượt quá 150 ký tự"],
    },
    content: {
      type: String,
      required: [true, "Nội dung không được để trống"],
      minlength: [20, "Nội dung phải có ít nhất 20 ký tự"],
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
    category: {
      type: String,
      required: [true, "Danh mục không được để trống"],
    },
    tags: [
      {
        type: String,
        trim: true,
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
    status: {
      type: String,
      enum: {
        values: ["draft", "pending", "published", "rejected"],
        message: "Trạng thái không hợp lệ",
      },
      default: "pending",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    voters: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        vote: {
          type: Number,
          enum: [-1, 1],
        },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Thiết lập virtual field cho comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

// Tạo slug từ tiêu đề
postSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    // Tạo slug từ tiêu đề
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\sÀ-ỹ]/g, "") // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
      .replace(/ì|í|ị|ỉ|ĩ/g, "i")
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
      .replace(/đ/g, "d")
      .replace(/-+/g, "-") // Loại bỏ nhiều dấu gạch ngang liên tiếp
      .replace(/^-+/, "") // Loại bỏ dấu gạch ngang ở đầu
      .replace(/-+$/, ""); // Loại bỏ dấu gạch ngang ở cuối

    // Thêm timestamp để đảm bảo độc nhất
    if (!this.isNew) {
      this.slug += `-${Date.now().toString().substring(9)}`;
    }
  }
  next();
});

// Phương thức tăng lượt xem
postSchema.methods.increaseViewCount = async function () {
  this.viewCount += 1;
  await this.save();
};

// Phương thức xử lý upvote/downvote
postSchema.methods.vote = async function (userId, voteType) {
  // Tìm kiếm voter hiện tại
  const voterIndex = this.voters.findIndex(
    (voter) => voter.user.toString() === userId.toString()
  );

  // Nếu chưa vote
  if (voterIndex === -1) {
    this.voters.push({ user: userId, vote: voteType });
    if (voteType === 1) this.upvotes += 1;
    else this.downvotes += 1;
  }
  // Nếu đã vote
  else {
    const currentVote = this.voters[voterIndex].vote;

    // Nếu vote giống nhau (bỏ vote)
    if (currentVote === voteType) {
      this.voters.splice(voterIndex, 1);
      if (voteType === 1) this.upvotes -= 1;
      else this.downvotes -= 1;
    }
    // Nếu vote khác nhau (đổi vote)
    else {
      this.voters[voterIndex].vote = voteType;
      if (voteType === 1) {
        this.upvotes += 1;
        this.downvotes -= 1;
      } else {
        this.upvotes -= 1;
        this.downvotes += 1;
      }
    }
  }

  await this.save();
  return this;
};

// Phương thức tìm kiếm
postSchema.statics.search = async function (query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

// Index để tìm kiếm
postSchema.index({ title: "text", content: "text", tags: "text" });
postSchema.index({ category: 1 });
postSchema.index({ "author._id": 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
