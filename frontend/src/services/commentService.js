import axios from "axios";

const API_URL = "http://localhost:5002/api";

// Hàm helper để tạo config với token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Lấy danh sách bình luận của một bài viết
const getComments = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/comments/post/${postId}`);
    console.log("API Response comments:", response);
    console.log(
      "Comment data structure:",
      JSON.stringify(response.data.data?.[0], null, 2)
    );

    // Thêm log chi tiết về một comment cụ thể (nếu có)
    if (response.data && response.data.data && response.data.data.length > 0) {
      const firstComment = response.data.data[0];
      console.log("Mẫu comment:", {
        id: firstComment._id,
        authorType: typeof firstComment.author,
        authorIsObject: typeof firstComment.author === "object",
        authorIdFromObject: firstComment.author?._id,
        authorId:
          firstComment.author?.id ||
          firstComment.author?.["_id"] ||
          firstComment.author,
        authorUsername: firstComment.author?.username,
      });
    }

    // Nếu không có bình luận, trả về mảng rỗng
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.warn("API không trả về dữ liệu bình luận hợp lệ:", response.data);
      return {
        success: true,
        count: 0,
        data: [],
      };
    }

    return response.data;
  } catch (error) {
    console.error("API Error:", error.response || error);
    throw (
      error.response?.data?.error || "Có lỗi xảy ra khi lấy danh sách bình luận"
    );
  }
};

// Tạo bình luận mới
const createComment = async (postId, content) => {
  try {
    const config = getAuthConfig();
    console.log(
      "Đang gửi bình luận:",
      { post: postId, content },
      "với config:",
      config
    );
    const response = await axios.post(
      `${API_URL}/comments`,
      {
        post: postId,
        content,
      },
      config
    );
    console.log("Kết quả tạo bình luận:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response || error);
    const errorMessage =
      error.response?.data?.error || "Có lỗi xảy ra khi tạo bình luận";
    if (error.response?.status === 401) {
      return { success: false, error: "Bạn cần đăng nhập để bình luận" };
    }
    throw errorMessage;
  }
};

// Cập nhật bình luận
const updateComment = async (commentId, content) => {
  try {
    console.log("commentService: Bắt đầu cập nhật bình luận", commentId);
    console.log("commentService: Nội dung bình luận mới:", content);

    const config = getAuthConfig();
    const response = await axios.put(
      `${API_URL}/comments/${commentId}`,
      {
        content: content, // Đảm bảo gửi đúng định dạng với key content
      },
      config
    );

    console.log("commentService: Kết quả cập nhật bình luận:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("commentService: Lỗi cập nhật bình luận:", error);
    console.error(
      "commentService: Chi tiết lỗi:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Có lỗi xảy ra khi cập nhật bình luận";
  }
};

// Xóa bình luận
const deleteComment = async (commentId) => {
  try {
    console.log("commentService: Bắt đầu xóa bình luận", commentId);
    const config = getAuthConfig();
    console.log("commentService: Config xóa bình luận:", {
      hasToken: !!config.headers.Authorization,
      token: config.headers.Authorization
        ? config.headers.Authorization.substring(0, 20) + "..."
        : null,
    });

    // Sử dụng fetch thay vì axios để phát hiện lỗi chi tiết hơn
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: config.headers.Authorization,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("commentService: Lỗi từ API:", errorText);
      throw new Error(`Lỗi ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("commentService: API xóa bình luận thành công:", data);
    return data;
  } catch (error) {
    console.error("commentService: Lỗi chi tiết:", error);
    if (error.response) {
      console.error("commentService: Response status:", error.response.status);
      console.error("commentService: Response data:", error.response.data);
    }
    throw (
      error.response?.data?.error ||
      error.message ||
      "Có lỗi xảy ra khi xóa bình luận"
    );
  }
};

// Thích/bỏ thích bình luận
const likeComment = async (commentId) => {
  try {
    console.log("Gọi API like comment với ID:", commentId);
    const config = getAuthConfig();
    const response = await axios.put(
      `${API_URL}/comments/${commentId}/like`,
      {},
      config
    );
    console.log("Kết quả likeComment:", response.data);

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Không thể thích/bỏ thích bình luận"
      );
    }

    // Kiểm tra cấu trúc dữ liệu của comment
    if (response.data.success && response.data.data) {
      const commentData = response.data.data;
      console.log("Thông tin comment sau khi like:", {
        id: commentData._id,
        likes: commentData.likes,
        author: commentData.author,
        authorId: commentData.author?._id || commentData.author,
      });
    }

    return response.data;
  } catch (error) {
    // Kiểm tra lỗi cụ thể để trả về thông báo phù hợp
    if (error.response) {
      // Lỗi từ server
      const errorMsg =
        error.response.data.error || "Lỗi khi thích/bỏ thích bình luận";
      console.error("Server error:", errorMsg);
      throw new Error(errorMsg);
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error("Không có phản hồi từ server");
      throw new Error("Không thể kết nối đến server");
    } else {
      // Lỗi khi thiết lập yêu cầu
      console.error("Lỗi khi thích/bỏ thích bình luận:", error.message);
      throw error;
    }
  }
};

// Trả lời bình luận
const replyToComment = async (postId, content, parentCommentId) => {
  try {
    const config = getAuthConfig();
    console.log(
      "Đang gửi trả lời bình luận:",
      { post: postId, content, parentComment: parentCommentId },
      "với config:",
      config
    );
    const response = await axios.post(
      `${API_URL}/comments`,
      {
        post: postId,
        content,
        parentComment: parentCommentId,
      },
      config
    );
    console.log("Kết quả trả lời bình luận:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response || error);
    const errorMessage =
      error.response?.data?.error || "Có lỗi xảy ra khi trả lời bình luận";
    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để trả lời bình luận",
      };
    }
    throw errorMessage;
  }
};

const commentService = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  replyToComment,
};

export default commentService;
