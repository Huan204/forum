import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
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
  FaTimes,
} from "react-icons/fa";

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const submitButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [uploadType, setUploadType] = useState("image");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    thumbnail: "",
    video: "",
    videoUrl: "",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [errors, setErrors] = useState({});

  // Danh sách danh mục
  const [categories, setCategories] = useState([
    "Công nghệ",
    "Đời sống",
    "Giáo dục",
    "Thể thao",
    "Giải trí",
    "Sức khỏe",
    "Du lịch",
    "Kinh doanh",
  ]);

  // Hàm helper để format URL
  const formatUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5002${url.startsWith("/") ? "" : "/"}${url}`;
  };

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
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getPost(id);
        console.log("Dữ liệu bài viết nhận được:", data);

        if (!data || !data._id) {
          toast.error("Không tìm thấy bài viết");
          return navigate("/posts");
        }

        // Kiểm tra quyền chỉnh sửa
        if (
          user?._id !== data.authorId &&
          user?.id !== data.authorId &&
          !user?.isAdmin
        ) {
          console.log("User ID:", user?._id);
          console.log("Author ID:", data.authorId);
          toast.error("Bạn không có quyền chỉnh sửa bài viết này");
          return navigate(`/posts/${id}`);
        }

        // Lưu dữ liệu bài viết gốc
        setPost(data);

        // Format dữ liệu cho form
        const formattedData = {
          title: data.title || "",
          content: data.content || "",
          category: data.category || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          thumbnail: data.thumbnail || "",
          video: data.video || "",
          videoUrl: data.video || "",
        };

        console.log("Dữ liệu đã format cho form:", formattedData);

        // Lưu dữ liệu gốc để so sánh thay đổi
        setOriginalData(formattedData);

        // Cập nhật form data
        setPostData(formattedData);

        // Khởi tạo preview
        if (data.thumbnail) {
          setThumbnailPreview(data.thumbnail);
          setUploadType("image");
        } else if (data.video) {
          setVideoPreview(data.video);
          setUploadType("video");
        }
      } catch (error) {
        console.error("Lỗi chi tiết khi tải bài viết:", error);
        toast.error(error.message || "Lỗi khi tải bài viết");
        navigate("/posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, user]);

  // Thay đổi upload type dựa vào dữ liệu đang có
  useEffect(() => {
    if (post) {
      if (post.video) {
        setUploadType("video");
      } else {
        setUploadType("image");
      }
    }
  }, [post]);

  // Kiểm tra xem dữ liệu đã thay đổi so với ban đầu chưa
  useEffect(() => {
    if (originalData) {
      const hasDataChanged =
        postData.title !== originalData.title ||
        postData.content !== originalData.content ||
        postData.category !== originalData.category ||
        postData.tags !== originalData.tags ||
        postData.thumbnail !== originalData.thumbnail ||
        (uploadType === "video" && postData.video !== originalData.video);

      setHasChanges(hasDataChanged);
    }
  }, [postData, originalData, uploadType]);

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
    if (!selectedVideoFile) return;

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
        "Vui lòng nhấn nút 'Tải lên' để tải video lên trước khi cập nhật bài viết";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra nếu không có thay đổi
    if (!hasChanges) {
      toast.info("Bài viết chưa có thay đổi.");
      return;
    }

    if (!validateForm()) {
      const firstError = document.querySelector(".text-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Chuẩn bị dữ liệu để gửi đi
      const dataToSubmit = {
        ...postData,
        tags: postData.tags
          ? postData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Xử lý video và thumbnail
      if (uploadType === "video") {
        if (postData.videoUrl) {
          dataToSubmit.video = postData.videoUrl;
          dataToSubmit.thumbnail = "";
        }
      } else {
        dataToSubmit.video = "";
        dataToSubmit.videoUrl = "";
      }

      console.log("Dữ liệu gửi đi:", dataToSubmit);

      // Gọi API cập nhật bài viết
      const response = await postService.updatePost(id, dataToSubmit);
      console.log("Phản hồi sau khi cập nhật:", response);

      if (response && response.success && response.data) {
        // Cập nhật state với dữ liệu mới
        const updatedData = response.data;
        console.log("Dữ liệu bài viết mới:", updatedData);

        // Format dữ liệu cho form
        const formattedData = {
          title: updatedData.title || "",
          content: updatedData.content || "",
          category: updatedData.category || "",
          tags: Array.isArray(updatedData.tags)
            ? updatedData.tags.join(", ")
            : "",
          thumbnail: updatedData.thumbnail || "",
          video: updatedData.video || "",
          videoUrl: updatedData.video || "",
        };

        // Cập nhật tất cả state liên quan
        setPost(updatedData);
        setOriginalData(formattedData);
        setPostData(formattedData);
        setHasChanges(false);

        // Hiển thị thông báo thành công
        toast.success("Cập nhật bài viết thành công!");

        // Đợi toast hiển thị
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Điều hướng về trang chi tiết bài viết
        navigate(`/posts/${id}`, {
          state: { post: updatedData },
          replace: true,
        });
      } else {
        throw new Error("Không nhận được dữ liệu bài viết sau khi cập nhật");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      const errorMessage = error.message || "Lỗi khi cập nhật bài viết";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn hủy chỉnh sửa? Mọi thay đổi sẽ không được lưu."
      )
    ) {
      navigate(`/posts/${id}`);
    }
  };

  // Hiển thị nội dung bài viết ở chế độ xem trước
  const renderPreview = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h2 className="text-2xl font-bold mb-4">
          {postData.title || "Tiêu đề bài viết"}
        </h2>

        {thumbnailPreview && uploadType === "image" && (
          <div className="mb-4">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {videoPreview && uploadType === "video" && (
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

  // UI cho trạng thái đang tải
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold">Đang tải bài viết...</h2>
        </div>
      </div>
    );
  }

  // UI hiển thị lỗi nếu không tìm thấy bài viết
  if (!postData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>
              Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa
            </span>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chỉnh sửa bài viết</h1>
        <p className="text-gray-600">
          Chỉnh sửa thông tin bài viết và nhấn "Cập nhật" để lưu thay đổi
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{submitError}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form chỉnh sửa */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg ${
                    !isPreview
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setIsPreview(false)}
                >
                  <FaEdit className="inline mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg ${
                    isPreview
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setIsPreview(true)}
                >
                  <FaEye className="inline mr-2" />
                  Xem trước
                </button>
              </div>

              {!isPreview ? (
                <form onSubmit={handleSubmit}>
                  {/* Tiêu đề bài viết */}
                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={postData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Upload ảnh hoặc video */}
                  <div className="mb-4">
                    <div className="flex mb-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Media
                      </label>
                      <div className="ml-4 flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="image"
                            checked={uploadType === "image"}
                            onChange={() => setUploadType("image")}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">Ảnh</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="video"
                            checked={uploadType === "video"}
                            onChange={() => setUploadType("video")}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">Video</span>
                        </label>
                      </div>
                    </div>

                    {uploadType === "image" && (
                      <div>
                        <div className="mb-2">
                          <input
                            type="file"
                            id="thumbnail"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <FaImage className="inline mr-2" />
                            Chọn ảnh
                          </button>
                          {thumbnailPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setThumbnailPreview("");
                                setPostData({
                                  ...postData,
                                  thumbnail: "",
                                });
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg ml-2 hover:bg-red-600 transition-colors"
                            >
                              <FaTrash className="inline mr-2" />
                              Xóa ảnh
                            </button>
                          )}
                        </div>
                        {thumbnailPreview && (
                          <div className="mt-2">
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="max-w-full h-auto max-h-60 rounded-lg"
                            />
                          </div>
                        )}
                        {errors.thumbnail && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.thumbnail}
                          </p>
                        )}
                      </div>
                    )}

                    {uploadType === "video" && (
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <input
                            type="file"
                            id="video"
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <FaVideo className="inline mr-2" />
                            Chọn video
                          </button>
                          {videoPreview && !isUploading && (
                            <>
                              <button
                                type="button"
                                onClick={uploadVideoChunks}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              >
                                <FaUpload className="inline mr-2" />
                                Tải lên
                              </button>
                              <button
                                type="button"
                                onClick={handleVideoRemove}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <FaTrash className="inline mr-2" />
                                Xóa video
                              </button>
                            </>
                          )}
                        </div>

                        {isUploading && (
                          <div className="my-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Đang tải lên: {uploadProgress}%
                            </p>
                          </div>
                        )}

                        {saveStatus && (
                          <p className="text-green-500 text-sm mt-1">
                            {saveStatus}
                          </p>
                        )}

                        {videoPreview && (
                          <div className="mt-2">
                            <video
                              src={videoPreview}
                              controls
                              className="max-w-full h-auto max-h-60 rounded-lg"
                            />
                          </div>
                        )}

                        {errors.video && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.video}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nội dung bài viết */}
                  <div className="mb-4">
                    <label
                      htmlFor="content"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={postData.content}
                      onChange={handleChange}
                      rows="8"
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.content ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nhập nội dung bài viết"
                    ></textarea>
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.content}
                      </p>
                    )}
                  </div>

                  {/* Danh mục bài viết */}
                  <div className="mb-4">
                    <label
                      htmlFor="category"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={postData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label
                      htmlFor="tags"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={postData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Các tags cách nhau bởi dấu phẩy (ví dụ: web, javascript, react)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Nhập các tags cách nhau bởi dấu phẩy
                    </p>
                  </div>

                  {/* Nút submit và cancel */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <FaTimes className="inline mr-2" />
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !hasChanges}
                      className={`px-6 py-2 rounded-lg ${
                        isSubmitting || !hasChanges
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white transition-colors flex items-center`}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="inline mr-2 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <FaSave className="inline mr-2" />
                          Cập nhật
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                renderPreview()
              )}
            </div>
          </div>
        </div>

        {/* Hướng dẫn bên phải */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Hướng dẫn</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Điền đầy đủ các thông tin bắt buộc (có dấu *).</li>
              <li>Có thể chọn ảnh hoặc video đại diện cho bài viết.</li>
              <li>
                Khi sử dụng video, nhớ nhấn nút "Tải lên" sau khi chọn video.
              </li>
              <li>
                Nội dung bài viết hỗ trợ định dạng xuống dòng và hiển thị gốc.
              </li>
              <li>Các tags nên ngắn gọn và liên quan đến nội dung bài viết.</li>
              <li>
                Sử dụng chức năng "Xem trước" để kiểm tra bài viết trước khi cập
                nhật.
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">
              <FaInfoCircle className="inline mr-2" />
              Lưu ý
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li>
                <FaCheck className="inline mr-2" />
                Tiêu đề phải có ít nhất 10 ký tự.
              </li>
              <li>
                <FaCheck className="inline mr-2" />
                Nội dung phải có ít nhất 50 ký tự.
              </li>
              <li>
                <FaCheck className="inline mr-2" />
                File ảnh tối đa 20MB, video tối đa 1GB.
              </li>
              <li>
                <FaCheck className="inline mr-2" />
                Các thay đổi chỉ được lưu khi bạn nhấn nút "Cập nhật".
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
