import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import Post from "./models/Post.js";
import authRoutes from "./routes/authRoutes.js"; // <-- route login/register

const app = express();

// --- MIDDLEWARE --- //
app.use(cors());
app.use(express.json());

// --- KẾT NỐI DATABASE --- //
connectDB();

// --- ROUTES --- //

// ✅ Login & Register
app.use("/api/auth", authRoutes);

// ✅ Lấy tất cả bài viết
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username email");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Tạo bài viết mới
app.post("/api/posts", async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Create post failed" });
  }
});

// --- SERVER --- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
