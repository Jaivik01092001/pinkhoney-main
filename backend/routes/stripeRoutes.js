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
  console.log("=== STRIPE WEBHOOK VERIFICATION STARTED ===");
  const signature = req.headers["stripe-signature"];

  // Log environment and configuration information
  console.log(`Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Stripe signature present: ${!!signature}`);
  console.log(`Webhook secret configured: ${!!config.stripe.webhookSecret}`);

  // Log request information for debugging
  console.log(`Request path: ${req.path}`);
  console.log(`Request method: ${req.method}`);
  console.log(`Content-Type: ${req.headers['content-type']}`);

  // Check if the body is a Buffer (raw body) as required for signature verification
  console.log(`Request body type: ${typeof req.body}`);
  console.log(`Request body is Buffer: ${Buffer.isBuffer(req.body)}`);

  if (!signature) {
    console.error("Missing Stripe signature in webhook request");
    return res.status(400).json({
      success: false,
      error: "Missing Stripe signature",
    });
  }

  try {
    // Get the webhook secret from config, with fallback to hardcoded value
    const webhookSecret = config.stripe.webhookSecret || 'whsec_2c8ebd59de1c9060e086ae553b9b3f853aae0c96b81d33902cb2240d6371f338';

    if (!webhookSecret) {
      console.error("Stripe webhook secret is not configured");
      return res.status(500).json({
        success: false,
        error: "Webhook secret not configured",
      });
    }

    console.log(`Using webhook secret: ${webhookSecret.substring(0, 10)}...`);

    // Verify the signature using Stripe's library
    const stripe = require("stripe")(config.stripe.secretKey);

    // In development mode, we'll try both verification and parsing
    const isDevelopment = process.env.NODE_ENV !== 'production';
    let event = null;

    // First try to verify the signature properly
    try {
      // Ensure we have a raw body for signature verification
      if (!Buffer.isBuffer(req.body)) {
        console.error("Request body is not a Buffer. This will cause signature verification to fail.");
        console.log("Converting body to Buffer if possible...");

        if (typeof req.body === 'string') {
          req.body = Buffer.from(req.body);
        } else if (typeof req.body === 'object') {
          req.body = Buffer.from(JSON.stringify(req.body));
        }
      }

      console.log("Attempting to verify webhook with signature");
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
      console.log("Webhook signature verification successful");
    } catch (verifyError) {
      console.error("Signature verification error:", verifyError.message);
      console.error("Verification error details:", verifyError);

      // In development mode, fall back to parsing without verification
      if (isDevelopment) {
        console.log("Development mode: Attempting to parse webhook payload without verification");
        try {
          // Try to parse the event from the raw body
          let rawBody;
          if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf8');
          } else if (typeof req.body === 'string') {
            rawBody = req.body;
          } else if (typeof req.body === 'object') {
            // Body is already parsed as JSON
            event = req.body;
            console.log("Using pre-parsed JSON body");
          }

          if (!event && rawBody) {
            event = JSON.parse(rawBody);
            console.log("Successfully parsed webhook event from raw body");
          }
        } catch (parseError) {
          console.error("Failed to parse webhook payload:", parseError);
          // If we can't parse it either, throw the original verification error
          throw verifyError;
        }
      } else {
        // In production, fail if signature verification fails
        throw verifyError;
      }
    }

    if (!event) {
      throw new Error("Failed to extract event from webhook payload");
    }

    // Log the event details
    console.log(`Webhook event type: ${event.type}`);
    console.log(`Webhook event ID: ${event.id}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(`Checkout session completed. Session ID: ${session.id}`);
      console.log(`Payment status: ${session.payment_status}`);
      console.log(`Customer ID: ${session.customer}`);
      console.log(`Payment Intent ID: ${session.payment_intent}`);

      // Log the full session object for debugging
      console.log("Full session object:", JSON.stringify(session, null, 2));
    }

    // Attach the verified event to the request object
    req.stripeEvent = event;
    console.log("=== STRIPE WEBHOOK VERIFICATION COMPLETED SUCCESSFULLY ===");
    next();
  } catch (error) {
    console.error("=== STRIPE WEBHOOK VERIFICATION ERROR ===");
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);

    // In development mode, return 200 to prevent Stripe from retrying
    // This helps with debugging as we can see the error in our logs
    if (process.env.NODE_ENV !== 'production') {
      console.log("Development mode: Returning 200 despite error to prevent Stripe retries");
      return res.status(200).json({
        success: false,
        error: "Webhook verification failed in development: " + error.message,
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid Stripe signature: " + error.message,
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
 * @route   GET /api/check_payment_status/:sessionId
 * @desc    Check the status of a payment by session ID
 * @access  Public
 */
router.get("/check_payment_status/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    console.log(`Checking payment status for session ID: ${sessionId}`);

    // Query the database directly
    const Payment = require("../models/Payment");

    // Try to find the payment with exact session ID
    let payment = await Payment.findOne({ stripeSessionId: sessionId });

    // If not found, try with pattern matching
    if (!payment && sessionId.includes('_')) {
      const sessionIdParts = sessionId.split('_');
      const uniquePart = sessionIdParts[sessionIdParts.length - 1];

      if (uniquePart && uniquePart.length > 5) {
        console.log(`Trying pattern matching with: ${uniquePart}`);
        payment = await Payment.findOne({
          stripeSessionId: { $regex: uniquePart, $options: 'i' }
        });
      }
    }

    if (payment) {
      console.log(`Found payment: ${payment._id}, status: ${payment.status}`);

      // If payment is still pending, try to update it directly
      if (payment.status === "pending") {
        console.log("Payment is still pending, attempting to update...");

        // Get session details from Stripe
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session && session.payment_status === "paid") {
          console.log("Stripe reports this payment as paid, updating database...");

          // Update payment status
          const updateResult = await Payment.updateOne(
            { _id: payment._id },
            {
              $set: {
                status: "completed",
                stripeCustomerId: session.customer,
                stripePaymentIntentId: session.payment_intent
              }
            }
          );

          console.log("Update result:", updateResult);

          // Get updated payment
          payment = await Payment.findById(payment._id);

          // Update user subscription
          if (payment.status === "completed") {
            const User = require("../models/User");
            const user = await User.findOne({ user_id: payment.user_id });

            if (user) {
              const subscriptionData = {
                subscribed: "yes",
                subscription: {
                  plan: payment.subscriptionPlan,
                  startDate: new Date(),
                  endDate: payment.subscriptionPlan === "lifetime"
                    ? null
                    : payment.subscriptionPlan === "yearly"
                      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  status: "active",
                  stripeCustomerId: session.customer,
                  stripeSubscriptionId: session.subscription,
                }
              };

              await User.updateOne(
                { user_id: payment.user_id },
                { $set: subscriptionData }
              );

              console.log(`Updated user subscription for user: ${user.user_id}`);
            }
          }
        }
      }

      return res.status(200).json({
        success: true,
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          plan: payment.subscriptionPlan,
          created: payment.createdAt
        }
      });
    } else {
      console.log(`No payment found for session ID: ${sessionId}`);
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/direct_stripe_check
 * @desc    Directly check a payment status with Stripe API
 * @access  Public
 */
router.post("/direct_stripe_check", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    console.log(`Direct Stripe check for session ID: ${session_id}`);

    // Get session details directly from Stripe
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      console.log(`Direct Stripe check result: ${session.payment_status}`);
      console.log(`Session details:`, JSON.stringify(session, null, 2));

      // If the session exists and payment is paid, update the database
      if (session && session.payment_status === "paid") {
        try {
          // Find and update the payment record
          const Payment = require("../models/Payment");
          let payment = await Payment.findOne({ stripeSessionId: session_id });

          // If not found by exact match, try pattern matching
          if (!payment && session_id.includes('_')) {
            const sessionIdParts = session_id.split('_');
            const uniquePart = sessionIdParts[sessionIdParts.length - 1];

            if (uniquePart && uniquePart.length > 5) {
              payment = await Payment.findOne({
                stripeSessionId: { $regex: uniquePart, $options: 'i' }
              });
            }
          }

          if (payment) {
            console.log(`Found payment record: ${payment._id}, current status: ${payment.status}`);

            // Update payment status if it's still pending
            if (payment.status === "pending") {
              const updateResult = await Payment.updateOne(
                { _id: payment._id },
                {
                  $set: {
                    status: "completed",
                    stripeCustomerId: session.customer,
                    stripePaymentIntentId: session.payment_intent
                  }
                }
              );

              console.log(`Payment update result:`, updateResult);

              // Update user subscription
              const User = require("../models/User");
              const user = await User.findOne({ user_id: payment.user_id });

              if (user) {
                const subscriptionData = {
                  subscribed: "yes",
                  subscription: {
                    plan: payment.subscriptionPlan,
                    startDate: new Date(),
                    endDate: payment.subscriptionPlan === "lifetime"
                      ? null
                      : payment.subscriptionPlan === "yearly"
                        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: "active",
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                  }
                };

                await User.updateOne(
                  { user_id: payment.user_id },
                  { $set: subscriptionData }
                );

                console.log(`Updated user subscription for user: ${user.user_id}`);
              }
            }
          } else {
            console.log(`No payment record found for session ID: ${session_id}`);
          }
        } catch (dbError) {
          console.error(`Database error during direct Stripe check:`, dbError);
        }
      }

      return res.status(200).json({
        success: true,
        status: session.payment_status,
        customer: session.customer,
        payment_intent: session.payment_intent
      });
    } catch (stripeError) {
      console.error(`Error retrieving session from Stripe:`, stripeError);
      return res.status(500).json({
        success: false,
        error: `Error retrieving session from Stripe: ${stripeError.message}`
      });
    }
  } catch (error) {
    console.error(`Error in direct Stripe check:`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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

// Export both the router and the webhook handler for direct access
module.exports = {
  router,
  webhookHandler: (req, res, next) => {
    // Apply the middleware chain manually
    stripeWebhookMiddleware(req, res, (err) => {
      if (err) return next(err);

      verifyStripeWebhook(req, res, (err) => {
        if (err) return next(err);

        webhookHandler(req, res, next);
      });
    });
  }
};
