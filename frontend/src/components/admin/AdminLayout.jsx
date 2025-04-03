import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminContent from "./AdminContent";

// Main Layout Component
const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <AdminContent>{children}</AdminContent>
    </div>
  );
};

export default AdminLayout;
