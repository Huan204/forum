const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi để debug
  console.error(error);

  // Mongoose lỗi ID không hợp lệ
  if (err.name === "CastError") {
    const message = "Không tìm thấy tài nguyên";
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose lỗi trùng lặp
  if (err.code === 11000) {
    const message = "Giá trị này đã tồn tại";
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose lỗi validation
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new Error(message.join(", "));
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Lỗi máy chủ",
  });
};

module.exports = errorMiddleware;
