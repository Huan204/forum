import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-all"
    >
      <ArrowLeft size={20} />
      Quay lại
    </button>
  );
};

export default BackButton;
