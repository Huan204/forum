import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import axios from "axios";
import { toast } from "react-hot-toast";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notificationSoundRef = useRef(null);
  const [error, setError] = useState(null);

  // Theme và màu sắc
  const [conversationThemes, setConversationThemes] = useState({});
  const DEFAULT_THEME = "blue";

  // Danh sách chủ đề màu
  const AVAILABLE_THEMES = {
    blue: {
      name: "Xanh dương",
      primary: "#3B82F6",
      gradient: "from-blue-400 to-blue-600",
      lightBg: "#EFF6FF",
      darkBg: "#1E3A8A",
    },
    purple: {
      name: "Tím",
      primary: "#8B5CF6",
      gradient: "from-purple-400 to-purple-600",
      lightBg: "#F5F3FF",
      darkBg: "#4C1D95",
    },
    green: {
      name: "Xanh lá",
      primary: "#10B981",
      gradient: "from-green-400 to-green-600",
      lightBg: "#ECFDF5",
      darkBg: "#064E3B",
    },
    pink: {
      name: "Hồng",
      primary: "#EC4899",
      gradient: "from-pink-400 to-pink-600",
      lightBg: "#FDF2F8",
      darkBg: "#831843",
    },
    orange: {
      name: "Cam",
      primary: "#F59E0B",
      gradient: "from-orange-400 to-orange-600",
      lightBg: "#FEF3C7",
      darkBg: "#7C2D12",
    },
    red: {
      name: "Đỏ",
      primary: "#EF4444",
      gradient: "from-red-400 to-red-600",
      lightBg: "#FEE2E2",
      darkBg: "#7F1D1D",
    },
    gray: {
      name: "Xám",
      primary: "#6B7280",
      gradient: "from-gray-400 to-gray-600",
      lightBg: "#F3F4F6",
      darkBg: "#1F2937",
    },
    indigo: {
      name: "Chàm",
      primary: "#6366F1",
      gradient: "from-indigo-400 to-indigo-600",
      lightBg: "#EEF2FF",
      darkBg: "#312E81",
    },
  };

  // Khởi tạo âm thanh thông báo
  useEffect(() => {
    try {
      console.log("Bắt đầu khởi tạo âm thanh thông báo...");

      // Tạo âm thanh nhẹ nhàng giống Instagram bằng Web Audio API
      createInstagramSound();
    } catch (err) {
      console.error("❌ Lỗi khi khởi tạo âm thanh:", err);
      // Fallback với âm thanh mặc định nếu có lỗi
      createDefaultSound();
    }

    // Cleanup function
    return () => {
      if (notificationSoundRef.current) {
        if (notificationSoundRef.current.pause) {
          notificationSoundRef.current.pause();
        }
        notificationSoundRef.current = null;
      }
    };
  }, []);

  // Tạo âm thanh giống Instagram bằng Web Audio API
  const createInstagramSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.error("Web Audio API không được hỗ trợ trên trình duyệt này");
        return;
      }

      const audioContext = new AudioContext();

      // Tạo âm thanh ngắn và nhẹ giống Instagram
      notificationSoundRef.current = {
        play: function () {
          try {
            // Tạo mới context mỗi lần phát để tránh trùng lặp
            const ctx = new AudioContext();
            const duration = 0.1; // Rất ngắn (0.1 giây)

            // Tạo oscillator cho âm thanh nhẹ nhàng
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Kết nối các nodes
            osc.connect(gain);
            gain.connect(ctx.destination);

            // Thiết lập âm thanh nhẹ nhàng giống Instagram
            osc.frequency.setValueAtTime(1600, ctx.currentTime); // Tần số cao hơn
            osc.frequency.exponentialRampToValueAtTime(
              790,
              ctx.currentTime + duration
            ); // Giảm tần số
            osc.type = "sine"; // Sine wave cho âm thanh mềm mại

            // Volume nhỏ
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
              0.01,
              ctx.currentTime + duration
            );

            // Bắt đầu và kết thúc
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);

            console.log("✅ Đã phát âm thanh kiểu Instagram");
            return Promise.resolve();
          } catch (err) {
            console.error("Lỗi khi tạo âm thanh Instagram:", err);
            return Promise.reject(err);
          }
        },
        currentTime: 0,
        volume: 0.15,
        pause: function () {},
        isCreatedByAPI: true,
        soundType: "instagram",
      };

      console.log("✅ Đã tạo âm thanh nhẹ kiểu Instagram thành công");
    } catch (err) {
      console.error("Lỗi khi tạo âm thanh Instagram:", err);
      // Fallback nếu có lỗi
      createDefaultSound();
    }
  };

  // Hàm tạo âm thanh mặc định bằng Web Audio API khi không tải được file
  const createDefaultSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.error("Web Audio API không được hỗ trợ trên trình duyệt này");
        return;
      }

      const audioContext = new AudioContext();
      const duration = 0.3;
      const volume = 0.5;

      // Phương thức để tạo và phát âm thanh
      notificationSoundRef.current = {
        play: function () {
          try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            gainNode.gain.value = volume;
            oscillator.frequency.value = 880; // Tần số A5
            oscillator.type = "sine";

            oscillator.start();

            // Tạo fade-out để âm thanh không ngừng đột ngột
            gainNode.gain.exponentialRampToValueAtTime(
              0.001,
              audioContext.currentTime + duration
            );

            // Dừng oscillator sau khi phát xong
            oscillator.stop(audioContext.currentTime + duration);

            return Promise.resolve();
          } catch (err) {
            console.error("Lỗi khi tạo âm thanh:", err);
            return Promise.reject(err);
          }
        },
        currentTime: 0, // Giả lập thuộc tính của Audio
        volume: volume,
        // Các phương thức và thuộc tính giả lập khác
        pause: function () {},
        isCreatedByAPI: true,
      };

      console.log("Đã tạo âm thanh mặc định thành công");
    } catch (err) {
      console.error("Lỗi khi tạo âm thanh mặc định:", err);
    }
  };

  // Hàm phát âm thanh thông báo
  const playNotificationSound = () => {
    if (!soundEnabled || !notificationSoundRef.current) return;

    try {
      // Đảm bảo âm thanh phát từ đầu nếu là Audio element
      if (
        notificationSoundRef.current.currentTime !== undefined &&
        !notificationSoundRef.current.isCreatedByAPI
      ) {
        notificationSoundRef.current.currentTime = 0;
      }

      // Phát âm thanh
      notificationSoundRef.current.play().catch((err) => {
        console.error("❌ Lỗi khi phát âm thanh thông báo:", err);

        // Người dùng chưa tương tác với trang (bảo mật của trình duyệt)
        if (err.name === "NotAllowedError") {
          console.log(
            "Trình duyệt chặn phát âm thanh tự động trước tương tác người dùng"
          );
        }
      });
    } catch (err) {
      console.error("Lỗi không xác định khi phát âm thanh:", err);
    }
  };

  // Bật/tắt âm thanh thông báo
  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Kết nối socket khi user đăng nhập
  useEffect(() => {
    if (!user || !token) return;

    // Kết nối socket.io với địa chỉ cụ thể
    const SOCKET_URL = "http://localhost:5000"; // Địa chỉ trực tiếp đến server
    console.log("Đang kết nối Socket.IO đến:", SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"], // Thử cả hai phương thức kết nối
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket.IO kết nối thành công");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket.IO connect error:", err.message);
      toast.error(`Lỗi kết nối: ${err.message}`);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket.IO đã ngắt kết nối");
    });

    newSocket.on("error", (err) => {
      console.error("Socket.IO error:", err);
      toast.error("Lỗi kết nối, vui lòng thử lại sau");
    });

    setSocket(newSocket);

    // Dọn dẹp khi component unmount
    return () => {
      console.log("Đóng kết nối Socket.IO");
      newSocket.disconnect();
    };
  }, [user, token]);

  // Thiết lập các event listeners khi socket thay đổi
  useEffect(() => {
    if (!socket) return;

    // Nhận tin nhắn mới
    socket.on("new_message", (message) => {
      console.log("Nhận tin nhắn mới:", message);

      // Lấy ID người gửi (hỗ trợ cả hai dạng object và string)
      const senderId =
        typeof message.sender === "object"
          ? message.sender._id
          : message.sender;

      // Thêm tin nhắn vào state nếu đang trong đoạn chat đó
      if (
        activeConversation &&
        (senderId === activeConversation._id ||
          message.recipient._id === activeConversation._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
        // Đánh dấu tin nhắn đã đọc
        socket.emit("mark_read", { senderId: senderId });
      } else {
        // Tăng số tin nhắn chưa đọc
        setUnreadMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));

        // Phát âm thanh thông báo khi nhận tin nhắn mới
        // và người dùng không đang ở trong đoạn chat
        playNotificationSound();
      }

      // Cập nhật danh sách đoạn chat
      updateConversationList();
    });

    // Nhận xác nhận tin nhắn đã gửi
    socket.on("message_sent", (message) => {
      console.log("Tin nhắn đã được gửi:", message);
      // Thêm tin nhắn đã gửi vào danh sách tin nhắn hiện tại nếu đang trong đúng đoạn chat
      if (
        activeConversation &&
        (message.recipient._id === activeConversation._id ||
          message.sender._id === activeConversation._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      // Cập nhật danh sách đoạn chat
      updateConversationList();
    });

    // Xử lý thông báo
    socket.on("notification", (notification) => {
      // Thêm thông báo vào danh sách
      setNotifications((prev) => [notification, ...prev]);

      // Phát âm thanh thông báo
      playNotificationSound();
    });

    // Người dùng online/offline
    socket.on("user_status", ({ userId, isOnline, lastActive }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: { isOnline, lastActive },
      }));
    });

    // Tin nhắn đã được đọc
    socket.on("messages_read", ({ by }) => {
      if (activeConversation && activeConversation._id === by) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.recipient._id === by ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    // Đang nhập
    socket.on("user_typing", ({ userId, isTyping }) => {
      setTyping((prev) => ({
        ...prev,
        [userId]: isTyping,
      }));
    });

    // Xử lý tin nhắn media (ảnh, file)
    socket.on("new_media_message", (message) => {
      console.log("Nhận tin nhắn media mới:", message);

      // Lấy ID người gửi (hỗ trợ cả hai dạng object và string)
      const senderId =
        typeof message.sender === "object"
          ? message.sender._id
          : message.sender;

      // Thêm tin nhắn vào state nếu đang trong đoạn chat đó
      if (
        activeConversation &&
        (senderId === activeConversation._id ||
          message.recipient._id === activeConversation._id)
      ) {
        console.log("Thêm tin nhắn media vào cuộc trò chuyện hiện tại");
        setMessages((prevMessages) => [...prevMessages, message]);
        // Đánh dấu tin nhắn đã đọc
        socket.emit("mark_read", { senderId: senderId });
      } else {
        // Tăng số tin nhắn chưa đọc
        setUnreadMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));

        // Phát âm thanh thông báo
        playNotificationSound();

        // Thông báo cho người dùng
        const messageType = message.type === "image" ? "ảnh" : "tệp tin";
        toast.success(`Bạn đã nhận ${messageType} mới`);
      }

      // Cập nhật danh sách đoạn chat
      updateConversationList();
    });

    // Xử lý thay đổi chủ đề
    socket.on("theme_changed", ({ conversationId, theme }) => {
      console.log(
        `Đối phương đã thay đổi chủ đề cuộc trò chuyện ${conversationId} thành ${theme}`
      );

      // Cập nhật state
      setConversationThemes((prev) => ({
        ...prev,
        [conversationId]: theme,
      }));

      // Lưu vào localStorage
      const savedThemes = JSON.parse(
        localStorage.getItem("chatThemes") || "{}"
      );
      savedThemes[conversationId] = theme;
      localStorage.setItem("chatThemes", JSON.stringify(savedThemes));

      // Thông báo cho người dùng
      toast.success(
        `Đối phương đã thay đổi chủ đề cuộc trò chuyện thành ${
          AVAILABLE_THEMES[theme]?.name || theme
        }`
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("message_sent");
      socket.off("notification");
      socket.off("user_status");
      socket.off("messages_read");
      socket.off("user_typing");
      socket.off("new_media_message");
      socket.off("theme_changed");
    };
  }, [socket, activeConversation]);

  // Lấy danh sách đoạn chat
  const updateConversationList = async () => {
    try {
      // Thiết lập URL server API
      const API_URL = "http://localhost:5000";
      console.log(
        "Lấy danh sách đoạn chat từ:",
        `${API_URL}/api/messages/conversations`
      );

      const response = await axios.get(
        `${API_URL}/api/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversations(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đoạn chat:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Status:", error.response.status);
      }
      toast.error("Không thể tải danh sách đoạn chat");
    }
  };

  // Lấy danh sách đoạn chat khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user && token) {
      updateConversationList();
    }
  }, [user, token]);

  // Chọn một đoạn chat
  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setLoadingMessages(true);

    try {
      // Thiết lập URL server API
      const API_URL = "http://localhost:5000";

      // Lấy lịch sử tin nhắn
      const response = await axios.get(
        `${API_URL}/api/messages/${conversation._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(response.data);

      // Đánh dấu tin nhắn đã đọc
      if (socket) {
        socket.emit("mark_read", { senderId: conversation._id });
      }

      // Xóa tin nhắn chưa đọc
      setUnreadMessages((prev) => ({
        ...prev,
        [conversation._id]: 0,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử tin nhắn:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      toast.error("Không thể tải lịch sử tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Gửi tin nhắn mới
  const sendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;

    try {
      // Gửi qua socket
      if (socket && socket.connected) {
        console.log("Gửi tin nhắn qua socket đến:", activeConversation._id);
        socket.emit("send_message", {
          recipientId: activeConversation._id,
          content: content,
        });
      } else {
        // Fallback nếu socket không hoạt động
        console.log("Socket không hoạt động, gửi tin nhắn qua API");
        const API_URL = "http://localhost:5000";
        const response = await axios.post(
          `${API_URL}/api/messages`,
          {
            recipientId: activeConversation._id,
            content: content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages((prevMessages) => [...prevMessages, response.data]);
        updateConversationList();
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      toast.error("Không thể gửi tin nhắn");
    }
  };

  // Gửi nhiều ảnh
  const sendImages = async (imageFiles) => {
    if (!activeConversation || !imageFiles || imageFiles.length === 0)
      return null;

    try {
      console.log("Bắt đầu gửi ảnh, số lượng:", imageFiles.length);
      const API_URL = "http://localhost:5000";
      const formData = new FormData();

      // Thêm nhiều file ảnh vào FormData
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]);
        console.log(
          `Đã thêm ảnh ${i + 1}/${imageFiles.length}: ${imageFiles[i].name} (${
            imageFiles[i].size
          } bytes)`
        );
      }

      // Thêm recipientId
      formData.append("recipientId", activeConversation._id);

      // In log content của formData để debug
      console.log("FormData được tạo với recipientId:", activeConversation._id);

      // Tạo placeholder cho tin nhắn đang gửi để hiển thị ngay cho người dùng
      const tempId = `temp-${Date.now()}-${Math.round(
        Math.random() * 1000000
      )}`;
      const placeholderMessage = {
        _id: tempId,
        sender: user,
        recipient: activeConversation,
        type: "image",
        content: "",
        images: imageFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // Tạo URL tạm thời để hiển thị ngay
        })),
        createdAt: new Date().toISOString(),
        isRead: false,
        isLoading: true, // Đánh dấu tin nhắn đang trong quá trình gửi
      };

      // Thêm tin nhắn placeholder vào state trước
      console.log("Thêm placeholder cho ảnh đang gửi:", placeholderMessage);
      setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

      // Gửi request đến API
      console.log("Gửi request đến:", `${API_URL}/api/messages/images`);
      const response = await axios.post(
        `${API_URL}/api/messages/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Nhận phản hồi từ server:", response.status);

      // Thay thế tin nhắn tạm thời bằng tin nhắn thật từ server
      if (response.data) {
        console.log("Tin nhắn ảnh đã được tạo:", response.data._id);

        // Thay thế tin nhắn placeholder bằng tin nhắn thật
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === tempId ? response.data : msg))
        );

        updateConversationList();

        // Thông báo Socket.io để người nhận nhận được tin nhắn realtime
        if (socket && socket.connected) {
          console.log("Gửi thông báo media_sent qua socket");
          socket.emit("media_sent", {
            messageId: response.data._id,
            recipientId: activeConversation._id,
          });
        }
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error);

      // Xóa tin nhắn placeholder khỏi danh sách nếu gặp lỗi
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.isLoading)
      );

      if (error.response) {
        // Server trả về lỗi
        console.error(
          "Server response:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("Không nhận được phản hồi từ server:", error.request);
      } else {
        // Lỗi khi thiết lập request
        console.error("Lỗi khi thiết lập request:", error.message);
      }

      // Re-throw lỗi để component xử lý
      throw error;
    }
  };

  // Gửi tệp tin
  const sendFile = async (file) => {
    if (!activeConversation || !file) return null;

    try {
      console.log("Bắt đầu gửi file:", file.name, `(${file.size} bytes)`);
      const API_URL = "http://localhost:5000";
      const formData = new FormData();

      // Thêm file vào FormData
      formData.append("file", file);
      console.log("Đã thêm file vào FormData:", file.name);

      // Thêm recipientId
      formData.append("recipientId", activeConversation._id);
      console.log("FormData được tạo với recipientId:", activeConversation._id);

      // Tạo placeholder cho tin nhắn đang gửi
      const tempId = `temp-${Date.now()}-${Math.round(
        Math.random() * 1000000
      )}`;
      const placeholderMessage = {
        _id: tempId,
        sender: user,
        recipient: activeConversation,
        type: "file",
        content: "",
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          url: "#", // URL tạm thời
        },
        createdAt: new Date().toISOString(),
        isRead: false,
        isLoading: true,
      };

      // Thêm tin nhắn placeholder vào state trước
      console.log("Thêm placeholder cho file đang gửi:", placeholderMessage);
      setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

      // Gửi request đến API
      console.log("Gửi request đến:", `${API_URL}/api/messages/file`);
      const response = await axios.post(
        `${API_URL}/api/messages/file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Nhận phản hồi từ server:", response.status);

      // Thay thế tin nhắn tạm thời bằng tin nhắn thật
      if (response.data) {
        console.log("Tin nhắn file đã được tạo:", response.data._id);

        // Thay thế tin nhắn placeholder bằng tin nhắn thật
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === tempId ? response.data : msg))
        );

        updateConversationList();

        // Thông báo Socket.io để người nhận nhận được tin nhắn realtime
        if (socket && socket.connected) {
          console.log("Gửi thông báo media_sent qua socket");
          socket.emit("media_sent", {
            messageId: response.data._id,
            recipientId: activeConversation._id,
          });
        }
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi tệp tin:", error);

      // Xóa tin nhắn placeholder khỏi danh sách nếu gặp lỗi
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.isLoading)
      );

      if (error.response) {
        // Server trả về lỗi
        console.error(
          "Server response:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error("Không nhận được phản hồi từ server:", error.request);
      } else {
        // Lỗi khi thiết lập request
        console.error("Lỗi khi thiết lập request:", error.message);
      }

      // Re-throw lỗi để component xử lý
      throw error;
    }
  };

  // Báo hiệu đang nhập
  const sendTypingStatus = (isTyping) => {
    if (!socket || !activeConversation) return;

    if (isTyping) {
      socket.emit("typing", { recipientId: activeConversation._id });
    } else {
      socket.emit("stop_typing", { recipientId: activeConversation._id });
    }
  };

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = async (userId) => {
    try {
      await axios.put(`/api/messages/mark-read/${userId}`);
      if (socket) {
        socket.emit("mark_read", { senderId: userId });
      }
      setUnreadMessages((prev) => ({
        ...prev,
        [userId]: 0,
      }));
    } catch (error) {
      console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    }
  };

  // Đánh dấu thông báo là đã đọc
  const markNotificationAsRead = (notificationId) => {
    try {
      if (!notificationId) {
        console.error("ID thông báo không hợp lệ:", notificationId);
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      console.log(`Đã đánh dấu thông báo ${notificationId} là đã đọc`);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    }
  };

  // Tạo cuộc trò chuyện mới với người dùng
  const createConversation = async (userId) => {
    try {
      console.log("Đang tạo cuộc trò chuyện với người dùng:", userId);

      // Kiểm tra xem đã có cuộc trò chuyện với người dùng này chưa
      const existingConversation = conversations.find((c) => {
        return (
          c.participants &&
          c.participants.some((p) => p._id === userId || p === userId)
        );
      });

      if (existingConversation) {
        console.log(
          "Đã tìm thấy cuộc trò chuyện hiện có:",
          existingConversation
        );
        return existingConversation;
      }

      const response = await axios.post("/api/messages/conversations", {
        receiverId: userId,
      });

      if (response.data && response.data.success) {
        console.log(
          "Tạo cuộc trò chuyện thành công:",
          response.data.conversation
        );

        // Cập nhật danh sách cuộc trò chuyện
        await updateConversationList();

        // Tìm cuộc trò chuyện vừa tạo trong danh sách cập nhật
        const newConversation = conversations.find(
          (c) =>
            c.participants &&
            c.participants.some((p) => p._id === userId || p === userId)
        );

        return newConversation || response.data.conversation;
      } else {
        setError(response.data?.error || "Không thể tạo cuộc trò chuyện");
        console.error("Lỗi từ API:", response.data);
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện:", error);

      if (error.response) {
        console.error("Lỗi từ server:", error.response.data);
      }

      toast.error("Có lỗi xảy ra khi tạo cuộc trò chuyện");
      return null;
    }
  };

  // Đánh dấu tất cả tin nhắn là đã đọc
  const markAllAsRead = async () => {
    try {
      const API_URL = "http://localhost:5000";

      await axios.put(
        `${API_URL}/api/messages/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật UI để hiển thị tất cả tin nhắn đã được đọc
      setUnreadMessages({});

      // Thông báo cho socket server
      if (socket) {
        socket.emit("mark_all_read");
      }

      console.log("Đã đánh dấu tất cả tin nhắn là đã đọc");
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả tin nhắn đã đọc:", error);
      toast.error("Không thể đánh dấu tất cả là đã đọc");
    }
  };

  // Cập nhật trạng thái hiển thị đã xem
  const updateReadStatus = (showStatus) => {
    // Lưu trạng thái vào localStorage để duy trì giữa các phiên
    localStorage.setItem("showReadStatus", showStatus);

    // Nếu có thêm logic xử lý phía server, có thể thêm vào đây
    // Ví dụ: gửi cập nhật đến server để lưu tùy chọn người dùng

    console.log("Đã cập nhật trạng thái hiển thị đã xem:", showStatus);
  };

  // Lấy chủ đề cho cuộc trò chuyện
  const getConversationTheme = (conversationId) => {
    if (!conversationId) return AVAILABLE_THEMES[DEFAULT_THEME];

    // Nếu đã có chủ đề cho cuộc trò chuyện này
    if (conversationThemes[conversationId]) {
      return (
        AVAILABLE_THEMES[conversationThemes[conversationId]] ||
        AVAILABLE_THEMES[DEFAULT_THEME]
      );
    }

    // Trả về chủ đề mặc định
    return AVAILABLE_THEMES[DEFAULT_THEME];
  };

  // Thay đổi chủ đề màu sắc cho cuộc trò chuyện
  const changeConversationTheme = async (conversationId, themeKey) => {
    if (!conversationId || !themeKey || !AVAILABLE_THEMES[themeKey]) {
      console.error("Thông số không hợp lệ:", { conversationId, themeKey });
      return false;
    }

    try {
      // Cập nhật state
      setConversationThemes((prev) => ({
        ...prev,
        [conversationId]: themeKey,
      }));

      // Lưu vào localStorage để duy trì giữa các phiên
      const savedThemes = JSON.parse(
        localStorage.getItem("chatThemes") || "{}"
      );
      savedThemes[conversationId] = themeKey;
      localStorage.setItem("chatThemes", JSON.stringify(savedThemes));

      // TODO: Nếu muốn lưu trên server, thêm API call ở đây

      console.log(
        `Đã thay đổi chủ đề của cuộc trò chuyện ${conversationId} thành ${themeKey}`
      );

      // Thông báo cho đối phương về sự thay đổi chủ đề (nếu cần)
      if (socket && socket.connected) {
        socket.emit("theme_changed", {
          conversationId,
          theme: themeKey,
        });
      }

      return true;
    } catch (error) {
      console.error("Lỗi khi thay đổi chủ đề:", error);
      return false;
    }
  };

  // Khôi phục chủ đề đã lưu khi khởi động
  useEffect(() => {
    try {
      const savedThemes = JSON.parse(
        localStorage.getItem("chatThemes") || "{}"
      );
      setConversationThemes(savedThemes);
    } catch (error) {
      console.error("Lỗi khi khôi phục chủ đề màu sắc:", error);
    }
  }, []);

  // Shared context value
  const contextValue = {
    conversations,
    activeConversation,
    messages,
    socket,
    onlineUsers,
    unreadMessages,
    typing,
    loadingMessages,
    notifications,
    soundEnabled,
    selectConversation,
    sendMessage,
    sendImages,
    sendFile,
    markAsRead,
    markAllAsRead,
    updateReadStatus,
    sendTypingStatus,
    updateConversationList,
    toggleSound,
    createConversation,
    markNotificationAsRead,
    getConversationTheme,
    changeConversationTheme,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

// Hook để sử dụng ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat phải được sử dụng trong ChatProvider");
  }
  return context;
};

export default ChatContext;
