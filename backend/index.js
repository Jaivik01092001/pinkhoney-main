require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { errorHandler } = require("./middleware/errorHandler");
const connectDB = require("./config/database");

// Import routes
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const clerkRoutes = require("./routes/clerkRoutes");

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080; // Default to 8080 to match frontend expectations

// Middleware
// Import security middleware
const {
  helmetMiddleware,
  apiLimiter,
  authMiddleware,
} = require("./middleware/securityMiddleware");
const corsMiddleware = require("./middleware/cors");
const logger = require("./middleware/logger");

// Apply security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use("/api", apiLimiter);

// Body parsers with size limits to prevent abuse
app.use(express.json({ limit: "1mb" })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // Parse URL-encoded bodies with size limit

// Request logging
app.use(logger);

// Apply Clerk authentication middleware
app.use(authMiddleware);

// Routes
app.use("/api", aiRoutes);
app.use("/api", userRoutes);
app.use("/api", stripeRoutes);
app.use("/api", clerkRoutes);

// Health check endpoint
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);



// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  // Don't crash the server, just log the error
});

// Handle MongoDB connection errors
process.on("SIGINT", async () => {
  try {
    // Close MongoDB connection when the app is shutting down
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

module.exports = app; // For testing
