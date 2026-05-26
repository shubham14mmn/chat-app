
// Main entry point of backend
import express from "express";

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import { app, server } from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// ======================
// Middlewares
// ======================

// Allow frontend requests
app.use(
  cors({
    origin: "https://chat-app-iota-seven-71.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Allow large JSON/file uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Cookie parser
app.use(cookieParser());

// ======================
// Routes
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("ChatApp API is running ✅");
});

// ======================
// Error Handler
// ======================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server Error",
  });
});

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (error) {
    console.log("❌ Database connection failed:", error.message);
  }
});

