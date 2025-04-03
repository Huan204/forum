const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Category = require("../models/Category");

// @desc    Lấy tất cả bài viết
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    // Tạo query
    let query;

    // Sao chép req.query
    const reqQuery = { ...req.query };

    // Fields cần loại trừ
    const removeFields = ["select", "sort", "page", "limit"];

    // Loại bỏ các fields không cần thiết khỏi reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Tạo query string
    let queryStr = JSON.stringify(reqQuery);

    // Tạo các operators ($gt, $gte, vv...)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Tìm tất cả bài viết
    query = Post.find(JSON.parse(queryStr)).populate({
      path: "author",
      select: "username avatar",
    });

    // Chọn fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sắp xếp
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Phân trang
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Thực thi query
    const posts = await query;

    // Phân trang kết quả
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Lấy một bài viết
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: "author",
      select: "username avatar",
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Không tự động tăng lượt xem khi lấy bài viết
    // Việc tăng lượt xem sẽ được xử lý bởi API riêng

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Tạo bài viết mới
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    // Thêm user vào req.body
    req.body.author = req.user.id;

    // Kiểm tra xem danh mục đã tồn tại chưa
    if (req.body.category) {
      const categoryName = req.body.category;
      let existingCategory = await Category.findOne({ name: categoryName });

      // Nếu danh mục chưa tồn tại, tạo mới
      if (!existingCategory) {
        existingCategory = await Category.create({
          name: categoryName,
          description: `Danh mục ${categoryName}`,
        });
        console.log(`Đã tạo danh mục mới: ${categoryName}`);
      }
    }

    // Tạo post mới với tất cả các trường từ request body
    const post = await Post.create(req.body);

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Cập nhật bài viết
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra user có phải là tác giả
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        error: "Bạn không có quyền cập nhật bài viết này",
      });
    }

    // Kiểm tra xem danh mục đã thay đổi và có tồn tại chưa
    if (req.body.category && req.body.category !== post.category) {
      const categoryName = req.body.category;
      let existingCategory = await Category.findOne({ name: categoryName });

      // Nếu danh mục chưa tồn tại, tạo mới
      if (!existingCategory) {
        existingCategory = await Category.create({
          name: categoryName,
          description: `Danh mục ${categoryName}`,
        });
        console.log(`Đã tạo danh mục mới: ${categoryName}`);
      }
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Xóa bài viết
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra user có phải là tác giả
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        error: "Bạn không có quyền xóa bài viết này",
      });
    }

    // await post.remove(); // Phương thức này đã bị deprecated
    await Post.findByIdAndDelete(req.params.id); // Thay thế bằng findByIdAndDelete

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Lỗi xóa bài viết:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Thích / Bỏ thích bài viết
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra xem bài viết đã được thích chưa
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Bỏ thích
      post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
      post.likesCount -= 1;
    } else {
      // Thích bài viết
      post.likes.push(req.user.id);
      post.likesCount += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
      isLiked: !isLiked,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Bỏ thích bài viết
// @route   DELETE /api/posts/:id/like
// @access  Private
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Kiểm tra xem người dùng đã thích bài viết hay chưa
    const isLiked = post.likes.includes(req.user.id);

    if (!isLiked) {
      return res.status(400).json({
        success: false,
        error: "Bạn chưa thích bài viết này",
      });
    }

    // Xóa ID người dùng khỏi danh sách likes
    post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
    post.likesCount = Math.max(0, post.likesCount - 1);

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Lấy bài viết của một người dùng cụ thể
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Đang lấy bài viết cho người dùng có ID: ${userId}`);

    // Kiểm tra userId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`ID người dùng không hợp lệ: ${userId}`);
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ",
      });
    }

    // Kiểm tra người dùng tồn tại
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.log(`Không tìm thấy người dùng với ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Lấy bài viết của người dùng, mới nhất xếp trước
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "username avatar email");

    console.log(`Tìm thấy ${posts.length} bài viết của người dùng ${userId}`);

    // Tính toán số lượng like và comment cho mỗi bài viết
    const postsWithCounts = posts.map((post) => {
      const postObj = post.toObject();
      postObj.likesCount = post.likes ? post.likes.length : 0;
      postObj.commentsCount = post.comments ? post.comments.length : 0;
      return postObj;
    });

    res.json({
      success: true,
      posts: postsWithCounts,
      total: postsWithCounts.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bài viết của người dùng:", error);

    // Kiểm tra loại lỗi để trả về thông báo phù hợp
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy bài viết của người dùng",
      error: error.message,
    });
  }
};

// @desc    Tăng lượt xem bài viết
// @route   PUT /api/posts/:id/view
// @access  Public
exports.incrementViews = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select("+uniqueViewers");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy bài viết",
      });
    }

    // Lấy ID định danh (IP address hoặc user ID nếu đã đăng nhập)
    const viewerId = req.user ? req.user.id : req.ip;

    // Kiểm tra xem người này đã xem bài viết chưa
    const hasViewed = post.uniqueViewers
      ? post.uniqueViewers.includes(viewerId)
      : false;

    // Chỉ tăng lượt xem nếu người dùng chưa xem bài viết này
    if (!hasViewed) {
      // Tăng số lượt xem lên 1
      post.views += 1;

      // Thêm người xem vào danh sách đã xem
      if (!post.uniqueViewers) {
        post.uniqueViewers = [viewerId];
      } else {
        post.uniqueViewers.push(viewerId);
      }

      await post.save();

      console.log(
        `Đã tăng lượt xem cho bài viết ${post._id} bởi người dùng ${viewerId}`
      );
    } else {
      console.log(
        `Người dùng ${viewerId} đã xem bài viết ${post._id} trước đó, không tăng lượt xem`
      );
    }

    res.status(200).json({
      success: true,
      data: {
        views: post.views,
        hasViewedBefore: hasViewed,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tăng lượt xem:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Lưu bài viết nháp
// @route   POST /api/posts/drafts
// @access  Private
exports.saveDraft = async (req, res) => {
  try {
    // Thêm user vào req.body
    req.body.author = req.user.id;

    // Đảm bảo trạng thái là nháp
    req.body.status = "draft";

    // Điền các giá trị mặc định nếu chưa có
    if (!req.body.title) req.body.title = "Bài viết chưa có tiêu đề";
    if (!req.body.content) req.body.content = "Nội dung đang được soạn thảo...";
    if (!req.body.category) req.body.category = "Khác";

    let post;

    // Kiểm tra xem đã có ID nháp chưa
    if (req.body.draftId) {
      // Cập nhật nháp hiện có
      const draftId = req.body.draftId;
      delete req.body.draftId; // Xóa trường này trước khi cập nhật

      post = await Post.findOneAndUpdate(
        { _id: draftId, author: req.user.id },
        req.body,
        { new: true, runValidators: false }
      );

      if (!post) {
        return res.status(404).json({
          success: false,
          error:
            "Không tìm thấy bài viết nháp hoặc bạn không có quyền truy cập",
        });
      }
    } else {
      // Tạo nháp mới - tắt validation để cho phép lưu nháp không hoàn chỉnh
      post = new Post(req.body);
      await post.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Lỗi khi lưu nháp:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Không thể lưu bài viết nháp",
    });
  }
};

// @desc    Lấy danh sách bài viết nháp của người dùng
// @route   GET /api/posts/drafts
// @access  Private
exports.getDrafts = async (req, res) => {
  try {
    // Tìm tất cả bài viết nháp của người dùng
    const drafts = await Post.find({
      author: req.user.id,
      status: "draft",
    }).sort("-updatedAt");

    res.status(200).json({
      success: true,
      count: drafts.length,
      data: drafts,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nháp:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Không thể lấy danh sách bài viết nháp",
    });
  }
};

// Xuất các controller
module.exports = {
  getPosts: exports.getPosts,
  getPost: exports.getPost,
  createPost: exports.createPost,
  updatePost: exports.updatePost,
  deletePost: exports.deletePost,
  likePost: exports.likePost,
  unlikePost: exports.unlikePost,
  getUserPosts: exports.getUserPosts,
  incrementViews: exports.incrementViews,
  saveDraft: exports.saveDraft,
  getDrafts: exports.getDrafts,
};
