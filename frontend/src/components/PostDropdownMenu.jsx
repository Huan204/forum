import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisH, FaTrash, FaEdit, FaFlag } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const PostDropdownMenu = ({ post, onPostDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const isOwner = currentUser && post?.author?._id === currentUser._id;
  const isAdmin = currentUser?.role === "admin";

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaEllipsisH />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <ul className="py-1">
            {(isOwner || isAdmin) && (
              <>
                <li>
                  <Link
                    to={`/posts/edit/${post._id}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Chỉnh sửa
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (
                        window.confirm("Bạn có chắc muốn xóa bài viết này?")
                      ) {
                        onPostDeleted && onPostDeleted();
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <FaTrash className="mr-2" /> Xóa
                  </button>
                </li>
              </>
            )}
            {!isOwner && (
              <li>
                <button
                  onClick={() => {
                    toast.info("Đã báo cáo bài viết này.");
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaFlag className="mr-2" /> Báo cáo
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PostDropdownMenu;
