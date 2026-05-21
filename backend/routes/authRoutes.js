import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/me", protect, getMe);

// FORGOT PASSWORD ROUTES
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;
