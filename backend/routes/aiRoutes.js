const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  getAIResponseHandler,
  getChatHistoryHandler,
} = require("../controllers/aiController");
const { userValidation } = require("../middleware/userValidation");

const router = express.Router();

// Use authentication based on environment
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  // Use authentication in production
  console.log("Using authenticated routes in production mode");
  router.post(
    "/get_ai_response",
    requireAuth(),
    userValidation,
    getAIResponseHandler
  );
  router.get(
    "/get_chat_history",
    requireAuth(),
    userValidation,
    getChatHistoryHandler
  );
} else {
  // Skip authentication in development for easier testing
  console.log("Using non-authenticated routes in development mode");
  router.post("/get_ai_response", getAIResponseHandler);
  router.get("/get_chat_history", getChatHistoryHandler);
}

module.exports = router;
