const Comment = require("../models/Comment");
const Post = require("../models/Post");

// @desc    Lấy tất cả comments của một bài viết
// @route   GET /api/comments/:postId
// @access  Public
exports.getComments = async (req, res) => {
  try {
    console.log("Đang lấy bình luận cho bài viết:", req.params.postId);

    const comments = await Comment.find({ post: req.params.postId })
      .populate({
        path: "author",
        select: "username avatar _id",
      })
      .sort("-createdAt");

    // Log thông tin comment đầu tiên nếu có
    if (comments.length > 0) {
      const sampleComment = comments[0];
      console.log("Mẫu comment từ DB:", {
        id: sampleComment._id,
        content: sampleComment.content,
        authorInfo: sampleComment.author,
        authorId: sampleComment.author?._id,
      });
    }

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Lấy một comment
// @route   GET /api/comments/:id
// @access  Public
exports.getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate({
      path: "author",
      select: "username avatar",
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bình luận",
      });
    }

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Tạo comment mới
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    // Thêm user vào req.body
    req.body.author = req.user.id;

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(req.body.post);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Tạo comment
    const comment = await Comment.create(req.body);

    // Lấy comment vừa tạo kèm thông tin author
    const populatedComment = await Comment.findById(comment._id).populate({
      path: "author",
      select: "username avatar",
    });

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Cập nhật comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bình luận",
      });
    }

    // Kiểm tra user có phải là tác giả
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: "Bạn không có quyền cập nhật bình luận này",
      });
    }

    // Cập nhật trường updatedAt
    req.body.updatedAt = Date.now();

    // Cập nhật comment
    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Lấy comment đã cập nhật với thông tin author
    const updatedComment = await Comment.findById(comment._id).populate({
      path: "author",
      select: "username avatar",
    });

    res.status(200).json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Xóa comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bình luận",
      });
    }

    // Kiểm tra user có phải là tác giả
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: "Bạn không có quyền xóa bình luận này",
      });
    }

    // Lưu lại ID bài viết trước khi xóa để cập nhật số lượng bình luận
    const postId = comment.post;

    // Xóa comment
    await Comment.findByIdAndDelete(comment._id);

    // Cập nhật số lượng bình luận trong bài viết
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -1 },
    });

    res.status(200).json({
      success: true,
      data: {},
      message: "Đã xóa bình luận thành công",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Thích / Bỏ thích comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bình luận",
      });
    }

    // Kiểm tra xem comment đã được thích chưa
    const isLiked = comment.likes.includes(req.user.id);

    if (isLiked) {
      // Bỏ thích
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== req.user.id
      );
    } else {
      // Thích comment
      comment.likes.push(req.user.id);
    }

    await comment.save();

    // Lấy comment đã cập nhật với thông tin author
    const updatedComment = await Comment.findById(comment._id).populate({
      path: "author",
      select: "username avatar",
    });

    res.status(200).json({
      success: true,
      data: updatedComment,
      isLiked: !isLiked,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
