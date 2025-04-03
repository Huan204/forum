import React from "react";
import { createPortal } from "react-dom";
import { XCircle, Check } from "lucide-react";

// Các chủ đề màu phù hợp với định dạng trong ChatContext
const THEMES = {
  blue: {
    name: "Bạn bè",
    primary: "#4285F4",
    gradient: "from-blue-400 to-blue-600",
    lightBg: "#EFF6FF",
    darkBg: "#1E3A8A",
  },
  purple: {
    name: "Đối tác",
    primary: "#9966CC",
    gradient: "from-purple-400 to-purple-600",
    lightBg: "#F5F3FF",
    darkBg: "#4C1D95",
  },
  green: {
    name: "Thân mật",
    primary: "#34A853",
    gradient: "from-green-400 to-green-600",
    lightBg: "#ECFDF5",
    darkBg: "#064E3B",
  },
  pink: {
    name: "Xã giao",
    primary: "#EA4C89",
    gradient: "from-pink-400 to-pink-600",
    lightBg: "#FDF2F8",
    darkBg: "#831843",
  },
  orange: {
    name: "Cộng đồng",
    primary: "#FF9900",
    gradient: "from-orange-400 to-orange-600",
    lightBg: "#FEF3C7",
    darkBg: "#7C2D12",
  },
  red: {
    name: "Người thân",
    primary: "#EA4335",
    gradient: "from-red-400 to-red-600",
    lightBg: "#FEE2E2",
    darkBg: "#7F1D1D",
  },
  gray: {
    name: "Nhóm",
    primary: "#6B7280",
    gradient: "from-gray-400 to-gray-600",
    lightBg: "#F3F4F6",
    darkBg: "#1F2937",
  },
  indigo: {
    name: "Chàm",
    primary: "#4F46E5",
    gradient: "from-indigo-400 to-indigo-600",
    lightBg: "#EEF2FF",
    darkBg: "#312E81",
  },
};

const ThemeSelector = ({ onClose, selectedTheme, onThemeChange }) => {
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-[340px] max-w-md mx-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Chọn chủ đề
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(THEMES).map((themeKey) => (
            <button
              key={themeKey}
              onClick={() => onThemeChange(themeKey)}
              className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-transform hover:scale-110 ${
                  selectedTheme === themeKey
                    ? "ring-2 ring-offset-2 ring-white"
                    : ""
                }`}
                style={{
                  backgroundColor: THEMES[themeKey].primary,
                }}
              >
                {selectedTheme === themeKey && (
                  <Check className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-xs text-center text-gray-600 dark:text-gray-300">
                {THEMES[themeKey].name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ThemeSelector;
export { THEMES };
