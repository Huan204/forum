const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "../uploads");
const imagesDir = path.join(uploadDir, "images");
const filesDir = path.join(uploadDir, "files");

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

// Cấu hình multer cho upload file và ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Xác định thư mục lưu trữ dựa trên loại file
    if (file.mimetype.startsWith("image/")) {
      cb(null, imagesDir);
    } else {
      cb(null, filesDir);
    }
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

// Giới hạn kích thước file và định dạng
const fileFilter = (req, file, cb) => {
  // Kiểm tra nếu là ảnh
  if (file.fieldname === "images" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Chỉ chấp nhận file ảnh!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Lấy danh sách đoạn chat (conversations)
router.get("/conversations", protect, async (req, res) => {
  try {
    // Tìm tất cả người dùng mà người dùng hiện tại đã nhắn tin
    const sentMessages = await Message.find({ sender: req.user._id }).distinct(
      "recipient"
    );

    const receivedMessages = await Message.find({
      recipient: req.user._id,
    }).distinct("sender");

    // Kết hợp và loại bỏ trùng lặp
    const conversationUserIds = [
      ...new Set([...sentMessages, ...receivedMessages]),
    ];

    // Lấy thông tin chi tiết về người dùng
    const conversations = await User.find({
      _id: { $in: conversationUserIds },
    }).select("username name avatar lastActive");

    // Lấy tin nhắn gần nhất và số tin nhắn chưa đọc cho mỗi cuộc trò chuyện
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (user) => {
        // Lấy tin nhắn gần nhất
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, recipient: user._id },
            { sender: user._id, recipient: req.user._id },
          ],
        }).sort({ createdAt: -1 });

        // Đếm tin nhắn chưa đọc
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          recipient: req.user._id,
          isRead: false,
        });

        return {
          _id: user._id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          lastActive: user.lastActive,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                sender: lastMessage.sender,
              }
            : null,
          unreadCount,
        };
      })
    );

    // Sắp xếp theo tin nhắn gần nhất
    conversationsWithDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    });

    res.json(conversationsWithDetails);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đoạn chat:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy lịch sử chat giữa hai người dùng
router.get("/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy tin nhắn giữa hai người dùng
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    // Đánh dấu tin nhắn là đã đọc
    await Message.updateMany(
      { sender: userId, recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử chat:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Gửi tin nhắn mới
router.post("/", protect, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin người nhận hoặc nội dung tin nhắn" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });

    // Populate sender info cho socket event
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username name avatar")
      .populate("recipient", "username name avatar");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Gửi nhiều ảnh
router.post(
  "/images",
  protect,
  upload.array("images", 10),
  async (req, res) => {
    try {
      console.log("Bắt đầu xử lý upload ảnh");
      const { recipientId } = req.body;
      const files = req.files;

      if (!recipientId) {
        return res.status(400).json({ message: "Thiếu thông tin người nhận" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Không tìm thấy ảnh" });
      }

      console.log(`Đã nhận ${files.length} ảnh để upload`);

      // Chuẩn bị thông tin ảnh
      const imageAttachments = files.map((file) => {
        // Tạo đường dẫn đơn giản hơn để truy cập từ client
        const filename = path.basename(file.path);
        const imageUrl = `/uploads/images/${filename}`;

        console.log("Tạo URL ảnh:", imageUrl, "từ file path:", file.path);

        return {
          url: imageUrl,
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
        };
      });

      console.log("Đã xử lý thông tin ảnh:", JSON.stringify(imageAttachments));

      // Tạo tin nhắn với ảnh
      const messageData = {
        sender: req.user._id,
        recipient: recipientId,
        content: req.body.content || "",
        type: "image",
        images: imageAttachments,
      };

      console.log(
        "Chuẩn bị tạo tin nhắn với dữ liệu:",
        JSON.stringify(messageData)
      );

      const message = await Message.create(messageData);
      console.log("Đã tạo tin nhắn trong database với ID:", message._id);

      // Populate sender info cho socket event
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username name avatar")
        .populate("recipient", "username name avatar");

      console.log("Đã hoàn thành xử lý");
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error);
      return res.status(500).json({
        message: "Lỗi khi xử lý yêu cầu",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

// Gửi file
router.post("/file", protect, upload.single("file"), async (req, res) => {
  try {
    console.log("Bắt đầu xử lý upload file");
    const { recipientId } = req.body;
    const file = req.file;

    if (!recipientId) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận" });
    }

    if (!file) {
      return res.status(400).json({ message: "Không tìm thấy file" });
    }

    console.log(`Đã nhận file để upload: ${file.originalname}`);

    // Chuẩn bị thông tin file
    const filename = path.basename(file.path);
    const fileUrl = `/uploads/files/${filename}`;

    console.log("Tạo URL file:", fileUrl, "từ file path:", file.path);

    const fileAttachment = {
      url: fileUrl,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };

    console.log("Đã xử lý thông tin file:", JSON.stringify(fileAttachment));

    // Tạo tin nhắn với file đính kèm
    const messageData = {
      sender: req.user._id,
      recipient: recipientId,
      content: req.body.content || "",
      type: "file",
      file: fileAttachment,
    };

    console.log(
      "Chuẩn bị tạo tin nhắn với dữ liệu:",
      JSON.stringify(messageData)
    );

    const message = await Message.create(messageData);
    console.log("Đã tạo tin nhắn trong database với ID:", message._id);

    // Populate sender info cho socket event
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username name avatar")
      .populate("recipient", "username name avatar");

    console.log("Đã hoàn thành xử lý");
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Lỗi khi gửi file:", error);
    return res.status(500).json({
      message: "Lỗi khi xử lý yêu cầu",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Đánh dấu tin nhắn là đã đọc
router.put("/mark-read/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Message.updateMany(
      { sender: userId, recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      message: "Đã đánh dấu tin nhắn là đã đọc",
      updatedCount: result.nModified,
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đánh dấu tất cả tin nhắn là đã đọc
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    const result = await Message.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      message: "Đã đánh dấu tất cả tin nhắn là đã đọc",
      updatedCount: result.nModified || result.modifiedCount,
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu tất cả tin nhắn đã đọc:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
