// Message model — one document per chat message
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:       { type: String, default: "" },
    // For images / videos / pdfs we store the Cloudinary URL + type
    fileUrl:    { type: String, default: "" },
    fileType:   { type: String, default: "" }, // "image" | "video" | "pdf"
    seen:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
