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
  },
  // Improve connection stability
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 5e6 // 5MB max buffer size for audio data
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

  // Set up a heartbeat to keep the connection alive
  let heartbeatInterval = setInterval(() => {
    socket.emit('heartbeat', { timestamp: Date.now() });
  }, 20000); // Send heartbeat every 20 seconds

  // Track conversation state for each socket
  const conversationState = {
    isProcessing: false,
    queue: [],
    lastProcessedTime: 0,
    processingTimeout: null,
    lastValidTranscription: '',
    transcriptionHistory: [], // Keep track of recent transcriptions
    conversationTurn: 0, // Track conversation turns (0 = start, odd = user, even = AI)
    lastResponseTime: Date.now() // Track when the last response was sent
  };

  // Process the next item in the queue
  const processNextInQueue = async () => {
    // Clear any existing timeout
    if (conversationState.processingTimeout) {
      clearTimeout(conversationState.processingTimeout);
      conversationState.processingTimeout = null;
    }

    // Check if queue is empty or already processing
    if (conversationState.queue.length === 0 || conversationState.isProcessing) {
      return;
    }

    // Implement a cooldown period to prevent processing items too quickly
    const now = Date.now();
    const timeSinceLastProcess = now - conversationState.lastProcessedTime;
    const MIN_PROCESS_INTERVAL = 1000; // 1 second minimum between processing

    if (timeSinceLastProcess < MIN_PROCESS_INTERVAL) {
      // Wait for the cooldown to complete before processing
      const waitTime = MIN_PROCESS_INTERVAL - timeSinceLastProcess;
      console.log(`Waiting ${waitTime}ms before processing next item`);

      conversationState.processingTimeout = setTimeout(() => {
        processNextInQueue();
      }, waitTime);

      return;
    }

    // Set processing flag to prevent concurrent processing
    conversationState.isProcessing = true;
    conversationState.lastProcessedTime = now;

    // Get the next item from the queue
    const data = conversationState.queue.shift();

    try {
      console.log("Processing voice data from queue");

      // Get the audio format from the data or default to 'raw'
      const audioFormat = data.audio_format || 'raw';
      console.log(`Using audio format: ${audioFormat}`);

      // Convert speech to text
      const text = await speechToText(data.audio, audioFormat);
      console.log(`Transcribed text: ${text}`);

      // Store the last valid transcription for comparison
      if (!conversationState.lastValidTranscription) {
        conversationState.lastValidTranscription = '';
      }

      // Validate the transcribed text
      const isValidText = (text) => {
        // Check if the text contains error messages
        if (text.includes("I couldn't understand") || text.includes("Error processing")) {
          console.log("Transcription contains error messages, rejecting");
          return false;
        }

        // Check if the text is empty or too short (at least 3 characters)
        if (!text.trim() || text.trim().length < 3) {
          console.log("Transcription too short, rejecting");
          return false;
        }

        // Count words in the text
        const wordCount = text.trim().split(/\s+/).length;

        // Reject transcriptions with fewer than 2 words
        if (wordCount < 2) {
          console.log(`Transcription has only ${wordCount} word(s), rejecting as too short`);
          return false;
        }

        // Check for common transcription errors like "Thanks for watching"
        const commonErrors = [
          "thanks for watching",
          "please subscribe",
          "like and subscribe",
          "click the link",
          "in the description",
          "thank you for watching",
          "don't forget to subscribe",
          "hit the like button"
        ];

        // Check if the text contains any of the common errors
        for (const error of commonErrors) {
          if (text.toLowerCase().includes(error)) {
            console.log(`Detected common transcription error: "${error}"`);
            return false;
          }
        }

        // Check if this is a duplicate or fragment of the previous transcription
        if (conversationState.lastValidTranscription) {
          // If the current text is a substring of the last valid transcription
          if (conversationState.lastValidTranscription.toLowerCase().includes(text.toLowerCase())) {
            console.log(`Transcription "${text}" is a fragment of previous transcription, rejecting`);
            return false;
          }

          // If the current text is very similar to the last valid transcription
          const similarity = calculateTextSimilarity(text, conversationState.lastValidTranscription);
          if (similarity > 0.7) { // 70% similarity threshold
            console.log(`Transcription too similar to previous (${Math.round(similarity * 100)}% similar), rejecting`);
            return false;
          }
        }

        // Store this as the last valid transcription for future comparisons
        conversationState.lastValidTranscription = text;

        return true;
      };

      // Calculate similarity between two strings (0-1 scale)
      const calculateTextSimilarity = (str1, str2) => {
        // Convert to lowercase for case-insensitive comparison
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        // If either string is empty, return 0
        if (!s1.length || !s2.length) return 0;

        // If the strings are identical, return 1
        if (s1 === s2) return 1;

        // Calculate Levenshtein distance
        const track = Array(s2.length + 1).fill(null).map(() =>
          Array(s1.length + 1).fill(null));

        for (let i = 0; i <= s1.length; i += 1) {
          track[0][i] = i;
        }

        for (let j = 0; j <= s2.length; j += 1) {
          track[j][0] = j;
        }

        for (let j = 1; j <= s2.length; j += 1) {
          for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
              track[j][i - 1] + 1, // deletion
              track[j - 1][i] + 1, // insertion
              track[j - 1][i - 1] + indicator, // substitution
            );
          }
        }

        // Calculate similarity as 1 - normalized distance
        const maxLength = Math.max(s1.length, s2.length);
        const distance = track[s2.length][s1.length];
        return 1 - (distance / maxLength);
      };

      // If the transcribed text is not valid, send an error message back
      if (!isValidText(text)) {
        console.log("Invalid transcription detected, sending error response");

        // Generate a friendly response for failed transcription
        const errorResponse = "I'm sorry, I couldn't understand what you said. Could you please try speaking again?";

        // Try to generate audio for the error message
        let errorAudio = null;
        try {
          errorAudio = await textToSpeech(errorResponse);
        } catch (audioError) {
          console.error("Error generating speech for error message:", audioError);
        }

        // Increment conversation turn for error response
        conversationState.conversationTurn++;

        socket.emit("ai-response", {
          text: errorResponse,
          audio: errorAudio,
          conversationTurn: conversationState.conversationTurn,
          userTranscript: text // Include the user's transcribed text even for errors
        });

        // Mark as done processing
        conversationState.isProcessing = false;

        // Process next item if available
        processNextInQueue();
        return;
      }

      // Increment conversation turn (odd = user, even = AI)
      conversationState.conversationTurn++;

      // Get AI response
      const aiResponses = await getAIResponse(text, data.companion_name, data.personality);
      const aiResponse = aiResponses[0]; // Get the first response
      console.log(`AI response: ${aiResponse}`);

      // Update last response time
      conversationState.lastResponseTime = Date.now();

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
        audio: audioBuffer,
        conversationTurn: conversationState.conversationTurn,
        userTranscript: text // Include the user's transcribed text
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
    if (typeof data.audio === 'string' && data.audio.length < 500) {
      console.warn("Audio data too small, skipping");
      socket.emit("ai-response", {
        text: "I couldn't hear anything. Could you please try speaking again?",
        audio: null
      });
      return;
    }

    // Implement a maximum queue size to prevent memory issues
    const MAX_QUEUE_SIZE = 2;

    // If the queue is already at max capacity, remove the oldest item
    if (conversationState.queue.length >= MAX_QUEUE_SIZE) {
      console.warn(`Queue at maximum capacity (${MAX_QUEUE_SIZE}), removing oldest item`);
      conversationState.queue.shift(); // Remove the oldest item
    }

    // Add to queue
    conversationState.queue.push(data);
    console.log(`Added to queue. Queue length: ${conversationState.queue.length}`);

    // If not currently processing, start processing the queue
    if (!conversationState.isProcessing) {
      processNextInQueue();
    } else {
      console.log("Already processing, item will be processed when current processing completes");
    }

    // Set a timeout to clear the queue if it gets stuck
    const QUEUE_TIMEOUT = 30000; // 30 seconds
    setTimeout(() => {
      if (conversationState.isProcessing && conversationState.queue.length > 0) {
        console.warn("Processing timeout reached, resetting processing state");
        conversationState.isProcessing = false;
        processNextInQueue();
      }
    }, QUEUE_TIMEOUT);
  });

  // Handle call end
  socket.on("end-call", () => {
    console.log(`Call ended by user: ${socket.id}`);

    // Clean up any pending timeouts
    if (conversationState.processingTimeout) {
      clearTimeout(conversationState.processingTimeout);
      conversationState.processingTimeout = null;
    }

    // Clear the heartbeat interval
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    // Clear the queue
    conversationState.queue = [];
    conversationState.isProcessing = false;

    // Send a final message to the client before disconnecting
    socket.emit('call-ended', { message: 'Call ended by user' });

    // Disconnect the socket
    socket.disconnect();
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Clean up any pending timeouts
    if (conversationState.processingTimeout) {
      clearTimeout(conversationState.processingTimeout);
      conversationState.processingTimeout = null;
    }

    // Clear the heartbeat interval
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    // Clear the queue to free up memory
    conversationState.queue = [];
    conversationState.isProcessing = false;
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
