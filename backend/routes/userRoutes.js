const express = require("express");
const { requireAuth } = require('@clerk/express');
const router = express.Router();
const {
  checkEmail,
  changeSubscription,
  increaseTokens,
} = require("../controllers/userController");
const { userValidation } = require("../middleware/userValidation");

// Protected routes that require authentication
router.post("/check_email", requireAuth(), userValidation, checkEmail);
router.post("/change_subscription", requireAuth(), userValidation, changeSubscription);
router.post("/increase_tokens", requireAuth(), userValidation, increaseTokens);

// Special routes that don't require authentication
router.post("/clerk_sync", checkEmail);
router.post("/get_user_by_email", checkEmail); // For pricing page

module.exports = router;
