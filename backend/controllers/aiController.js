/**
 * AI response controller
 */
const { getAIResponse } = require("../services/aiService");
const { saveChatMessage, getChatHistory } = require("../services/mongoService");

/**
 * Get AI response for user message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAIResponseHandler = async (req, res, next) => {
  try {
    const { message, name, personality, image, user_id } = req.body;

    // Validate required fields
    if (!message || !name || !personality) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: message, name, or personality",
      });
    }

    // Save user message to chat history if user_id is provided
    if (user_id) {
      const userMessage = {
        text: message,
        sender: "user",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: new Date(),
      };

      await saveChatMessage(user_id, name, personality, image, userMessage);
    }

    // Get AI response
    const aiResponses = await getAIResponse(message, name, personality);

    // Save AI responses to chat history if user_id is provided
    if (user_id) {
      for (const response of aiResponses) {
        const botMessage = {
          text: response,
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: new Date(),
        };

        await saveChatMessage(user_id, name, personality, image, botMessage);
      }
    }

    // Return response
    res.status(200).json({
      success: true,
      llm_ans: aiResponses, // Match the format expected by the frontend
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat history for a user and companion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getChatHistoryHandler = async (req, res, next) => {
  try {
    const { user_id, companion_name } = req.query;

    // Validate required fields
    if (!user_id || !companion_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id or companion_name",
      });
    }

    // Get chat history
    const chatHistory = await getChatHistory(user_id, companion_name);

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    // Return response
    res.status(200).json({
      success: true,
      messages: chatHistory.messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIResponseHandler,
  getChatHistoryHandler,
};
