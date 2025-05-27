/**
 * Message routes
 * Handles message-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  generateFirstMessageHandler,
  getUserInboxHandler,
  markAsReadHandler,
  checkFirstMessageNeededHandler
} = require("../controllers/messageController");

// Import middleware
const { userValidation } = require("../middleware/userValidation");
const { conditionalAuth } = require("../middleware/securityMiddleware");

const router = express.Router();

// Use conditional authentication middleware
console.log(
  `Message routes using ${process.env.NODE_ENV === "production"
    ? "authenticated"
    : "non-authenticated"
  } mode`
);

// Generate first message endpoint - conditionally authenticated
router.post(
  "/generate_first_message",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  generateFirstMessageHandler
);

// Get user inbox endpoint - conditionally authenticated
router.get(
  "/get_user_inbox",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  getUserInboxHandler
);

// Mark messages as read endpoint - conditionally authenticated
router.post(
  "/mark_as_read",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  markAsReadHandler
);

// Check if first message is needed - conditionally authenticated
router.get(
  "/check_first_message_needed",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  checkFirstMessageNeededHandler
);

module.exports = router;
