import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://mongo:27017/blogdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

const postSchema = new mongoose.Schema({
  title: String,
  content: String
});
const Post = mongoose.model("Post", postSchema);

app.get("/api/posts", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

app.post("/api/posts", async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json(post);
});

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
