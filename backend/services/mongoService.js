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
 * @param {Object} options - Additional options (isFirstMessage, markAsFirstMessageGenerated)
 * @returns {Promise<Object>} Updated chat history
 */
const saveChatMessage = async (userId, name, personality, image, message, options = {}) => {
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
        lastMessage: {
          text: '',
          sender: 'bot',
          timestamp: new Date()
        },
        unreadCount: 0,
        isFirstConversation: true,
        firstMessageGenerated: false,
        followUpTracking: {
          hasFollowUpSchedule: false,
          lastFollowUpReset: new Date(),
          followUpCycle: 1,
          conversationMetrics: {
            userMessageCount: 0,
            botMessageCount: 0,
            bothParticipated: false
          }
        }
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

    // Update last message preview
    chatHistory.lastMessage = {
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp || new Date()
    };

    // Handle unread count and follow-up tracking
    if (message.sender === 'bot') {
      chatHistory.unreadCount += 1;

      // Update follow-up tracking for bot messages
      chatHistory.followUpTracking.conversationMetrics.botMessageCount += 1;
      chatHistory.followUpTracking.conversationMetrics.lastBotActivity = new Date();
    } else if (message.sender === 'user') {
      // User sent a message, reset unread count
      chatHistory.unreadCount = 0;
      // Mark as no longer first conversation
      chatHistory.isFirstConversation = false;

      // Update follow-up tracking for user messages
      chatHistory.followUpTracking.conversationMetrics.userMessageCount += 1;
      chatHistory.followUpTracking.conversationMetrics.lastUserActivity = new Date();
    }

    // Check if both have participated
    if (chatHistory.followUpTracking.conversationMetrics.userMessageCount > 0 &&
      chatHistory.followUpTracking.conversationMetrics.botMessageCount > 0) {
      chatHistory.followUpTracking.conversationMetrics.bothParticipated = true;
    }

    // Handle first message generation flag
    if (options.markAsFirstMessageGenerated) {
      chatHistory.firstMessageGenerated = true;
    }

    await chatHistory.save();

    // Handle follow-up timer management
    if (!options.skipFollowUpUpdate) {
      try {
        const followUpService = require("./followUpService");

        if (message.sender === 'user') {
          // Reset follow-up timers when user sends a message
          await followUpService.resetFollowUpTimers(userId, name, true);
          chatHistory.followUpTracking.hasFollowUpSchedule = true;
          chatHistory.followUpTracking.lastFollowUpReset = new Date();
        } else if (message.sender === 'bot' && !chatHistory.followUpTracking.hasFollowUpSchedule) {
          // Create initial follow-up schedule when bot sends first message
          await followUpService.createFollowUpSchedule(userId, name);
          chatHistory.followUpTracking.hasFollowUpSchedule = true;
        } else if (message.sender === 'bot') {
          // Update conversation state for bot messages
          await followUpService.resetFollowUpTimers(userId, name, false);
        }

        // Save updated follow-up tracking
        await chatHistory.save();
      } catch (followUpError) {
        console.error("Error updating follow-up timers:", followUpError);
        // Don't throw error - message saving should succeed even if follow-up fails
      }
    }

    console.log(
      `Chat message saved for user ${userId} with companion ${name}. Message: ${message.text.substring(
        0,
        30
      )}... (Unread: ${chatHistory.unreadCount})`
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
    console.log(`=== PAYMENT UPDATE STARTED ===`);
    console.log(`Attempting to update payment with stripeSessionId: ${stripeSessionId}`);
    console.log(`Update data:`, JSON.stringify(updateData));

    // First check if the payment exists by exact match
    let existingPayment = await Payment.findOne({ stripeSessionId });

    if (existingPayment) {
      console.log(`Found payment by exact match. Payment ID: ${existingPayment._id}`);
    } else {
      console.log(`No payment found with exact stripeSessionId match: ${stripeSessionId}`);

      // Try to find by payment intent if provided
      if (updateData.stripePaymentIntentId) {
        console.log(`Trying to find payment by payment intent ID: ${updateData.stripePaymentIntentId}`);
        existingPayment = await Payment.findOne({ stripePaymentIntentId: updateData.stripePaymentIntentId });

        if (existingPayment) {
          console.log(`Found payment by payment intent ID. Payment ID: ${existingPayment._id}`);
        }
      }

      // If still not found and session ID contains underscores, try pattern matching
      if (!existingPayment && stripeSessionId.includes('_')) {
        // Extract the unique part of the session ID after the last underscore
        const sessionIdParts = stripeSessionId.split('_');
        const uniquePart = sessionIdParts[sessionIdParts.length - 1];

        if (uniquePart && uniquePart.length > 10) {
          console.log(`Trying to find payment by unique part of session ID: ${uniquePart}`);
          existingPayment = await findPaymentBySessionIdPattern(uniquePart);

          if (existingPayment) {
            console.log(`Found payment by pattern matching. Payment ID: ${existingPayment._id}`);
          }
        }
      }

      // If still not found, try case-insensitive regex search
      if (!existingPayment) {
        console.log(`Trying case-insensitive regex search for session ID`);
        existingPayment = await Payment.findOne({
          stripeSessionId: { $regex: stripeSessionId, $options: 'i' }
        });

        if (existingPayment) {
          console.log(`Found payment by case-insensitive search. Payment ID: ${existingPayment._id}`);
        }
      }
    }

    if (!existingPayment) {
      console.log(`No payment found with any search method for session ID: ${stripeSessionId}`);
      return null;
    }

    console.log(`Found payment record: ${existingPayment._id}`);
    console.log(`Current payment details: Status=${existingPayment.status}, Amount=${existingPayment.amount}, Plan=${existingPayment.subscriptionPlan}`);

    // Ensure status is explicitly set to "completed" if that's what we're trying to do
    if (updateData.status === "completed") {
      console.log(`Explicitly setting payment status to "completed" for payment ID: ${existingPayment._id}`);
      updateData.status = "completed";
    }

    // Update the payment with retries
    let payment = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (!payment && retryCount < maxRetries) {
      try {
        payment = await Payment.findByIdAndUpdate(
          existingPayment._id,
          { $set: updateData },
          { new: true }
        );

        console.log(`Payment updated successfully on attempt ${retryCount + 1}`);
        console.log(`New payment details: Status=${payment.status}, CustomerID=${payment.stripeCustomerId || 'not set'}`);
      } catch (updateError) {
        retryCount++;
        console.error(`Error updating payment on attempt ${retryCount}:`, updateError);

        if (retryCount >= maxRetries) {
          throw updateError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Double-check that the update was successful
    const verifiedPayment = await Payment.findById(existingPayment._id);

    if (verifiedPayment.status !== updateData.status) {
      console.error(`WARNING: Verification failed! Expected status "${updateData.status}" but found "${verifiedPayment.status}"`);

      // Force one more direct update as a last resort
      console.log(`Forcing direct update to ensure status is set correctly`);
      await Payment.updateOne(
        { _id: existingPayment._id },
        { $set: { status: updateData.status } }
      );

      // Verify again
      const reVerifiedPayment = await Payment.findById(existingPayment._id);
      console.log(`Re-verification status: ${reVerifiedPayment.status}`);
    } else {
      console.log(`Verification successful: Payment status is "${verifiedPayment.status}" as expected`);
    }

    console.log(`=== PAYMENT UPDATE COMPLETED ===`);
    return payment;
  } catch (error) {
    console.error(`=== PAYMENT UPDATE ERROR ===`);
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

/**
 * Get all chat threads for a user (for inbox/messages page)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of chat threads with previews
 */
const getUserChatThreads = async (userId) => {
  try {
    const chatThreads = await ChatHistory.find({
      user_id: userId
    })
      .select('companion lastMessage unreadCount lastUpdated isFirstConversation firstMessageGenerated')
      .sort({ lastUpdated: -1 }); // Sort by most recent activity

    // Transform data for frontend
    const transformedThreads = chatThreads.map(thread => ({
      name: thread.companion.name,
      image: thread.companion.image,
      personality: thread.companion.personality,
      lastMessage: {
        text: thread.lastMessage.text || '',
        sender: thread.lastMessage.sender || 'bot',
        timestamp: thread.lastMessage.timestamp || thread.lastUpdated
      },
      unreadCount: thread.unreadCount || 0,
      lastUpdated: thread.lastUpdated,
      isOnline: true, // AI companions are always "online"
      isFirstConversation: thread.isFirstConversation,
      firstMessageGenerated: thread.firstMessageGenerated
    }));

    console.log(`Found ${transformedThreads.length} chat threads for user ${userId}`);
    return transformedThreads;
  } catch (error) {
    console.error("Error getting user chat threads:", error);
    throw error;
  }
};

/**
 * Mark messages as read when user opens a chat
 * @param {string} userId - User ID
 * @param {string} companionName - Companion name
 * @returns {Promise<Object>} Updated chat history
 */
const markMessagesAsRead = async (userId, companionName) => {
  try {
    const chatHistory = await ChatHistory.findOneAndUpdate(
      {
        user_id: userId,
        "companion.name": companionName,
      },
      {
        $set: { unreadCount: 0 }
      },
      { new: true }
    );

    if (chatHistory) {
      console.log(`Marked messages as read for user ${userId} and companion ${companionName}`);
    }

    return chatHistory;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

/**
 * Check if first message needs to be generated for a chat
 * @param {string} userId - User ID
 * @param {string} companionName - Companion name
 * @returns {Promise<boolean>} True if first message needs to be generated
 */
const needsFirstMessage = async (userId, companionName) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user_id: userId,
      "companion.name": companionName,
    });

    // Need first message if:
    // 1. No chat history exists, OR
    // 2. Chat exists but first message hasn't been generated yet
    const needs = !chatHistory || (!chatHistory.firstMessageGenerated && chatHistory.messages.length === 0);

    console.log(`First message needed for ${userId}/${companionName}: ${needs}`);
    return needs;
  } catch (error) {
    console.error("Error checking if first message is needed:", error);
    return true; // Default to true if there's an error
  }
};

/**
 * Save a match between user and companion
 * @param {string} userId - User ID
 * @param {string} name - Companion name
 * @param {string} personality - Companion personality
 * @param {string} image - Companion image URL
 * @param {string} matchType - Type of match (optional)
 * @returns {Promise<Object>} Match result
 */
const saveMatch = async (userId, name, personality, image, matchType = 'like') => {
  try {
    // For now, we'll create or update a chat history record to represent the match
    // This ensures that when the user matches, a chat thread is ready
    let chatHistory = await ChatHistory.findOne({
      user_id: userId,
      "companion.name": name,
    });

    if (!chatHistory) {
      // Create new chat history for the match
      chatHistory = new ChatHistory({
        user_id: userId,
        companion: {
          name,
          personality,
          image,
        },
        messages: [],
        lastMessage: {
          text: '',
          sender: 'bot',
          timestamp: new Date()
        },
        unreadCount: 0,
        isFirstConversation: true,
        firstMessageGenerated: false
      });

      await chatHistory.save();
      console.log(`Match saved: User ${userId} matched with ${name}`);
    } else {
      console.log(`Match already exists: User ${userId} and ${name}`);
    }

    return {
      userId,
      companionName: name,
      personality,
      image,
      matchType,
      matchedAt: new Date(),
      chatId: chatHistory._id
    };

  } catch (error) {
    console.error("Error saving match:", error);
    throw error;
  }
};

/**
 * Get chat summaries for a user (legacy function for compatibility)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of chat summaries
 */
const getUserChatSummaries = async (userId) => {
  try {
    // This is essentially the same as getUserChatThreads but with different formatting
    // for backward compatibility
    const chatThreads = await getUserChatThreads(userId);

    // Transform to match expected format
    const summaries = chatThreads.map(thread => ({
      companionName: thread.name,
      personality: thread.personality,
      image: thread.image,
      lastMessage: thread.lastMessage.text,
      lastMessageTime: thread.lastMessage.timestamp,
      unreadCount: thread.unreadCount,
      totalMessages: 0 // We don't track this currently, but could be added
    }));

    console.log(`Found ${summaries.length} chat summaries for user ${userId}`);
    return summaries;
  } catch (error) {
    console.error("Error getting user chat summaries:", error);
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
  getUserChatThreads,
  markMessagesAsRead,
  needsFirstMessage,
  saveMatch,
  getUserChatSummaries,
  createPayment,
  updatePayment,
  findPaymentBySessionIdPattern,
};
