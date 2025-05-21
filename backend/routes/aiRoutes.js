const express = require("express");
const { requireAuth } = require('@clerk/express');
const {
  getAIResponseHandler,
  getChatHistoryHandler,
} = require("../controllers/aiController");
const { userValidation } = require("../middleware/userValidation");

const router = express.Router();

// Temporarily remove authentication for testing
router.post("/get_ai_response", getAIResponseHandler);
router.get("/get_chat_history", getChatHistoryHandler);

// Original authenticated routes
// router.post("/get_ai_response", requireAuth(), userValidation, getAIResponseHandler);
// router.get("/get_chat_history", requireAuth(), userValidation, getChatHistoryHandler);

module.exports = router;
