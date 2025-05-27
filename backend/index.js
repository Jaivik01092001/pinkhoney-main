require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { errorHandler } = require("./middleware/errorHandler");
const connectDB = require("./config/database");

// Import routes
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const { router: stripeRoutes } = require("./routes/stripeRoutes");
const clerkRoutes = require("./routes/clerkRoutes");
const companionRoutes = require("./routes/companionRoutes");

// Connect to MongoDB
connectDB().then(async () => {
  // Auto-seed companions data if needed
  try {
    const { seedCompanionsBulk } = require('./seeders/companionSeederBulk');
    await seedCompanionsBulk(true); // Pass true to indicate server startup
  } catch (error) {
    console.error('Error during auto-seeding:', error.message);
    // Don't crash the server, just log the error
  }
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080; // Default to 8080 to match frontend expectations

// Middleware
// Import security middleware
const {
  helmetMiddleware,
  apiLimiter,
  authMiddleware,
} = require("./middleware/securityMiddleware");
const corsMiddleware = require("./middleware/cors");
const logger = require("./middleware/logger");

// Apply security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use("/api", apiLimiter);

// Request logging
app.use(logger);

// Special handling for Stripe webhook route - must be before body parsers
// This ensures the raw body is preserved for signature verification
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log("=== STRIPE WEBHOOK REQUEST RECEIVED ===");
  console.log("Headers:", JSON.stringify(req.headers));

  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_2c8ebd59de1c9060e086ae553b9b3f853aae0c96b81d33902cb2240d6371f338';

    console.log(`Webhook secret: ${webhookSecret.substring(0, 10)}...`);
    console.log(`Signature present: ${!!signature}`);
    console.log(`Body is buffer: ${Buffer.isBuffer(req.body)}`);

    // Check if the body is a buffer
    if (!Buffer.isBuffer(req.body)) {
      console.error("Request body is not a buffer. This will cause signature verification to fail.");
      return res.status(200).json({ success: false, error: 'Request body is not a buffer' });
    }

    // Check if the body contains HTML instead of JSON
    const bodyPreview = req.body.toString('utf8', 0, 100).trim();
    if (bodyPreview.startsWith('<!DOCTYPE') || bodyPreview.startsWith('<html')) {
      console.error("Received HTML instead of JSON. This might indicate a redirect or error page.");
      console.log("HTML content preview:", bodyPreview);
      return res.status(200).json({ success: false, error: 'Received HTML instead of JSON webhook data' });
    }

    let event;

    try {
      // Verify the signature
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      console.log(`Webhook verified! Event type: ${event.type}`);
    } catch (verifyError) {
      console.error(`⚠️ Webhook signature verification failed:`, verifyError.message);

      // Check if the error is due to HTML content
      if (verifyError.message && verifyError.message.includes("Unexpected token '<'")) {
        console.error("Received HTML instead of JSON. This might indicate a redirect or error page.");
        return res.status(200).json({ success: false, error: 'Received HTML instead of JSON webhook data' });
      }

      // In development, try to parse the payload without verification
      if (process.env.NODE_ENV !== 'production') {
        try {
          const rawBody = req.body.toString('utf8');
          event = JSON.parse(rawBody);
          console.log(`Parsed event in development mode: ${event.type}`);
        } catch (parseError) {
          console.error(`Failed to parse webhook payload:`, parseError);
          return res.status(400).json({ success: false, error: 'Webhook verification failed: ' + parseError.message });
        }
      } else {
        return res.status(400).json({ success: false, error: 'Webhook verification failed: ' + verifyError.message });
      }
    }

    // Handle the event - focus on checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`Processing checkout.session.completed for session ID: ${session.id}`);
      console.log(`Session details:`, JSON.stringify(session, null, 2));

      // Direct database update
      try {
        const Payment = require('./models/Payment');
        const User = require('./models/User');

        // Find the payment record
        let payment = await Payment.findOne({ stripeSessionId: session.id });

        if (!payment) {
          console.log(`Payment not found with session ID ${session.id}, trying alternative search...`);

          // Try with payment intent
          if (session.payment_intent) {
            payment = await Payment.findOne({ stripePaymentIntentId: session.payment_intent });
          }

          // If still not found, try pattern matching
          if (!payment && session.id.includes('_')) {
            const sessionIdParts = session.id.split('_');
            const uniquePart = sessionIdParts[sessionIdParts.length - 1];

            if (uniquePart && uniquePart.length > 5) {
              console.log(`Trying to find payment with pattern: ${uniquePart}`);
              payment = await Payment.findOne({
                stripeSessionId: { $regex: uniquePart, $options: 'i' }
              });
            }
          }
        }

        if (payment) {
          console.log(`Found payment record: ${payment._id}, current status: ${payment.status}`);

          // Update payment status to completed
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

          // Verify the update
          const updatedPayment = await Payment.findById(payment._id);
          console.log(`Payment status after update: ${updatedPayment.status}`);

          // Update user subscription
          if (payment.user_id) {
            const user = await User.findOne({ user_id: payment.user_id });

            if (user) {
              console.log(`Updating subscription for user: ${user.user_id}`);

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

              const userUpdateResult = await User.updateOne(
                { user_id: payment.user_id },
                { $set: subscriptionData }
              );

              console.log(`User subscription update result:`, userUpdateResult);
            } else {
              console.log(`User not found with ID: ${payment.user_id}`);
            }
          }
        } else {
          console.log(`No payment record found for session ID: ${session.id}`);

          // Create a new payment record if we can extract user info
          const metadata = session.metadata || {};
          const user_id = metadata.user_id || session.client_reference_id;
          const email = metadata.email || session.customer_email || session.customer_details?.email;

          if (user_id && email) {
            console.log(`Creating new payment record for user: ${user_id}, email: ${email}`);

            const newPayment = new Payment({
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

            await newPayment.save();
            console.log(`Created new payment record with ID: ${newPayment._id}`);

            // Update user subscription
            const user = await User.findOne({ user_id });

            if (user) {
              console.log(`Updating subscription for user: ${user.user_id}`);

              const subscriptionData = {
                subscribed: "yes",
                subscription: {
                  plan: newPayment.subscriptionPlan,
                  startDate: new Date(),
                  endDate: newPayment.subscriptionPlan === "lifetime"
                    ? null
                    : newPayment.subscriptionPlan === "yearly"
                      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  status: "active",
                  stripeCustomerId: session.customer,
                  stripeSubscriptionId: session.subscription,
                }
              };

              const userUpdateResult = await User.updateOne(
                { user_id },
                { $set: subscriptionData }
              );

              console.log(`User subscription update result:`, userUpdateResult);
            }
          } else {
            console.log(`Cannot create payment record: missing user_id or email`);
          }
        }
      } catch (dbError) {
        console.error(`Database error while processing webhook:`, dbError);
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Webhook error:`, error);
    // Return a 200 response to prevent Stripe from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

// Body parsers with size limits to prevent abuse - applied after webhook route
app.use(express.json({ limit: "1mb" })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // Parse URL-encoded bodies with size limit

// Serve static files from UploadFolder
// const path = require('path');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));


// Apply Clerk authentication middleware (except for webhook route which is handled separately)
app.use((req, res, next) => {
  // Skip authentication for webhook endpoint
  if (req.path === '/api/webhook') {
    return next();
  }
  authMiddleware(req, res, next);
});

// Special route for Stripe webhook with raw body parsing
app.post("/api/webhook", express.raw({ type: 'application/json' }), (req, res) => {
  const { webhookHandler } = require("./routes/stripeRoutes");
  webhookHandler(req, res, (err) => {
    if (err) {
      console.error("Error in webhook handler:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });
});

// Regular API routes
app.use("/api", aiRoutes);
app.use("/api", userRoutes);
app.use("/api", (req, res, next) => {
  // Skip the webhook route as it's handled separately
  if (req.path === '/webhook' && req.method === 'POST') {
    return next('route');
  }
  next();
}, stripeRoutes);
app.use("/api", clerkRoutes);
app.use("/api", companionRoutes);

// Health check endpoint
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);



// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  // Don't crash the server, just log the error
});

// Handle MongoDB connection errors
process.on("SIGINT", async () => {
  try {
    // Close MongoDB connection when the app is shutting down
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

module.exports = app; // For testing
