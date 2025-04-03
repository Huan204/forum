const express = require("express");
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route lấy comments theo bài viết
router.route("/post/:postId").get(getComments);

// Route tạo comment mới
router.route("/").post(protect, createComment);

// Route cho comment cụ thể
router
  .route("/:id")
  .get(getComment)
  .put(protect, updateComment)
  .delete(protect, deleteComment);

// Route thích/bỏ thích comment
router.route("/:id/like").put(protect, likeComment);

module.exports = router;
