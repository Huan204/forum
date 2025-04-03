/**
 * Tệp kết nối đến MongoDB
 * Sử dụng trong Backend để kết nối đến cơ sở dữ liệu
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Lấy chuỗi kết nối từ biến môi trường
const connectionString =
  process.env.MONGODB_URI || "mongodb://localhost:27017/forum";

/**
 * Thiết lập kết nối đến MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Kết nối MongoDB thành công!");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error.message);
    process.exit(1);
  }
};

// Xử lý sự kiện kết nối
mongoose.connection.on("error", (err) => {
  console.error(`Lỗi kết nối MongoDB: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB đã ngắt kết nối");
});

// Xử lý tắt ứng dụng đúng cách
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Kết nối MongoDB đã đóng do ứng dụng kết thúc");
  process.exit(0);
});

module.exports = connectDB;
