/**
 * MongoDB database service
 */
const User = require("../models/User");
const ChatHistory = require("../models/ChatHistory");
const Companion = require("../models/Companion");
const Payment = require("../models/Payment");

/**
 * Check if a user exists by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user data
 */
const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
const updateUser = async (userId, userData) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      { $set: userData },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findOne({ user_id: userId });
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

/**
 * Get user by Clerk ID
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserByClerkId = async (clerkId) => {
  try {
    const user = await User.findOne({ clerkId });
    return user;
  } catch (error) {
    console.error("Error getting user by Clerk ID:", error);
    throw error;
  }
};

/**
 * Save chat message
 * @param {string} userId - User ID
 * @param {string} name - Companion name
 * @param {string} personality - Companion personality
 * @param {string} image - Companion image
 * @param {Object} message - Message object
 * @returns {Promise<Object>} Updated chat history
 */
const saveChatMessage = async (userId, name, personality, image, message) => {
  try {
    // Find existing chat history or create new one
    let chatHistory = await ChatHistory.findOne({
      user_id: userId,
      "companion.name": name,
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user_id: userId,
        companion: {
          name,
          personality,
          image,
        },
        messages: [],
      });
    }

    // Validate message text before saving
    if (!message.text || message.text.trim() === "") {
      console.error(
        `Error: Attempted to save empty message for user ${userId} with companion ${name}`
      );
      throw new Error("Message text cannot be empty");
    }

    // Add message to chat history
    chatHistory.messages.push(message);
    chatHistory.lastUpdated = new Date();

    await chatHistory.save();
    console.log(
      `Chat message saved for user ${userId} with companion ${name}. Message: ${message.text.substring(
        0,
        30
      )}...`
    );
    return chatHistory;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
};

/**
 * Get chat history for user and companion
 * @param {string} userId - User ID
 * @param {string} companionName - Companion name
 * @returns {Promise<Object|null>} Chat history or null if not found
 */
const getChatHistory = async (userId, companionName) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user_id: userId,
      "companion.name": companionName,
    });

    if (chatHistory) {
      console.log(
        `Found chat history for user ${userId} with companion ${companionName}. ${chatHistory.messages.length} messages.`
      );
    } else {
      console.log(
        `No chat history found for user ${userId} with companion ${companionName}.`
      );
    }

    return chatHistory;
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
};

/**
 * Create payment record
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Created payment record
 */
const createPayment = async (paymentData) => {
  try {
    const payment = new Payment(paymentData);
    await payment.save();
    return payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

/**
 * Find payment by session ID pattern
 * @param {string} sessionIdPattern - Part of the session ID to search for
 * @returns {Promise<Object>} Found payment record
 */
const findPaymentBySessionIdPattern = async (sessionIdPattern) => {
  try {
    console.log(`Searching for payment with session ID pattern: ${sessionIdPattern}`);

    // Use regex to find payments where stripeSessionId contains the pattern
    const payment = await Payment.findOne({
      stripeSessionId: { $regex: sessionIdPattern, $options: 'i' }
    });

    if (payment) {
      console.log(`Found payment with pattern match: ${payment.stripeSessionId}`);
    } else {
      console.log(`No payment found with session ID pattern: ${sessionIdPattern}`);
    }

    return payment;
  } catch (error) {
    console.error("Error finding payment by pattern:", error);
    return null;
  }
};

/**
 * Update payment record
 * @param {string} stripeSessionId - Stripe session ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated payment record
 */
const updatePayment = async (stripeSessionId, updateData) => {
  try {
    console.log(`Attempting to update payment with stripeSessionId: ${stripeSessionId}`);
    console.log(`Update data:`, JSON.stringify(updateData));

    // First check if the payment exists
    let existingPayment = await Payment.findOne({ stripeSessionId });

    // If not found by exact match, try to find by pattern
    if (!existingPayment && stripeSessionId.includes('_')) {
      // Extract the unique part of the session ID after the last underscore
      const sessionIdParts = stripeSessionId.split('_');
      const uniquePart = sessionIdParts[sessionIdParts.length - 1];

      if (uniquePart && uniquePart.length > 10) {
        console.log(`Trying to find payment by unique part of session ID: ${uniquePart}`);
        existingPayment = await findPaymentBySessionIdPattern(uniquePart);
      }
    }

    if (!existingPayment) {
      console.log(`No payment found with stripeSessionId: ${stripeSessionId}`);
      return null;
    }

    console.log(`Found payment record: ${existingPayment._id}, current status: ${existingPayment.status}`);

    // Update the payment
    const payment = await Payment.findByIdAndUpdate(
      existingPayment._id,
      { $set: updateData },
      { new: true }
    );

    console.log(`Payment updated successfully, new status: ${payment.status}`);
    return payment;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

module.exports = {
  getUserByEmail,
  createUser,
  updateUser,
  getUserById,
  getUserByClerkId,
  saveChatMessage,
  getChatHistory,
  createPayment,
  updatePayment,
  findPaymentBySessionIdPattern,
};
