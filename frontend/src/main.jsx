import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

// Tắt cảnh báo của React Router
window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// Render ứng dụng với Router
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
      <Toaster position="top-right" />
    </Router>
  </React.StrictMode>
);
