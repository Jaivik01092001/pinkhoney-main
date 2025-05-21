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
 * Update payment record
 * @param {string} stripeSessionId - Stripe session ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated payment record
 */
const updatePayment = async (stripeSessionId, updateData) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId },
      { $set: updateData },
      { new: true }
    );
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
  saveChatMessage,
  getChatHistory,
  createPayment,
  updatePayment,
};
