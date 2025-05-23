/**
 * Stripe payment controller
 */
const {
  createCheckoutSession,
  handleWebhookEvent,
} = require("../services/stripeService");

/**
 * Create a checkout session for subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createCheckoutSessionHandler = async (req, res, next) => {
  try {
    const { user_id, selected_plan, email } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Create checkout session with required information
    const session = await createCheckoutSession({
      userId: user_id,
      email: email || "",
      plan: selected_plan || "monthly",
    });

    // Redirect to checkout URL
    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    next(error);
  }
};

/**
 * Handle webhook events from Stripe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const webhookHandler = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: "Missing Stripe signature",
      });
    }

    // Process the webhook event
    // req.body is already raw for Stripe webhooks due to express.raw() middleware
    // Use the pre-verified event from the middleware if available
    const event = req.stripeEvent || req.body;
    console.log("Webhook received for event type:", event.type || "Unknown event type");

    await handleWebhookEvent(event, signature);

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createCheckoutSessionHandler,
  webhookHandler,
};
