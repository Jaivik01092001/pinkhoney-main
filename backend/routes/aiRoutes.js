/**
 * AI routes
 * Handles AI-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  getAIResponseHandler,
  getChatHistoryHandler,
} = require("../controllers/aiController");

// Import middleware
const { userValidation } = require("../middleware/userValidation");
const {
  validateAIResponse,
  validateChatHistory,
} = require("../middleware/requestValidation");
const { conditionalAuth } = require("../middleware/securityMiddleware");

const router = express.Router();

// Use conditional authentication middleware
console.log(
  `AI routes using ${
    process.env.NODE_ENV === "production"
      ? "authenticated"
      : "non-authenticated"
  } mode`
);

// AI response endpoint - conditionally authenticated
router.post(
  "/get_ai_response",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateAIResponse,
  getAIResponseHandler
);

// Chat history endpoint - conditionally authenticated
router.get(
  "/get_chat_history",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateChatHistory,
  getChatHistoryHandler
);

module.exports = router;
