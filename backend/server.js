const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorMiddleware");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /^https?:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin không được phép"));
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Tùy chỉnh morgan để bỏ qua các request đến health-check endpoint
app.use(
  morgan((tokens, req, res) => {
    // Bỏ qua các request đến health-check endpoint
    if (req.url.includes("/health-check")) {
      return null;
    }

    // Log bình thường các request khác
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("Serving static files from:", path.join(__dirname, "uploads"));

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));
console.log("Serving public folder from:", path.join(__dirname, "public"));

// Thêm middleware để ghi log các yêu cầu tới static files
app.use("/uploads", (req, res, next) => {
  console.log(`Static file request: ${req.method} ${req.url}`);
  next();
});

// Import main router
const apiRoutes = require("./routes/index");
const messageRoutes = require("./routes/messageRoutes");

// API Routes - sử dụng router tập trung
app.use("/api", apiRoutes);
app.use("/api/messages", messageRoutes);

// Thêm route kiểm tra socket.io
app.get("/socket-test", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Socket.IO Test</title>
        <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const socket = io();
            const log = (msg) => {
              const div = document.createElement('div');
              div.textContent = msg;
              document.getElementById('logs').appendChild(div);
            };

            socket.on('connect', () => {
              log('Connected to socket server!');
            });

            socket.on('connect_error', (err) => {
              log('Connection error: ' + err.message);
            });

            socket.on('disconnect', () => {
              log('Disconnected from socket server.');
            });
          });
        </script>
      </head>
      <body>
        <h1>Socket.IO Test Page</h1>
        <div id="logs"></div>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO
const Message = require("./models/Message");

// Lưu trữ kết nối Socket.IO
const userSockets = new Map();
const socketUsers = new Map();

// Socket Middleware - Xác thực người dùng qua token
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log(
      "Socket authentication attempt with token:",
      token ? "Token received" : "No token"
    );

    if (!token) {
      return next(new Error("Authentication error: Token is missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log("Socket authenticated for user:", decoded.id);

      // Cập nhật trạng thái user thành online
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastActive: Date.now(),
      });

      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      next(new Error("Authentication error: Invalid token"));
    }
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: " + error.message));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Lưu thông tin kết nối
  userSockets.set(socket.userId, socket.id);
  socketUsers.set(socket.id, socket.userId);

  // Thông báo cho tất cả người dùng về trạng thái online
  io.emit("user_status", { userId: socket.userId, isOnline: true });

  // Xử lý tin nhắn mới
  socket.on("send_message", async (data) => {
    try {
      const { recipientId, content } = data;

      // Lưu tin nhắn vào database
      const message = await Message.create({
        sender: socket.userId,
        recipient: recipientId,
        content: content,
      });

      // Populate thông tin để gửi đi
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username name avatar")
        .populate("recipient", "username name avatar");

      // Gửi tin nhắn cho người nhận nếu đang online
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("new_message", populatedMessage);
      }

      // Gửi lại cho người gửi để xác nhận
      socket.emit("message_sent", populatedMessage);

      // Thông báo có tin nhắn mới
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("notification", {
          type: "new_message",
          message: `Bạn có tin nhắn mới từ ${
            populatedMessage.sender.name || populatedMessage.sender.username
          }`,
          data: populatedMessage,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Không thể gửi tin nhắn" });
    }
  });

  // Xử lý tin nhắn media (ảnh hoặc file)
  socket.on("media_sent", async (data) => {
    try {
      const { messageId, recipientId } = data;
      console.log(
        `Nhận thông báo media_sent cho tin nhắn: ${messageId}, đến người nhận: ${recipientId}`
      );

      // Lấy thông tin đầy đủ của tin nhắn từ database
      const message = await Message.findById(messageId)
        .populate("sender", "username name avatar")
        .populate("recipient", "username name avatar");

      if (!message) {
        console.error(`Không tìm thấy tin nhắn với ID: ${messageId}`);
        return;
      }

      // Gửi tin nhắn đến người nhận nếu họ đang online
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        console.log(
          `Gửi tin nhắn media đến người nhận: ${recipientId} (Socket ID: ${recipientSocketId})`
        );
        io.to(recipientSocketId).emit("new_media_message", message);

        // Thông báo có tin nhắn mới
        io.to(recipientSocketId).emit("notification", {
          type: "new_media_message",
          message: `Bạn có ${
            message.type === "image" ? "ảnh" : "tệp tin"
          } mới từ ${message.sender.name || message.sender.username}`,
          data: message,
        });
      } else {
        console.log(
          `Người nhận ${recipientId} không online, không gửi realtime`
        );
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn media:", error);
      socket.emit("error", { message: "Không thể xử lý tin nhắn media" });
    }
  });

  // Đánh dấu tin nhắn đã đọc
  socket.on("mark_read", async ({ senderId }) => {
    try {
      await Message.updateMany(
        { sender: senderId, recipient: socket.userId, isRead: false },
        { isRead: true }
      );

      // Thông báo cho người gửi rằng tin nhắn đã được đọc
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_read", {
          by: socket.userId,
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Xử lý người dùng typing
  socket.on("typing", ({ recipientId }) => {
    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", {
        userId: socket.userId,
        isTyping: true,
      });
    }
  });

  socket.on("stop_typing", ({ recipientId }) => {
    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", {
        userId: socket.userId,
        isTyping: false,
      });
    }
  });

  // Xử lý thay đổi chủ đề chat
  socket.on("theme_changed", ({ conversationId, theme }) => {
    try {
      console.log(
        `Người dùng ${socket.userId} đã thay đổi chủ đề chat ${conversationId} thành ${theme}`
      );

      // Gửi thông báo đến đối phương
      const recipientSocketId = userSockets.get(conversationId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("theme_changed", {
          conversationId: socket.userId, // conversationId của đối phương là userId của người gửi
          theme: theme,
        });
      } else {
        console.log(
          `Đối phương ${conversationId} không online, không thể gửi thông báo thay đổi chủ đề`
        );
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thay đổi chủ đề:", error);
    }
  });

  // Xử lý ngắt kết nối
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.userId}`);

    // Cập nhật trạng thái người dùng thành offline
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastActive: Date.now(),
      });

      // Thông báo cho tất cả người dùng rằng người này đã offline
      io.emit("user_status", {
        userId: socket.userId,
        isOnline: false,
        lastActive: Date.now(),
      });

      // Xóa khỏi các maps
      userSockets.delete(socket.userId);
      socketUsers.delete(socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.error(`Không thể khởi động server: ${err.message}`);
    process.exit(1);
  }
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Môi trường: ${process.env.NODE_ENV || "development"}`);
  console.log("MongoDB: đã cấu hình kết nối");
  console.log(`Frontend URL: http://localhost:3000`);
});

// Handle unexpected errors
process.on("unhandledRejection", (err) => {
  console.log(`Lỗi: ${err.message}`);
  server.close(() => process.exit(1));
});
