import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // ký tự tối thiểu
    },
  },
  { timestamps: true }
);

// mã hóa password
userSchema.pre("save", async function (next) {
  // Nếu mật khẩu chưa thay
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10); // tạo salt ngẫu nhiên
    this.password = await bcrypt.hash(this.password, salt); // hash password
    next();
  } catch (err) {
    next(err);
  }
});

// kiểm tra mật khẩu khi login
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

export default mongoose.model("User", userSchema);
