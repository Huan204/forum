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

const Login = () => {
  const { login, user, error, setError, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (!formData.email || !formData.password) {
      setFormError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      // Đăng nhập với AuthContext
      const success = await login(formData);

      if (success) {
        setSuccess(true);
        // Đợi hiệu ứng hoàn thành trước khi chuyển trang
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setFormError(error || "Đăng nhập thất bại, vui lòng thử lại");
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);

      // Xử lý hiển thị lỗi cụ thể và đặc biệt là lỗi kết nối
      let errorMessage =
        err.message || err.error || "Đăng nhập thất bại, vui lòng thử lại sau";

      if (
        errorMessage.includes("Không thể kết nối đến server") ||
        errorMessage.includes("Network Error") ||
        err.networkError
      ) {
        errorMessage =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đã khởi động.";
      }

      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Đang xử lý đăng nhập từ bên ngoài
  const isProcessing = isLoading || authLoading;

  return (
    <motion.div
      initial={{
        opacity: 0,
        background: "linear-gradient(to br, #f3f4f6, #e5e7eb)",
      }}
      animate={{
        opacity: 1,
        background: "linear-gradient(to br, #f9fafb, #f3f4f6)",
        transition: { duration: 1.5 },
      }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-slate-800 dark:to-gray-950"
    >
      <div className="p-8">
        <div className="relative">
          {/* Hiệu ứng trang trí */}
          <div className="absolute -z-10 opacity-10">
            <motion.div
              className="absolute top-10 left-10 w-40 h-40 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl"
              animate={{
                x: [0, 30, 0],
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
              className="absolute bottom-10 right-10 w-40 h-40 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl"
              animate={{
                x: [0, -30, 0],
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

          <motion.div className="text-center mb-8" variants={itemVariants}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                variants={svgVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  variants={pathVariants}
                />
              </motion.svg>
            </motion.div>
            <motion.h2
              className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-600 dark:from-primary-400 dark:to-secondary-500"
              animate={{
                backgroundPosition: ["0% center", "100% center", "0% center"],
                transition: {
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
              }}
            >
              Đăng Nhập
            </motion.h2>
            <motion.p
              className="mt-2 text-sm text-gray-600 dark:text-gray-300"
              variants={itemVariants}
            >
              Chào mừng bạn quay trở lại
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {(formError || error) && (
              <motion.div
                className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 p-4"
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
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
                      {formError || error}
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
                  Đăng nhập thành công!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2"
                >
                  Đang chuyển hướng đến trang chủ...
                </motion.p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={containerVariants}
              >
                <motion.div className="group" variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-primary-500 transition-colors"
                  >
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500"
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
                      id="email"
                      name="email"
                      autoComplete="email"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/10 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-md"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isProcessing}
                      variants={itemVariants}
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                <motion.div className="group" variants={itemVariants}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-primary-500 transition-colors"
                  >
                    Mật khẩu
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500"
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
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/10 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-md"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isProcessing}
                      variants={itemVariants}
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between"
                  variants={itemVariants}
                >
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md shadow-primary-500/20 dark:shadow-primary-500/5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    initial="rest"
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
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Đăng Nhập
                      </motion.span>
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div className="mt-6" variants={itemVariants}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <motion.span
                  className="px-2 bg-white/5 backdrop-blur-sm dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                  whileHover={{
                    color: "#6366F1",
                    transition: { duration: 0.2 },
                  }}
                >
                  Hoặc tiếp tục với
                </motion.span>
              </div>
            </div>

            <motion.div
              className="mt-6 grid grid-cols-2 gap-3"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <motion.a
                  href="#"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300/20 dark:border-gray-600/30 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-gray-800/30 hover:bg-white/20 dark:hover:bg-gray-700/40 transition-colors backdrop-blur-sm"
                  whileHover={{
                    scale: 1.02,
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="h-5 w-5 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </motion.a>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.a
                  href="#"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300/20 dark:border-gray-600/30 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-gray-800/30 hover:bg-white/20 dark:hover:bg-gray-700/40 transition-colors backdrop-blur-sm"
                  whileHover={{
                    scale: 1.02,
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="h-5 w-5 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="mt-6 text-center" variants={itemVariants}>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Chưa có tài khoản?{" "}
              <motion.span
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  <motion.span
                    whileHover={{
                      scale: 1.05,
                      textShadow: "0 0 8px rgba(99, 102, 241, 0.4)",
                    }}
                  >
                    Đăng ký ngay
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

export default Login;
