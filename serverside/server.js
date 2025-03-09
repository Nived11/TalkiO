// server.js - updated code for user online/offline status
import express from "express";
import env from "dotenv";
import cors from "cors";
import connection from "./connection.js";
import router from "./router.js";
import { createServer } from "http";
import { Server } from "socket.io";

env.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(express.json({limit:"50mb"}));
app.use(cors());
app.use("/api", router);

// Socket.io connection handling
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  // User comes online
  socket.on("user-online", (userId) => {
    if (!userId) return;
    
    // Store the user's socket id
    onlineUsers.set(userId, socket.id);
    console.log("User online:", userId);
    
    // Broadcast to all connected clients that this user is online
    io.emit("user-status-changed", { userId, status: "online" });
    
    // ADDED: Send the status of all currently online users to the newly connected user
    onlineUsers.forEach((_, onlineUserId) => {
      if (onlineUserId !== userId) {
        socket.emit("user-status-changed", { userId: onlineUserId, status: "online" });
      }
    });
  });
  
  // User goes offline explicitly (e.g., on logout)
  socket.on("user-offline", (userId) => {
    if (onlineUsers.has(userId)) {
      onlineUsers.delete(userId);
      // Broadcast to all that this user went offline
      io.emit("user-status-changed", { userId, status: "offline" });
      console.log("User offline (logout):", userId);
    }
  });
  
  // Handle private messages
  socket.on("send-message", (messageData) => {
    console.log("Message received:", messageData);
    const receiverSocketId = onlineUsers.get(messageData.receiverId);
    
    if (receiverSocketId) {
      // If receiver is online, emit the message to them
      io.to(receiverSocketId).emit("receive-message", messageData);
    }
    
    // Also emit back to sender to ensure it's in their chat history
    // This helps with synchronization across multiple devices
    const senderSocketId = onlineUsers.get(messageData.senderId);
    if (senderSocketId && senderSocketId !== socket.id) {
      io.to(senderSocketId).emit("receive-message", messageData);
    }
  });
  
  // Handle typing status
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing-started", { senderId });
    }
  });
  
  socket.on("stop-typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing-stopped", { senderId });
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    // Find which user disconnected
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      // Broadcast to all users that this user went offline
      io.emit("user-status-changed", { userId: disconnectedUserId, status: "offline" });
      console.log("User offline (disconnect):", disconnectedUserId);
    }
  });
});

// Updated connection code
connection().then(() => {
  httpServer.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
  });
});