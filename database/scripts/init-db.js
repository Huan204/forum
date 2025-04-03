/**
 * Script khởi tạo cơ sở dữ liệu MongoDB cho dự án Diễn đàn
 *
 * Cách sử dụng:
 * - Kết nối đến MongoDB shell
 * - Chạy `load("đường_dẫn_đến_file/init-db.js")`
 *
 * Script này sẽ tạo các collection và dữ liệu mẫu
 */

// Xóa database hiện tại nếu tồn tại
db = db.getSiblingDB("forum");
print("Đang xóa database cũ nếu có...");
db.dropDatabase();
print("Đã xóa database cũ. Đang tạo database và collection mới...");

// Tạo các collection và index
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.createCollection("posts");
db.posts.createIndex({ "author._id": 1 });
db.posts.createIndex({ category: 1 });
db.posts.createIndex({ tags: 1 });
db.posts.createIndex({ status: 1 });
db.posts.createIndex({ createdAt: -1 });

db.createCollection("comments");
db.comments.createIndex({ post: 1 });
db.comments.createIndex({ "author._id": 1 });
db.comments.createIndex({ status: 1 });
db.comments.createIndex({ parentComment: 1 });

db.createCollection("categories");
db.categories.createIndex({ slug: 1 }, { unique: true });

db.createCollection("settings");
db.settings.createIndex({ key: 1 }, { unique: true });

db.createCollection("notifications");
db.notifications.createIndex({ user: 1 });
db.notifications.createIndex({ isRead: 1 });

db.createCollection("announcements");
db.announcements.createIndex({ isActive: 1 });
db.announcements.createIndex({ startDate: 1 });
db.announcements.createIndex({ endDate: 1 });

print("Đã tạo các collection và index. Bắt đầu nhập dữ liệu mẫu...");

// Chèn dữ liệu mẫu - Users
const userIds = {
  admin: ObjectId(),
  moderator: ObjectId(),
  user1: ObjectId(),
  user2: ObjectId(),
  user3: ObjectId(),
};

const hashPassword = (password) => {
  // Chỉ là mô phỏng, không phải hash thực
  return `hashed_${password}_${Date.now()}`;
};

const usersData = [
  {
    _id: userIds.admin,
    username: "admin",
    email: "admin@example.com",
    password: hashPassword("admin123"),
    fullName: "Admin User",
    avatar:
      "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    role: "admin",
    bio: "Quản trị viên của diễn đàn",
    joined: new Date("2023-01-01"),
    lastActive: new Date(),
    isVerified: true,
    settings: {
      notifications: true,
      newsletter: true,
      darkMode: true,
    },
    badges: [
      { type: "admin", earnedAt: new Date("2023-01-01") },
      { type: "founder", earnedAt: new Date("2023-01-01") },
    ],
    reputation: 1000,
  },
  {
    _id: userIds.moderator,
    username: "moderator",
    email: "mod@example.com",
    password: hashPassword("mod123"),
    fullName: "Moderator User",
    avatar:
      "https://ui-avatars.com/api/?name=Moderator+User&background=3CBC8D&color=fff",
    role: "moderator",
    bio: "Người kiểm duyệt nội dung diễn đàn",
    joined: new Date("2023-01-15"),
    lastActive: new Date(),
    isVerified: true,
    settings: {
      notifications: true,
      newsletter: true,
      darkMode: false,
    },
    badges: [{ type: "moderator", earnedAt: new Date("2023-01-15") }],
    reputation: 750,
  },
  {
    _id: userIds.user1,
    username: "user1",
    email: "user1@example.com",
    password: hashPassword("user123"),
    fullName: "Regular User One",
    avatar:
      "https://ui-avatars.com/api/?name=User+One&background=E83A59&color=fff",
    role: "user",
    bio: "Người dùng bình thường của diễn đàn",
    joined: new Date("2023-02-01"),
    lastActive: new Date(),
    isVerified: true,
    settings: {
      notifications: true,
      newsletter: false,
      darkMode: true,
    },
    badges: [{ type: "newcomer", earnedAt: new Date("2023-02-01") }],
    reputation: 50,
  },
  {
    _id: userIds.user2,
    username: "user2",
    email: "user2@example.com",
    password: hashPassword("user456"),
    fullName: "Regular User Two",
    avatar:
      "https://ui-avatars.com/api/?name=User+Two&background=F1C40F&color=fff",
    role: "user",
    bio: "Người dùng tích cực đăng bài",
    joined: new Date("2023-02-15"),
    lastActive: new Date(),
    isVerified: true,
    settings: {
      notifications: true,
      newsletter: true,
      darkMode: false,
    },
    badges: [
      { type: "newcomer", earnedAt: new Date("2023-02-15") },
      { type: "contributor", earnedAt: new Date("2023-03-01") },
    ],
    reputation: 120,
  },
  {
    _id: userIds.user3,
    username: "user3",
    email: "user3@example.com",
    password: hashPassword("user789"),
    fullName: "Regular User Three",
    avatar:
      "https://ui-avatars.com/api/?name=User+Three&background=8E44AD&color=fff",
    role: "user",
    bio: "Người dùng thích bình luận và thảo luận",
    joined: new Date("2023-03-01"),
    lastActive: new Date(),
    isVerified: true,
    settings: {
      notifications: true,
      newsletter: true,
      darkMode: true,
    },
    badges: [{ type: "newcomer", earnedAt: new Date("2023-03-01") }],
    reputation: 80,
  },
];

db.users.insertMany(usersData);
print(`Đã chèn ${usersData.length} người dùng`);

// Chèn dữ liệu mẫu - Categories
const categoryIds = {
  react: ObjectId(),
  nodejs: ObjectId(),
  database: ObjectId(),
  css: ObjectId(),
  tools: ObjectId(),
};

const categoriesData = [
  {
    _id: categoryIds.react,
    name: "React",
    description: "Tất cả về React và các thư viện liên quan",
    icon: "react",
    color: "#61dafb",
    slug: "react",
    postCount: 2,
    order: 1,
  },
  {
    _id: categoryIds.nodejs,
    name: "Node.js",
    description: "Phát triển backend với Node.js",
    icon: "nodejs",
    color: "#3c873a",
    slug: "nodejs",
    postCount: 1,
    order: 2,
  },
  {
    _id: categoryIds.database,
    name: "Database",
    description: "MongoDB, SQL và các công nghệ database khác",
    icon: "database",
    color: "#4CAF50",
    slug: "database",
    postCount: 1,
    order: 3,
  },
  {
    _id: categoryIds.css,
    name: "CSS",
    description: "CSS, SCSS, Styled Components và thiết kế web",
    icon: "css",
    color: "#2965f1",
    slug: "css",
    postCount: 0,
    order: 4,
  },
  {
    _id: categoryIds.tools,
    name: "Tools",
    description: "Công cụ, IDE và môi trường phát triển",
    icon: "tools",
    color: "#FFA000",
    slug: "tools",
    postCount: 1,
    order: 5,
  },
];

db.categories.insertMany(categoriesData);
print(`Đã chèn ${categoriesData.length} danh mục`);

// Chèn dữ liệu mẫu - Posts
const postIds = {
  post1: ObjectId(),
  post2: ObjectId(),
  post3: ObjectId(),
  post4: ObjectId(),
  post5: ObjectId(),
};

const postsData = [
  {
    _id: postIds.post1,
    title: "Giới thiệu về React Hooks",
    content:
      "React Hooks là tính năng được giới thiệu trong React 16.8 cho phép bạn sử dụng state và các tính năng React khác mà không cần viết class. Bài viết này sẽ giới thiệu các hooks phổ biến như useState, useEffect và cách sử dụng chúng...",
    author: {
      _id: userIds.user1,
      name: "Regular User One",
    },
    category: "React",
    tags: ["react", "hooks", "frontend"],
    createdAt: new Date("2023-04-01T10:00:00Z"),
    updatedAt: new Date("2023-04-01T10:00:00Z"),
    status: "published",
    viewCount: 135,
    upvotes: 12,
    downvotes: 2,
    voters: [
      { user: userIds.user2, vote: 1 },
      { user: userIds.user3, vote: 1 },
      { user: userIds.moderator, vote: 1 },
    ],
    featured: true,
    commentCount: 2,
    images: [],
  },
  {
    _id: postIds.post2,
    title: "Sử dụng MongoDB với Node.js",
    content:
      "MongoDB là cơ sở dữ liệu NoSQL phổ biến thường được sử dụng cùng với Node.js. Trong bài viết này, chúng ta sẽ tìm hiểu cách kết nối MongoDB với ứng dụng Node.js sử dụng Mongoose...",
    author: {
      _id: userIds.moderator,
      name: "Moderator User",
    },
    category: "Database",
    tags: ["mongodb", "nodejs", "database", "mongoose"],
    createdAt: new Date("2023-04-05T14:30:00Z"),
    updatedAt: new Date("2023-04-06T09:15:00Z"),
    status: "published",
    viewCount: 97,
    upvotes: 8,
    downvotes: 0,
    voters: [
      { user: userIds.admin, vote: 1 },
      { user: userIds.user1, vote: 1 },
    ],
    featured: false,
    commentCount: 1,
    images: [],
  },
  {
    _id: postIds.post3,
    title: "Tối ưu hiệu suất cho ứng dụng React",
    content:
      "Hiệu suất là yếu tố quan trọng đối với mọi ứng dụng web. Trong bài viết này, chúng ta sẽ khám phá các kỹ thuật tối ưu hiệu suất cho các ứng dụng React, bao gồm memo, useMemo, useCallback và React.lazy...",
    author: {
      _id: userIds.user2,
      name: "Regular User Two",
    },
    category: "React",
    tags: ["react", "performance", "optimization"],
    createdAt: new Date("2023-04-10T08:45:00Z"),
    updatedAt: new Date("2023-04-10T08:45:00Z"),
    status: "published",
    viewCount: 78,
    upvotes: 5,
    downvotes: 1,
    voters: [
      { user: userIds.user1, vote: 1 },
      { user: userIds.admin, vote: 1 },
    ],
    featured: false,
    commentCount: 1,
    images: [],
  },
  {
    _id: postIds.post4,
    title: "Express.js - Framework Node.js phổ biến",
    content:
      "Express là framework web phổ biến nhất cho Node.js, cung cấp các tính năng mạnh mẽ để xây dựng các ứng dụng web và API. Bài viết này sẽ giới thiệu cách bắt đầu với Express và các tính năng quan trọng...",
    author: {
      _id: userIds.user3,
      name: "Regular User Three",
    },
    category: "Node.js",
    tags: ["nodejs", "express", "backend", "api"],
    createdAt: new Date("2023-04-15T16:20:00Z"),
    updatedAt: new Date("2023-04-15T16:20:00Z"),
    status: "published",
    viewCount: 65,
    upvotes: 7,
    downvotes: 0,
    voters: [
      { user: userIds.user1, vote: 1 },
      { user: userIds.moderator, vote: 1 },
    ],
    featured: false,
    commentCount: 1,
    images: [],
  },
  {
    _id: postIds.post5,
    title: "Sử dụng Git và GitHub hiệu quả",
    content:
      "Git là công cụ quản lý phiên bản phổ biến nhất hiện nay, và GitHub là nền tảng lưu trữ mã nguồn phổ biến nhất. Trong bài viết này, chúng ta sẽ tìm hiểu cách sử dụng Git và GitHub hiệu quả trong dự án phát triển phần mềm...",
    author: {
      _id: userIds.user1,
      name: "Regular User One",
    },
    category: "Tools",
    tags: ["git", "github", "version-control", "tools"],
    createdAt: new Date("2023-04-20T11:10:00Z"),
    updatedAt: new Date("2023-04-20T11:10:00Z"),
    status: "pending",
    viewCount: 0,
    upvotes: 0,
    downvotes: 0,
    voters: [],
    featured: false,
    commentCount: 0,
    images: [],
  },
];

db.posts.insertMany(postsData);
print(`Đã chèn ${postsData.length} bài viết`);

// Chèn dữ liệu mẫu - Comments
const commentIds = {
  comment1: ObjectId(),
  comment2: ObjectId(),
  comment3: ObjectId(),
  comment4: ObjectId(),
  comment5: ObjectId(),
};

const commentsData = [
  {
    _id: commentIds.comment1,
    post: postIds.post1,
    content:
      "Bài viết rất hữu ích! Tôi đã học được rất nhiều về React Hooks. Cám ơn tác giả!",
    author: {
      _id: userIds.user2,
      name: "Regular User Two",
    },
    createdAt: new Date("2023-04-01T13:30:00Z"),
    updatedAt: new Date("2023-04-01T13:30:00Z"),
    status: "approved",
    likes: 3,
    parentComment: null,
  },
  {
    _id: commentIds.comment2,
    post: postIds.post1,
    content:
      "Bạn có thể giải thích thêm về useContext và useReducer không? Tôi vẫn chưa hiểu rõ lắm.",
    author: {
      _id: userIds.user3,
      name: "Regular User Three",
    },
    createdAt: new Date("2023-04-02T09:15:00Z"),
    updatedAt: new Date("2023-04-02T09:15:00Z"),
    status: "approved",
    likes: 1,
    parentComment: commentIds.comment1,
  },
  {
    _id: commentIds.comment3,
    post: postIds.post2,
    content:
      "Mongoose thực sự là một ODM tuyệt vời cho MongoDB. Tôi đã sử dụng nó trong nhiều dự án và rất hài lòng.",
    author: {
      _id: userIds.user1,
      name: "Regular User One",
    },
    createdAt: new Date("2023-04-07T11:45:00Z"),
    updatedAt: new Date("2023-04-07T11:45:00Z"),
    status: "approved",
    likes: 2,
    parentComment: null,
  },
  {
    _id: commentIds.comment4,
    post: postIds.post3,
    content:
      "Tôi đã áp dụng một số kỹ thuật nêu trong bài viết và ứng dụng của tôi đã nhanh hơn đáng kể!",
    author: {
      _id: userIds.user1,
      name: "Regular User One",
    },
    createdAt: new Date("2023-04-12T14:20:00Z"),
    updatedAt: new Date("2023-04-12T14:20:00Z"),
    status: "pending",
    likes: 0,
    parentComment: null,
  },
  {
    _id: commentIds.comment5,
    post: postIds.post4,
    content: "Nội dung không phù hợp, vi phạm quy tắc diễn đàn.",
    author: {
      _id: userIds.user3,
      name: "Regular User Three",
    },
    createdAt: new Date("2023-04-17T10:30:00Z"),
    updatedAt: new Date("2023-04-17T10:30:00Z"),
    status: "reported",
    likes: 0,
    parentComment: null,
    reports: [
      {
        user: userIds.moderator,
        reason: "Nội dung vi phạm quy tắc diễn đàn",
        createdAt: new Date("2023-04-17T12:00:00Z"),
      },
    ],
  },
];

db.comments.insertMany(commentsData);
print(`Đã chèn ${commentsData.length} bình luận`);

// Chèn dữ liệu mẫu - Settings
const settingsData = [
  {
    _id: ObjectId(),
    key: "general",
    settings: {
      siteName: "Diễn đàn Lập trình",
      description: "Cộng đồng chia sẻ kiến thức về lập trình",
      logo: "/images/logo.png",
      favicon: "/images/favicon.ico",
      postsPerPage: 10,
      commentsPerPage: 15,
      allowRegistration: true,
      requireEmailVerification: true,
      allowUserProfileCustomization: true,
      defaultUserRole: "user",
      maintenanceMode: false,
    },
  },
  {
    _id: ObjectId(),
    key: "email",
    settings: {
      host: "smtp.example.com",
      port: 587,
      secure: true,
      username: "no-reply@example.com",
      password: "emailPassword123",
      fromEmail: "no-reply@example.com",
      fromName: "Diễn đàn Lập trình",
      templates: {
        welcome: {
          subject: "Chào mừng bạn đến với Diễn đàn Lập trình",
          body: "Cảm ơn bạn đã đăng ký tài khoản...",
        },
        resetPassword: {
          subject: "Đặt lại mật khẩu",
          body: "Bạn đã yêu cầu đặt lại mật khẩu...",
        },
        emailVerification: {
          subject: "Xác thực email",
          body: "Vui lòng xác thực email của bạn...",
        },
      },
    },
  },
];

db.settings.insertMany(settingsData);
print(`Đã chèn ${settingsData.length} thiết lập hệ thống`);

// Chèn dữ liệu mẫu - Notifications
const notificationsData = [
  {
    _id: ObjectId(),
    user: userIds.user1,
    type: "comment",
    message: "User Two đã bình luận về bài viết của bạn",
    relatedTo: {
      type: "post",
      id: postIds.post1,
    },
    isRead: false,
    createdAt: new Date("2023-04-01T13:30:00Z"),
  },
  {
    _id: ObjectId(),
    user: userIds.user2,
    type: "like",
    message: "User One đã thích bình luận của bạn",
    relatedTo: {
      type: "comment",
      id: commentIds.comment1,
    },
    isRead: true,
    createdAt: new Date("2023-04-01T14:00:00Z"),
  },
  {
    _id: ObjectId(),
    user: userIds.user2,
    type: "mention",
    message: "User Three đã đề cập đến bạn trong một bình luận",
    relatedTo: {
      type: "comment",
      id: commentIds.comment2,
    },
    isRead: false,
    createdAt: new Date("2023-04-02T09:15:00Z"),
  },
  {
    _id: ObjectId(),
    user: userIds.user3,
    type: "system",
    message: "Bài viết của bạn đã được duyệt",
    relatedTo: {
      type: "post",
      id: postIds.post4,
    },
    isRead: true,
    createdAt: new Date("2023-04-15T16:30:00Z"),
  },
];

db.notifications.insertMany(notificationsData);
print(`Đã chèn ${notificationsData.length} thông báo`);

// Chèn dữ liệu mẫu - Announcements
const announcementsData = [
  {
    _id: ObjectId(),
    title: "Chào mừng đến với phiên bản mới của Diễn đàn!",
    content:
      "Chúng tôi vừa ra mắt phiên bản mới với nhiều tính năng hấp dẫn. Hãy khám phá và cho chúng tôi biết ý kiến của bạn!",
    author: userIds.admin,
    startDate: new Date("2023-04-01"),
    endDate: new Date("2023-04-30"),
    isActive: true,
    priority: 5,
    targetAudience: "all",
    createdAt: new Date("2023-03-30"),
  },
  {
    _id: ObjectId(),
    title: "Bảo trì hệ thống",
    content:
      "Hệ thống sẽ được bảo trì vào ngày 15/05/2023 từ 02:00 - 04:00 GMT+7. Xin lỗi vì sự bất tiện này!",
    author: userIds.admin,
    startDate: new Date("2023-05-10"),
    endDate: new Date("2023-05-15T04:00:00Z"),
    isActive: true,
    priority: 4,
    targetAudience: "all",
    createdAt: new Date("2023-05-01"),
  },
  {
    _id: ObjectId(),
    title: "Hướng dẫn dành cho người kiểm duyệt",
    content:
      "Chúng tôi đã cập nhật hướng dẫn kiểm duyệt nội dung. Vui lòng đọc kỹ để đảm bảo tuân thủ các quy tắc mới.",
    author: userIds.admin,
    startDate: new Date("2023-04-05"),
    endDate: new Date("2023-05-05"),
    isActive: true,
    priority: 3,
    targetAudience: "moderators",
    createdAt: new Date("2023-04-04"),
  },
];

db.announcements.insertMany(announcementsData);
print(`Đã chèn ${announcementsData.length} thông báo hệ thống`);

print("Hoàn tất khởi tạo cơ sở dữ liệu!");
