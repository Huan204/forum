import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Banner = ({ title, subtitle, image, overlay = true }) => {
  const [offset, setOffset] = useState(0);

  // Hiệu ứng parallax khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Mặc định nếu không truyền các prop
  const defaultTitle = "Tham gia cộng đồng diễn đàn của chúng tôi";
  const defaultSubtitle =
    "Khám phá kiến thức, chia sẻ trải nghiệm và kết nối với mọi người";
  const defaultImage =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

  // Tạo style cho hiệu ứng parallax
  const parallaxStyle = {
    backgroundImage: `url(${image || defaultImage})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    transform: `translateY(${offset * 0.3}px)`,
  };

  // Tạo các particle cho hiệu ứng
  const particles = Array.from({ length: 6 }, (_, i) => {
    const animDuration = Math.random() * 10 + 5;
    const sizeClass = Math.floor(Math.random() * 12) + 4;
    const opacityClass = Math.floor(Math.random() * 3) + 1;
    const delayClass = Math.floor(Math.random() * 4);

    return (
      <div
        key={i}
        className={`absolute rounded-full bg-white opacity-${opacityClass}0 
                    w-${sizeClass} h-${sizeClass}`}
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `pulse ${animDuration}s cubic-bezier(0.4, 0, 0.6, 1) infinite ${delayClass}s`,
        }}
      />
    );
  });

  return (
    <header className="relative overflow-hidden">
      {/* Background với hiệu ứng parallax */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={parallaxStyle}
      />

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80" />
      )}

      {/* Hiệu ứng particles */}
      <div className="absolute inset-0 overflow-hidden">{particles}</div>

      {/* Nội dung */}
      <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 
                     opacity-0 animate-[fadeInUp_1s_forwards]"
          >
            {title || defaultTitle}
          </h1>

          <p
            className="text-lg md:text-xl text-blue-100 mb-8 
                      opacity-0 animate-[fadeInUp_1s_0.3s_forwards]"
          >
            {subtitle || defaultSubtitle}
          </p>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute bottom-0 w-full h-full text-white"
              fill="currentColor"
            >
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,97.92,134.22,84.8,190.87,67.88,250.3,50.34,286.71,64.76,321.39,56.44Z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

// Banner với animation cho trang chủ
export const HomeBanner = () => {
  return (
    <Banner
      title="Chào mừng đến với Diễn đàn"
      subtitle="Nơi chia sẻ kiến thức, kinh nghiệm và kết nối cộng đồng. Tham gia ngay hôm nay để khám phá thế giới tri thức!"
      image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
    />
  );
};

// Banner nhỏ hơn cho các trang khác
export const PageBanner = ({ title, subtitle, image }) => {
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

export default Banner;
