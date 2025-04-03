const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updatePostCounts,
} = require("../controllers/categoryController");

// Routes cho /api/categories
router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

// Route cập nhật số lượng bài viết
router
  .route("/update-post-count")
  .put(protect, authorize("admin"), updatePostCounts);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
