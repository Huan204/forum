import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaHome,
  FaNewspaper,
  FaFolderOpen,
  FaSearch,
  FaSignInAlt,
  FaUserPlus,
  FaQuestionCircle,
  FaEnvelope,
  FaFileAlt,
  FaShieldAlt,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Danh sách các liên kết
  const links = [
    { name: "Trang chủ", path: "/", icon: <FaHome /> },
    { name: "Bài viết", path: "/posts", icon: <FaNewspaper /> },
    { name: "Danh mục", path: "/categories", icon: <FaFolderOpen /> },
    { name: "Tìm kiếm", path: "/search", icon: <FaSearch /> },
    { name: "Đăng nhập", path: "/login", icon: <FaSignInAlt /> },
    { name: "Đăng ký", path: "/register", icon: <FaUserPlus /> },
  ];

  // Danh sách các mục hỗ trợ
  const supports = [
    { name: "Câu hỏi thường gặp", path: "/faq", icon: <FaQuestionCircle /> },
    { name: "Liên hệ", path: "/contact", icon: <FaEnvelope /> },
    { name: "Điều khoản", path: "/terms", icon: <FaFileAlt /> },
    { name: "Chính sách", path: "/privacy", icon: <FaShieldAlt /> },
  ];

  // Danh sách các mạng xã hội
  const socials = [
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      url: "https://facebook.com",
      color: "hover:bg-blue-600",
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      url: "https://twitter.com",
      color: "hover:bg-blue-400",
    },
    {
      name: "Instagram",
      icon: <FaInstagram />,
      url: "https://instagram.com",
      color: "hover:bg-pink-600",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn />,
      url: "https://linkedin.com",
      color: "hover:bg-blue-800",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white pb-6 relative">
      {/* Wave top */}
      <div className="h-16 overflow-hidden transform rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="h-full w-full text-white"
          fill="currentColor"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,97.92,134.22,84.8,190.87,67.88,250.3,50.34,286.71,64.76,321.39,56.44Z" />
        </svg>
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              animation: `float-around ${Math.random() * 10 + 15}s linear ${Math.random() * 5}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          {/* Logo và thông tin */}
          <div className="transform transition-all duration-500 hover:-translate-y-1">
            <Link
              to="/"
              className="text-white text-xl font-bold flex items-center mb-4 group"
            >
              <div
                className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2 
                            transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              >
                <span className="font-bold">D</span>
              </div>
              <span className="relative overflow-hidden">
                DIỄN ĐÀN
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              Nơi chia sẻ kiến thức, kinh nghiệm và kết nối cộng đồng. Tham gia
              ngay hôm nay để khám phá thế giới tri thức!
            </p>
            <div className="flex space-x-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white transition-all duration-300 hover:shadow-lg ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-blue-300 relative inline-block">
              Liên kết nhanh
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="text-blue-500 mr-2 transition-transform duration-300 group-hover:translate-x-1">
                      {link.icon}
                    </span>
                    <span className="group-hover:underline">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-blue-300 relative inline-block">
              Hỗ trợ
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              {supports.map((support) => (
                <li key={support.name}>
                  <Link
                    to={support.path}
                    className="text-gray-400 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="text-blue-500 mr-2 transition-transform duration-300 group-hover:translate-x-1">
                      {support.icon}
                    </span>
                    <span className="group-hover:underline">
                      {support.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 mb-8 transform transition-all shadow hover:shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <FaEnvelope className="mr-2 text-blue-400" /> Đăng ký cập nhật
              </h3>
              <p className="text-gray-400 text-sm">
                Nhận thông báo về bài viết mới và sự kiện
              </p>
            </div>
            <div className="md:col-span-2">
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-grow px-4 py-2 bg-gray-800/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                >
                  <FaHeart className="mr-2 animate-pulse" /> Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Phân cách */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          <p>© {currentYear} Diễn đàn. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-1">
            Được phát triển với{" "}
            <span className="text-red-500 animate-pulse">❤</span> bởi{" "}
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Team DEV
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
