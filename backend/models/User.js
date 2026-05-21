// User model — represents a user in MongoDB
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // stored as hashed (bcrypt)
    profilePic: { type: String, default: "" },  // Cloudinary URL
    bio: { type: String, default: "Hey there! I'm using ChatApp." },
    // FORGOT PASSWORD OTP
    resetOtp: { type: String, default: "" },
    resetOtpExpire: { type: Date },
    
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
