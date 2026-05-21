// Main entry point of the backend
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import { app, server } from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Allow large JSON bodies for base64 file uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// FIXED CORS
app.use(
cors({
origin: [
"http://localhost:5173",
"https://chat-app-iota-seven-7l.vercel.app",
],
credentials: true,
})
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("ChatApp API is running ✅"));

// Simple error handler
app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
await connectDB();
console.log(`🚀 Server running on port ${PORT}`);
});
