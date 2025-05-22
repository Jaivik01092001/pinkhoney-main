/**
 * Clerk webhook controller
 */
const crypto = require("crypto");
const {
  getUserByEmail,
  createUser,
  updateUser,
} = require("../services/mongoService");
const config = require("../config/config");

/**
 * Verify Clerk webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Clerk signature header
 * @returns {boolean} Whether the signature is valid
 */
const verifyClerkWebhookSignature = (payload, signature) => {
  try {
    if (!config.clerk || !config.clerk.webhookSecret) {
      console.error("Clerk webhook secret not configured");
      return false;
    }

    const hmac = crypto.createHmac("sha256", config.clerk.webhookSecret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    console.error("Error verifying Clerk webhook signature:", error);
    return false;
  }
};

/**
 * Handle Clerk webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleClerkWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["svix-signature"];
    const payload = req.body;

    // In production, verify the webhook signature
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      if (!signature) {
        return res.status(400).json({
          success: false,
          error: "Missing Clerk signature",
        });
      }

      // Verify signature
      const isValid = verifyClerkWebhookSignature(payload, signature);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid Clerk signature",
        });
      }

      console.log("Clerk webhook signature verified successfully");
    } else {
      console.log(
        "Skipping Clerk webhook signature verification in development mode"
      );
    }

    // Parse the webhook payload
    const data = typeof payload === "string" ? JSON.parse(payload) : payload;
    const { type, data: eventData } = data;

    // Handle different event types
    switch (type) {
      case "user.created":
        await handleUserCreated(eventData);
        break;
      case "user.updated":
        await handleUserUpdated(eventData);
        break;
      case "user.deleted":
        await handleUserDeleted(eventData);
        break;
      default:
        console.log(`Unhandled Clerk event type: ${type}`);
    }

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    next(error);
  }
};

/**
 * Handle user.created event
 * @param {Object} userData - User data from Clerk
 */
const handleUserCreated = async (userData) => {
  try {
    const { id: clerkId, email_addresses, username } = userData;

    if (!email_addresses || email_addresses.length === 0) {
      console.error("No email addresses found for user:", clerkId);
      return;
    }

    // Get primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === userData.primary_email_address_id
    );
    const email = primaryEmail
      ? primaryEmail.email_address
      : email_addresses[0].email_address;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log(`User with email ${email} already exists in MongoDB`);

      // Update the user with Clerk ID if it's not set
      if (!existingUser.clerkId) {
        await updateUser(existingUser.user_id, { clerkId });
      }
      return;
    }

    // Generate random user ID
    const userId = Math.floor(Math.random() * 900000000) + 100000000;

    // Create new user in MongoDB
    const newUser = {
      clerkId,
      user_id: userId.toString(),
      email,
      username: username || email.split("@")[0],
      tokens: "0",
      subscribed: "no",
    };

    await createUser(newUser);
    console.log(`Created new user in MongoDB for Clerk user: ${clerkId}`);
  } catch (error) {
    console.error("Error handling user.created event:", error);
  }
};

/**
 * Handle user.updated event
 * @param {Object} userData - User data from Clerk
 */
const handleUserUpdated = async (userData) => {
  try {
    const { id: clerkId, email_addresses } = userData;

    if (!email_addresses || email_addresses.length === 0) {
      console.error("No email addresses found for user:", clerkId);
      return;
    }

    // Get primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === userData.primary_email_address_id
    );
    const email = primaryEmail
      ? primaryEmail.email_address
      : email_addresses[0].email_address;

    // Find user by Clerk ID
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      console.log(`User with email ${email} not found in MongoDB`);
      return;
    }

    // Update user data
    const updateData = {
      email,
      username: userData.username || existingUser.username,
    };

    await updateUser(existingUser.user_id, updateData);
    console.log(`Updated user in MongoDB for Clerk user: ${clerkId}`);
  } catch (error) {
    console.error("Error handling user.updated event:", error);
  }
};

/**
 * Handle user.deleted event
 * @param {Object} userData - User data from Clerk
 */
const handleUserDeleted = async (userData) => {
  try {
    const { id: clerkId } = userData;

    // In a real application, you might want to anonymize the user data
    // rather than deleting it completely
    console.log(`User deleted in Clerk: ${clerkId}`);

    // For now, we'll just log the event
    // You could implement actual deletion or anonymization logic here
  } catch (error) {
    console.error("Error handling user.deleted event:", error);
  }
};

module.exports = {
  handleClerkWebhook,
};
