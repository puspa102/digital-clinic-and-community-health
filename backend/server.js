import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";


// Database
import { connectDB } from "./config/db.js";

// Configuration
import corsOptions from "./config/cors.config.js";
import config from "./config/env.config.js";

// Middlewares
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import { seedAdminIfNotExists } from "./utils/seedAdmin.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);
  connectedUsers.set(socket.userId, socket.id);

  // Join a personal room for direct messages
  socket.join(`user_${socket.userId}`);

  // Handle joining a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  // Handle leaving a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    const { conversationId, message, recipientId } = data;
    
    // Emit to the conversation room
    socket.to(`conversation_${conversationId}`).emit("new_message", {
      conversationId,
      message,
    });

    // Also emit to recipient's personal room for notification
    socket.to(`user_${recipientId}`).emit("message_notification", {
      conversationId,
      message,
    });
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`conversation_${conversationId}`).emit("user_typing", {
      userId: socket.userId,
      isTyping,
    });
  });

  // Handle read receipt
  socket.on("mark_read", (data) => {
    const { conversationId, recipientId } = data;
    socket.to(`user_${recipientId}`).emit("messages_read", {
      conversationId,
      readBy: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
  });
});

// Make io accessible in routes
app.set("io", io);

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// ============================================
// CORS - Must be first before other middleware
// ============================================

// CORS - Cross-Origin Resource Sharing (handles preflight automatically)
app.use(cors(corsOptions));

// ============================================
// Security Middlewares
// ============================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ============================================
// Request Parsing Middlewares
// ============================================

// Parse JSON bodies
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parse cookies
app.use(cookieParser());

// ============================================
// Performance Middlewares
// ============================================

// Compression - Gzip responses
app.use(compression());

// ============================================
// Logging Middleware
// ============================================

// Morgan - HTTP request logger
if (config.app.isDev) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ============================================
// Rate Limiting
// ============================================

// Apply general rate limiting to all API routes
app.use("/api", apiLimiter);

// ============================================
// Health Check & Info Routes
// ============================================

// Health check endpoint (no rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env,
  });
});

// API info endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: config.app.name,
    version: "1.0.0",
    description: "Digital Clinic Backend API",
    documentation: "/api-docs",
    description:
      "Digital Clinic Backend API. Patients register publicly. Pharmacies are created by Admin. Doctors are created by Pharmacies. Patients book appointments at Pharmacies, and Pharmacies assign their Doctors.",
    endpoints: {
      auth: "/api/auth",
      pharmacies: "/api/pharmacies",
      doctors: "/api/doctors",
      appointments: "/api/appointments",
      payments: "/api/payments",
      emergencies: "/api/emergencies",
    },
  });
});

// ============================================
// API Routes
// ============================================

// Authentication routes
app.use("/api/auth", authRoutes);

// Pharmacy routes (Admin creates pharmacies, Pharmacy creates doctors & assigns them to appointments)
app.use("/api/pharmacies", pharmacyRoutes);

// Doctor routes (public browsing, doctor profile management)
app.use("/api/doctors", doctorRoutes);

// Appointment routes
app.use("/api/appointments", appointmentRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// Emergency routes
app.use("/api/emergencies", emergencyRoutes);

// Inventory routes (Pharmacy)
app.use("/api/inventory", inventoryRoutes);

// Order routes (Pharmacy)
app.use("/api/orders", orderRoutes);

// Prescription routes (Doctor)
app.use("/api/prescriptions", prescriptionRoutes);

// Chat routes (Doctor, Patient)
app.use("/api/chat", chatRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Seed admin ONLY if enabled
    if (process.env.SEED_ADMIN === "true") {
      await seedAdminIfNotExists();
    }

    const PORT = config.app.port;
    const HOST = config.app.host;

    httpServer.listen(PORT, () => {
      console.log("\n========================================");
      console.log(`🏥 ${config.app.name}`);
      console.log("========================================");
      console.log(`📡 Server:      http://${HOST}:${PORT}`);
      console.log(`📚 API Docs:    http://${HOST}:${PORT}/api-docs`);
      console.log(`❤️  Health:      http://${HOST}:${PORT}/health`);
      console.log(`💬 WebSocket:   ws://${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${config.app.env}`);
      console.log("========================================\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();

export default app;
