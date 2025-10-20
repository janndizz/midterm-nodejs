import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Post from "./models/Post.js";

// Load biến môi trường (.env nếu có)
dotenv.config();

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/blogdb";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Xóa dữ liệu cũ
    await User.deleteMany();
    await Post.deleteMany();

    // Tạo user mẫu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const users = await User.insertMany([
      { username: "admin", email: "admin@example.com", password: hashedPassword },
      { username: "nhan", email: "nhan@example.com", password: hashedPassword },
      { username: "alice", email: "alice@example.com", password: hashedPassword },
    ]);

    console.log("👤 Sample users created:", users.length);

    //Tạo bài viết mẫu
    const posts = await Post.insertMany([
      {
        title: "Welcome to My Blog",
        content: "This is the first blog post in our new MERN blog project.",
        author: users[0]._id,
      },
      {
        title: "Learning Docker the Easy Way",
        content: "Docker simplifies deployment a lot. Here’s how you can start!",
        author: users[1]._id,
      },
      {
        title: "Why I Love Node.js",
        content: "Node.js allows building scalable backend apps easily.",
        author: users[2]._id,
      },
    ]);

    console.log("Sample posts created:", posts.length);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
