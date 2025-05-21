/**
 * Voice call controller
 */
const { OpenAI } = require("openai");
const config = require("../config/config");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Initiate a voice call session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initiateCallHandler = async (req, res) => {
  try {
    const { user_id, companion_name, personality } = req.body;

    // Validate required fields
    if (!companion_name || !personality) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: companion_name or personality",
      });
    }

    // Generate a unique session ID for the call
    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Return session information
    res.status(200).json({
      success: true,
      sessionId,
      message: "Voice call session initiated successfully",
    });
  } catch (error) {
    console.error("Error in initiateCallHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate voice call session",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * End a voice call session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const endCallHandler = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Validate required fields
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: sessionId",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Voice call session ended successfully",
    });
  } catch (error) {
    console.error("Error in endCallHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to end voice call session",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  initiateCallHandler,
  endCallHandler,
};
