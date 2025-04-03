import { useState, useEffect, useCallback } from "react";
import { checkServerConnection } from "../services/api";

/**
 * Hook để kiểm tra và theo dõi trạng thái kết nối server
 * @param {number} interval - Thời gian kiểm tra lại (ms)
 * @returns {Object} - Thông tin về trạng thái kết nối
 */
export const useCheckConnection = (interval = 300000) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const connected = await checkServerConnection();
      setIsConnected(connected);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Lỗi khi kiểm tra kết nối:", error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  // Kiểm tra kết nối khi mount component
  useEffect(() => {
    console.log("[CONNECTION] Thiết lập kiểm tra kết nối mỗi 5 phút");
    checkConnection();

    // Thiết lập kiểm tra định kỳ
    const intervalId = setInterval(checkConnection, interval);

    return () => clearInterval(intervalId);
  }, [checkConnection, interval]);

  // Hàm kiểm tra thủ công
  const checkNow = useCallback(() => {
    return checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    lastChecked,
    isChecking,
    checkNow,
  };
};

export default useCheckConnection;
