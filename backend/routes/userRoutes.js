/**
 * User routes
 * Handles user-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const router = express.Router();

// Import controllers
const {
  checkEmail,
  changeSubscription,
  increaseTokens,
} = require("../controllers/userController");

// Import middleware
const { userValidation } = require("../middleware/userValidation");
const {
  validateUserEmail,
  validateSubscriptionChange,
  validateTokenIncrease,
} = require("../middleware/requestValidation");
const { conditionalAuth } = require("../middleware/securityMiddleware");

// Protected routes that require authentication in production
// Apply conditional authentication, validation, and request validation
router.post(
  "/check_email",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateUserEmail,
  checkEmail
);

router.post(
  "/change_subscription",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateSubscriptionChange,
  changeSubscription
);

router.post(
  "/increase_tokens",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateTokenIncrease,
  increaseTokens
);

// Special routes that don't require authentication
router.post("/clerk_sync", validateUserEmail, checkEmail);
router.post("/get_user_by_email", validateUserEmail, checkEmail); // For pricing page

module.exports = router;
