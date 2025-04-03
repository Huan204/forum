/**
 * File index cho các model MongoDB
 * Export tất cả các model để sử dụng trong ứng dụng
 */

const User = require("./user");
const Post = require("./post");
const Comment = require("./comment");
const Category = require("./category");
const Setting = require("./setting");
const Notification = require("./notification");
const Announcement = require("./announcement");

module.exports = {
  User,
  Post,
  Comment,
  Category,
  Setting,
  Notification,
  Announcement,
};
