/**
 * AI routes
 * Handles AI-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  getAIResponseHandler,
  getChatHistoryHandler,
  getWelcomeMessageHandler,
  saveBotMessageHandler,
} = require("../controllers/aiController");

// Import middleware
const { userValidation } = require("../middleware/userValidation");
const {
  validateAIResponse,
  validateWelcomeMessage,
  validateSaveBotMessage,
  validateChatHistory,
} = require("../middleware/requestValidation");
const { conditionalAuth } = require("../middleware/securityMiddleware");

const router = express.Router();

// Use conditional authentication middleware
console.log(
  `AI routes using ${process.env.NODE_ENV === "production"
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

// Welcome message endpoint - conditionally authenticated
router.post(
  "/get_welcome_message",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateWelcomeMessage, // Use specific validation for welcome messages
  getWelcomeMessageHandler
);

// Save bot message endpoint - conditionally authenticated
router.post(
  "/save_bot_message",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateSaveBotMessage, // Use specific validation for bot messages
  saveBotMessageHandler
);

module.exports = router;
