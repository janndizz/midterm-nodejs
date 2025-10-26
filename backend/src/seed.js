import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Post from "./models/Post.js";

// --- Load biến môi trường ---
dotenv.config();

// --- URI Mongo ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/blogdb";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // --- Xóa toàn bộ database cũ ---
    await mongoose.connection.dropDatabase();
    console.log("Dropped old database!");

    // --- Tạo user mẫu ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const users = await User.insertMany([
      { username: "admin", email: "admin@example.com", password: hashedPassword },
      { username: "nhan", email: "nhan@example.com", password: hashedPassword },
      { username: "alice", email: "alice@example.com", password: hashedPassword },
    ]);

    console.log(`Created ${users.length} sample users.`);

    // --- Tạo bài viết mẫu ---
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

    console.log(`Created ${posts.length} sample posts.`);

    console.log("Seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
