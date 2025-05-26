/**
 * AI response controller
 */
const { getAIResponse, getWelcomeMessage } = require("../services/aiService");
const { saveChatMessage, getChatHistory } = require("../services/mongoService");

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
 * Generate welcome message for new conversations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWelcomeMessageHandler = async (req, res) => {
  try {
    const { name, personality, image, user_id } = req.body;

    // Validate required fields
    if (!name || !personality) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name or personality",
      });
    }

    // Generate welcome message
    const welcomeMessages = await getWelcomeMessage(name, personality);

    // Save welcome messages to chat history if user_id is provided
    if (user_id) {
      try {
        let savedResponses = 0;
        for (const welcomeText of welcomeMessages) {
          try {
            const welcomeMessage = {
              text: welcomeText,
              sender: "bot",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              timestamp: new Date(),
            };

            await saveChatMessage(user_id, name, personality, image, welcomeMessage);
            savedResponses++;
          } catch (saveError) {
            console.error("Error saving welcome message:", saveError);
            // Continue with other messages even if one fails
          }
        }

        console.log(
          `Successfully saved ${savedResponses} out of ${welcomeMessages.length} welcome messages`
        );
      } catch (error) {
        console.error("Error saving welcome messages:", error);
        // Continue execution even if saving fails
      }
    }

    // Return response
    res.status(200).json({
      success: true,
      llm_ans: welcomeMessages, // Match the format expected by the frontend
    });
  } catch (error) {
    console.error("Error in getWelcomeMessageHandler:", error);

    // Send a more user-friendly error response
    res.status(500).json({
      success: false,
      error: "Failed to generate welcome message. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Save a bot message directly to chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveBotMessageHandler = async (req, res) => {
  try {
    const { message_text, name, personality, image, user_id } = req.body;

    // Validate required fields
    if (!message_text || !name || !personality || !user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: message_text, name, personality, or user_id",
      });
    }

    // Create bot message object
    const botMessage = {
      text: message_text,
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date(),
    };

    // Save bot message to chat history
    await saveChatMessage(user_id, name, personality, image, botMessage);

    console.log(`Bot message saved successfully for user ${user_id} with companion ${name}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Bot message saved successfully",
    });
  } catch (error) {
    console.error("Error in saveBotMessageHandler:", error);

    // Send a more user-friendly error response
    res.status(500).json({
      success: false,
      error: "Failed to save bot message. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAIResponseHandler,
  getChatHistoryHandler,
  getWelcomeMessageHandler,
  saveBotMessageHandler,
};
