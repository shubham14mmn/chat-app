// Socket.io setup — handles real-time events (online users, typing, messages)
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Map: userId -> socketId (so we can send messages to a specific user)
const userSocketMap = {};

export const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  
  // ---------------- VOICE CALL EVENTS ----------------

// User is calling another user
socket.on("callUser", ({ to, offer, from }) => {
  const receiverSocket = userSocketMap[to];

  if (receiverSocket) {
    io.to(receiverSocket).emit("incomingCall", {
      from,
      offer,
    });
  }
});

// Receiver accepted the call
socket.on("answerCall", ({ to, answer }) => {
  const receiverSocket = userSocketMap[to];

  if (receiverSocket) {
    io.to(receiverSocket).emit("callAccepted", {
      answer,
    });
  }
});

// End call
socket.on("endCall", ({ to }) => {
  const receiverSocket = userSocketMap[to];

  if (receiverSocket) {
    io.to(receiverSocket).emit("callEnded");
  }
});
  console.log("🔌 New socket connected:", socket.id);

  // The frontend sends our userId right after connecting
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Tell everyone who is online
  io.emit("onlineUsers", Object.keys(userSocketMap));

  // Typing indicator: forward "I am typing" to the other user
  socket.on("typing", ({ to }) => {
    const toSocket = userSocketMap[to];
    if (toSocket) io.to(toSocket).emit("typing", { from: userId });
  });
  socket.on("stopTyping", ({ to }) => {
    const toSocket = userSocketMap[to];
    if (toSocket) io.to(toSocket).emit("stopTyping", { from: userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
