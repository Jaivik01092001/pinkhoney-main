/**
 * AI response controller
 */
const { getAIResponse } = require("../services/aiService");
const {
  saveChatMessage,
  getChatHistory,
  getUserChatSummaries,
  saveMatch,
} = require("../services/mongoService");

/**
 * Get AI response for user message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAIResponseHandler = async (req, res) => {
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
      try {
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
      } catch (saveError) {
        console.error("Error saving user message:", saveError);
        // Continue execution even if saving fails
      }
    }

    // Get AI response
    const aiResponses = await getAIResponse(message, name, personality);

    // Save AI responses to chat history if user_id is provided
    if (user_id) {
      let savedResponses = 0;
      for (const response of aiResponses) {
        // Skip empty responses to avoid MongoDB validation errors
        if (!response || response.trim() === "") {
          console.log("Skipping empty AI response");
          continue;
        }

        try {
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
          savedResponses++;
        } catch (saveError) {
          console.error("Error saving bot message:", saveError);
          // Continue with other responses even if one fails
        }
      }

      console.log(
        `Successfully saved ${savedResponses} out of ${aiResponses.length} AI responses`
      );
    }

    // Return response
    res.status(200).json({
      success: true,
      llm_ans: aiResponses, // Match the format expected by the frontend
    });
  } catch (error) {
    console.error("Error in getAIResponseHandler:", error);

    // Send a more user-friendly error response
    res.status(500).json({
      success: false,
      error: "Failed to process your message. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get chat history for a user and companion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChatHistoryHandler = async (req, res) => {
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
    console.error("Error in getChatHistoryHandler:", error);

    // Send a more user-friendly error response
    res.status(500).json({
      success: false,
      error: "Failed to retrieve chat history. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all chat summaries for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserChatSummariesHandler = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: user_id",
      });
    }

    // Get chat summaries
    const chatSummaries = await getUserChatSummaries(user_id);

    // Return response
    res.status(200).json({
      success: true,
      chatSummaries: chatSummaries,
    });
  } catch (error) {
    console.error("Error in getUserChatSummariesHandler:", error);

    // Send a more user-friendly error response
    res.status(500).json({
      success: false,
      error: "Failed to retrieve chat summaries. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Save a match between user and companion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveMatchHandler = async (req, res) => {
  try {
    const { user_id, name, personality, image, matchType } = req.body;

    // Validate required fields
    if (!user_id || !name || !personality || !image) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, name, personality, image",
      });
    }

    // Save the match
    const match = await saveMatch(user_id, name, personality, image, matchType);

    // Return response
    res.status(200).json({
      success: true,
      match: match,
    });
  } catch (error) {
    console.error("Error in saveMatchHandler:", error);

    // Send a more user-friendly error response
    res.status(500).json({
      success: false,
      error: "Failed to save match. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAIResponseHandler,
  getChatHistoryHandler,
  getUserChatSummariesHandler,
  saveMatchHandler,
};
