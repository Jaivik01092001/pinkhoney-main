/**
 * Voice call routes
 * Handles voice call-related API endpoints
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  initiateCallHandler,
  endCallHandler,
} = require("../controllers/voiceController");

// Import middleware
const { userValidation } = require("../middleware/userValidation");
const {
  validateInitiateCall,
  validateEndCall,
} = require("../middleware/requestValidation");
const { conditionalAuth } = require("../middleware/securityMiddleware");

const router = express.Router();

// Use conditional authentication middleware
console.log(
  `Voice routes using ${
    process.env.NODE_ENV === "production"
      ? "authenticated"
      : "non-authenticated"
  } mode`
);

/**
 * @route   POST /api/voice/initiate
 * @desc    Initiate a voice call session
 * @access  Authenticated in production, Public in development
 */
router.post(
  "/voice/initiate",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateInitiateCall,
  initiateCallHandler
);

/**
 * @route   POST /api/voice/end
 * @desc    End a voice call session
 * @access  Authenticated in production, Public in development
 */
router.post(
  "/voice/end",
  conditionalAuth(requireAuth()),
  conditionalAuth(userValidation),
  validateEndCall,
  endCallHandler
);

module.exports = router;
