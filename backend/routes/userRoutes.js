import express from "express";
import { getAllUsers, searchUsers, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updateProfile);

export default router;
