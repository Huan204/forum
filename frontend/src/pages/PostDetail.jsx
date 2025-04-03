import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import postService from "../services/postService";
import commentService from "../services/commentService";
import PostActions from "../components/PostActions";
import { toast } from "react-toastify";
import { FaEye, FaHeart, FaComment, FaShareAlt } from "react-icons/fa";

// Custom styling
const styleContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  .animate-pulse-custom {
    animation: pulse 1.5s infinite;
  }
  
  .hover-lift {
    transition: transform 0.2s ease-out;
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);
  }
`;

// Lấy base URL của API
const getApiBaseUrl = () => {
  try {
    return process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";
  } catch (error) {
    console.error("Lỗi khi lấy API base URL:", error);
    return "http://localhost:5002"; // URL mặc định khi xảy ra lỗi
  }
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictedUsers, setRestrictedUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [showCommentMenu, setShowCommentMenu] = useState(null);
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const commentMenuRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [viewIncremented, setViewIncremented] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const avatarUrl = useRef(null);
  const videoPlayerRef = useRef(null);
  const [showFullContent, setShowFullContent] = useState(false);
  const [contentLength, setContentLength] = useState(0);
  const MAX_CONTENT_LENGTH = 1000; // Số ký tự tối đa trước khi hiển thị "Xem thêm"
  const [isVideoPaused, setIsVideoPaused] = useState(true); // Thêm state cho trạng thái video
  const [isProcessingVideoAction, setIsProcessingVideoAction] = useState(false); // Theo dõi trạng thái xử lý video

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log("Đang tải bài viết với ID:", id);

        // Kiểm tra thông tin người dùng đăng nhập hiện tại
        const currentUser = {
          userId: localStorage.getItem("userId"),
          username: localStorage.getItem("username"),
          role: localStorage.getItem("role"),
          token: localStorage.getItem("token") ? "Có token" : "Không có token",
        };
        console.log("Thông tin người dùng hiện tại:", currentUser);

        const data = await postService.getPost(id);
        console.log("Dữ liệu bài viết nhận được:", data);

        if (!data) {
          setError("Không có dữ liệu trả về từ API");
          toast.error("Không có dữ liệu trả về từ API");
        } else if (data.success && data.data) {
          // Truy cập vào data.data trong response
          const postData = data.data;

          // Xử lý avatar cho tác giả bài viết
          if (postData.author && postData.author.avatar) {
            // Xử lý avatar URL nếu cần
            let avatarUrl = postData.author.avatar;

            // Nếu avatar không phải là data URL hoặc URL đầy đủ, thêm tiền tố
            if (
              !avatarUrl.startsWith("data:image") &&
              !avatarUrl.startsWith("http")
            ) {
              avatarUrl = `${getApiBaseUrl()}${
                avatarUrl.startsWith("/") ? "" : "/"
              }${avatarUrl}`;
            }

            // Tiền tải ảnh avatar với URL đã được xử lý
            const authorImg = new Image();
            authorImg.src = avatarUrl;
            authorImg.onerror = () => {
              console.log("Lỗi tải avatar tác giả, sử dụng ảnh mặc định");
              // Đặt giá trị mặc định cho avatar nếu lỗi
              postData.author.avatarFallback = true;
            };

            // Cập nhật trực tiếp avatar đã xử lý vào dữ liệu bài viết
            postData.author.avatar = avatarUrl;
          } else {
            postData.author.avatarFallback = true;
          }

          // Tiền tải thumbnail nếu có
          if (postData.thumbnail) {
            const img = new Image();
            img.src = postData.thumbnail;
            img.onerror = () => setThumbnailError(true);
          }

          setPost(postData);

          // Thiết lập URL avatar để tránh nhấp nháy
          if (postData.author && postData.author.avatar) {
            avatarUrl.current = postData.author.avatar;
          } else {
            avatarUrl.current = "/default-avatar.png";
          }

          // Kiểm tra xem bài viết đã được like chưa
          // Thông thường bạn sẽ kiểm tra user hiện tại có trong danh sách likes của bài viết không
          const userId = localStorage.getItem("userId");
          if (userId && postData.likes && postData.likes.includes(userId)) {
            setIsLiked(true);
          }

          // Kiểm tra xem người dùng hiện tại có phải là tác giả không
          const userRole = localStorage.getItem("role");

          if (userId && postData.author) {
            // Đảm bảo so sánh dưới dạng chuỗi để tránh sai khác định dạng
            const authorId = String(postData.author._id);
            const currentUserId = String(userId);

            // Kiểm tra nếu ID người dùng trùng với ID tác giả hoặc là admin
            const isAuthorUser = authorId === currentUserId;
            const isAdmin = userRole === "admin";

            console.log("DEBUG: [fetchPost] Kiểm tra quyền tác giả:", {
              userId: currentUserId,
              authorId: authorId,
              isMatch: isAuthorUser,
              userRole,
              isAdmin,
            });

            setIsAuthor(isAuthorUser || isAdmin);

            // Log để debug
            console.log(
              "DEBUG: [fetchPost] Đã thiết lập isAuthor:",
              isAuthorUser || isAdmin
            );
          } else {
            console.log(
              "DEBUG: [fetchPost] Không thể xác định quyền tác giả:",
              {
                userId,
                hasAuthor: !!postData.author,
              }
            );
            setIsAuthor(false); // Đặt là false nếu không có đủ thông tin
          }

          // Lấy danh sách người dùng bị hạn chế từ API hoặc localStorage
          if (postData.restrictedUsers) {
            setRestrictedUsers(postData.restrictedUsers);
          }
        } else {
          setError("Cấu trúc dữ liệu không đúng định dạng");
          toast.error("Cấu trúc dữ liệu không đúng định dạng");
        }
      } catch (error) {
        console.error("Chi tiết lỗi:", error);
        setError(error.message || "Không thể tải bài viết");
        toast.error(`Không thể tải bài viết: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Thêm useEffect để tăng lượt xem khi truy cập trang chi tiết
  useEffect(() => {
    const incrementViewCount = async () => {
      // Chỉ tăng lượt xem nếu đã tải bài viết thành công và chưa tăng trước đó
      if (post && !viewIncremented) {
        try {
          const response = await postService.incrementPostViews(id);
          setViewIncremented(true);

          // Chỉ cập nhật UI nếu đây là lần đầu xem bài viết
          if (!response.data.hasViewedBefore) {
            // Cập nhật UI với số lượt xem mới
            setPost((prevPost) => ({
              ...prevPost,
              views: response.data.views,
            }));
            console.log("Đã tăng lượt xem cho bài viết");
          } else {
            console.log(
              "Người dùng đã xem bài viết trước đó, không tăng lượt xem"
            );
          }
        } catch (error) {
          console.error("Lỗi khi tăng lượt xem:", error);
          // Xử lý lỗi một cách im lặng, không hiển thị cho người dùng
        }
      }
    };

    incrementViewCount();
  }, [post, id, viewIncremented]);

  // Lấy danh sách bình luận
  const fetchComments = async () => {
    try {
      const response = await commentService.getComments(id);
      console.log("Response từ API comments:", response);

      // Chi tiết cấu trúc bình luận đầu tiên nếu có
      if (response.success && response.data && response.data.length > 0) {
        const firstComment = response.data[0];
        console.log("Chi tiết bình luận đầu tiên:", {
          id: firstComment._id,
          content: firstComment.content,
          author: firstComment.author,
          authorId: firstComment.author?._id || firstComment.author,
          authorType: typeof firstComment.author,
          user: firstComment.user,
          likes: firstComment.likes,
          parentComment: firstComment.parentComment,
        });
      }

      // In thông tin người dùng hiện tại và kiểm tra
      const currentUserId = localStorage.getItem("userId");
      const currentUsername = localStorage.getItem("username");
      const userRole = localStorage.getItem("role");
      const isAdmin = userRole === "admin";

      console.log("Thông tin người dùng hiện tại:", {
        userId: currentUserId,
        username: currentUsername,
        role: userRole,
        isAdmin,
      });

      if (response.success) {
        // Thêm trường isCurrentUserAuthor cho mỗi comment
        const commentsWithAuthorFlag = response.data.map((comment) => {
          // Xử lý avatar nếu author là object
          if (
            comment.author &&
            typeof comment.author === "object" &&
            comment.author.avatar
          ) {
            let avatarUrl = comment.author.avatar;

            // Chuẩn hóa URL avatar
            if (
              !avatarUrl.startsWith("data:image") &&
              !avatarUrl.startsWith("http")
            ) {
              avatarUrl = `${getApiBaseUrl()}${
                avatarUrl.startsWith("/") ? "" : "/"
              }${avatarUrl}`;
              comment.author.avatar = avatarUrl;
            }
          }

          // Xác định tác giả của bình luận
          let commentAuthorId = null;
          if (comment.author) {
            // Trường hợp author là object với _id
            if (typeof comment.author === "object" && comment.author._id) {
              commentAuthorId = String(comment.author._id);
            }
            // Trường hợp author là string (ID)
            else if (typeof comment.author === "string") {
              commentAuthorId = String(comment.author);
            }
          }

          // Chuyển đổi ID người dùng hiện tại sang chuỗi để so sánh chính xác
          const currentUserIdStr = currentUserId ? String(currentUserId) : null;

          console.log("Kiểm tra quyền bình luận:", {
            commentId: comment._id,
            commentAuthorId: commentAuthorId,
            currentUserId: currentUserIdStr,
            isMatch: commentAuthorId === currentUserIdStr,
            userRole: userRole,
            isAdmin: isAdmin,
          });

          // Người dùng là tác giả bình luận hoặc là admin
          const isAuthor =
            currentUserIdStr &&
            (currentUserIdStr === commentAuthorId || isAdmin);

          return {
            ...comment,
            isCurrentUserAuthor: isAuthor,
          };
        });

        // Tổ chức comments thành cấu trúc phân cấp (parent-child)
        const parentComments = commentsWithAuthorFlag.filter(
          (comment) => !comment.parentComment
        );

        const childComments = commentsWithAuthorFlag.filter(
          (comment) => comment.parentComment
        );

        // Thêm các child comments vào mỗi parent comment
        parentComments.forEach((parent) => {
          // Lọc các phản hồi cho bình luận này
          const replies = childComments.filter(
            (child) => child.parentComment === parent._id
          );

          // Đảm bảo các phản hồi cũng có flag isCurrentUserAuthor
          replies.forEach((reply) => {
            // Kiểm tra nếu phản hồi chưa có flag isCurrentUserAuthor
            if (reply.isCurrentUserAuthor === undefined) {
              // Xác định tác giả của phản hồi
              let replyAuthorId = null;
              if (reply.author) {
                if (typeof reply.author === "object" && reply.author._id) {
                  replyAuthorId = String(reply.author._id);
                } else if (typeof reply.author === "string") {
                  replyAuthorId = String(reply.author);
                }
              }

              // Người dùng là tác giả phản hồi hoặc là admin
              const isAuthor =
                currentUserIdStr &&
                (currentUserIdStr === replyAuthorId || isAdmin);

              reply.isCurrentUserAuthor = isAuthor;
            }
          });

          // Gán phản hồi vào bình luận cha
          parent.replies = replies;
        });

        console.log("Comments đã phân cấp:", parentComments);

        setComments(commentsWithAuthorFlag);

        // Cập nhật số lượng bình luận trong bài viết nếu cần
        if (post && response.count !== post.commentsCount) {
          setPost((prevPost) => ({
            ...prevPost,
            commentsCount: response.count,
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bình luận:", error);
      toast.error("Không thể tải danh sách bình luận");
    }
  };

  // Xử lý gửi bình luận
  const handleSubmitComment = async () => {
    try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để bình luận");
        navigate("/login");
        return;
      }

      if (!commentContent.trim()) {
        toast.error("Vui lòng nhập nội dung bình luận");
        return;
      }

      toast.info("Đang gửi bình luận...", { autoClose: 1000 });
      const response = await commentService.createComment(id, commentContent);

      if (response.success) {
        // Tạo bình luận thành công
        setCommentContent("");
        toast.success("Đã gửi bình luận thành công");

        // Cập nhật danh sách bình luận
        if (response.data) {
          // Nếu API trả về comment đã tạo, thêm vào danh sách hiện tại
          setComments((prevComments) => [response.data, ...prevComments]);
          // Cập nhật số lượng bình luận
          setPost((prevPost) => ({
            ...prevPost,
            commentsCount: (prevPost.commentsCount || 0) + 1,
          }));
        } else {
          // Nếu không, tải lại toàn bộ danh sách
          await fetchComments();
        }
      } else {
        // Xử lý lỗi
        toast.error(response.error || "Không thể gửi bình luận");
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      toast.error(
        typeof error === "string" ? error : "Không thể gửi bình luận"
      );
    }
  };

  // Xử lý chỉnh sửa bình luận
  const handleEditComment = async () => {
    if (!editingComment || !commentContent.trim()) return;

    try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("role");

      if (!token || !userId) {
        toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
        return;
      }

      // Xác định quyền chỉnh sửa - chỉ tác giả bình luận mới có quyền chỉnh sửa
      let canEdit = false;
      let authorId = null;

      if (editingComment.author) {
        if (
          typeof editingComment.author === "object" &&
          editingComment.author._id
        ) {
          authorId = String(editingComment.author._id);
        } else if (typeof editingComment.author === "string") {
          authorId = editingComment.author;
        }
      }

      // Admin không có quyền chỉnh sửa bình luận của người khác, chỉ có quyền xóa
      canEdit = userId === authorId;

      console.log("Kiểm tra quyền sửa bình luận:", {
        commentId: editingComment._id,
        authorId,
        userId,
        userRole,
        canEdit,
      });

      if (!canEdit) {
        toast.error("Bạn không có quyền chỉnh sửa bình luận này");
        setEditingComment(null);
        setCommentContent("");
        return;
      }

      // Gọi API cập nhật bình luận
      const updatedComment = await commentService.updateComment(
        editingComment._id,
        commentContent // Truyền trực tiếp nội dung text thay vì object
      );

      // Cập nhật state hiển thị
      const updatedComments = comments.map((comment) => {
        if (comment._id === updatedComment._id) {
          return { ...comment, content: updatedComment.content };
        }
        return comment;
      });

      setComments(updatedComments);
      setEditingComment(null);
      setCommentContent("");
      toast.success("Đã cập nhật bình luận");
    } catch (error) {
      console.error("Lỗi cập nhật bình luận:", error);
      toast.error("Không thể cập nhật bình luận: " + error.message);
    }
  };

  // Xử lý xóa bình luận
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    console.log("==== BẮT ĐẦU XÓA BÌNH LUẬN ====");
    console.log("ID bình luận cần xóa:", commentId);

    if (window.confirm("Bạn có chắc muốn xóa bình luận này không?")) {
      try {
        // Kiểm tra đăng nhập
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("role");

        console.log("Thông tin người dùng hiện tại:", {
          userId,
          userRole,
          hasToken: !!token,
        });

        if (!token || !userId) {
          console.error("Thiếu thông tin đăng nhập:", {
            token: !!token,
            userId,
          });
          toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
          return;
        }

        // Tìm bình luận cần xóa
        const commentToDelete = comments.find(
          (comment) => comment._id === commentId
        );
        if (!commentToDelete) {
          console.error("Không tìm thấy bình luận với ID:", commentId);
          toast.error("Không tìm thấy bình luận");
          return;
        }

        console.log("Thông tin bình luận cần xóa:", {
          id: commentToDelete._id,
          content: commentToDelete.content.substring(0, 50) + "...",
          authorId:
            typeof commentToDelete.author === "object"
              ? commentToDelete.author._id
              : commentToDelete.author,
          isCurrentUserAuthor: commentToDelete.isCurrentUserAuthor,
        });

        // Gọi API xóa bình luận
        console.log("Đang gọi API xóa bình luận...");

        // Tạo URL API để hiển thị rõ ràng
        const apiUrl = `http://localhost:5002/api/comments/${commentId}`;
        console.log("URL API xóa bình luận:", apiUrl);
        console.log("Header gửi đi:", {
          Authorization: `Bearer ${token.substring(0, 15)}...`,
        });

        // Sử dụng fetch trực tiếp để xem rõ lỗi
        const response = await fetch(apiUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Kết quả API:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Lỗi từ API:", errorText);
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Phản hồi API thành công:", data);

        // Đảm bảo response có định dạng chuẩn
        if (data.success === false) {
          throw new Error(data.error || "Có lỗi khi xóa bình luận");
        }

        // Cập nhật state hiển thị
        const updatedComments = comments.filter(
          (comment) => comment._id !== commentId
        );

        console.log(
          `Số lượng bình luận: trước = ${comments.length}, sau = ${updatedComments.length}`
        );

        setComments(updatedComments);
        setShowCommentMenu(null);
        toast.success("Đã xóa bình luận thành công");
        console.log("==== KẾT THÚC XÓA BÌNH LUẬN - THÀNH CÔNG ====");
      } catch (error) {
        console.error("==== LỖI XÓA BÌNH LUẬN ====", error);
        toast.error("Không thể xóa bình luận: " + error.message);
      }
    } else {
      console.log("Người dùng đã hủy xóa bình luận");
    }
  };

  // Xử lý báo cáo bình luận
  const handleReportComment = async (commentId, authorId) => {
    if (!commentId) return;

    try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");
      if (!token || !currentUserId) {
        toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
        return;
      }

      // Báo cáo tự mình là không hợp lệ
      if (currentUserId === authorId) {
        toast.error("Bạn không thể báo cáo bình luận của chính mình");
        return;
      }

      // Lấy lý do báo cáo từ người dùng
      const reason = prompt("Vui lòng nhập lý do báo cáo:");
      if (!reason) return; // Người dùng hủy báo cáo

      // Gọi API báo cáo bình luận (giả định)
      // await commentService.reportComment(commentId, { reason });

      // Đây là mã giả, cần triển khai API báo cáo thực tế
      console.log("Báo cáo bình luận:", { commentId, reason });

      setShowCommentMenu(null);
      toast.success(
        "Đã gửi báo cáo. Cảm ơn bạn đã giúp cộng đồng an toàn hơn."
      );
    } catch (error) {
      console.error("Lỗi báo cáo bình luận:", error);
      toast.error("Không thể gửi báo cáo: " + error.message);
    }
  };

  // Xử lý trả lời bình luận
  const handleReplyToComment = async (parentId) => {
    if (!parentId || !replyContent.trim()) return;

    try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");
      if (!token || !userId) {
        toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
        return;
      }

      // Gọi API gửi phản hồi
      const newReply = {
        content: replyContent,
        author: { _id: userId, username },
        createdAt: new Date().toISOString(),
        _id: Date.now().toString(), // ID tạm thời
      };

      // Cập nhật state hiển thị
      const updatedComments = comments.map((comment) => {
        if (comment._id === parentId) {
          const replies = comment.replies || [];
          return {
            ...comment,
            replies: [...replies, newReply],
          };
        }
        return comment;
      });

      setComments(updatedComments);
      setReplyingTo(null);
      setReplyContent("");
      toast.success("Đã gửi phản hồi");

      // Gọi API phản hồi thực tế (giả định)
      // const savedReply = await commentService.replyToComment(parentId, { content: replyContent });

      // Cần triển khai API phản hồi bình luận thực tế
    } catch (error) {
      console.error("Lỗi gửi phản hồi:", error);
      toast.error("Không thể gửi phản hồi: " + error.message);
    }
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng menu của bài viết
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }

      // Đóng modal hạn chế người dùng
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        showRestrictionModal
      ) {
        setShowRestrictionModal(false);
      }

      // Đóng menu 3 chấm của bình luận khi click bên ngoài
      if (showCommentMenu !== null) {
        const commentMenuElement = document.getElementById(
          `comment-menu-${showCommentMenu}`
        );
        if (commentMenuElement && !commentMenuElement.contains(event.target)) {
          setShowCommentMenu(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRestrictionModal, showCommentMenu]);

  // Lấy danh sách bình luận khi hiển thị phần bình luận
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Xử lý like bài viết
  const handleLike = async () => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      navigate("/login");
      return;
    }

    setLikeLoading(true);
    try {
      if (!isLiked) {
        // Cập nhật UI ngay lập tức để phản hồi nhanh
        setIsLiked(true);
        setPost((prevPost) => ({
          ...prevPost,
          likesCount: prevPost.likesCount + 1,
        }));

        // Gọi API để thích bài viết
        const response = await postService.likePost(id);
        if (response.success) {
          toast.success("Đã thích bài viết", { autoClose: 2000 });
        } else {
          // Nếu API thất bại, khôi phục lại trạng thái
          setIsLiked(false);
          setPost((prevPost) => ({
            ...prevPost,
            likesCount: prevPost.likesCount - 1,
          }));
          toast.error(response.error || "Không thể thích bài viết");
        }
      } else {
        // Cập nhật UI ngay lập tức để phản hồi nhanh
        setIsLiked(false);
        setPost((prevPost) => ({
          ...prevPost,
          likesCount: Math.max(0, prevPost.likesCount - 1),
        }));

        // Gọi API để bỏ thích bài viết
        const response = await postService.unlikePost(id);
        if (response.success) {
          toast.success("Đã bỏ thích bài viết", { autoClose: 2000 });
        } else {
          // Nếu API thất bại, khôi phục lại trạng thái
          setIsLiked(true);
          setPost((prevPost) => ({
            ...prevPost,
            likesCount: prevPost.likesCount + 1,
          }));
          toast.error(response.error || "Không thể bỏ thích bài viết");
        }
      }
    } catch (error) {
      // Phục hồi trạng thái ban đầu nếu có lỗi
      setIsLiked(!isLiked);
      setPost((prevPost) => ({
        ...prevPost,
        likesCount: isLiked
          ? prevPost.likesCount + 1
          : Math.max(0, prevPost.likesCount - 1),
      }));

      // Hiển thị thông báo lỗi
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Không thể thực hiện hành động. Vui lòng thử lại sau.");
      }
      console.error("Lỗi khi thích/bỏ thích:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Xử lý bình luận
  const handleComment = () => {
    setShowComments(!showComments);
    // Có thể thêm code để cuộn đến phần bình luận
    if (!showComments) {
      setTimeout(() => {
        document
          .getElementById("comments-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Xử lý chia sẻ
  const handleShare = () => {
    // Tạo URL hiện tại để chia sẻ
    const shareUrl = window.location.href;

    // Sử dụng Web Share API nếu trình duyệt hỗ trợ
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: `Xem bài viết: ${post.title}`,
          url: shareUrl,
        })
        .then(() => toast.success("Đã chia sẻ thành công"))
        .catch((error) => {
          console.error("Lỗi khi chia sẻ:", error);
          fallbackShare();
        });
    } else {
      fallbackShare();
    }
  };

  // Phương thức dự phòng khi trình duyệt không hỗ trợ Web Share API
  const fallbackShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("Đã sao chép liên kết vào clipboard"))
      .catch(() => toast.error("Không thể sao chép liên kết"));
  };

  // Xử lý báo cáo
  const handleReport = () => {
    // Đóng menu sau khi chọn
    setShowMenu(false);
    toast.info("Đã gửi báo cáo bài viết. Chúng tôi sẽ xem xét nội dung này.");
    // Thêm code để gửi báo cáo đến server
  };

  // Xử lý ẩn bài viết
  const handleHide = () => {
    // Đóng menu sau khi chọn
    setShowMenu(false);
    toast.info("Đã ẩn bài viết này khỏi feed của bạn.");
    // Thêm code để lưu trạng thái ẩn vào localStorage hoặc gửi API
  };

  // Xử lý chặn người đăng
  const handleBlockUser = () => {
    // Đóng menu sau khi chọn
    setShowMenu(false);
    if (post.author) {
      toast.info(`Đã ẩn tất cả bài viết từ ${post.author.username}.`);
      // Thêm code để lưu trạng thái chặn vào localStorage hoặc gửi API
    }
  };

  // Mở modal hạn chế người xem
  const handleOpenRestrictionModal = () => {
    setShowMenu(false);
    setShowRestrictionModal(true);
  };

  // Xử lý chỉnh sửa bài viết
  const handleEditPost = () => {
    setShowMenu(false);
    // Chuyển hướng đến trang chỉnh sửa
    window.location.href = `/posts/${id}/edit`;
  };

  // Xử lý xóa bài viết
  const handleDeletePost = async () => {
    setShowMenu(false);

    // Kiểm tra quyền trước khi xác nhận xóa
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!userId) {
      toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
      return;
    }

    if (!token) {
      toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    // Debug thông tin
    console.log("Thông tin xóa bài viết:", {
      postId: id,
      userId: userId,
      authorId: post.author?._id,
      userRole: userRole,
      isAuthor: isAuthor,
      token: token ? "Có token" : "Không có token",
    });

    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        console.log("Bắt đầu xóa bài viết với ID:", id);
        toast.info("Đang xóa bài viết...");

        // Sử dụng trực tiếp fetch để có thể theo dõi quá trình xóa tốt hơn
        const response = await fetch(`http://localhost:5002/api/posts/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Trạng thái phản hồi:", response.status);

        if (response.ok) {
          console.log("Xóa bài viết thành công");
          toast.success("Đã xóa bài viết thành công");

          // Chuyển về trang chủ sau 1 giây
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else {
          // Đọc nội dung phản hồi lỗi
          const errorText = await response.text();
          let errorData = {};

          try {
            // Cố gắng parse phản hồi thành JSON
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.error("Không thể parse phản hồi lỗi:", errorText);
            errorData = { error: errorText || "Lỗi không xác định" };
          }

          console.error("Lỗi xóa bài viết:", errorData);

          // Hiển thị dialog với các thông tin chi tiết về lỗi
          const errorMessage = `
Không thể xóa bài viết. Chi tiết lỗi:
- Mã lỗi: ${response.status}
- Thông báo: ${errorData.error || "Không xác định"}
- Bạn có phải là tác giả: ${isAuthor ? "Có" : "Không"}
- ID người dùng: ${userId}
- ID tác giả: ${post.author?._id}
- Quyền của bạn: ${userRole || "Không xác định"}
          `;

          console.error(errorMessage);
          alert(errorMessage);
          toast.error(
            `Không thể xóa bài viết: ${
              errorData.error || `Lỗi ${response.status}`
            }`
          );
        }
      } catch (error) {
        console.error("Lỗi trong quá trình xóa bài viết:", error);
        toast.error(
          `Không thể xóa bài viết: ${error.message || "Lỗi kết nối đến server"}`
        );
      }
    }
  };

  // Xử lý thêm/xóa người dùng khỏi danh sách hạn chế
  const handleToggleUserRestriction = (userId) => {
    // Ví dụ code thêm/xóa người dùng khỏi danh sách hạn chế
    const isRestricted = restrictedUsers.includes(userId);
    let updatedList;

    if (isRestricted) {
      updatedList = restrictedUsers.filter((id) => id !== userId);
      toast.success("Đã bỏ hạn chế người dùng");
    } else {
      updatedList = [...restrictedUsers, userId];
      toast.success("Đã hạn chế người dùng khỏi xem bài viết");
    }

    setRestrictedUsers(updatedList);

    // Gửi API cập nhật danh sách người dùng bị hạn chế
    // postService.updatePostRestrictions(id, updatedList);
  };

  // Lưu danh sách hạn chế và đóng modal
  const handleSaveRestrictions = async () => {
    try {
      // Giả lập API cập nhật danh sách người dùng bị hạn chế
      // await postService.updatePostRestrictions(id, restrictedUsers);
      toast.success("Đã cập nhật hạn chế người xem");
      setShowRestrictionModal(false);
    } catch (error) {
      toast.error(
        "Không thể cập nhật: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  // Toggle menu
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Tìm và sửa hàm hiển thị avatar người dùng
  const getAvatarUrl = (user) => {
    // Kiểm tra nếu không có user hoặc không có thông tin avatar
    if (!user) return "/default-avatar.png";

    // Đã đánh dấu dùng avatar mặc định
    if (user.avatarFallback) return "/default-avatar.png";

    // Kiểm tra nếu không có đường dẫn avatar
    if (!user.avatar || user.avatar === "undefined" || user.avatar === "null") {
      return "/default-avatar.png";
    }

    // Nếu avatar đã là định dạng data URL hoặc URL đầy đủ, sử dụng trực tiếp
    if (
      user.avatar.startsWith("data:image") ||
      user.avatar.startsWith("http")
    ) {
      return user.avatar;
    }

    try {
      // Xây dựng đường dẫn đầy đủ đến avatar
      const baseUrl = getApiBaseUrl();
      const path = user.avatar.startsWith("/")
        ? user.avatar
        : `/${user.avatar}`;
      return `${baseUrl}${path}`;
    } catch (error) {
      console.error("Lỗi xử lý URL avatar:", error);
      return "/default-avatar.png";
    }
  };

  // Cập nhật độ dài nội dung khi post thay đổi
  useEffect(() => {
    if (post && post.content) {
      setContentLength(post.content.length);
    }
  }, [post]);

  // Hàm xử lý nút "Xem thêm"
  const toggleContentDisplay = () => {
    setShowFullContent(!showFullContent);
    // Cuộn xuống sau khi hiển thị nội dung đầy đủ
    if (!showFullContent) {
      setTimeout(() => {
        document
          .getElementById("post-content")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // Hàm hiển thị nội dung với chức năng "Xem thêm"
  const renderContent = () => {
    if (!post || !post.content) return null;

    // Nếu nội dung ngắn hơn giới hạn hoặc đã chọn hiển thị đầy đủ
    if (post.content.length <= MAX_CONTENT_LENGTH || showFullContent) {
      return <div>{post.content}</div>;
    }

    // Cắt nội dung và thêm "Xem thêm"
    const truncatedContent = post.content.substring(0, MAX_CONTENT_LENGTH);
    return (
      <>
        <div>{truncatedContent}...</div>
        <button
          onClick={toggleContentDisplay}
          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          Xem thêm
        </button>
      </>
    );
  };

  // Kiểm tra người dùng hiện tại có phải là tác giả không
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role"); // Thêm lấy role ở đây

    if (userId && post?.author?._id) {
      // Đảm bảo so sánh dưới dạng chuỗi
      const currentUserId = String(userId);
      const authorId = String(post.author._id);
      const isAdmin = userRole === "admin";

      // Log ra để debug
      console.log("DEBUG: [useEffect post] So sánh ID tác giả:", {
        userId: currentUserId,
        authorId: authorId,
        userRole: userRole,
        isAdmin: isAdmin,
        giống: currentUserId === authorId,
      });

      // Chỉ cập nhật nếu logic này khác với logic trong fetchPost (hiếm khi xảy ra)
      const newIsAuthor = currentUserId === authorId || isAdmin;
      if (newIsAuthor !== isAuthor) {
        console.log(
          "DEBUG: [useEffect post] Cập nhật isAuthor thành:",
          newIsAuthor
        );
        setIsAuthor(newIsAuthor);
      }
    } else {
      console.log(
        "DEBUG: [useEffect post] Không đủ thông tin để kiểm tra tác giả:",
        {
          userId: userId,
          hasAuthor: !!post?.author?._id,
        }
      );
      // Nếu không có đủ thông tin, đảm bảo isAuthor là false
      if (isAuthor) {
        console.log(
          "DEBUG: [useEffect post] Đặt isAuthor thành false vì thiếu thông tin."
        );
        setIsAuthor(false);
      }
    }
  }, [post, isAuthor]); // Thêm isAuthor vào dependencies để tránh cập nhật không cần thiết

  const refreshPost = () => {
    window.location.reload();
  };

  // Thêm interval để kiểm tra trạng thái video
  useEffect(() => {
    const checkVideoState = () => {
      if (videoPlayerRef.current) {
        // Cập nhật state isVideoPaused dựa trên trạng thái thực tế của video
        setIsVideoPaused(videoPlayerRef.current.paused);
      }
    };

    // Thiết lập interval kiểm tra trạng thái video mỗi 200ms
    const intervalId = setInterval(checkVideoState, 200);

    return () => clearInterval(intervalId);
  }, []);

  // Dọn dẹp event listeners khi component unmount
  useEffect(() => {
    return () => {
      // Xóa tất cả event listeners khi component unmount
      if (videoPlayerRef.current) {
        videoPlayerRef.current.removeEventListener("play", () => {});
        videoPlayerRef.current.removeEventListener("pause", () => {});
        videoPlayerRef.current.removeEventListener("ended", () => {});
      }
    };
  }, []);

  // Thêm useEffect để đảm bảo thông tin người dùng được đồng bộ
  useEffect(() => {
    // Kiểm tra và đồng bộ thông tin người dùng từ token nếu thiếu
    const syncUserInfo = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("role");

      console.log("Kiểm tra thông tin người dùng:", {
        token: token ? "Có" : "Không có",
        userId: userId || "Không có",
        username: username || "Không có",
        role: role || "Không có",
      });

      // Nếu có token nhưng không có userId hoặc role, thử lấy lại thông tin
      if (token && (!userId || !role || !username)) {
        try {
          console.log("Đang đồng bộ thông tin người dùng từ token...");
          const response = await fetch("http://localhost:5002/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            console.log("Đã lấy thông tin người dùng:", userData);

            if (userData.success && userData.data) {
              // Cập nhật thông tin vào localStorage
              localStorage.setItem("userId", userData.data._id);
              localStorage.setItem("username", userData.data.username);
              localStorage.setItem("role", userData.data.role || "user");
              console.log("Đã đồng bộ thông tin người dùng thành công");
            }
          } else {
            console.error("Không thể lấy thông tin người dùng");
          }
        } catch (error) {
          console.error("Lỗi khi đồng bộ thông tin người dùng:", error);
        }
      }
    };

    syncUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10 text-xl">{error}</div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-10 text-xl">Không tìm thấy bài viết</div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      <div className="container mx-auto px-4 py-8">
        {/* Phần Header */}
        <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden">
          {/* Tiêu đề bài viết */}
          <div className="px-6 pt-6 pb-3">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors duration-300">
                {post.title}
              </h1>

              {/* PostActions component */}
              <PostActions
                post={post}
                currentUser={{
                  _id: localStorage.getItem("userId"),
                  username: localStorage.getItem("username"),
                  role: localStorage.getItem("role"),
                }}
                onDelete={() => navigate("/posts")}
                onRefresh={refreshPost}
              />
            </div>

            {/* Thông tin tác giả và meta */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2">
              {post.author && (
                <Link
                  to={`/profileusers/${post.author._id}`}
                  className="flex items-center mr-4 hover:text-blue-600 transition-colors duration-200 group"
                >
                  <div className="relative">
                    <img
                      src={post.author.avatar || "/default-avatar.png"}
                      alt={post.author.username}
                      className="w-9 h-9 rounded-full mr-2 object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300 ring-2 ring-white/50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                    {post.author.username}
                  </span>
                </Link>
              )}
              <span className="mr-4 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </span>
              <span className="mr-4 flex items-center text-gray-400">
                <FaEye className="mr-1" /> {post.views || 0}
              </span>
              <span className="flex items-center text-gray-400">
                <FaHeart className="mr-1" /> {post.likesCount || 0}
              </span>
            </div>
          </div>

          {/* Danh mục và thẻ */}
          <div className="px-6 py-3 flex flex-wrap items-center border-b border-gray-200 bg-gray-50/50">
            {post.category && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-3 py-1 rounded-full shadow-sm hover:bg-blue-200 transition-colors duration-200 hover-lift animate-fadeIn">
                {post.category}
              </span>
            )}
            {post.tags &&
              post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full hover:bg-gray-200 transition-colors duration-200 shadow-sm hover-lift animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  #{tag}
                </span>
              ))}
          </div>

          {/* Hình ảnh bài viết */}
          {post.thumbnail && !thumbnailError && !post.video && (
            <div className="px-6 pt-4 group cursor-pointer animate-fadeIn">
              <div className="overflow-hidden rounded-lg shadow-md">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-500"
                  onError={() => setThumbnailError(true)}
                />
              </div>
            </div>
          )}

          {/* Video (nếu có) */}
          {post.video && (
            <div className="px-6 pt-4">
              <div className="w-full relative">
                <div className="video-container relative group">
                  <video
                    ref={videoPlayerRef}
                    className="w-full h-auto rounded-lg shadow-lg transition-all duration-300"
                    controls
                    preload="metadata"
                    src={postService.formatVideoUrl(post.video)}
                    poster={post.thumbnail || "/images/default-thumbnail.jpg"}
                    onError={(e) => {
                      console.error("Lỗi tải video:", e);
                      e.target.onerror = null;
                    }}
                    onPlay={() => setIsVideoPaused(false)}
                    onPause={() => setIsVideoPaused(true)}
                  >
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>

                  {/* Overlay cho toàn bộ video để bắt sự kiện click cho cả phát và dừng */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ bottom: "40px" }} // Để không che phủ thanh điều khiển
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (isProcessingVideoAction) return;
                      setIsProcessingVideoAction(true);

                      const video = videoPlayerRef.current;
                      if (!video) {
                        setIsProcessingVideoAction(false);
                        return;
                      }

                      // Đảo ngược trạng thái: phát nếu đang dừng, dừng nếu đang phát
                      if (video.paused) {
                        video.play().finally(() => {
                          setTimeout(
                            () => setIsProcessingVideoAction(false),
                            200
                          );
                        });
                      } else {
                        video.pause();
                        setTimeout(
                          () => setIsProcessingVideoAction(false),
                          200
                        );
                      }
                    }}
                  ></div>

                  {/* Nút play kiểu YouTube khi video tạm dừng */}
                  <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
                      isVideoPaused
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-90 pointer-events-none"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (isProcessingVideoAction) return;
                      setIsProcessingVideoAction(true);

                      const video = videoPlayerRef.current;
                      if (!video) {
                        setIsProcessingVideoAction(false);
                        return;
                      }

                      // Phát video khi nhấp vào nút play
                      if (video.paused) {
                        video.play().finally(() => {
                          setTimeout(
                            () => setIsProcessingVideoAction(false),
                            200
                          );
                        });
                      }
                    }}
                  >
                    <div className="bg-red-600 bg-opacity-90 hover:bg-opacity-100 hover:bg-red-700 rounded-full p-5 transition-all duration-300 cursor-pointer shadow-xl transform hover:scale-105 active:scale-95 animate-pulse-custom">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-sm text-center text-gray-500">
                  Nếu video không phát được, hãy{" "}
                  <a
                    href={postService.formatVideoUrl(post.video)}
                    download
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium hover:underline"
                  >
                    tải xuống
                  </a>{" "}
                  hoặc{" "}
                  <a
                    href={postService.formatVideoUrl(post.video)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium hover:underline"
                  >
                    mở trong tab mới
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Nội dung bài viết */}
          <div className="px-6 py-6 prose max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed"
            />
          </div>

          {/* Thanh tương tác */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center transition-all duration-200 ${
                  isLiked
                    ? "text-red-500 hover:text-red-600 font-semibold"
                    : "text-gray-500 hover:text-red-500"
                } hover-lift`}
              >
                <FaHeart
                  className={`mr-2 ${isLiked ? "animate-pulse-custom" : ""}`}
                />
                <span>{post.likesCount || 0} thích</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center text-gray-500 hover:text-blue-500 transition-all duration-200"
              >
                <FaComment className="mr-2" />
                <span>{post.commentsCount || 0} bình luận</span>
              </button>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center text-gray-500 hover:text-green-500 transition-all duration-200"
            >
              <FaShareAlt className="mr-2" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Phần bình luận */}
        {showComments && (
          <div className="bg-white rounded-xl shadow-sm mt-6 p-6 transform transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FaComment className="mr-2 text-blue-500" /> Bình luận (
              {comments.length})
            </h3>

            {/* Form thêm bình luận */}
            <div className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="3"
              ></textarea>
              <div className="mt-2 text-right">
                {editingComment && (
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setCommentContent("");
                    }}
                    className="px-4 py-2 mr-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
                <button
                  onClick={
                    editingComment ? handleEditComment : handleSubmitComment
                  }
                  disabled={!commentContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 transform hover:translate-y-[-1px] active:translate-y-0"
                >
                  {editingComment ? "Cập nhật bình luận" : "Gửi bình luận"}
                </button>
              </div>
            </div>

            {/* Danh sách bình luận */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </p>
              ) : (
                comments.map((comment, index) => (
                  <div
                    key={comment._id}
                    className="border-b border-gray-100 pb-4 mb-4 hover:bg-gray-50/50 p-3 rounded-lg transition-colors duration-200 animate-slideIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <img
                          src={
                            comment.author
                              ? getAvatarUrl(comment.author)
                              : "/default-avatar.png"
                          }
                          alt={comment.author?.username || "Người dùng"}
                          className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 ring-2 ring-white shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div>
                          <div className="font-semibold">
                            {comment.author?.username || "Người dùng"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu tùy chọn bình luận */}
                      <div className="relative">
                        <button
                          className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                          onClick={() => setShowCommentMenu(comment._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {showCommentMenu === comment._id && (
                          <div
                            id={`comment-menu-${comment._id}`}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-100 transform origin-top-right transition-all duration-200"
                          >
                            {/* PHẦN TÙY CHỌN MENU */}

                            {/* 1. CHỈNH SỬA: Người dùng đã đăng nhập VÀ là tác giả bình luận */}
                            {comment.isCurrentUserAuthor && (
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center"
                                onClick={() => {
                                  setEditingComment(comment);
                                  setCommentContent(comment.content);
                                  setShowCommentMenu(null);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 mr-2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                                  />
                                </svg>
                                Chỉnh sửa
                              </button>
                            )}

                            {/* 2. XÓA: Người dùng đã đăng nhập VÀ là tác giả bình luận HOẶC là admin */}
                            {(comment.isCurrentUserAuthor ||
                              localStorage.getItem("role") === "admin") && (
                              <>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center"
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 mr-2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                  {localStorage.getItem("role") === "admin" &&
                                  !comment.isCurrentUserAuthor
                                    ? "Xóa (Admin)"
                                    : "Xóa"}
                                </button>

                                {/* Thêm nút xóa bằng hàm riêng để debug */}
                                <button
                                  className="flex w-full text-left px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-150 flex items-center"
                                  onClick={() => {
                                    // Gọi lệnh xóa trực tiếp từ server
                                    if (
                                      window.confirm(
                                        `Xóa trực tiếp comment ID: ${comment._id}?`
                                      )
                                    ) {
                                      const token =
                                        localStorage.getItem("token");
                                      const userId =
                                        localStorage.getItem("userId");
                                      const userRole =
                                        localStorage.getItem("role");

                                      console.log(
                                        "==== BẮT ĐẦU XÓA TRỰC TIẾP ===="
                                      );
                                      console.log("Thông tin người dùng xóa:", {
                                        userId,
                                        role: userRole,
                                        hasToken: !!token,
                                      });

                                      const apiUrl = `http://localhost:5002/api/comments/${comment._id}`;
                                      console.log(
                                        "Gửi request xóa trực tiếp tới:",
                                        apiUrl
                                      );
                                      console.log("Header gửi đi:", {
                                        Authorization: `Bearer ${token.substring(
                                          0,
                                          15
                                        )}...`,
                                      });

                                      fetch(apiUrl, {
                                        method: "DELETE",
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                          "Content-Type": "application/json",
                                        },
                                      })
                                        .then((response) => {
                                          console.log(
                                            "Status code:",
                                            response.status,
                                            response.statusText
                                          );
                                          console.log(
                                            "Response OK?",
                                            response.ok
                                          );

                                          return response
                                            .text()
                                            .then((text) => {
                                              console.log(
                                                "Response text:",
                                                text
                                              );
                                              if (text) {
                                                try {
                                                  return JSON.parse(text);
                                                } catch (e) {
                                                  console.log(
                                                    "Không thể parse JSON:",
                                                    text
                                                  );
                                                  return {
                                                    success: false,
                                                    text,
                                                  };
                                                }
                                              }
                                              return { success: response.ok };
                                            });
                                        })
                                        .then((data) => {
                                          console.log(
                                            "Kết quả xóa comment:",
                                            data
                                          );
                                          if (data.success) {
                                            // Cập nhật UI
                                            const updatedComments =
                                              comments.filter(
                                                (c) => c._id !== comment._id
                                              );
                                            console.log(
                                              `Số lượng bình luận: trước = ${comments.length}, sau = ${updatedComments.length}`
                                            );

                                            setComments(updatedComments);
                                            toast.success(
                                              "Đã xóa bình luận thành công"
                                            );
                                            setShowCommentMenu(null);
                                            console.log(
                                              "==== KẾT THÚC XÓA TRỰC TIẾP - THÀNH CÔNG ===="
                                            );
                                          } else {
                                            console.error(
                                              "==== LỖI XÓA TRỰC TIẾP ====",
                                              data
                                            );
                                            toast.error(
                                              `Lỗi xóa bình luận: ${
                                                data.error ||
                                                JSON.stringify(data)
                                              }`
                                            );
                                          }
                                        })
                                        .catch((error) => {
                                          console.error(
                                            "==== LỖI XÓA TRỰC TIẾP ====",
                                            error
                                          );
                                          toast.error(
                                            "Lỗi kết nối khi xóa bình luận"
                                          );
                                        });
                                    } else {
                                      console.log(
                                        "Người dùng đã hủy xóa trực tiếp"
                                      );
                                    }
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 mr-2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                    />
                                  </svg>
                                  Xóa riêng (Debug)
                                </button>
                              </>
                            )}

                            {/* 3. BÁO CÁO: Người dùng đã đăng nhập VÀ KHÔNG phải tác giả bình luận VÀ KHÔNG phải admin */}
                            {localStorage.getItem("userId") &&
                              !comment.isCurrentUserAuthor &&
                              localStorage.getItem("role") !== "admin" && (
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-150 flex items-center"
                                  onClick={() => {
                                    const authorId =
                                      typeof comment.author === "object"
                                        ? comment.author?._id
                                        : comment.author;
                                    handleReportComment(comment._id, authorId);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 mr-2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                    />
                                  </svg>
                                  Báo cáo
                                </button>
                              )}

                            {/* 4. ĐĂNG NHẬP: Nếu chưa đăng nhập */}
                            {!localStorage.getItem("token") && (
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-150 flex items-center"
                                onClick={() => {
                                  setShowCommentMenu(null);
                                  navigate("/login");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4 mr-2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                                  />
                                </svg>
                                Đăng nhập để tương tác
                              </button>
                            )}

                            {/* 5. ĐÓNG: Luôn hiển thị */}
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors duration-150 flex items-center"
                              onClick={() => setShowCommentMenu(null)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4 mr-2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18 18 6M6 6l12 12"
                                />
                              </svg>
                              Đóng
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nội dung bình luận */}
                    <div className="mt-2 text-gray-700 px-3 py-2 bg-gray-50/50 rounded-lg">
                      {comment.content}
                    </div>

                    {/* Phần tương tác với bình luận */}
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <button
                        className={`text-gray-500 hover:text-blue-500 transition-colors duration-200 ${
                          comment.likes?.includes(
                            localStorage.getItem("userId")
                          )
                            ? "text-blue-500"
                            : ""
                        }`}
                        onClick={() => handleLikeComment(comment._id)}
                        disabled={commentLikeLoading === comment._id}
                      >
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {comment.likes?.length || 0} Thích
                        </span>
                      </button>

                      <button
                        className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                        onClick={() => {
                          setReplyingTo(
                            replyingTo === comment._id ? null : comment._id
                          );
                          setReplyContent("");
                        }}
                      >
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Trả lời
                        </span>
                      </button>
                    </div>

                    {/* Form trả lời bình luận */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 pl-10 transition-all duration-300 animate-fadeIn">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Trả lời ${
                            comment.author?.username || "người dùng"
                          }...`}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                          rows="2"
                        ></textarea>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors duration-200"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleReplyToComment(comment._id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
                          >
                            Gửi
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hiển thị các phản hồi cho bình luận hiện tại */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-10 space-y-3">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="border-l-2 border-blue-100 pl-3 hover:border-blue-300 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <img
                                  src={
                                    reply.author
                                      ? getAvatarUrl(reply.author)
                                      : "/default-avatar.png"
                                  }
                                  alt={reply.author?.username || "Người dùng"}
                                  className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-avatar.png";
                                  }}
                                />
                                <div className="font-medium text-sm">
                                  {reply.author?.username || "Người dùng"}
                                </div>
                                <div className="text-xs text-gray-500 ml-2">
                                  {new Date(reply.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </div>
                              </div>

                              {/* Menu tùy chọn cho bình luận trả lời */}
                              <div className="relative">
                                <button
                                  className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                                  onClick={() => setShowCommentMenu(reply._id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {showCommentMenu === reply._id && (
                                  <div
                                    id={`comment-menu-${reply._id}`}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-100 transform origin-top-right transition-all duration-200"
                                  >
                                    {/* Tùy chọn sửa bình luận trả lời */}
                                    {reply.isCurrentUserAuthor && (
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center"
                                        onClick={() => {
                                          setEditingComment(reply);
                                          setCommentContent(reply.content);
                                          setShowCommentMenu(null);
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.5}
                                          stroke="currentColor"
                                          className="w-4 h-4 mr-2"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                                          />
                                        </svg>
                                        Chỉnh sửa
                                      </button>
                                    )}

                                    {/* Tùy chọn xóa bình luận trả lời */}
                                    {(reply.isCurrentUserAuthor ||
                                      localStorage.getItem("role") ===
                                        "admin") && (
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center"
                                        onClick={() =>
                                          handleDeleteComment(reply._id)
                                        }
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.5}
                                          stroke="currentColor"
                                          className="w-4 h-4 mr-2"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                          />
                                        </svg>
                                        {localStorage.getItem("role") ===
                                          "admin" && !reply.isCurrentUserAuthor
                                          ? "Xóa (Admin)"
                                          : "Xóa"}
                                      </button>
                                    )}

                                    {/* Tùy chọn báo cáo bình luận */}
                                    {localStorage.getItem("userId") &&
                                      !reply.isCurrentUserAuthor &&
                                      localStorage.getItem("role") !==
                                        "admin" && (
                                        <button
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-150 flex items-center"
                                          onClick={() => {
                                            const authorId =
                                              typeof reply.author === "object"
                                                ? reply.author?._id
                                                : reply.author;
                                            handleReportComment(
                                              reply._id,
                                              authorId
                                            );
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-4 h-4 mr-2"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                            />
                                          </svg>
                                          Báo cáo
                                        </button>
                                      )}

                                    {/* Tùy chọn đóng menu */}
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors duration-150 flex items-center"
                                      onClick={() => setShowCommentMenu(null)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4 mr-2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6 18 18 6M6 6l12 12"
                                        />
                                      </svg>
                                      Đóng
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-1 text-gray-700 text-sm bg-gray-50 p-2 rounded-lg">
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
