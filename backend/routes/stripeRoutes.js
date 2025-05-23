/**
 * Stripe payment routes
 * Handles payment-related API endpoints
 */
const express = require("express");
const {
  createCheckoutSessionHandler,
  webhookHandler,
} = require("../controllers/stripeController");
const { validateCheckoutSession } = require("../middleware/requestValidation");
const config = require("../config/config");

const router = express.Router();

// Special middleware for Stripe webhooks to get raw body
const stripeWebhookMiddleware = express.raw({ type: "application/json" });

/**
 * Stripe webhook signature verification middleware
 * Verifies that the webhook request came from Stripe
 */
const verifyStripeWebhook = (req, res, next) => {
  // Always verify webhook signatures, even in development
  // This ensures consistent behavior across environments

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({
      success: false,
      error: "Missing Stripe signature",
    });
  }

  try {
    // Verify the signature using Stripe's library
    const stripe = require("stripe")(config.stripe.secretKey);
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );

    // Log the event type and session ID for debugging
    console.log("Webhook event verified:", event.type);
    if (event.type === "checkout.session.completed") {
      console.log("Checkout session completed webhook received. Session ID:", event.data.object.id);
    }

    // Attach the verified event to the request object
    req.stripeEvent = event;
    next();
  } catch (error) {
    console.error("Stripe webhook verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid Stripe signature",
    });
  }
};

/**
 * @route   GET /api/create_checkout_session
 * @desc    Create a checkout session for subscription
 * @access  Public
 */
router.get(
  "/create_checkout_session",
  validateCheckoutSession,
  createCheckoutSessionHandler
);

/**
 * @route   POST /api/webhook
 * @desc    Handle webhook events from Stripe
 * @access  Public
 */
router.post(
  "/webhook",
  stripeWebhookMiddleware,
  verifyStripeWebhook,
  webhookHandler
);

module.exports = router;
