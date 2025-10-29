import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    originalName: String,
    filename: String,
    path: String,
    size: Number,
    mimeType: String,
    thumbnail: String,
    duration: Number,
    status: {
      type: String,
      enum: ["uploading", "processing", "processed", "failed"],
      default: "uploading",
    },
  }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: [mediaSchema],
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
