import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import postService from "../services/postService";
import axios from "axios";
import {
  FaPencilAlt,
  FaImage,
  FaTags,
  FaFolder,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaArrowLeft,
  FaEye,
  FaEdit,
  FaSave,
  FaCheck,
  FaVideo,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

const CreatePost = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const submitButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    thumbnail: "",
    video: "",
    videoUrl: "", // URL cho video đã upload
  });
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [categories, setCategories] = useState([]);
  const [uploadType, setUploadType] = useState("image"); // "image" hoặc "video"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

  // Kiểm tra xác thực khi component được tải
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  // Tự động lưu nháp mỗi 30 giây nếu có nội dung
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (
        isAuthenticated &&
        (postData.title.trim() || postData.content.trim()) &&
        !isSubmitting
      ) {
        handleSaveDraft();
      }
    }, 30000); // 30 giây

    return () => clearInterval(autoSaveInterval);
  }, [postData, isAuthenticated, isSubmitting, draftId]);

  // Lưu nháp tự động
  const handleSaveDraft = async () => {
    if (!isAuthenticated) return;

    // Kiểm tra nếu bài viết không có đủ thông tin cơ bản
    if (!postData.title.trim() && !postData.content.trim()) {
      return; // Không lưu nếu chưa có nội dung
    }

    try {
      setIsSavingDraft(true);
      setSaveStatus("Đang lưu...");

      // Chuẩn bị dữ liệu
      const draftData = {
        ...postData,
        status: "draft", // Đảm bảo trạng thái là nháp
        draftId: draftId || null, // Gửi null nếu chưa có ID
        tags: postData.tags
          ? postData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Log dữ liệu sẽ gửi đi để debug
      console.log("Dữ liệu nháp gửi đi:", draftData);

      // Gọi API để lưu nháp
      const API_URL = "http://localhost:5002/api";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(`${API_URL}/posts/drafts`, draftData, {
        headers,
      });

      console.log("Phản hồi khi lưu nháp:", response.data);

      // Cập nhật trạng thái
      if (!draftId && response.data.data && response.data.data._id) {
        setDraftId(response.data.data._id);
      }

      setLastSaved(new Date());
      setSaveStatus("Đã lưu");

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
      setSaveStatus("Lỗi khi lưu");

      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5002/api/categories"
        );
        if (response.data.success) {
          const categoryNames = response.data.data.map(
            (category) => category.name
          );
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        // Sử dụng danh mục mặc định nếu không thể lấy từ API
        setCategories([
          "Công nghệ",
          "Giải trí",
          "Thể thao",
          "Khoa học",
          "Sức khỏe",
          "Khác",
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData({
      ...postData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (uploadType === "image") {
        // Kiểm tra kích thước file ảnh (tối đa 20MB)
        if (file.size > 20 * 1024 * 1024) {
          setErrors({
            ...errors,
            thumbnail: "Kích thước ảnh không được vượt quá 20MB",
          });
          return;
        }

        // Kiểm tra loại file ảnh
        if (!file.type.match("image.*")) {
          setErrors({
            ...errors,
            thumbnail: "Vui lòng chọn file hình ảnh",
          });
          return;
        }

        // Tạo URL preview cho ảnh
        const reader = new FileReader();
        reader.onload = () => {
          setThumbnailPreview(reader.result);
          setPostData({
            ...postData,
            thumbnail: reader.result,
          });
        };
        reader.readAsDataURL(file);

        // Xóa lỗi nếu có
        if (errors.thumbnail) {
          setErrors({
            ...errors,
            thumbnail: "",
          });
        }
      } else if (uploadType === "video") {
        // Kiểm tra kích thước file video (tối đa 1GB)
        if (file.size > 1024 * 1024 * 1024) {
          setErrors({
            ...errors,
            video: "Kích thước video không được vượt quá 1GB",
          });
          return;
        }

        // Kiểm tra loại file video
        if (!file.type.match("video.*")) {
          setErrors({
            ...errors,
            video: "Vui lòng chọn file video",
          });
          return;
        }

        // Lưu file video để sau này xử lý
        setSelectedVideoFile(file);

        // Tạo URL preview cho video
        const videoURL = URL.createObjectURL(file);
        setVideoPreview(videoURL);

        // Xóa lỗi nếu có
        if (errors.video) {
          setErrors({
            ...errors,
            video: "",
          });
        }
      }
    }
  };

  const handleVideoRemove = () => {
    setVideoPreview("");
    setSelectedVideoFile(null);
    setPostData({
      ...postData,
      video: "",
      videoUrl: "",
    });
    setUploadProgress(0);
  };

  const uploadVideoChunks = async () => {
    if (!selectedVideoFile || !isAuthenticated) return;

    setIsUploading(true);
    setUploadProgress(0);
    console.log("Bắt đầu tải lên video:", selectedVideoFile.name);

    try {
      // Lấy token xác thực
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để tải lên video");
      }

      // Tính toán số lượng chunk cần thiết
      const file = selectedVideoFile;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      // Khởi tạo phiên upload mới
      const initResponse = await axios.post(
        "http://localhost:5002/api/upload/init",
        {
          filename: file.name,
          fileSize: file.size,
          totalChunks,
          contentType: file.type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!initResponse.data.success) {
        throw new Error("Không thể khởi tạo phiên upload");
      }

      const uploadId = initResponse.data.uploadId;

      // Upload từng chunk
      for (let i = 0; i < totalChunks; i++) {
        // Tính toán tiến trình
        const progress = Math.floor((i / totalChunks) * 95); // Để lại 5% cho quá trình hoàn thành
        setUploadProgress(progress);

        // Cắt chunk từ file
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        // Tạo form data để gửi chunk
        const formData = new FormData();
        formData.append("chunk", chunk);

        // Gửi chunk lên server
        const chunkResponse = await axios.post(
          "http://localhost:5002/api/upload/chunk",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-upload-id": uploadId,
              "x-chunk-index": i,
            },
          }
        );

        if (!chunkResponse.data.success) {
          throw new Error(`Lỗi khi tải lên chunk ${i}`);
        }
      }

      // Hoàn thành quá trình upload
      setUploadProgress(95);

      const completeResponse = await axios.post(
        "http://localhost:5002/api/upload/complete",
        { uploadId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!completeResponse.data.success) {
        throw new Error("Không thể hoàn thành quá trình upload");
      }

      // Sau khi hoàn thành, cập nhật state
      setUploadProgress(100);

      const videoUrl = completeResponse.data.url;

      setPostData((prevData) => {
        const updatedData = {
          ...prevData,
          videoUrl: videoUrl,
          video: videoUrl, // Lưu đường dẫn video vào field video
        };
        console.log("postData sau khi cập nhật videoUrl:", updatedData);
        return updatedData;
      });

      setSaveStatus("Video đã tải lên thành công");
      setTimeout(() => setSaveStatus(""), 3000);

      console.log("Upload thành công, videoUrl:", videoUrl);
    } catch (error) {
      console.error("Lỗi khi tải lên video:", error);
      setErrors({
        ...errors,
        video: "Lỗi khi tải lên video: " + (error.message || "Không xác định"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Debug các giá trị
    console.log("Kiểm tra video khi submit:", {
      selectedVideoFile,
      uploadType,
      videoUrl: postData.videoUrl,
      video: postData.video,
      videoPreview,
    });

    if (!postData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề bài viết";
    } else if (postData.title.length < 10) {
      newErrors.title = "Tiêu đề phải có ít nhất 10 ký tự";
    }

    if (!postData.content.trim()) {
      newErrors.content = "Vui lòng nhập nội dung bài viết";
    } else if (postData.content.length < 50) {
      newErrors.content = "Nội dung phải có ít nhất 50 ký tự";
    }

    if (!postData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }

    // Chỉ kiểm tra video khi người dùng đã chọn uploadType là video và có chọn file
    if (uploadType === "video" && videoPreview && !postData.videoUrl) {
      newErrors.video =
        "Vui lòng nhấn nút 'Tải lên' để tải video lên trước khi đăng bài";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Kiểm tra nếu đang submit để tránh submit nhiều lần
    if (isSubmitting) {
      console.log("Đang trong quá trình gửi, bỏ qua yêu cầu submit mới");
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!validateForm()) {
      // Cuộn đến lỗi đầu tiên
      const firstError = document.querySelector(".text-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    // Kiểm tra xem danh mục có hợp lệ không
    const validCategories = [
      "Công nghệ",
      "Giải trí",
      "Thể thao",
      "Khoa học",
      "Sức khỏe",
      "Khác",
    ];
    if (!validCategories.includes(postData.category)) {
      setErrors({
        ...errors,
        category: `Danh mục không hợp lệ. Vui lòng chọn một trong các danh mục: ${validCategories.join(
          ", "
        )}`,
      });
      setIsSubmitting(false);
      return;
    }

    // Kiểm tra kích thước video
    if (postData.video && !postData.videoUrl) {
      try {
        const videoSize = postData.video.length * 0.75; // Ước tính kích thước của chuỗi base64
        console.log(
          `Kích thước video ước tính: ${(videoSize / (1024 * 1024)).toFixed(
            2
          )}MB`
        );

        if (videoSize > 200 * 1024 * 1024) {
          setErrors({
            ...errors,
            video:
              "Video quá lớn, vui lòng sử dụng video nhỏ hơn 200MB hoặc sử dụng chức năng tải lên video trước",
          });
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra kích thước video:", error);
      }
    }

    // Chuẩn bị dữ liệu gửi đi
    try {
      // Chuẩn bị dữ liệu
      const dataToSubmit = {
        ...postData,
        status: "published", // Đảm bảo trạng thái là đã xuất bản
        draftId: draftId || null, // Gửi draftId nếu có để backend biết đây là nháp được publish
        tags: postData.tags
          ? postData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Xử lý video
      if (uploadType === "video") {
        if (postData.videoUrl) {
          // Kiểm tra nếu videoUrl là đường dẫn thực đến server
          if (postData.videoUrl.startsWith("/uploads/")) {
            dataToSubmit.video = postData.videoUrl;
            console.log("Sử dụng video đã upload:", postData.videoUrl);
          }
          // Trường hợp vẫn đang dùng blob URL (từ chế độ cũ)
          else if (postData.videoUrl.startsWith("blob:")) {
            console.warn(
              "Đang sử dụng blob URL, điều này không được khuyến khích"
            );
            dataToSubmit.video = "video_uploaded"; // Đánh dấu đã có video
            dataToSubmit.videoName = postData.video; // Tên file video
            console.log("Sử dụng video đã upload (mô phỏng):", postData.video);
          }
          // Trường hợp URL khác (có thể là URL đầy đủ)
          else {
            dataToSubmit.video = postData.videoUrl;
            console.log("Sử dụng video đã upload:", postData.videoUrl);
          }
        } else if (videoPreview) {
          console.error("Lỗi: Đã chọn video nhưng chưa tải lên");
          setErrors({
            ...errors,
            video: "Vui lòng tải lên video trước khi đăng bài",
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // Khi không sử dụng video, đảm bảo không gửi dữ liệu video đi
        dataToSubmit.video = "";
        dataToSubmit.videoUrl = "";
      }

      console.log("Dữ liệu trước khi gửi:", dataToSubmit);
      console.log("Trạng thái xác thực:", isAuthenticated);
      console.log("User hiện tại:", user);

      // Gọi API để đăng bài
      const response = await postService.createPost(dataToSubmit);

      if (response.success) {
        console.log(
          "Bài viết đã được đăng thành công, chuyển hướng tới:",
          response.data._id
        );
        // Xóa localStorage draft nếu có
        if (draftId) {
          try {
            localStorage.removeItem(`draft_${draftId}`);
          } catch (err) {
            console.error("Không thể xóa draft từ localStorage:", err);
          }
        }
        // Chuyển hướng đến trang chi tiết bài viết
        navigate(`/posts/${response.data._id}`);
      } else {
        setSubmitError(response.message || "Có lỗi xảy ra khi đăng bài viết");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài viết:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
      setSubmitError(
        error.response?.data?.error ||
          error.message ||
          "Đã xảy ra lỗi khi đăng bài viết"
      );
      setIsSubmitting(false);
    }
  };

  // Thay đổi giữa chế độ soạn thảo và xem trước
  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  // Hiển thị nội dung bài viết ở chế độ xem trước
  const renderPreview = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h2 className="text-2xl font-bold mb-4">
          {postData.title || "Tiêu đề bài viết"}
        </h2>

        {thumbnailPreview && (
          <div className="mb-4">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {videoPreview && (
          <div className="mb-4">
            <video
              src={videoPreview}
              controls
              className="w-full max-h-96 rounded-lg"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {postData.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {postData.category}
            </span>
          )}

          {postData.tags &&
            postData.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                #{tag.trim()}
              </span>
            ))}
        </div>

        <div className="prose max-w-none">
          {postData.content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: postData.content.replace(/\n/g, "<br/>"),
              }}
            />
          ) : (
            <p className="text-gray-500 italic">Chưa có nội dung</p>
          )}
        </div>
      </div>
    );
  };

  // Popup yêu cầu đăng nhập
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-center mb-4">
          <FaExclamationTriangle className="text-yellow-500 text-4xl" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">
          Yêu cầu đăng nhập
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Bạn cần đăng nhập để tạo bài viết trên diễn đàn.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-center"
          >
            Đăng ký
          </Link>
        </div>
        <button
          onClick={() => setShowLoginModal(false)}
          className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
        >
          Trở lại
        </button>
      </div>
    </div>
  );

  // Sửa hàm setUploadType để tránh mất dữ liệu khi chuyển đổi
  const handleUploadTypeChange = (type) => {
    if (type === uploadType) return;

    // Lưu trữ thông tin của loại upload hiện tại
    if (uploadType === "video" && type === "image") {
      // Chuyển từ video sang ảnh
      console.log("Chuyển từ video sang ảnh, lưu trữ thông tin video");
    } else if (uploadType === "image" && type === "video") {
      // Chuyển từ ảnh sang video
      console.log("Chuyển từ ảnh sang video, lưu trữ thông tin ảnh");
    }

    setUploadType(type);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showLoginModal && <LoginModal />}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Link
            to="/posts"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaArrowLeft className="mr-1" />
            <span>Quay lại</span>
          </Link>
          <h1 className="text-2xl font-bold">Tạo bài viết mới</h1>
        </div>

        <div className="flex items-center space-x-2">
          {saveStatus && (
            <div className="text-sm bg-gray-100 px-3 py-1 rounded-md flex items-center">
              <span
                className={
                  saveStatus === "Đã lưu" ? "text-green-600" : "text-gray-600"
                }
              >
                {saveStatus}
              </span>
              {saveStatus === "Đã lưu" && (
                <FaCheck className="ml-1 text-green-600" />
              )}
            </div>
          )}

          <button
            type="button"
            onClick={togglePreview}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"
          >
            {isPreview ? (
              <>
                <FaEdit className="mr-1" />
                <span>Chỉnh sửa</span>
              </>
            ) : (
              <>
                <FaEye className="mr-1" />
                <span>Xem trước</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || !isAuthenticated}
            className={`px-3 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 flex items-center ${
              isSavingDraft ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSavingDraft ? (
              <>
                <FaSpinner className="animate-spin mr-1" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <FaSave className="mr-1" />
                <span>Lưu nháp</span>
              </>
            )}
          </button>
        </div>
      </div>

      {lastSaved && (
        <div className="text-xs text-gray-500 mb-4 text-right">
          Lần cuối lưu:{" "}
          {new Intl.DateTimeFormat("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date(lastSaved))}
        </div>
      )}

      {isPreview ? (
        renderPreview()
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tiêu đề */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPencilAlt className="text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={postData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề bài viết (ít nhất 10 ký tự)"
                className={`pl-10 block w-full border ${
                  errors.title ? "border-red-300" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Ảnh bìa và Video */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {uploadType === "image" ? "Ảnh bìa" : "Video"}
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleUploadTypeChange("image")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    uploadType === "image"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <FaImage className="inline mr-1" />
                  Ảnh
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadTypeChange("video")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    uploadType === "video"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <FaVideo className="inline mr-1" />
                  Video
                </button>
              </div>
            </div>

            {uploadType === "image" ? (
              <div
                className={`border ${
                  errors.thumbnail ? "border-red-300" : "border-gray-300"
                } rounded-lg p-4 bg-gray-50`}
              >
                <div className="flex items-center justify-center w-full">
                  {thumbnailPreview ? (
                    <div className="relative w-full">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto max-h-64 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview("");
                          setPostData({
                            ...postData,
                            thumbnail: "",
                          });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaImage className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Nhấn để tải ảnh lên
                          </span>{" "}
                          hoặc kéo thả tại đây
                        </p>
                        <p className="text-xs text-gray-500">
                          Định dạng: JPG, PNG, GIF (Tối đa 20MB)
                        </p>
                      </div>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`border ${
                  errors.video ? "border-red-300" : "border-gray-300"
                } rounded-lg p-4 bg-gray-50`}
              >
                <div className="flex items-center justify-center w-full">
                  {videoPreview ? (
                    <div className="relative w-full">
                      <video
                        src={videoPreview}
                        controls
                        className="mx-auto max-h-64 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleVideoRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>

                      {!isUploading &&
                        selectedVideoFile &&
                        !postData.videoUrl && (
                          <button
                            type="button"
                            onClick={uploadVideoChunks}
                            className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-md px-2 py-1 hover:bg-blue-600 flex items-center"
                          >
                            <FaUpload className="mr-1" />
                            <span>Tải lên</span>
                          </button>
                        )}

                      {isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2 rounded-b-lg">
                          <div
                            className="bg-blue-500 h-2 rounded-b-lg transition-all duration-300 ease-in-out"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                          <p className="text-center text-xs mt-1 text-gray-700">
                            {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {postData.videoUrl && (
                        <div className="absolute bottom-2 right-2 bg-green-100 text-green-800 rounded-md px-2 py-1 flex items-center">
                          <FaCheck className="mr-1" />
                          <span>
                            {postData.videoUrl.startsWith("blob:")
                              ? "Đã tải lên (mô phỏng)"
                              : "Đã tải lên"}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="video-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaVideo className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Nhấn để tải video lên
                          </span>{" "}
                          hoặc kéo thả tại đây
                        </p>
                        <p className="text-xs text-gray-500">
                          Định dạng: MP4, MOV, AVI (Tối đa 1GB)
                        </p>
                      </div>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
            {errors.thumbnail && uploadType === "image" && (
              <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
            )}
            {errors.video && uploadType === "video" && (
              <p className="mt-1 text-sm text-red-500">{errors.video}</p>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Danh mục <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFolder className="text-gray-400" />
              </div>
              <select
                id="category"
                name="category"
                value={postData.category}
                onChange={handleChange}
                className={`pl-10 block w-full border ${
                  errors.category ? "border-red-300" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Thẻ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaTags className="text-gray-400" />
              </div>
              <input
                type="text"
                id="tags"
                name="tags"
                value={postData.tags}
                onChange={handleChange}
                placeholder="Nhập các thẻ, cách nhau bởi dấu phẩy (ví dụ: web, javascript, react)"
                className="pl-10 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Thêm các thẻ giúp bài viết của bạn dễ tìm kiếm hơn.
            </p>
          </div>

          {/* Nội dung */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={postData.content}
              onChange={handleChange}
              rows={15}
              placeholder="Nhập nội dung bài viết của bạn ở đây..."
              className={`block w-full border ${
                errors.content ? "border-red-300" : "border-gray-300"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">{errors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 flex items-center">
              <FaInfoCircle className="mr-1" />
              Hỗ trợ văn bản thuần túy. Nội dung phải có ít nhất 50 ký tự.
            </p>
          </div>

          {/* Lỗi khi submit */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/posts"
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Hủy
            </Link>
            <button
              type="submit"
              ref={submitButtonRef}
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  <span>Đăng bài</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
