// User controller — search users, get profile, update profile
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// GET /api/users — list all users except me (for sidebar)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/search?q=keyword — search by name or email
export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || "";
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile — update name, bio, profile picture
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (bio) user.bio = bio;

    // If profilePic is a base64 string, upload to Cloudinary
    if (profilePic && profilePic.startsWith("data:")) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "chatapp/profiles",
      });
      user.profilePic = upload.secure_url;
    }

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
