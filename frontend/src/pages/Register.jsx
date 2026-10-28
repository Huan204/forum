import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

// Biến chứa các hiệu ứng
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const svgVariants = {
  hidden: { rotate: -5, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeInOut",
      yoyo: Infinity,
      repeatDelay: 10,
    },
  },
};

const pathVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 17,
    },
  },
  tap: { scale: 0.98 },
};

const errorVariants = {
  initial: { opacity: 0, y: -10, height: 0 },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const Register = () => {
  const { register, user, error, setError, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }

    // Clear any existing errors
    if (error) {
      setError(null);
    }

    // eslint-disable-next-line
  }, [user, navigate]);

  const handleChange = (e) => {
    // Clear errors when user starts typing
    if (formError) setFormError("");
    if (error) setError(null);

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate form
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (formData.username.length < 3) {
      setFormError("Tên người dùng phải có ít nhất 3 ký tự");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Mật khẩu nhập lại không khớp");
      return;
    }

    setIsLoading(true);

    try {
      // Không gửi confirmPassword lên server
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);

      if (result?.success) {
        setSuccess(true);
        // Đợi hiệu ứng hoàn thành trước khi chuyển trang
        setTimeout(() => {
          // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
          navigate("/login");
        }, 1500);
      } else {
        setFormError(result?.error || error || "Đăng ký thất bại, vui lòng thử lại");
      }
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
      setFormError(
        err.message || err.error || "Đăng ký thất bại, vui lòng thử lại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Đang xử lý đăng ký từ bên ngoài
  const isProcessing = isLoading || authLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-bl from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-slate-800 dark:to-gray-950"
    >
      <div className="p-8">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute -z-10 opacity-10">
            <motion.div
              className="absolute top-10 right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl"
              animate={{
                x: [0, -30, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
            <motion.div
              className="absolute bottom-10 left-10 w-40 h-40 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -40, 0],
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 13,
                repeat: Infinity,
                repeatType: "mirror",
                delay: 2,
              }}
            />
          </div>

          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
                />
              </motion.svg>
            </motion.div>
            <motion.h2
              className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500"
              animate={{
                backgroundPosition: ["0% center", "100% center", "0% center"],
                transition: {
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
              }}
            >
              Đăng Ký Tài Khoản
            </motion.h2>
            <motion.p
              className="mt-2 text-sm text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Tạo tài khoản mới và bắt đầu trải nghiệm diễn đàn của chúng tôi
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {formError && (
              <motion.div
                className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                  <div className="ml-3">
                    <motion.p
                      className="text-sm font-medium text-red-600 dark:text-red-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {formError}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                >
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </motion.svg>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg font-medium text-green-600 dark:text-green-400 text-center"
                >
                  Đăng ký thành công!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-600 dark:text-gray-300 text-center mt-1"
                >
                  Vui lòng đăng nhập với tài khoản vừa tạo
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2"
                >
                  Đang chuyển hướng đến trang đăng nhập...
                </motion.p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="group"
                >
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-purple-500 transition-colors"
                  >
                    Tên người dùng
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <motion.input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/10 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-md"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isProcessing}
                      placeholder="Tên người dùng"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="group"
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-purple-500 transition-colors"
                  >
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <motion.input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/10 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-md"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isProcessing}
                      placeholder="you@example.com"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="group"
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-purple-500 transition-colors"
                  >
                    Mật khẩu
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <motion.input
                      type="password"
                      name="password"
                      id="password"
                      autoComplete="new-password"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/10 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-md"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isProcessing}
                      placeholder="••••••••"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="group"
                >
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-purple-500 transition-colors"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <motion.input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      autoComplete="new-password"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/10 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-md"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isProcessing}
                      placeholder="••••••••"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center mt-4"
                >
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeTerms: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="agree-terms"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Tôi đồng ý với{" "}
                    <a
                      href="#"
                      className="font-medium text-purple-600 hover:text-purple-500"
                    >
                      Điều khoản
                    </a>{" "}
                    và{" "}
                    <a
                      href="#"
                      className="font-medium text-purple-600 hover:text-purple-500"
                    >
                      Chính sách bảo mật
                    </a>
                  </label>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isProcessing || !formData.agreeTerms}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md shadow-purple-500/20 dark:shadow-purple-500/5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ${
                      !formData.agreeTerms
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    whileHover={
                      !formData.agreeTerms
                        ? {}
                        : {
                            scale: 1.02,
                            boxShadow: "0 8px 15px rgba(139, 92, 246, 0.3)",
                          }
                    }
                    whileTap={!formData.agreeTerms ? {} : { scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <motion.div
                        className="flex items-center"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Đang xử lý...</span>
                      </motion.div>
                    ) : (
                      "Đăng Ký"
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.p className="text-sm text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{" "}
              <motion.span
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/login"
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  <motion.span
                    whileHover={{
                      scale: 1.05,
                      textShadow: "0 0 8px rgba(139, 92, 246, 0.4)",
                    }}
                  >
                    Đăng nhập ngay
                  </motion.span>
                </Link>
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
