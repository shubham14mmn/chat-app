import express from "express";
import {
  sendMessage,
  getMessages,
  markSeen,
  getUnreadCounts,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/unread/counts", protect, getUnreadCounts);
router.post("/send/:receiverId", protect, sendMessage);
router.put("/seen/:otherUserId", protect, markSeen);
router.get("/:otherUserId", protect, getMessages);

export default router;
