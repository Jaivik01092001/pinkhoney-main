/**
 * Companion routes
 * Handles companion-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  getAllCompanions,
  getCompanionById,
  getCompanionByName,
} = require("../controllers/companionController");

// Import middleware
const { userValidation } = require("../middleware/userValidation");
const { conditionalAuth } = require("../middleware/securityMiddleware");

const router = express.Router();

// Use conditional authentication middleware
console.log(
  `Companion routes using ${
    process.env.NODE_ENV === "production"
      ? "authenticated"
      : "non-authenticated"
  } mode`
);

// Get all active companions - conditionally authenticated
router.get(
  "/companions",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  getAllCompanions
);

// Get companion by MongoDB ID - conditionally authenticated
router.get(
  "/companions/id/:id",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  getCompanionById
);

// Get companion by name - conditionally authenticated
router.get(
  "/companions/name/:name",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  getCompanionByName
);

module.exports = router;
