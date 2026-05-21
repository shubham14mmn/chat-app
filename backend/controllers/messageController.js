// Message controller — send messages, get conversation, mark as seen
import Message from "../models/Message.js";
import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// POST /api/messages/send/:receiverId
export const sendMessage = async (req, res) => {
  try {
    const { text, file, fileType } = req.body; // file = base64 data URL
    const senderId = req.user._id;
    const { receiverId } = req.params;

    let fileUrl = "";
    if (file) {
      // Cloudinary auto-detects images, videos and raw files (PDFs)
      const upload = await cloudinary.uploader.upload(file, {
        folder: "chatapp/messages",
        resource_type: "auto",
      });
      fileUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      fileUrl,
      fileType: fileType || "",
    });

    // Send the new message in real time using Socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/:otherUserId — get all messages between me and other user
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/messages/seen/:otherUserId — mark all messages from other user as seen
export const markSeen = async (req, res) => {
  try {
    const myId = req.user._id;
    const { otherUserId } = req.params;

    await Message.updateMany(
      { senderId: otherUserId, receiverId: myId, seen: false },
      { $set: { seen: true } }
    );

    // Notify the sender that messages have been seen
    const senderSocketId = getReceiverSocketId(otherUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { by: myId });
    }

    res.json({ message: "Marked as seen" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/unread/counts — unread count per sender (for sidebar badges)
export const getUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;
    const counts = await Message.aggregate([
      { $match: { receiverId: myId, seen: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);
    res.json(counts); // [{ _id: senderId, count: n }]
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
