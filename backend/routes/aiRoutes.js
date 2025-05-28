/**
 * AI routes
 * Handles AI-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");

const {
  getAIResponseHandler,
  getChatHistoryHandler,
  getUserChatSummariesHandler,
  saveMatchHandler,
  postVoiceToken
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

// User chat summaries endpoint - conditionally authenticated
router.get(
  "/get_user_chat_summaries",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  (req, res, next) => {
    // Simple validation for user_id
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: user_id",
      });
    }
    next();
  },
  getUserChatSummariesHandler
);

// Save match endpoint - conditionally authenticated
router.post(
  "/save_match",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  (req, res, next) => {
    // Simple validation for required fields
    const { user_id, name, personality, image } = req.body;
    if (!user_id || !name || !personality || !image) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, name, personality, image",
      });
    }
    next();
  },
  saveMatchHandler
);
//Removed authentication for testing: Viral
router.post("/voiceToken", postVoiceToken)

module.exports = router;
