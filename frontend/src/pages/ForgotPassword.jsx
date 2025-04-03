import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Xác nhận email đã gửi

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Kiểm tra đầu vào
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email của bạn");
      return;
    }

    if (!validateEmail(email)) {
      setError("Vui lòng nhập một địa chỉ email hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      setMessage("Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu cho bạn");
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
        {step === 1 && (
          <p className="text-gray-600 mt-2">
            Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu
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

      {step === 1 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Địa chỉ email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
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
                Gửi liên kết đặt lại
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-green-500 mb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4">Kiểm tra email của bạn</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến{" "}
            <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến của bạn.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Nếu bạn không thấy email trong hộp thư đến, vui lòng kiểm tra thư
            mục spam.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setStep(1)}
              className="text-primary-600 hover:text-primary-800"
            >
              Thử với email khác
            </button>
            <Link to="/login" className="text-gray-500 hover:text-gray-700">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
