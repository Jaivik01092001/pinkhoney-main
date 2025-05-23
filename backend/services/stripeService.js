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
 * Get the amount in cents for a given plan
 * @param {string} plan - Subscription plan (lifetime, yearly, monthly)
 * @returns {number} Amount in cents
 */
const getPlanAmount = (plan) => {
  switch (plan) {
    case "lifetime":
      return 9999; // $99.99
    case "yearly":
      return 9999; // $99.99
    case "monthly":
      return 1999; // $19.99
    default:
      return 1999; // Default to monthly price
  }
};

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
      success_url: `${config.server.frontendUrl}/subscribed?user_id=${userId}&selected_plan=${plan}&email=${email}&session_id={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      billing_address_collection: "required",
      payment_method_types: ["card"],
      // Add metadata to help with webhook processing
      metadata: {
        user_id: userId,
        email: email,
        plan: plan
      },
      // Add client reference ID for additional user identification
      client_reference_id: userId
    };

    // ✅ Only add customer_creation for one-time (payment) mode
    if (mode === "payment") {
      sessionPayload.customer_creation = "always";
    }

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create(sessionPayload);

    // Get the actual amount from the session
    const amount = session.amount_total || getPlanAmount(plan);

    // Save payment record with correct amounts
    await createPayment({
      user_id: userId,
      email,
      amount: amount, // Use the actual amount from the session or plan
      currency: "usd",
      status: "pending",
      stripeSessionId: session.id,
      subscriptionPlan: plan,
    });

    // Log the session details for debugging
    console.log("Created checkout session with ID:", session.id);
    console.log(`Payment record created with amount: ${amount} cents (${(amount / 100).toFixed(2)} USD)`);

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
    console.log("Handling webhook event...");

    // Since the event is already verified in the middleware, we can use it directly
    // We're receiving the raw payload, so we need to parse it if it's a string
    let event;

    if (typeof payload === 'string') {
      console.log("Payload is a string, parsing JSON...");
      event = JSON.parse(payload);
    } else if (payload.object) {
      console.log("Payload is already an object with 'object' property");
      event = payload;
    } else {
      console.log("Constructing event from raw payload and signature");
      // Use the webhook secret from memory if available
      const webhookSecret = config.stripe.webhookSecret || 'whsec_2c8ebd59de1c9060e086ae553b9b3f853aae0c96b81d33902cb2240d6371f338';
      event = stripeClient.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    }

    console.log("Processing webhook event type:", event.type);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        // Payment is successful, update user subscription status
        const session = event.data.object;
        console.log("Session ID from webhook:", session.id);
        console.log("Webhook session details:", JSON.stringify({
          id: session.id,
          customer: session.customer,
          payment_intent: session.payment_intent,
          amount_total: session.amount_total,
          payment_status: session.payment_status
        }));

        // Update payment record with completed status
        // Make sure we're using the correct session ID field
        console.log("Looking for payment with session ID:", session.id);
        console.log("Payment status from Stripe:", session.payment_status);

        // Consolidated payment update logic
        let payment = null;

        // Step 1: Try with the exact session ID
        console.log("Step 1: Trying to update payment with exact session ID:", session.id);
        payment = await updatePayment(session.id, {
          status: "completed", // Ensure status is set to completed
          stripeCustomerId: session.customer,
          stripePaymentIntentId: session.payment_intent,
        });

        // Step 2: If not found, try with the test_ prefix removed
        if (!payment && session.id.includes('cs_test_')) {
          const alternativeSessionId = session.id.replace('cs_test_', 'cs_');
          console.log("Step 2: Payment not found with original session ID. Trying alternative ID:", alternativeSessionId);

          payment = await updatePayment(alternativeSessionId, {
            status: "completed",
            stripeCustomerId: session.customer,
            stripePaymentIntentId: session.payment_intent,
          });
        }

        // Step 3: If still not found, try pattern matching
        if (!payment && session.id.includes('_')) {
          const sessionIdParts = session.id.split('_');
          const uniquePart = sessionIdParts[sessionIdParts.length - 1];

          if (uniquePart && uniquePart.length > 10) {
            console.log("Step 3: Still not found. Trying to find by unique part of session ID:", uniquePart);

            // Find the payment by pattern
            const patternPayment = await findPaymentBySessionIdPattern(uniquePart);

            if (patternPayment) {
              console.log("Found payment by pattern matching. Payment ID:", patternPayment._id);

              // Update the found payment
              const Payment = require("../models/Payment");
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
              console.log("Updated payment by pattern matching. New status:", payment.status);
            }
          }
        }

        // Step 4: If still not found, try a direct database update as a last resort
        if (!payment) {
          console.log("Step 4: Payment still not found. Attempting direct database update as last resort");
          try {
            const Payment = require("../models/Payment");
            const directUpdate = await Payment.updateOne(
              { stripeSessionId: { $regex: session.id, $options: 'i' } },
              {
                $set: {
                  status: "completed",
                  stripeCustomerId: session.customer,
                  stripePaymentIntentId: session.payment_intent
                }
              }
            );
            console.log("Direct database update result:", directUpdate);

            // If the update was successful, retrieve the updated payment
            if (directUpdate.modifiedCount > 0) {
              payment = await Payment.findOne({
                stripeCustomerId: session.customer,
                stripePaymentIntentId: session.payment_intent
              });
              console.log("Retrieved payment after direct update:", payment ? payment._id : "not found");
            }
          } catch (dbError) {
            console.error("Error during direct database update:", dbError);
          }
        }

        // Step 5: Verify the payment status was updated correctly
        if (payment) {
          const Payment = require("../models/Payment");
          const verifiedPayment = await Payment.findById(payment._id);
          console.log("Verification - Payment ID:", payment._id);
          console.log("Verification - Payment status:", verifiedPayment.status);

          // If the status is still pending, force an update
          if (verifiedPayment.status === "pending") {
            console.log("WARNING: Payment status is still pending after update. Forcing update...");
            await Payment.updateOne(
              { _id: payment._id },
              { $set: { status: "completed" } }
            );

            // Verify again
            const reVerifiedPayment = await Payment.findById(payment._id);
            console.log("Re-verification - Payment status:", reVerifiedPayment.status);
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
