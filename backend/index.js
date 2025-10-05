require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./database");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const Ride = require("./models/Ride");
const chatRouter = require("./routes/chat");

const userRouter = require("./routes/user");
const ridesRouter = require("./routes/rides");
const reserveRouter = require("./routes/reservation");

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);


app.use(cors({
  origin: [
    process.env.FRONT_END,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use("/users", userRouter);
app.use("/rides", ridesRouter);
app.use("/reserve", reserveRouter);
app.use("/chat", chatRouter);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONT_END,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter(Boolean),
    credentials: true,
  },
  // Increase timeouts to reduce disconnects on slower networks
  pingTimeout: 120000, // default ~20000
  pingInterval: 30000, // default ~25000
  connectTimeout: 30000, // Added to prevent hanging connections
});

// Store user socket mappings and auth cache
const userSockets = new Map();
const verifiedUsers = new Map();

io.use((socket, next) => {
  try {
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!authHeader) {
      console.log('No auth token provided');
      return next(new Error("Unauthorized: No token provided"));
    }

    // Check cache first
    const tokenKey = authHeader;
    if (verifiedUsers.has(tokenKey)) {
      socket.userId = verifiedUsers.get(tokenKey);
      console.log(`Socket authenticated from cache for user: ${socket.userId}`);
      return next();
    }

    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    verifiedUsers.set(tokenKey, decoded.userId);
    socket.userId = decoded.userId;
    console.log(`Socket authenticated for user: ${socket.userId}`);
    next();
  } catch (e) {
    console.error('Socket authentication failed:', e.message);
    next(new Error("Unauthorized: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected with socket ${socket.id}`);
  
  // Store user socket mapping
  userSockets.set(socket.userId, socket.id);
  
  socket.on("chat:join", async ({ rideId, otherUserId }) => {
    try {
      if (!rideId || !otherUserId) {
        console.log('Invalid chat:join parameters');
        return;
      }
      
      const roomId = `${rideId}:${[socket.userId, otherUserId].sort().join(":")}`;
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
      
      // Notify successful join
      socket.emit('chat:joined', { roomId });
    } catch (e) {
      console.error('Error in chat:join:', e);
      socket.emit('chat:error', { message: 'Failed to join chat room' });
    }
  });

  socket.on("chat:send", async ({ rideId, recipientId, text }) => {
    try {
      if (!rideId || !recipientId || !text?.trim()) {
        console.log('Invalid chat:send parameters');
        socket.emit('chat:error', { message: 'Invalid message parameters' });
        return;
      }
      
      const ride = await Ride.findById(rideId);
      if (!ride) {
        console.log('Ride not found:', rideId);
        socket.emit('chat:error', { message: 'Ride not found' });
        return;
      }
      
      // Allow only chats where one party is the ride creator
      const involvesCreator = ride.createdBy.toString() === socket.userId || ride.createdBy.toString() === recipientId;
      if (!involvesCreator) {
        console.log('Unauthorized chat attempt');
        socket.emit('chat:error', { message: 'Not authorized to chat' });
        return;
      }
      
      const msg = await Message.create({ 
        ride: rideId, 
        sender: socket.userId, 
        recipient: recipientId, 
        text: text.trim() 
      });
      
      const roomId = `${rideId}:${[socket.userId, recipientId].sort().join(":")}`;
      const payload = {
        _id: msg._id,
        ride: msg.ride,
        sender: msg.sender,
        recipient: msg.recipient,
        text: msg.text,
        createdAt: msg.createdAt,
      };
      
      console.log(`Message sent in room ${roomId}:`, payload.text);
      
      // Only emit to room (no duplicate to sender)
      io.to(roomId).emit("chat:message", payload);

    } catch (e) {
      console.error('Error in chat:send:', e);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.userId} disconnected. Reason: ${reason}`);
    // Common reasons: transport close, ping timeout, server shutting down, io client disconnect, io server disconnect
    userSockets.delete(socket.userId);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

async function main() {
  try {
    await connectToDatabase(process.env.MONGO_URL);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

main();
