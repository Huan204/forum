import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  isLoading = false,
  icon = null,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 shadow-sm";
      case "secondary":
        return "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-200 shadow-sm";
      case "outline":
        return "bg-white hover:bg-gray-50 text-primary-600 border border-primary-500 shadow-sm";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white border border-green-600 shadow-sm";
      case "info":
        return "bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 shadow-sm";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500 shadow-sm";
      case "ghost":
        return "bg-transparent hover:bg-gray-100 text-gray-700";
      default:
        return "bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 shadow-sm";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "px-2 py-1 text-xs";
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-base";
      case "lg":
        return "px-5 py-2.5 text-lg";
      case "xl":
        return "px-6 py-3 text-xl";
      default:
        return "px-4 py-2 text-base";
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        font-medium rounded-md transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        active:scale-95 
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${className}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        flex items-center justify-center
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></span>
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
