const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục không được để trống"],
      trim: true,
      unique: true,
      maxlength: [50, "Tên danh mục không được vượt quá 50 ký tự"],
    },
    description: {
      type: String,
      required: [true, "Mô tả danh mục không được để trống"],
      trim: true,
      maxlength: [200, "Mô tả danh mục không được vượt quá 200 ký tự"],
    },
    icon: {
      type: String,
      default: "default-category",
    },
    color: {
      type: String,
      default: "#3498db",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Thiết lập virtual field cho danh sách bài viết
categorySchema.virtual("posts", {
  ref: "Post",
  localField: "name",
  foreignField: "category",
});

// Thiết lập virtual field cho danh mục con
categorySchema.virtual("childCategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Tạo slug từ tên danh mục
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    // Tạo slug từ tên danh mục
    this.slug = this.name
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
  }
  next();
});

// Phương thức tăng số lượng bài viết
categorySchema.methods.increasePostCount = async function () {
  this.postCount += 1;
  await this.save();
};

// Phương thức giảm số lượng bài viết
categorySchema.methods.decreasePostCount = async function () {
  if (this.postCount > 0) {
    this.postCount -= 1;
    await this.save();
  }
};

// Phương thức lấy tất cả danh mục con đệ quy
categorySchema.statics.getSubcategoriesRecursive = async function (categoryId) {
  const subcategories = await this.find({ parentCategory: categoryId });
  let allSubcategories = [...subcategories];

  for (const subcat of subcategories) {
    const children = await this.getSubcategoriesRecursive(subcat._id);
    allSubcategories = [...allSubcategories, ...children];
  }

  return allSubcategories;
};

// Phương thức lấy đường dẫn đầy đủ của danh mục
categorySchema.methods.getFullPath = async function () {
  let path = [this.name];
  let currentCategory = this;

  while (currentCategory.parentCategory) {
    const parent = await mongoose
      .model("Category")
      .findById(currentCategory.parentCategory);
    if (!parent) break;

    path.unshift(parent.name);
    currentCategory = parent;
  }

  return path.join(" > ");
};

// Index để tìm kiếm
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ slug: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ parentCategory: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
