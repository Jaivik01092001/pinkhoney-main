const express = require("express");
const { requireAuth } = require('@clerk/express');
const router = express.Router();
const {
  checkEmail,
  changeSubscription,
  increaseTokens,
} = require("../controllers/userController");
const { userValidation } = require("../middleware/userValidation");

router.post("/check_email", requireAuth(), userValidation, checkEmail);
router.post("/change_subscription", requireAuth(), userValidation, changeSubscription);
router.post("/increase_tokens", requireAuth(), userValidation, increaseTokens);

module.exports = router;
