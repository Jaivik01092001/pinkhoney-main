require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const { errorHandler } = require("./middleware/errorHandler");
const connectDB = require("./config/database");
const { clerkMiddleware } = require('@clerk/express');
const { speechToText, textToSpeech } = require("./services/speechService");
const { getAIResponse } = require("./services/aiService");

// Import routes
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const clerkRoutes = require("./routes/clerkRoutes");
const voiceRoutes = require("./routes/voiceRoutes");

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 8080; // Default to 8080 to match frontend expectations

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Request logging

app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,   // same env var as before
  })
);

// Routes
app.use("/api", aiRoutes);
app.use("/api", userRoutes);
app.use("/api", stripeRoutes);
app.use("/api", clerkRoutes);
app.use("/api", voiceRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Track conversation state for each socket
  const conversationState = {
    isProcessing: false,
    queue: []
  };

  // Process the next item in the queue
  const processNextInQueue = async () => {
    if (conversationState.queue.length === 0 || conversationState.isProcessing) {
      return;
    }

    // Set processing flag to prevent concurrent processing
    conversationState.isProcessing = true;

    // Get the next item from the queue
    const data = conversationState.queue.shift();

    try {
      console.log("Processing voice data from queue");

      // Convert speech to text (using raw format to let the backend handle detection)
      const text = await speechToText(data.audio, 'raw');
      console.log(`Transcribed text: ${text}`);

      // If we couldn't transcribe the speech or the text is empty, send an error message back
      if (text.includes("I couldn't understand") || text.includes("Error processing") || !text.trim()) {
        // Generate a friendly response for failed transcription
        const errorResponse = "I'm sorry, I couldn't understand what you said. Could you please try speaking again?";

        // Try to generate audio for the error message
        let errorAudio = null;
        try {
          errorAudio = await textToSpeech(errorResponse);
        } catch (audioError) {
          console.error("Error generating speech for error message:", audioError);
        }

        socket.emit("ai-response", {
          text: errorResponse,
          audio: errorAudio
        });

        // Mark as done processing
        conversationState.isProcessing = false;

        // Process next item if available
        processNextInQueue();
        return;
      }

      // Get AI response
      const aiResponses = await getAIResponse(text, data.companion_name, data.personality);
      const aiResponse = aiResponses[0]; // Get the first response
      console.log(`AI response: ${aiResponse}`);

      // Try to convert AI response to speech, but don't fail if it doesn't work
      let audioBuffer = null;
      try {
        audioBuffer = await textToSpeech(aiResponse);
      } catch (ttsError) {
        console.error("Error in text-to-speech, falling back to browser TTS:", ttsError);
      }

      // Send the audio response back to the client
      // If audioBuffer is null, the client will use browser's SpeechSynthesis
      socket.emit("ai-response", {
        text: aiResponse,
        audio: audioBuffer
      });

      // Mark as done processing
      conversationState.isProcessing = false;

      // Process next item if available
      processNextInQueue();
    } catch (error) {
      console.error("Error processing voice data:", error);
      socket.emit("error", { message: "Failed to process voice data" });

      // Mark as done processing even if there was an error
      conversationState.isProcessing = false;

      // Process next item if available
      processNextInQueue();
    }
  };

  // Handle voice data from client
  socket.on("voice-data", async (data) => {
    console.log("Received voice data from client");

    // Check if we have the required data
    if (!data || !data.audio) {
      console.log("No audio data received");
      socket.emit("error", { message: "No audio data received" });
      return;
    }

    // Log basic info about the received audio
    console.log("Received audio data:",
      typeof data.audio === 'string' ? `${data.audio.length} bytes` : 'invalid format');

    // Skip processing if the audio data is too small
    if (typeof data.audio === 'string' && data.audio.length < 100) {
      console.warn("Audio data too small, skipping");
      socket.emit("ai-response", {
        text: "I couldn't hear anything. Could you please try speaking again?",
        audio: null
      });
      return;
    }

    // Add to queue and process
    conversationState.queue.push(data);

    // If not currently processing, start processing the queue
    if (!conversationState.isProcessing) {
      processNextInQueue();
    } else {
      console.log("Already processing, added to queue. Queue length:", conversationState.queue.length);
    }
  });

  // Handle call end
  socket.on("end-call", () => {
    console.log(`Call ended by user: ${socket.id}`);
    socket.disconnect();
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

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
