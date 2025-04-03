const mongoose = require("mongoose");
const Post = require("./models/Post");
require("dotenv").config();

// Sử dụng DATABASE_URL thay vì MONGO_URI
const dbUrl = process.env.DATABASE_URL;
console.log("Đang kết nối đến:", dbUrl);

mongoose
  .connect(dbUrl)
  .then(async () => {
    console.log("Đã kết nối MongoDB thành công");

    // Đặt lại lượt xem về 0 và xóa danh sách uniqueViewers
    const result = await Post.updateMany(
      {},
      {
        views: 0,
        uniqueViewers: [],
      }
    );

    console.log(`Đã đặt lại lượt xem cho ${result.modifiedCount} bài viết`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });
