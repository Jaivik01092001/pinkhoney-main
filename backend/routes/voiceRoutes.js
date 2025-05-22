/**
 * Voice call routes
 */
const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  initiateCallHandler,
  endCallHandler,
} = require("../controllers/voiceController");
const { userValidation } = require("../middleware/userValidation");

const router = express.Router();

// Use authentication based on environment
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  /**
   * @route   POST /api/voice/initiate
   * @desc    Initiate a voice call session
   * @access  Authenticated
   */
  router.post(
    "/voice/initiate",
    requireAuth(),
    userValidation,
    initiateCallHandler
  );

  /**
   * @route   POST /api/voice/end
   * @desc    End a voice call session
   * @access  Authenticated
   */
  router.post("/voice/end", requireAuth(), userValidation, endCallHandler);
} else {
  /**
   * @route   POST /api/voice/initiate
   * @desc    Initiate a voice call session
   * @access  Public (development only)
   */
  router.post("/voice/initiate", initiateCallHandler);

  /**
   * @route   POST /api/voice/end
   * @desc    End a voice call session
   * @access  Public (development only)
   */
  router.post("/voice/end", endCallHandler);
}

module.exports = router;
