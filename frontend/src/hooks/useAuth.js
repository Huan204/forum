import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Hook để sử dụng authentication context
 * @returns {Object} Context chứa thông tin người dùng và các hàm xác thực
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }

  return context;
};
