import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Hàm trợ giúp để lấy token từ localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  console.log("Token hiện tại:", token);
  return token;
};

// Hàm trợ giúp để thiết lập headers với token nếu có
const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Hàm xử lý URL video
const formatVideoUrl = (videoUrl) => {
  if (!videoUrl) return "";

  // Loại bỏ khoảng trắng thừa nếu có
  videoUrl = videoUrl.trim();

  // Xử lý các trường hợp đặc biệt
  if (videoUrl === "video_uploaded") {
    console.warn("Giá trị video_uploaded không phải là URL thực");
    return "";
  }

  // Nếu đã là blob URL hoặc URL http/https đầy đủ thì giữ nguyên
  if (
    videoUrl.startsWith("blob:") ||
    videoUrl.startsWith("http://") ||
    videoUrl.startsWith("https://")
  ) {
    return videoUrl;
  }

  // Đảm bảo URL đầy đủ
  const apiUrl = "http://localhost:5000"; // Hoặc lấy từ process.env.REACT_APP_API_URL

  // Log để debug
  console.log("Đang format video URL:", videoUrl);

  // Xử lý URL
  let formattedUrl;

  // Nếu videoUrl đã bắt đầu bằng "/", không cần thêm "/" nữa
  if (videoUrl.startsWith("/")) {
    formattedUrl = `${apiUrl}${videoUrl}`;
  } else {
    formattedUrl = `${apiUrl}/${videoUrl}`;
  }

  // Log URL đã format
  console.log("URL video đã format:", formattedUrl);

  return formattedUrl;
};

const postService = {
  getPost: async (id) => {
    if (!id) {
      console.error("ID bài viết không được cung cấp");
      throw new Error("ID bài viết không được cung cấp");
    }

    try {
      console.log(`Đang gửi request tới: ${API_URL}/posts/${id}`);
      console.log("Headers:", getHeaders());

      const response = await axios.get(`${API_URL}/posts/${id}`, {
        headers: getHeaders(),
      });

      console.log("Phản hồi từ API:", response);

      if (!response.data) {
        throw new Error("Không nhận được dữ liệu từ server");
      }

      // Xử lý dữ liệu trả về
      const responseData = response.data;

      // Kiểm tra cấu trúc dữ liệu
      if (!responseData.success) {
        throw new Error(responseData.message || "Lỗi không xác định từ server");
      }

      // Lấy dữ liệu bài viết từ response
      const postData = responseData.data;

      if (!postData) {
        throw new Error("Không tìm thấy dữ liệu bài viết");
      }

      // Format video URL nếu có
      if (postData.video) {
        postData.video = formatVideoUrl(postData.video);
      }

      // Format thumbnail URL nếu có
      if (postData.thumbnail && !postData.thumbnail.startsWith("http")) {
        postData.thumbnail = `${API_URL}/${postData.thumbnail.replace(
          /^\//,
          ""
        )}`;
      }

      // Đảm bảo các trường dữ liệu cần thiết
      return {
        success: true,
        data: {
          ...postData,
          likes: Array.isArray(postData.likes) ? postData.likes : [],
          views: typeof postData.views === "number" ? postData.views : 0,
          comments: Array.isArray(postData.comments) ? postData.comments : [],
          tags: Array.isArray(postData.tags) ? postData.tags : [],
          author: postData.author || null,
          createdAt: postData.createdAt || new Date().toISOString(),
          updatedAt: postData.updatedAt || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết bài viết:", error);

      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        console.error("Response error:", {
          status: error.response.status,
          data: error.response.data,
        });
        throw new Error(
          error.response.data.message || "Không thể lấy thông tin bài viết"
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
        throw new Error("Không nhận được phản hồi từ server");
      } else {
        console.error("Error:", error.message);
        throw error;
      }
    }
  },

  getPosts: async (filter = {}) => {
    try {
      // Xây dựng query params từ filter object
      const params = new URLSearchParams();

      if (filter.category) {
        params.append("category", filter.category);
      }

      if (filter.search) {
        params.append("search", filter.search);
      }

      if (filter.tag) {
        params.append("tag", filter.tag);
      }

      if (filter.page) {
        params.append("page", filter.page);
      }

      if (filter.limit) {
        params.append("limit", filter.limit);
      }

      if (filter.sort) {
        params.append("sort", filter.sort);
      }

      // Gọi API để lấy danh sách bài viết với các bộ lọc
      const url = `${API_URL}/posts${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axios.get(url, {
        headers: getHeaders(),
      });

      // Tiền tải hình ảnh cho các bài viết
      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        // Sử dụng hàm async để tải trước hình ảnh
        preloadImages(response.data.data);
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
      throw error;
    }
  },

  getUserPosts: async (userId) => {
    try {
      if (!userId) {
        console.error(
          "Lỗi: ID người dùng không được cung cấp hoặc không hợp lệ"
        );
        return {
          posts: [],
          success: false,
          message: "ID người dùng không được cung cấp hoặc không hợp lệ",
        };
      }

      // Kiểm tra định dạng ID
      const isValidObjectId = (id) => {
        return id && id.match(/^[0-9a-fA-F]{24}$/);
      };

      if (!isValidObjectId(userId)) {
        console.error("ID không đúng định dạng ObjectId:", userId);
        return {
          posts: [],
          success: false,
          message: "ID người dùng không hợp lệ",
        };
      }

      console.log(`Đang lấy bài viết của người dùng ID: ${userId}`);
      console.log("API URL:", `${API_URL}/posts/user/${userId}`);
      console.log("Headers:", getHeaders());

      // Gọi API để lấy bài viết của một người dùng cụ thể
      const response = await axios.get(`${API_URL}/posts/user/${userId}`, {
        headers: getHeaders(),
        timeout: 8000, // Tăng timeout lên 8 giây
      });

      console.log(`Đã nhận được phản hồi từ API, status: ${response.status}`);
      console.log("Cấu trúc dữ liệu phản hồi:", response.data);

      // Kiểm tra và trả về dữ liệu
      if (response.data && response.data.success) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Trường hợp API trả về mảng trực tiếp
        return { posts: response.data, success: true };
      } else {
        // Trường hợp cấu trúc khác
        console.warn("Cấu trúc dữ liệu API không như mong đợi:", response.data);
        return {
          posts: [],
          success: false,
          message: "Dữ liệu không đúng định dạng",
        };
      }
    } catch (error) {
      console.error("Lỗi khi lấy bài viết của người dùng:", error);

      // Tạo thông báo lỗi chi tiết
      let errorMsg = "Không thể lấy bài viết của người dùng";
      let errorData = { posts: [], success: false };

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);

        errorData.message = error.response.data.message || errorMsg;

        if (error.response.status === 404) {
          errorData.message = "Không tìm thấy người dùng hoặc bài viết";
        } else if (error.response.status === 400) {
          errorData.message =
            "Yêu cầu không hợp lệ: " +
            (error.response.data.message || "ID người dùng không hợp lệ");
        } else if (error.response.status === 500) {
          errorData.message =
            "Lỗi server: " +
            (error.response.data.message ||
              "Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } else if (error.request) {
        errorData.message = "Không nhận được phản hồi từ server";
      } else {
        errorData.message = error.message;
      }

      console.error("Lỗi đã xử lý:", errorData.message);
      return errorData; // Trả về dữ liệu lỗi thay vì ném lỗi
    }
  },

  getDrafts: async () => {
    try {
      // Gọi API để lấy danh sách bài viết nháp của người dùng hiện tại
      const response = await axios.get(`${API_URL}/posts/drafts`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết nháp:", error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      // Thêm header authorization nếu có token
      const headers = {};
      const token = getAuthToken();

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error("Không có token xác thực, vui lòng đăng nhập");
      }

      // Chuyển đổi tags từ chuỗi sang mảng nếu cần
      const tagsArray = Array.isArray(postData.tags)
        ? postData.tags
        : postData.tags
        ? postData.tags.split(",").map((tag) => tag.trim())
        : [];

      // Chuẩn bị dữ liệu theo đúng schema bài viết
      const formattedData = {
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: tagsArray,
        thumbnail: postData.thumbnail || "",
        video: postData.video || "",
        // Các trường khác sẽ được tự động xử lý bởi backend
      };

      console.log("Dữ liệu gửi đi:", formattedData);
      console.log("Headers:", headers);

      // Để debug xem token có hợp lệ không
      if (token) {
        try {
          const tokenData = token.split(".")[1];
          const decodedData = JSON.parse(atob(tokenData));
          console.log("Token data:", decodedData);
          // Kiểm tra token hết hạn
          const expiryTime = decodedData.exp * 1000;
          if (expiryTime < Date.now()) {
            console.error("Token đã hết hạn");
          }
        } catch (e) {
          console.error("Lỗi khi decode token:", e);
        }
      }

      // Gọi API để tạo bài viết
      const response = await axios.post(`${API_URL}/posts`, formattedData, {
        headers,
      });
      console.log("Phản hồi từ API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("Không nhận được phản hồi:", error.request);
      }
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      console.log("ID bài viết cần cập nhật:", id);
      console.log("Dữ liệu gốc nhận được:", postData);

      // Chuyển đổi tags từ chuỗi sang mảng nếu cần
      const tagsArray = Array.isArray(postData.tags)
        ? postData.tags
        : postData.tags
        ? postData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        : [];

      // Chuẩn bị dữ liệu theo đúng schema bài viết
      const formattedData = {
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: tagsArray,
        thumbnail: postData.thumbnail || "",
        video: postData.video || "",
      };

      console.log("Dữ liệu đã format để gửi đi:", formattedData);

      // Gọi API để cập nhật bài viết
      const response = await axios.put(
        `${API_URL}/posts/${id}`,
        formattedData,
        {
          headers: {
            ...getHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Phản hồi từ server:", response.data);

      // Kiểm tra và xử lý phản hồi
      if (response.data) {
        // Lấy dữ liệu bài viết đã cập nhật
        const updatedPost = await axios.get(`${API_URL}/posts/${id}`, {
          headers: getHeaders(),
        });

        if (updatedPost.data) {
          return {
            success: true,
            data: updatedPost.data,
            message: "Cập nhật bài viết thành công",
          };
        }
      }

      throw new Error("Không nhận được dữ liệu từ server");
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
        console.error("Status code:", error.response.status);
        throw new Error(
          error.response.data.message ||
            error.response.data.error ||
            "Lỗi khi cập nhật bài viết"
        );
      }
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
      }

      console.log(`Gửi request xóa bài viết ID: ${id}`);
      console.log(`Authorization token: ${token.substring(0, 15)}...`);

      // Gọi API để xóa bài viết
      const response = await axios.delete(`${API_URL}/posts/${id}`, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);

      // Cung cấp thông báo lỗi chi tiết hơn
      let errorMessage = "Lỗi không xác định";

      if (error.response) {
        // Lỗi từ phía server với mã trạng thái
        if (error.response.status === 401) {
          errorMessage = "Bạn không có quyền xóa bài viết này";
          console.error("Lỗi xác thực hoặc quyền hạn:", error.response.data);
        } else {
          errorMessage =
            error.response.data.error ||
            `Lỗi server (${error.response.status}): ${JSON.stringify(
              error.response.data
            )}`;
        }
        console.error("Chi tiết lỗi từ server:", error.response.data);
      } else if (error.request) {
        // Yêu cầu được gửi nhưng không nhận được phản hồi
        errorMessage = "Không nhận được phản hồi từ server";
      } else {
        // Lỗi khi thiết lập yêu cầu
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  likePost: async (id) => {
    try {
      // Gọi API để thích bài viết
      const response = await axios.post(
        `${API_URL}/posts/${id}/like`,
        {},
        {
          headers: getHeaders(),
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Không thể thích bài viết");
      }

      return response.data;
    } catch (error) {
      // Kiểm tra lỗi cụ thể để trả về thông báo phù hợp
      if (error.response) {
        // Lỗi từ server
        const errorMsg = error.response.data.error || "Lỗi khi thích bài viết";
        console.error("Server error:", errorMsg);
        throw new Error(errorMsg);
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("Không có phản hồi từ server");
        throw new Error("Không thể kết nối đến server");
      } else {
        // Lỗi khi thiết lập yêu cầu
        console.error("Lỗi khi thích bài viết:", error.message);
        throw error;
      }
    }
  },

  unlikePost: async (id) => {
    try {
      // Gọi API để bỏ thích bài viết
      const response = await axios.delete(`${API_URL}/posts/${id}/like`, {
        headers: getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Không thể bỏ thích bài viết");
      }

      return response.data;
    } catch (error) {
      // Kiểm tra lỗi cụ thể để trả về thông báo phù hợp
      if (error.response) {
        // Lỗi từ server
        const errorMsg =
          error.response.data.error || "Lỗi khi bỏ thích bài viết";
        console.error("Server error:", errorMsg);
        throw new Error(errorMsg);
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("Không có phản hồi từ server");
        throw new Error("Không thể kết nối đến server");
      } else {
        // Lỗi khi thiết lập yêu cầu
        console.error("Lỗi khi bỏ thích bài viết:", error.message);
        throw error;
      }
    }
  },

  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      throw error;
    }
  },

  getTags: async () => {
    try {
      // Gọi API để lấy danh sách tất cả tags
      const response = await axios.get(`${API_URL}/tags`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tags:", error);
      throw error;
    }
  },

  incrementPostViews: async (id) => {
    try {
      // Gọi API để tăng lượt xem
      const response = await axios.put(
        `${API_URL}/posts/${id}/view`,
        {},
        {
          headers: getHeaders(),
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Không thể tăng lượt xem");
      }

      // Nếu bài viết có hình thumbnail, tiền tải hình ảnh
      if (response.data.post && response.data.post.thumbnail) {
        try {
          console.log(
            "Tiền tải hình ảnh cho bài viết:",
            response.data.post.thumbnail
          );
          const img = new Image();
          img.src = response.data.post.thumbnail;
          img.onload = () => {
            console.log("Đã tải thành công hình ảnh cho bài viết:", id);
            // Không lưu vào localStorage để tránh vượt quá giới hạn
          };
        } catch (imgError) {
          console.error("Lỗi khi tải hình ảnh bài viết:", imgError);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi khi tăng lượt xem bài viết:", error);
      // Xử lý lỗi
      if (error.response) {
        console.error("Lỗi từ server:", error.response.data);
        throw new Error(error.response.data.error || "Lỗi khi tăng lượt xem");
      } else if (error.request) {
        throw new Error("Không nhận được phản hồi từ server");
      } else {
        throw error;
      }
    }
  },

  formatVideoUrl,
};

// Hàm tiền tải hình ảnh
const preloadImages = (posts) => {
  // Tải không đồng bộ để không làm chậm luồng chính
  setTimeout(() => {
    posts.forEach((post) => {
      // Tiền tải thumbnail nếu có
      if (post.thumbnail) {
        const img = new Image();
        img.src = post.thumbnail;
        img.onload = () => {
          console.log("Đã tải thành công thumbnail cho bài viết:", post._id);
          // Không lưu vào localStorage vì có thể vượt quá giới hạn
        };
      }

      // Tiền tải avatar tác giả nếu có
      if (post.author && post.author.avatar) {
        const avatar = new Image();
        avatar.src = post.author.avatar;
        avatar.onload = () => {
          console.log(
            "Đã tải thành công avatar tác giả cho bài viết:",
            post._id
          );
          // Không lưu vào localStorage vì có thể vượt quá giới hạn
        };
      }
    });
  }, 100); // Trì hoãn một chút để không ảnh hưởng đến việc hiển thị trang
};

export default postService;
