const axios = require("axios");

// Thông tin danh mục cần thêm
const newCategory = {
  name: "Danh mục mới",
  description: "Mô tả về danh mục mới",
};

// Gửi request đến API
async function addCategory() {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/categories",
      newCategory
    );
    console.log("Kết quả:", response.data);
  } catch (error) {
    console.error("Lỗi:", error.response ? error.response.data : error.message);
  }
}

// Gọi hàm thêm danh mục
addCategory();
