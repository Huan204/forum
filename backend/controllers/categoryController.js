const Category = require("../models/Category");
const Post = require("../models/Post");

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi lấy danh sách danh mục",
    });
  }
};

// @desc    Lấy chi tiết danh mục
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi lấy chi tiết danh mục",
    });
  }
};

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Kiểm tra danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Danh mục này đã tồn tại",
      });
    }

    const category = await Category.create({
      name,
      description: description || `Danh mục ${name}`,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Có lỗi xảy ra khi tạo danh mục",
    });
  }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy danh mục",
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi cập nhật danh mục",
    });
  }
};

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy danh mục",
      });
    }

    await category.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi xóa danh mục",
    });
  }
};

// @desc    Cập nhật số lượng bài viết trong danh mục
// @route   PUT /api/categories/update-post-count
// @access  Private/Admin
exports.updatePostCounts = async (req, res) => {
  try {
    // Lấy tất cả danh mục
    const categories = await Category.find();

    // Cập nhật số lượng bài viết cho từng danh mục
    for (const category of categories) {
      const count = await Post.countDocuments({ category: category.name });

      await Category.findByIdAndUpdate(
        category._id,
        { postCount: count },
        { new: true }
      );
    }

    // Lấy danh sách đã cập nhật
    const updatedCategories = await Category.find();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật số lượng bài viết cho tất cả danh mục",
      data: updatedCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi cập nhật số lượng bài viết",
    });
  }
};
