import React from "react";
import AdminNavMenu from "./AdminNavMenu";
import AdminFooter from "./AdminFooter";

const AdminContent = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col">
      <AdminNavMenu />
      <div className="flex-1 overflow-x-auto p-4 md:p-8">{children}</div>
      <AdminFooter />
    </div>
  );
};

export default AdminContent;
