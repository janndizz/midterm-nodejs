import express from "express";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy tất cả bài post
router.get("/", async (req, res) => {
  const posts = await Post.find().populate("author", "username email");
  res.json(posts);
});

// Lấy bài viết của user hiện tại
router.get("/my", verifyToken, async (req, res) => {
  try {
    const myPosts = await Post.find({ author: req.userId })
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(myPosts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Thêm bài viết
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({
      title,
      content,
      author: req.userId,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cập nhật bài viết
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa bài viết
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
