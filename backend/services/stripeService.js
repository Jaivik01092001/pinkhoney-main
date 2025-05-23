/**
 * Stripe payment service
 */
const stripe = require("stripe");
const config = require("../config/config");
const Payment = require("../models/Payment");
const {
  createPayment,
  updatePayment,
  updateUser,
  getUserById,
  findPaymentBySessionIdPattern,
} = require("./mongoService");

// Initialize Stripe client
const stripeClient = stripe(config.stripe.secretKey);

/**
 * Create a checkout session for subscription
 * @param {Object} options - Checkout options
 * @param {string} options.userId - User ID
 * @param {string} options.email - User email
 * @param {string} options.plan - Subscription plan (lifetime, yearly, monthly)
 * @returns {Promise<Object>} Stripe checkout session
 */
const createCheckoutSession = async ({ userId, email, plan }) => {
  try {
    // Determine price ID based on selected plan
    let priceId = config.stripe.priceIds.default;
    if (plan === "lifetime") {
      priceId = config.stripe.priceIds.lifetime;
    } else if (plan === "yearly") {
      priceId = config.stripe.priceIds.yearly;
    } else if (plan === "monthly") {
      priceId = config.stripe.priceIds.monthly;
    }

    // Determine mode: 'payment' for lifetime (one-time), 'subscription' otherwise
    const isSubscription = plan === "monthly" || plan === "yearly";
    const mode = isSubscription ? "subscription" : "payment";

    // Build session payload
    const sessionPayload = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${config.server.frontendUrl}/subscribed?user_id=${userId}&selected_plan=${plan}&email=${email}`,
      customer_email: email,
      billing_address_collection: "required",
      payment_method_types: ["card"],
    };

    // ✅ Only add customer_creation for one-time (payment) mode
    if (mode === "payment") {
      sessionPayload.customer_creation = "always";
    }

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create(sessionPayload);

    // Save payment record with correct amounts
    await createPayment({
      user_id: userId,
      email,
      amount: plan === "lifetime" ? 9999 : plan === "yearly" ? 9999 : 1000, // Monthly plan is $10.00 = 1000 cents
      currency: "usd",
      status: "pending",
      stripeSessionId: session.id,
      subscriptionPlan: plan,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

/**
 * Handle webhook events from Stripe
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Promise<Object>} Processed event
 */
const handleWebhookEvent = async (payload, signature) => {
  try {
    // Since the event is already verified in the middleware, we can use it directly
    // We're receiving the raw payload, so we need to parse it if it's a string
    const event = typeof payload === 'string'
      ? JSON.parse(payload)
      : payload.object ? payload : stripeClient.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

    console.log("Processing webhook event type:", event.type);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        // Payment is successful, update user subscription status
        const session = event.data.object;
        console.log("Session ID from webhook:", session.id);

        // Update payment record with completed status
        // Make sure we're using the correct session ID field
        console.log("Looking for payment with session ID:", session.id);

        // First try with the exact session ID
        let payment = await updatePayment(session.id, {
          status: "completed", // Ensure status is set to completed
          stripeCustomerId: session.customer,
          stripePaymentIntentId: session.payment_intent,
        });

        if (!payment) {
          // If payment not found, try with the test_ prefix removed (for test mode sessions)
          const alternativeSessionId = session.id.replace('cs_test_', 'cs_');
          console.log("Payment not found with original session ID. Trying alternative ID:", alternativeSessionId);

          payment = await updatePayment(alternativeSessionId, {
            status: "completed",
            stripeCustomerId: session.customer,
            stripePaymentIntentId: session.payment_intent,
          });

          // If still not found, try to find by pattern matching the unique part of the session ID
          if (!payment && session.id.includes('_')) {
            const sessionIdParts = session.id.split('_');
            const uniquePart = sessionIdParts[sessionIdParts.length - 1];

            if (uniquePart && uniquePart.length > 10) {
              console.log("Still not found. Trying to find by unique part of session ID:", uniquePart);

              // Find the payment by pattern
              const patternPayment = await findPaymentBySessionIdPattern(uniquePart);

              if (patternPayment) {
                // Update the found payment
                payment = await Payment.findByIdAndUpdate(
                  patternPayment._id,
                  {
                    $set: {
                      status: "completed",
                      stripeCustomerId: session.customer,
                      stripePaymentIntentId: session.payment_intent,
                    }
                  },
                  { new: true }
                );
                console.log("Found and updated payment by pattern matching");
              }
            }
          }
        }

        console.log("Payment record updated:", payment ? "success" : "not found");

        if (payment) {
          // Update user subscription status
          const user = await getUserById(payment.user_id);
          if (user) {
            const subscriptionData = {
              subscribed: "yes",
              subscription: {
                plan: payment.subscriptionPlan,
                startDate: new Date(),
                endDate:
                  payment.subscriptionPlan === "lifetime"
                    ? null
                    : payment.subscriptionPlan === "yearly"
                      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "active",
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
              },
            };

            await updateUser(user.user_id, subscriptionData);
            console.log("User subscription updated for user:", user.user_id);
          } else {
            console.log("User not found for payment:", payment.user_id);
          }
        } else {
          console.log("Payment record not found for session ID:", session.id);
        }

        console.log("Checkout session completed:", session.id);
        break;

      case "invoice.payment_succeeded":
        // Subscription invoice paid
        const invoice = event.data.object;

        // Find user by Stripe customer ID and update subscription
        // This would require additional lookup functionality

        console.log("Invoice payment succeeded:", invoice.id);
        break;

      case "customer.subscription.deleted":
        // Subscription canceled or expired
        const subscription = event.data.object;

        // Find user by Stripe subscription ID and update status
        // This would require additional lookup functionality

        console.log("Subscription deleted:", subscription.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return event;
  } catch (error) {
    console.error("Error handling webhook event:", error);
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhookEvent,
};
