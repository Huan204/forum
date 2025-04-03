import React from "react";

const AdminNavMenu = () => {
  return (
    <div className="bg-white border-b shadow-sm py-2 px-4 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">
          Quản trị hệ thống
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <span className="text-xl">🔔</span>
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              5
            </span>
          </button>
        </div>
        <div className="flex items-center">
          <img
            src="https://via.placeholder.com/40"
            alt="Admin"
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </div>
  );
};

export default AdminNavMenu;
