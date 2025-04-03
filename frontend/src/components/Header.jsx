import React from "react";
import { Link } from "react-router-dom";

const Header = ({ title, subtitle, image, overlay = true }) => {
  // Mặc định nếu không truyền các prop
  const defaultTitle = "Tham gia cộng đồng diễn đàn của chúng tôi";
  const defaultSubtitle =
    "Khám phá kiến thức, chia sẻ trải nghiệm và kết nối với mọi người";
  const defaultImage =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

  return (
    <header className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${image || defaultImage})` }}
      />

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80" />
      )}

      {/* Nội dung */}
      <div className="relative container mx-auto px-4 py-24 md:py-32 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {title || defaultTitle}
          </h1>

          <p className="text-lg md:text-xl text-blue-100 mb-8">
            {subtitle || defaultSubtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-blue-900 font-medium rounded-lg 
                        hover:bg-blue-50 transition-all shadow-lg"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg 
                        hover:bg-blue-700 transition-all shadow-lg 
                        border border-blue-500"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// Header với animation cho trang chủ
export const HomeHeader = () => {
  return (
    <Header
      title="Chào mừng đến với Diễn đàn"
      subtitle="Nơi chia sẻ kiến thức, kinh nghiệm và kết nối cộng đồng. Tham gia ngay hôm nay để khám phá thế giới tri thức!"
      image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
    />
  );
};

// Header nhỏ hơn cho các trang khác
export const PageHeader = ({ title, subtitle, image }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90" />

      {/* Nội dung */}
      <div className="relative container mx-auto px-4 py-16 z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h1>
          {subtitle && <p className="text-blue-100 text-lg">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default Header;
