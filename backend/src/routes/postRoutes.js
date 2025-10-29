import express from "express";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { MediaService } from "../services/mediaService.js";
import path from 'path';
import fs from 'fs';
import { addFileProcessingJob, JOB_TYPES } from "../services/queueService.js";

const router = express.Router();

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/temp', 'uploads/images', 'uploads/videos', 'uploads/thumbnails'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Serve static files - MUST be before other routes
router.get('/media/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error serving file:', err);
    res.status(500).json({ message: 'Error serving file' });
  }
});

// Create post with async processing
router.post("/", verifyToken, upload.array('media', 5), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const mediaFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        mediaFiles.push({
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          originalName: file.originalname,
          filename: file.filename, // temp filename
          path: file.path, // temp path
          size: file.size,
          mimeType: file.mimetype,
          status: 'uploading'
        });
      }
    }

    const post = await Post.create({
      title,
      content,
      author: req.userId,
      media: mediaFiles,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    });

    // Add processing jobs to queue
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const jobType = file.mimetype.startsWith('image/') 
          ? JOB_TYPES.PROCESS_IMAGE 
          : JOB_TYPES.PROCESS_VIDEO;

        await addFileProcessingJob(jobType, {
          filePath: file.path,
          filename: file.filename,
          postId: post._id,
          mediaIndex: i
        });
      }
    }

    const populatedPost = await Post.findById(post._id).populate("author", "username email");
    
    res.status(201).json({
      ...populatedPost.toObject(),
      message: "Post created successfully. Media files are being processed."
    });
    
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: err.message || "Error creating post" });
  }
});

// API to check processing status
router.get("/:id/status", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const processingStatus = {
      postId: post._id,
      mediaStatus: post.media.map(m => ({
        originalName: m.originalName,
        status: m.status
      })),
      allProcessed: post.media.every(m => m.status === 'processed')
    };

    res.json(processingStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get posts with media
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all posts of current user
router.get("/my", verifyToken, async (req, res) => {
  try {
    const myPosts = await Post.find({ author: req.userId })
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(myPosts);
  } catch (err) {
    console.error('Get my posts error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username email"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update post
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : post.tags;
    
    await post.save();

    const populatedPost = await Post.findById(post._id).populate("author", "username email");
    res.json(populatedPost);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    // Delete associated media files
    if (post.media && post.media.length > 0) {
      for (const mediaItem of post.media) {
        const filePath = path.join(process.cwd(), 'uploads', mediaItem.type === 'image' ? 'images' : 'videos', mediaItem.filename);
        const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', mediaItem.thumbnail);
        
        await MediaService.deleteFile(filePath);
        await MediaService.deleteFile(thumbnailPath);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;