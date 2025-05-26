/**
 * Clerk webhook routes
 * Handles authentication-related webhook endpoints
 */
const express = require("express");
const { handleClerkWebhook } = require("../controllers/clerkController");
const config = require("../config/config");

const router = express.Router();

// Special middleware for Clerk webhooks to get raw body
const clerkWebhookMiddleware = express.raw({ type: "application/json" });

/**
 * Clerk webhook signature verification middleware
 * Verifies that the webhook request came from Clerk
 */
const verifyClerkWebhook = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.log(
      "Skipping Clerk webhook signature verification in development mode"
    );
    return next();
  }

  const signature = req.headers["svix-signature"];

  if (!signature) {
    return res.status(400).json({
      success: false,
      error: "Missing Clerk signature",
    });
  }

  try {
    // Verify the signature using the verifyClerkWebhookSignature function
    const { verifyClerkWebhookSignature } = require("../utils/clerkUtils");
    const isValid = verifyClerkWebhookSignature(req.body, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid Clerk signature",
      });
    }

    next();
  } catch (error) {
    console.error("Clerk webhook verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Webhook verification failed",
    });
  }
};

/**
 * @route   POST /api/clerk-webhook
 * @desc    Handle Clerk webhook events
 * @access  Public
 */
router.post(
  "/clerk-webhook",
  clerkWebhookMiddleware,
  verifyClerkWebhook,
  handleClerkWebhook
);

module.exports = router;
