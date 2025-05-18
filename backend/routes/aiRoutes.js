/**
 * AI response routes
 */
const express = require("express");
const {
  getAIResponseHandler,
  getChatHistoryHandler,
} = require("../controllers/aiController");

const router = express.Router();

/**
 * @route   POST /api/get_ai_response
 * @desc    Get AI response for user message
 * @access  Public
 */
router.post("/get_ai_response", getAIResponseHandler);

/**
 * @route   GET /api/get_chat_history
 * @desc    Get chat history for a user and companion
 * @access  Public
 */
router.get("/get_chat_history", getChatHistoryHandler);

module.exports = router;
