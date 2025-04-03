import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import { motion, AnimatePresence } from "framer-motion";


const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      const success = await login(formData);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-tl from-gray-900 via-purple-950 to-black dark:from-gray-950 dark:via-slate-900 dark:to-gray-900"
    >
      
        <div className="p-8 relative">
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl -z-10">
            <motion.div
              className="absolute w-64 h-64 rounded-full bg-purple-800/20 blur-2xl"
              animate={{
                x: [0, 40, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 15,
              }}
              style={{ top: -20, right: -20 }}
            />
            <motion.div
              className="absolute w-72 h-72 rounded-full bg-indigo-800/20 blur-2xl"
              animate={{
                x: [0, -30, 0],
                y: [0, 40, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 18,
                delay: 2,
              }}
              style={{ bottom: -30, left: -30 }}
            />
          </div>

          <div className="relative">
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
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6"
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
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
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1.2,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  />
                </motion.svg>
              </motion.div>
              <motion.h2
                className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-500 dark:to-indigo-400"
                animate={{
                  backgroundPosition: ["0% center", "100% center", "0% center"],
                  transition: {
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Infinity,
                  },
                }}
              >
                Đăng Nhập Admin
              </motion.h2>
              <motion.p
                className="mt-2 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Vui lòng đăng nhập với tài khoản quản trị
              </motion.p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 rounded-lg bg-red-900/30 p-4 border border-red-700/30"
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
                        className="h-5 w-5 text-red-400"
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
                        className="text-sm font-medium text-red-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {error}
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
                    className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4 border border-green-700/30"
                  >
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="w-8 h-8 text-green-400"
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
                    className="text-lg font-medium text-green-400 text-center"
                  >
                    Đăng nhập thành công!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-gray-400 text-center mt-2"
                  >
                    Đang chuyển hướng đến bảng điều khiển...
                  </motion.p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="group"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 group-focus-within:text-purple-400 transition-colors"
                    >
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400"
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isProcessing}
                        placeholder="admin@example.com"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="group"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 group-focus-within:text-purple-400 transition-colors"
                    >
                      Mật khẩu
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400"
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
                        autoComplete="current-password"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isProcessing}
                        placeholder="••••••••"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-800"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-300"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md shadow-purple-900/30 text-sm font-medium text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 8px 15px rgba(126, 34, 206, 0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
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
                        "Đăng Nhập"
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      
    </motion.div>
  );
};

export default AdminLogin;
