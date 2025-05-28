/**
 * Message Controller
 * Handles message-related API endpoints including first messages and inbox
 */
const { createFirstMessage } = require("../services/firstMessageService");
const { getUserChatThreads, markMessagesAsRead, needsFirstMessage } = require("../services/mongoService");

/**
 * Generate and save first message when users match
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateFirstMessageHandler = async (req, res) => {
  try {
    const { user_id, companion_name, personality, image } = req.body;

    // Validate required fields
    if (!user_id || !companion_name || !personality) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, companion_name, or personality",
      });
    }

    // Check if first message is actually needed
    const needsFirst = await needsFirstMessage(user_id, companion_name);
    if (!needsFirst) {
      return res.status(200).json({
        success: true,
        message: "First message already exists",
        alreadyExists: true
      });
    }

    // Generate and save the first message
    const result = await createFirstMessage(user_id, companion_name, personality, image);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        firstMessage: result.firstMessage,
        alreadyExists: result.alreadyExists
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error in generateFirstMessageHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate first message. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user's chat inbox with message previews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserInboxHandler = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: user_id",
      });
    }

    // Get chat threads for the user
    const chatThreads = await getUserChatThreads(user_id);

    // Transform data to match frontend expectations
    const formattedThreads = chatThreads.map(thread => {
      // Format the last message preview
      let status = '';
      if (thread.lastMessage.text) {
        if (thread.lastMessage.sender === 'user') {
          status = `You: ${thread.lastMessage.text}`;
        } else {
          status = thread.lastMessage.text;
        }
      } else {
        status = 'No messages yet';
      }

      // Format time
      const now = new Date();
      const messageTime = new Date(thread.lastMessage.timestamp);
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
      
      let timeString;
      if (diffInMinutes < 1) {
        timeString = 'now';
      } else if (diffInMinutes < 60) {
        timeString = `${diffInMinutes} min`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        timeString = `${hours}h`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        timeString = `${days}d`;
      }

      return {
        name: thread.name,
        status: status,
        time: timeString,
        unread: thread.unreadCount,
        img: thread.image,
        online: thread.isOnline,
        personality: thread.personality,
        image: thread.image
      };
    });

    res.status(200).json({
      success: true,
      threads: formattedThreads,
      count: formattedThreads.length
    });

  } catch (error) {
    console.error("Error in getUserInboxHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve inbox. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Mark messages as read when user opens a chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAsReadHandler = async (req, res) => {
  try {
    const { user_id, companion_name } = req.body;

    // Validate required fields
    if (!user_id || !companion_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id or companion_name",
      });
    }

    // Mark messages as read
    const result = await markMessagesAsRead(user_id, companion_name);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      unreadCount: 0
    });

  } catch (error) {
    console.error("Error in markAsReadHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark messages as read. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Check if first message is needed for a chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkFirstMessageNeededHandler = async (req, res) => {
  try {
    const { user_id, companion_name } = req.query;

    // Validate required fields
    if (!user_id || !companion_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id or companion_name",
      });
    }

    // Check if first message is needed
    const needed = await needsFirstMessage(user_id, companion_name);

    res.status(200).json({
      success: true,
      needsFirstMessage: needed
    });

  } catch (error) {
    console.error("Error in checkFirstMessageNeededHandler:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check first message status. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  generateFirstMessageHandler,
  getUserInboxHandler,
  markAsReadHandler,
  checkFirstMessageNeededHandler
};
