const express = require("express");
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserPosts,
  incrementViews,
  saveDraft,
  getDrafts,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

const {
  savePost,
  getSavedPosts,
  hidePost,
  reportPost,
} = require("../controllers/userPostInteractionController");

const router = express.Router();

// Route cơ bản
router.route("/").get(getPosts).post(protect, createPost);

// Route cho bài viết nháp
router.route("/drafts").get(protect, getDrafts).post(protect, saveDraft);

// Route cho bài viết cụ thể
router
  .route("/:id")
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// Route thích/bỏ thích
router.route("/:id/like").post(protect, likePost);
router.route("/:id/like").delete(protect, unlikePost);

// Route tăng lượt xem (không cần xác thực)
router.route("/:id/view").put(incrementViews);

// Route để lấy bài viết của người dùng cụ thể
router.route("/user/:userId").get(getUserPosts);

// Route cho tương tác người dùng với bài viết
router.route("/:id/save").post(protect, savePost);
router.route("/saved").get(protect, getSavedPosts);
router.route("/:id/hide").post(protect, hidePost);
router.route("/:id/report").post(protect, reportPost);

// Tìm cả file và thêm route mới sau các route hiện có của posts/:id

module.exports = router;
