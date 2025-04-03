const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

// @desc    Lưu bài viết cho người dùng
// @route   POST /api/posts/:id/save
// @access  Private
exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Cập nhật danh sách bài viết đã lưu của người dùng
    const user = await User.findById(userId);

    // Kiểm tra xem bài viết đã được lưu chưa
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      // Người dùng đã lưu bài viết này trước đó - hủy lưu
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Đã hủy lưu bài viết",
        isSaved: false,
      });
    } else {
      // Người dùng chưa lưu bài viết - thêm vào danh sách
      user.savedPosts.push(postId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Đã lưu bài viết thành công",
        isSaved: true,
      });
    }
  } catch (error) {
    console.error("Lỗi khi lưu bài viết:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lưu bài viết",
    });
  }
};

// @desc    Lấy tất cả bài viết đã lưu của người dùng
// @route   GET /api/posts/saved
// @access  Private
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy thông tin người dùng với danh sách bài viết đã lưu
    const user = await User.findById(userId).populate({
      path: "savedPosts",
      populate: {
        path: "author",
        select: "username avatar",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      count: user.savedPosts.length,
      data: user.savedPosts,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bài viết đã lưu:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy bài viết đã lưu",
    });
  }
};

// @desc    Ẩn bài viết cho người dùng
// @route   POST /api/posts/:id/hide
// @access  Private
exports.hidePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Cập nhật danh sách bài viết đã ẩn của người dùng
    const user = await User.findById(userId);

    // Kiểm tra xem bài viết đã bị ẩn chưa
    const isHidden = user.hiddenPosts.includes(postId);

    if (isHidden) {
      // Người dùng đã ẩn bài viết này trước đó - hiện lại
      user.hiddenPosts = user.hiddenPosts.filter(
        (id) => id.toString() !== postId
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Đã hiển thị lại bài viết",
        isHidden: false,
      });
    } else {
      // Người dùng chưa ẩn bài viết - thêm vào danh sách ẩn
      user.hiddenPosts.push(postId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Đã ẩn bài viết",
        isHidden: true,
      });
    }
  } catch (error) {
    console.error("Lỗi khi ẩn bài viết:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi ẩn bài viết",
    });
  }
};

// @desc    Báo cáo bài viết
// @route   POST /api/posts/:id/report
// @access  Private
exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng cung cấp lý do báo cáo",
      });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra xem người dùng đã báo cáo bài viết này chưa
    if (!post.reports) {
      post.reports = [];
    }

    const alreadyReported = post.reports.some(
      (report) => report.user.toString() === userId
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        error: "Bạn đã báo cáo bài viết này rồi",
      });
    }

    // Thêm báo cáo vào bài viết
    post.reports.push({
      user: userId,
      reason,
      createdAt: Date.now(),
    });

    // Nếu có nhiều báo cáo, đánh dấu bài viết là đã bị báo cáo
    if (post.reports.length >= 3) {
      post.status = "reported";
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: "Đã báo cáo bài viết thành công",
    });
  } catch (error) {
    console.error("Lỗi khi báo cáo bài viết:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi báo cáo bài viết",
    });
  }
};

module.exports = {
  savePost: exports.savePost,
  getSavedPosts: exports.getSavedPosts,
  hidePost: exports.hidePost,
  reportPost: exports.reportPost,
};
