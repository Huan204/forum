import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import { resetPassword, verifyResetToken } from "../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Xác minh token khi component được tải
    const verifyToken = async () => {
      setIsVerifying(true);
      try {
        const response = await verifyResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("Thiếu token đặt lại mật khẩu");
      setTokenValid(false);
      setIsVerifying(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate form
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(token, formData.password);
      setMessage("Mật khẩu của bạn đã được đặt lại thành công");

      // Đặt timeout để chuyển hướng người dùng đến trang đăng nhập
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
        {tokenValid && (
          <p className="text-gray-600 mt-2">
            Nhập mật khẩu mới của bạn bên dưới
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
          {message}
        </div>
      )}

      {tokenValid ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
            </div>

            <div className="mb-6">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Đặt lại mật khẩu
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4">Liên kết không hợp lệ</h2>
          <p className="text-gray-600 mb-6">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
            cầu liên kết mới.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              to="/forgot-password"
              className="text-primary-600 hover:text-primary-800"
            >
              Yêu cầu liên kết mới
            </Link>
            <Link to="/login" className="text-gray-500 hover:text-gray-700">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
