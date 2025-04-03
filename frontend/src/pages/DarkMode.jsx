import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

const DarkMode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lấy trạng thái chế độ tối từ localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Lưu các tùy chọn chế độ tối
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("darkModeSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          auto: false, // Tự động theo thời gian
          startTime: "20:00", // Bắt đầu chế độ tối
          endTime: "06:00", // Kết thúc chế độ tối
          followSystem: false, // Theo cài đặt hệ thống
          darkComponents: {
            navbar: true,
            sidebar: true,
            content: true,
            codeBlocks: true,
            tables: true,
          },
        };
  });

  // Danh sách các theme màu
  const [colorThemes, setColorThemes] = useState([
    {
      id: "default",
      name: "Mặc định",
      primary: "#4F46E5",
      secondary: "#818CF8",
      selected: true,
    },
    {
      id: "emerald",
      name: "Ngọc lục bảo",
      primary: "#10B981",
      secondary: "#6EE7B7",
      selected: false,
    },
    {
      id: "amber",
      name: "Hổ phách",
      primary: "#F59E0B",
      secondary: "#FCD34D",
      selected: false,
    },
    {
      id: "rose",
      name: "Hoa hồng",
      primary: "#F43F5E",
      secondary: "#FB7185",
      selected: false,
    },
    {
      id: "sky",
      name: "Bầu trời",
      primary: "#0EA5E9",
      secondary: "#7DD3FC",
      selected: false,
    },
    {
      id: "purple",
      name: "Tím",
      primary: "#8B5CF6",
      secondary: "#C4B5FD",
      selected: false,
    },
  ]);

  // Cập nhật trạng thái trên toàn trang
  useEffect(() => {
    const root = window.document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Lưu cài đặt vào localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    localStorage.setItem("darkModeSettings", JSON.stringify(settings));

    // Theo dõi thời gian nếu bật tự động
    let autoTimer;
    if (settings.auto) {
      const checkTime = () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMinute] = settings.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = settings.endTime.split(":").map(Number);

        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;

        // Kiểm tra nếu thời gian hiện tại nằm trong khoảng chế độ tối
        let shouldBeDark;
        if (startTimeMinutes < endTimeMinutes) {
          // Trường hợp bình thường: ví dụ 20:00 - 06:00
          shouldBeDark =
            currentTime >= startTimeMinutes && currentTime < endTimeMinutes;
        } else {
          // Trường hợp qua đêm: ví dụ 22:00 - 06:00
          shouldBeDark =
            currentTime >= startTimeMinutes || currentTime < endTimeMinutes;
        }

        setIsDarkMode(shouldBeDark);
      };

      checkTime(); // Kiểm tra ngay lập tức
      autoTimer = setInterval(checkTime, 60000); // Kiểm tra mỗi phút
    }

    return () => {
      if (autoTimer) clearInterval(autoTimer);
    };
  }, [isDarkMode, settings]);

  // Theo dõi cài đặt hệ thống nếu bật tùy chọn
  useEffect(() => {
    if (settings.followSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      setIsDarkMode(mediaQuery.matches);

      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [settings.followSystem]);

  // Cập nhật cài đặt
  const updateSettings = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Cập nhật cài đặt component con
  const updateDarkComponents = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      darkComponents: {
        ...prev.darkComponents,
        [key]: value,
      },
    }));
  };

  // Chọn theme màu
  const selectColorTheme = (themeId) => {
    setColorThemes((prev) =>
      prev.map((theme) => ({
        ...theme,
        selected: theme.id === themeId,
      }))
    );

    // Cập nhật biến CSS cho theme màu
    const selectedTheme = colorThemes.find((theme) => theme.id === themeId);
    if (selectedTheme) {
      const root = document.documentElement;
      root.style.setProperty("--color-primary", selectedTheme.primary);
      root.style.setProperty("--color-secondary", selectedTheme.secondary);

      // Lưu cài đặt màu vào localStorage
      localStorage.setItem("colorTheme", themeId);
    }
  };

  // Reset tất cả cài đặt về mặc định
  const resetSettings = () => {
    setIsDarkMode(false);
    setSettings({
      auto: false,
      startTime: "20:00",
      endTime: "06:00",
      followSystem: false,
      darkComponents: {
        navbar: true,
        sidebar: true,
        content: true,
        codeBlocks: true,
        tables: true,
      },
    });
    selectColorTheme("default");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cài đặt chế độ hiển thị</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Chế độ tối</h2>

        <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
          <div>
            <h3 className="font-medium">Bật chế độ tối</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chuyển đổi giữa giao diện sáng và tối
            </p>
          </div>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
            <input
              type="checkbox"
              id="toggle-darkmode"
              className="absolute w-6 h-6 opacity-0"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <label
              htmlFor="toggle-darkmode"
              className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                isDarkMode ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute inset-y-0 z-10 block w-6 h-6 rounded-full transform transition-transform bg-white ${
                  isDarkMode ? "right-0" : "left-0"
                }`}
              ></span>
            </label>
          </div>
        </div>

        <div className="py-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium">Tự động chuyển đổi theo thời gian</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tự động kích hoạt chế độ tối trong khung giờ đã định
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
              <input
                type="checkbox"
                id="toggle-auto"
                className="absolute w-6 h-6 opacity-0"
                checked={settings.auto}
                onChange={() => updateSettings("auto", !settings.auto)}
              />
              <label
                htmlFor="toggle-auto"
                className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                  settings.auto ? "bg-primary-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute inset-y-0 z-10 block w-6 h-6 rounded-full transform transition-transform bg-white ${
                    settings.auto ? "right-0" : "left-0"
                  }`}
                ></span>
              </label>
            </div>
          </div>

          {settings.auto && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Bắt đầu
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={settings.startTime}
                  onChange={(e) => updateSettings("startTime", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Kết thúc
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={settings.endTime}
                  onChange={(e) => updateSettings("endTime", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
          <div>
            <h3 className="font-medium">Theo cài đặt hệ thống</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Theo chế độ tối của thiết bị
            </p>
          </div>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
            <input
              type="checkbox"
              id="toggle-system"
              className="absolute w-6 h-6 opacity-0"
              checked={settings.followSystem}
              onChange={() =>
                updateSettings("followSystem", !settings.followSystem)
              }
            />
            <label
              htmlFor="toggle-system"
              className={`block w-full h-full overflow-hidden rounded-full cursor-pointer ${
                settings.followSystem ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute inset-y-0 z-10 block w-6 h-6 rounded-full transform transition-transform bg-white ${
                  settings.followSystem ? "right-0" : "left-0"
                }`}
              ></span>
            </label>
          </div>
        </div>

        <div className="py-4 border-b dark:border-gray-700">
          <h3 className="font-medium mb-3">Thành phần áp dụng chế độ tối</h3>
          <div className="space-y-2">
            {Object.entries(settings.darkComponents).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  id={`component-${key}`}
                  type="checkbox"
                  checked={value}
                  onChange={() => updateDarkComponents(key, !value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`component-${key}`}
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  {key === "navbar" && "Thanh điều hướng"}
                  {key === "sidebar" && "Thanh bên"}
                  {key === "content" && "Nội dung"}
                  {key === "codeBlocks" && "Khối mã"}
                  {key === "tables" && "Bảng"}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Màu sắc chủ đề</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {colorThemes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => selectColorTheme(theme.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                theme.selected
                  ? "ring-2 ring-primary-500 border-primary-500"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex mb-2">
                <div
                  className="w-6 h-6 rounded-full mr-2"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.secondary }}
                ></div>
              </div>
              <div className="text-sm font-medium">{theme.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={resetSettings}
          variant="outline"
          className="text-gray-700 dark:text-gray-300"
        >
          Khôi phục mặc định
        </Button>
        <Button
          onClick={() => navigate("/")}
          className="bg-primary-600 text-white"
        >
          Lưu cài đặt
        </Button>
      </div>

      <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Xem trước chế độ tối</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 mb-2"></div>
            <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-3/5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkMode;
