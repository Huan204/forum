const mongoose = require("mongoose");

// Schema cho object ảnh
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String },
    size: { type: Number },
    type: { type: String },
  },
  { _id: false }
);

// Schema cho object file
const fileSchema = new mongoose.Schema(
  {
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    type: { type: String },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      default: "text",
    },
    images: [imageSchema],
    file: fileSchema,
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index để tối ưu truy vấn
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ type: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
