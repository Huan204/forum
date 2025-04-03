import React from "react";
import { useLocation } from "react-router-dom";
import BackButton from "./BackButton";

const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="container mx-auto px-4 py-4">
      {!isHomePage && (
        <div className="mb-4">
          <BackButton />
        </div>
      )}
      {children}
    </div>
  );
};

export default Layout;
