/**
 * AI response controller
 */
const { getAIResponse } = require('../services/aiService');

/**
 * Get AI response for user message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAIResponseHandler = async (req, res, next) => {
  try {
    const { message, name, personality } = req.body;
    
    // Validate required fields
    if (!message || !name || !personality) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, name, or personality'
      });
    }
    
    // Get AI response
    const aiResponses = await getAIResponse(message, name, personality);
    
    // Return response
    res.status(200).json({
      success: true,
      llm_ans: aiResponses // Match the format expected by the frontend
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIResponseHandler
};
