const mongoose = require("mongoose");

const connectDB = async () => {
  const databaseUrl = process.env.DATABASE_URL || process.env.MONGO_URI;

  if (!databaseUrl) {
    console.error(
      "Thiếu DATABASE_URL (hoặc MONGO_URI). Hãy tạo backend/.env từ README.md trước khi khởi động server."
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(databaseUrl, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Không thể kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
