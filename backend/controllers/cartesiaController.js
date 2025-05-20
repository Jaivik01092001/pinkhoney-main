/**
 * Cartesia voice API controller
 */
const { generateSpeech } = require("../services/cartesiaService");

/**
 * Handle text-to-speech conversion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const textToSpeechHandler = async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    // Validate required fields
    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required",
      });
    }

    // Generate speech using Cartesia service
    const audioData = await generateSpeech(text, voiceId);

    // Set appropriate headers for audio data
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioData.length);

    // Send the audio data
    return res.status(200).send(audioData);
  } catch (error) {
    console.error(
      "Error in text-to-speech:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || "Failed to generate speech",
    });
  }
};

module.exports = {
  textToSpeechHandler,
};
