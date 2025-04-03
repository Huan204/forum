import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useCheckConnection from "../hooks/useCheckConnection";

const ConnectionStatus = ({ className = "" }) => {
  const { isConnected, lastChecked, isChecking, checkNow } =
    useCheckConnection();
  const [showDetails, setShowDetails] = useState(false);

  // Định dạng thời gian cuối cùng kiểm tra
  const formatLastChecked = () => {
    if (!lastChecked) return "Chưa kiểm tra";

    // Định dạng thời gian
    return lastChecked.toLocaleTimeString();
  };

  // Nếu đang kết nối, không hiển thị gì cả
  if (isConnected && !isChecking && !showDetails) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg ${className} ${
          isConnected
            ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800/50"
            : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800/50"
        }`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex items-center">
          <motion.div
            animate={{
              scale: isChecking ? [1, 1.1, 1] : 1,
              rotate: isChecking ? 360 : 0,
            }}
            transition={{ duration: 1, repeat: isChecking ? Infinity : 0 }}
            className={`w-5 h-5 mr-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <div className="flex-1">
            <div className="font-medium">
              {isConnected ? "Đã kết nối" : "Mất kết nối đến server"}
            </div>
            <div className="text-xs mt-1">
              {isConnected
                ? "Kết nối đến server ổn định"
                : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đã khởi động."}
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  className="mt-2 text-xs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div>Kiểm tra lần cuối: {formatLastChecked()}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex mt-3 space-x-2">
          <button
            onClick={() => checkNow()}
            disabled={isChecking}
            className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-colors ${
              isConnected
                ? "bg-green-200 hover:bg-green-300 text-green-800 dark:bg-green-700 dark:hover:bg-green-600 dark:text-green-100"
                : "bg-red-200 hover:bg-red-300 text-red-800 dark:bg-red-700 dark:hover:bg-red-600 dark:text-red-100"
            }`}
          >
            {isChecking ? "Đang kiểm tra..." : "Kiểm tra lại"}
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`py-1 px-3 text-xs font-medium rounded-md transition-colors ${
              isConnected
                ? "bg-green-200 hover:bg-green-300 text-green-800 dark:bg-green-700 dark:hover:bg-green-600 dark:text-green-100"
                : "bg-red-200 hover:bg-red-300 text-red-800 dark:bg-red-700 dark:hover:bg-red-600 dark:text-red-100"
            }`}
          >
            {showDetails ? "Ẩn chi tiết" : "Chi tiết"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;
