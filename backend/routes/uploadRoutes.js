const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/authMiddleware");

console.log(">>> uploadRoutes.js module evaluated - Cleaned Version");

// Route test đơn giản không cần xác thực
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload API đang hoạt động!",
    timestamp: new Date().toISOString(),
  });
});

// Thư mục lưu trữ file tạm thời và file hoàn chỉnh
const UPLOAD_DIR = path.join(__dirname, "../uploads");
const TEMP_DIR = path.join(__dirname, "../uploads/temp");
const VIDEOS_DIR = path.join(__dirname, "../uploads/videos");

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

const uploadSessions = {};

// Cấu hình lưu trữ cho tải lên từng phần
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_DIR);
  },
  filename: function (req, file, cb) {
    const uploadId = req.headers["x-upload-id"];
    const chunkIndex = req.headers["x-chunk-index"];
    if (!uploadId || chunkIndex === undefined) {
      return cb(new Error("Missing upload ID or chunk index"));
    }
    cb(null, `${uploadId}-${chunkIndex}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB cho mỗi chunk
  },
});

// --- START: Avatar Upload Configuration ---
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    // Quan trọng: Đảm bảo req.user tồn tại (do có middleware protect)
    const userId = req.user ? req.user._id : "unknown";
    cb(null, `avatar-${userId}-${uniqueSuffix}${extension}`);
  },
});
const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên file ảnh (JPEG, PNG, GIF)!"), false);
  }
};
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: avatarFileFilter,
}).single("avatar"); // Mong đợi field tên là 'avatar'
// --- END: Avatar Upload Configuration ---

// --- START: Avatar Upload Route ---
// Bỏ lại middleware 'protect' để kiểm tra
router.post("/avatar", (req, res) => {
  uploadAvatar(req, res, function (err) {
    // Log lỗi nếu có
    if (err) {
      console.error("Error during avatar upload middleware:", err);
      if (err instanceof multer.MulterError) {
        let message = "Lỗi khi tải lên avatar.";
        if (err.code === "LIMIT_FILE_SIZE") {
          message = "Kích thước file không được vượt quá 5MB.";
        }
        return res.status(400).json({ success: false, message });
      } else {
        return res.status(400).json({
          success: false,
          message: err.message || "Lỗi không xác định khi tải lên avatar.",
        });
      }
    }

    // Kiểm tra lại req.file sau khi middleware chạy
    if (!req.file) {
      console.error(
        "req.file is missing after uploadAvatar middleware ran successfully."
      );
      return res.status(400).json({
        success: false,
        message: "Không có file nào được tải lên hoặc có lỗi xử lý file.",
      });
    }

    // Upload thành công
    console.log(`Avatar uploaded for user ${req.user._id}:`, req.file.filename);
    const avatarUrl = `/uploads/${req.file.filename}`;

    // **QUAN TRỌNG:** Logic cập nhật DB người dùng ở đây!
    // Ví dụ:
    // try {
    //   await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
    // } catch (dbError) { ... xử lý lỗi DB, có thể xóa file ... }

    res.status(200).json({
      success: true,
      message: "Tải lên ảnh đại diện thành công!",
      avatarUrl: avatarUrl,
    });
  });
});
// --- END: Avatar Upload Route ---

// Khởi tạo phiên tải lên
router.post("/init", protect, (req, res) => {
  try {
    const { filename, fileSize, totalChunks, contentType } = req.body;
    if (!filename || !fileSize || !totalChunks || !contentType) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin cần thiết để khởi tạo phiên tải lên.",
      });
    }

    const uploadId = uuidv4();
    const now = Date.now();

    uploadSessions[uploadId] = {
      userId: req.user._id,
      filename,
      fileSize,
      totalChunks,
      contentType,
      receivedChunks: 0,
      chunkMap: {},
      createdAt: now,
      lastUpdatedAt: now,
    };

    console.log(
      `Khởi tạo phiên tải lên mới: ${uploadId} cho người dùng ${req.user._id}`
    );

    return res.status(201).json({
      success: true,
      uploadId,
      message: "Phiên tải lên đã được khởi tạo.",
    });
  } catch (error) {
    console.error("Lỗi khi khởi tạo phiên tải lên:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi khởi tạo phiên tải lên.",
    });
  }
});

// Tải lên một chunk
router.post("/chunk", protect, upload.single("chunk"), (req, res) => {
  try {
    const uploadId = req.headers["x-upload-id"];
    const chunkIndex = parseInt(req.headers["x-chunk-index"], 10);

    if (!uploadId || isNaN(chunkIndex)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin upload ID hoặc chỉ số chunk.",
      });
    }

    // Kiểm tra phiên tải lên có tồn tại không
    const session = uploadSessions[uploadId];
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Phiên tải lên không tồn tại hoặc đã hết hạn.",
      });
    }

    // Kiểm tra quyền sở hữu
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền tải lên chunk cho phiên này.",
      });
    }

    // Cập nhật thông tin phiên
    session.chunkMap[chunkIndex] = req.file.path;
    session.receivedChunks += 1;
    session.lastUpdatedAt = Date.now();

    console.log(
      `Đã nhận chunk ${chunkIndex} cho phiên ${uploadId}. Tổng số chunk nhận: ${session.receivedChunks}/${session.totalChunks}`
    );

    return res.status(200).json({
      success: true,
      message: `Chunk ${chunkIndex} đã được tải lên thành công.`,
      progress: {
        current: session.receivedChunks,
        total: session.totalChunks,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tải lên chunk:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi tải lên chunk.",
    });
  }
});

// Hoàn thành quá trình tải lên
router.post("/complete", protect, async (req, res) => {
  try {
    const { uploadId } = req.body;
    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã phiên tải lên (uploadId).",
      });
    }

    // Kiểm tra phiên tải lên
    const session = uploadSessions[uploadId];
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Phiên tải lên không tồn tại hoặc đã hết hạn.",
      });
    }

    // Kiểm tra quyền sở hữu
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền hoàn thành phiên tải lên này.",
      });
    }

    // Kiểm tra tất cả các chunk đã nhận chưa
    if (session.receivedChunks !== session.totalChunks) {
      return res.status(400).json({
        success: false,
        message: `Chưa nhận đủ tất cả các chunk. Đã nhận: ${session.receivedChunks}/${session.totalChunks}`,
      });
    }

    console.log(
      `Bắt đầu ghép ${session.totalChunks} chunk cho phiên ${uploadId}...`
    );

    // Tạo tên file đầu ra
    const fileExtension = path.extname(session.filename);
    const outputFileName = `video-${
      req.user._id
    }-${Date.now()}${fileExtension}`;
    const outputPath = path.join(VIDEOS_DIR, outputFileName);

    // Tạo stream ghi file
    const outputStream = fs.createWriteStream(outputPath);

    // Ghép các chunks theo thứ tự
    for (let i = 0; i < session.totalChunks; i++) {
      const chunkPath = session.chunkMap[i];
      if (!chunkPath) {
        return res.status(500).json({
          success: false,
          message: `Không tìm thấy chunk ${i}`,
        });
      }

      try {
        // Đọc chunk và ghi vào file đầu ra
        const chunkData = fs.readFileSync(chunkPath);
        outputStream.write(chunkData);

        // Xóa chunk sau khi đã ghép
        fs.unlinkSync(chunkPath);
      } catch (err) {
        console.error(`Lỗi khi xử lý chunk ${i}:`, err);
        return res.status(500).json({
          success: false,
          message: `Lỗi khi xử lý chunk ${i}`,
        });
      }
    }

    // Đóng stream
    outputStream.end();

    // Xử lý khi hoàn thành ghi file
    outputStream.on("finish", () => {
      const videoUrl = `/uploads/videos/${outputFileName}`;
      console.log(`Hoàn thành tải lên video: ${videoUrl}`);

      // Xóa thông tin phiên tải lên
      delete uploadSessions[uploadId];

      // Trả về URL video
      return res.status(200).json({
        success: true,
        message: "Video đã được tải lên thành công.",
        url: videoUrl,
      });
    });

    // Xử lý lỗi khi ghi file
    outputStream.on("error", (err) => {
      console.error("Lỗi khi ghi file video:", err);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi hoàn thành tải lên video.",
      });
    });
  } catch (error) {
    console.error("Lỗi khi hoàn thành tải lên:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi hoàn thành tải lên.",
    });
  }
});

// Hàm dọn dẹp phiên tải lên cũ
function cleanupUploadSession(uploadId) {
  const session = uploadSessions[uploadId];
  if (!session) return;

  // Xóa tất cả các chunk tạm
  for (const chunkPath of Object.values(session.chunkMap)) {
    try {
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    } catch (err) {
      console.error(`Lỗi khi xóa chunk ${chunkPath}:`, err);
    }
  }

  // Xóa thông tin phiên
  delete uploadSessions[uploadId];
  console.log(`Đã dọn dẹp phiên tải lên ${uploadId}`);
}

// Dọn dẹp các phiên cũ sau mỗi giờ
setInterval(() => {
  const now = Date.now();
  const expireTime = 3600 * 1000; // 1 giờ

  Object.keys(uploadSessions).forEach((uploadId) => {
    const session = uploadSessions[uploadId];
    if (now - session.lastUpdatedAt > expireTime) {
      console.log(`Phiên tải lên ${uploadId} đã hết hạn và sẽ bị xóa.`);
      cleanupUploadSession(uploadId);
    }
  });
}, 60 * 60 * 1000); // Chạy mỗi 1 giờ

module.exports = router;
