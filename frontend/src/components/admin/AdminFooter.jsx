import React from "react";

const AdminFooter = () => {
  return (
    <footer className="bg-white border-t py-4 px-6 text-center text-gray-600">
      <p>© 2023 Hệ thống Diễn đàn. Tất cả quyền được bảo lưu.</p>
      <div className="mt-2 text-sm">
        <span className="mr-4">Phiên bản 1.0.0</span>
        <a href="#" className="text-blue-500 hover:underline mr-4">
          Chính sách bảo mật
        </a>
        <a href="#" className="text-blue-500 hover:underline">
          Điều khoản sử dụng
        </a>
      </div>
    </footer>
  );
};

export default AdminFooter;
