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
  getMemoryDebugHandler,
  forceMemoryProcessingHandler,
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

// Debug endpoints for memory system (development only)
if (process.env.NODE_ENV === "development") {
  // Memory debug endpoint - get memory status
  router.get(
    "/debug/memory",
    (req, res, next) => {
      // Simple validation for required fields
      const { user_id, companion_name } = req.query;
      if (!user_id || !companion_name) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: user_id, companion_name",
        });
      }
      next();
    },
    getMemoryDebugHandler
  );

  // Force memory processing endpoint
  router.post(
    "/debug/memory/process",
    (req, res, next) => {
      // Simple validation for required fields
      const { user_id, companion_name } = req.body;
      if (!user_id || !companion_name) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: user_id, companion_name",
        });
      }
      next();
    },
    forceMemoryProcessingHandler
  );
}

module.exports = router;
