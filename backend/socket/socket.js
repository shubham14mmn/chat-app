// Socket.io setup — handles real-time events
import { Server } from "socket.io";
import http from "http";
import express from "express";

// Create express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-iota-seven-71.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store online users
// userId => socketId
const userSocketMap = {};

// Get receiver socket id
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

// Socket connection
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Get userId from frontend query
  const userId = socket.handshake.query.userId;

  // Save socket
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Send online users to all clients
  io.emit("onlineUsers", Object.keys(userSocketMap));

  // =========================
  // Typing Events
  // =========================

  socket.on("typing", ({ to }) => {
    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        from: userId,
      });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        from: userId,
      });
    }
  });

  // =========================
  // Voice Call Events
  // =========================

  // Call user
  socket.on("callUser", ({ to, offer, from }) => {
    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        from,
        offer,
      });
    }
  });

  // Accept call
  socket.on("answerCall", ({ to, answer }) => {
    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAccepted", {
        answer,
      });
    }
  });

  // End call
  socket.on("endCall", ({ to }) => {
    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
    }
  });

  // =========================
  // Disconnect
  // =========================

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    delete userSocketMap[userId];

    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

// Export everything
export { app, server, io };