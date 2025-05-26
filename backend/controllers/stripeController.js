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

    // Return the session URL as JSON for the frontend to handle
    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
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
    console.log("=== STRIPE WEBHOOK HANDLER STARTED ===");
    const signature = req.headers["stripe-signature"];
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Log environment and signature information
    console.log(`Environment: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`Stripe signature present: ${!!signature}`);
    console.log(`Webhook secret configured: ${!!process.env.STRIPE_WEBHOOK_SECRET}`);

    // Log request information for debugging
    console.log(`Request path: ${req.path}`);
    console.log(`Request method: ${req.method}`);
    console.log(`Content-Type: ${req.headers['content-type']}`);
    console.log(`Request body type: ${typeof req.body}`);
    console.log(`Request body is Buffer: ${Buffer.isBuffer(req.body)}`);

    if (!signature && !isDevelopment) {
      console.error("Missing Stripe signature in webhook request");
      return res.status(400).json({
        success: false,
        error: "Missing Stripe signature",
      });
    }

    // Process the webhook event
    let event = req.stripeEvent;

    if (!event) {
      console.error("No Stripe event found in request");

      // Try to parse the event from the raw body if possible
      if (Buffer.isBuffer(req.body)) {
        try {
          const rawBody = req.body.toString('utf8');

          // Check if the body starts with HTML (<!DOCTYPE or <html)
          if (rawBody.trim().startsWith('<!DOCTYPE') || rawBody.trim().startsWith('<html')) {
            console.error("Received HTML instead of JSON. This might indicate a redirect or error page.");
            console.log("HTML content preview:", rawBody.substring(0, 200));
            return res.status(200).json({
              success: false,
              error: "Received HTML instead of JSON webhook data",
            });
          }

          event = JSON.parse(rawBody);
          console.log("Successfully parsed event from raw body");
        } catch (parseError) {
          console.error("Failed to parse event from raw body:", parseError);

          // Check if the parse error is due to HTML content
          if (parseError.message && parseError.message.includes("Unexpected token '<'")) {
            console.error("Received HTML instead of JSON. This might indicate a redirect or error page.");
            return res.status(200).json({
              success: false,
              error: "Received HTML instead of JSON webhook data",
            });
          }

          return res.status(400).json({
            success: false,
            error: "No Stripe event found and failed to parse from body: " + parseError.message,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: "No Stripe event found",
        });
      }
    }

    console.log(`Processing webhook event type: ${event.type}`);
    console.log(`Event ID: ${event.id}`);

    // For checkout.session.completed events, we'll let the service handle it
    if (event.type === "checkout.session.completed") {
      console.log("Received checkout.session.completed event");
      const session = event.data.object;
      console.log(`Session details: ID=${session.id}, Payment Status=${session.payment_status}`);
      console.log(`Customer ID: ${session.customer}, Payment Intent: ${session.payment_intent}`);

      // Log the full session object for debugging
      console.log("Full session object:", JSON.stringify(session, null, 2));

      // Process the event through the service
      console.log("Forwarding event to stripeService.handleWebhookEvent");
      try {
        await handleWebhookEvent(event, signature);
        console.log("Event processing completed");
      } catch (serviceError) {
        console.error("Error in handleWebhookEvent service:", serviceError);
        // Continue processing to try direct database update as fallback
      }

      // Direct database update as a fallback
      try {
        console.log("Performing direct database update as fallback");
        const session = event.data.object;
        const Payment = require("../models/Payment");

        // Try to find the payment record
        const payment = await Payment.findOne({
          $or: [
            { stripeSessionId: session.id },
            { stripePaymentIntentId: session.payment_intent }
          ]
        });

        if (payment) {
          console.log(`Found payment record: ${payment._id}, current status: ${payment.status}`);

          // Update the payment status
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

            console.log("Direct update result:", updateResult);

            // Verify the update
            const updatedPayment = await Payment.findById(payment._id);
            console.log(`Payment status after direct update: ${updatedPayment.status}`);

            // Update user subscription if payment was updated successfully
            if (updatedPayment.status === "completed") {
              try {
                const { updateUser, getUserById } = require("../services/mongoService");
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
              } catch (userUpdateError) {
                console.error("Error updating user subscription:", userUpdateError);
              }
            }
          } else {
            console.log(`Payment already has status: ${payment.status}, no update needed`);
          }
        } else {
          console.log("Payment record not found, creating new record");

          // If no payment record found, create one
          try {
            const { createPayment } = require("../services/mongoService");

            // Extract user_id and email from metadata if available
            const metadata = session.metadata || {};
            const user_id = metadata.user_id || session.client_reference_id;
            const email = metadata.email || session.customer_email || session.customer_details?.email;

            if (user_id && email) {
              const newPayment = await createPayment({
                user_id,
                email,
                amount: session.amount_total || 1000,
                currency: session.currency || "usd",
                status: "completed",
                stripeSessionId: session.id,
                stripeCustomerId: session.customer,
                stripePaymentIntentId: session.payment_intent,
                subscriptionPlan: metadata.plan || "monthly",
              });

              console.log("Created new payment record:", newPayment._id);
            } else {
              console.error("Missing user_id or email, cannot create payment record");
            }
          } catch (createError) {
            console.error("Error creating payment record:", createError);
          }
        }
      } catch (directUpdateError) {
        console.error("Error during direct database update:", directUpdateError);
      }
    } else {
      // For other event types, just process through the service
      console.log("Forwarding non-checkout event to stripeService.handleWebhookEvent");
      await handleWebhookEvent(event, signature);
      console.log("Event processing completed");
    }

    console.log("=== STRIPE WEBHOOK HANDLER COMPLETED SUCCESSFULLY ===");
    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("=== STRIPE WEBHOOK ERROR ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);

    // Always return 200 to Stripe even if there's an error to prevent retries
    return res.status(200).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createCheckoutSessionHandler,
  webhookHandler,
};
