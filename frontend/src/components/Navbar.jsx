import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Diễn đàn
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Trang chủ
            </Link>
            <Link to="/posts" className="text-gray-600 hover:text-gray-900">
              Bài viết
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Đăng nhập
            </Link>
            <Link to="/register" className="text-gray-600 hover:text-gray-900">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
