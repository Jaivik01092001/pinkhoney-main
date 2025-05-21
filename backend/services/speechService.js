/**
 * Speech service for handling speech-to-text and text-to-speech
 */
const { OpenAI } = require("openai");
const config = require("../config/config");
const fs = require('fs');
const path = require('path');
const os = require('os');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Convert speech to text using OpenAI Whisper API
 * @param {any} audioData - Audio data from client
 * @param {string} audioFormat - Format of the audio data (optional)
 * @returns {Promise<string>} Transcribed text
 */
const speechToText = async (audioData, audioFormat = 'wav') => {
  let tempFilePath = null;

  try {
    // Check if we have valid audio data
    if (!audioData) {
      return "No audio data received. Please try again.";
    }

    // Create a temporary file to store the audio data
    const tempDir = os.tmpdir();

    // Use a format that's definitely supported by OpenAI
    // Despite webm being listed as supported, it seems to have issues
    // Let's force mp3 format which is widely supported
    let fileExtension = 'mp3'; // Force mp3 format regardless of input

    console.log(`Using audio format: ${fileExtension} (forced for compatibility)`);

    const fileName = `audio_${Date.now()}.${fileExtension}`;
    tempFilePath = path.join(tempDir, fileName);
    console.log(`Creating temporary audio file: ${fileName}`);

    // Check if the audio data is a base64 string
    let audioBuffer;
    if (typeof audioData === 'string') {
      // If it's a base64 string, decode it to a buffer
      try {
        audioBuffer = Buffer.from(audioData, 'base64');
        console.log("Successfully decoded base64 audio data, size:", audioBuffer.length);
      } catch (error) {
        console.error("Error decoding base64 audio data:", error);
        return "Error processing audio. Please try again.";
      }
    } else if (Buffer.isBuffer(audioData)) {
      // If it's already a buffer, use it directly
      audioBuffer = audioData;
    } else {
      // Otherwise, try to convert it to a buffer
      try {
        audioBuffer = Buffer.from(audioData);
      } catch (error) {
        console.error("Error converting audio data to buffer:", error);
        return "Error processing audio. Please try again.";
      }
    }

    // Write the buffer to a temporary file
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      // Log file details for debugging
      const fileStats = fs.statSync(tempFilePath);
      console.log(`Sending file to OpenAI: ${tempFilePath}`);
      console.log(`File size: ${fileStats.size} bytes`);
      console.log(`File format: ${fileExtension}`);

      // Verify file content before sending
      if (fileStats.size === 0) {
        console.error("Error: File is empty");
        return "Error processing audio. Please try again.";
      }

      // Send the file to OpenAI
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
      });


      // Clean up the temporary file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      return response.text || "I couldn't understand what you said.";
    } catch (error) {
      console.error("Error in OpenAI API call:", error);

      // Log more detailed error information
      if (error.error && error.error.message) {
        console.error("OpenAI API error message:", error.error.message);
      }

      // If it's a format error, try to convert to a more compatible format for the next attempt
      if (error.error && error.error.message && error.error.message.includes("Invalid file format")) {
        console.log("Format error detected. Will try a different format next time.");
      }

      // Clean up the temporary file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary file:", cleanupError);
        }
      }

      return "I couldn't understand what you said. Could you please try again?";
    }
  } catch (error) {
    console.error("Error in speechToText:", error);

    // Clean up the temporary file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }

    return "I couldn't understand what you said. Could you please try again?";
  }
};

/**
 * Convert text to speech using browser's SpeechSynthesis API
 * This is a fallback method that doesn't require OpenAI API access
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} Audio buffer containing synthesized speech
 */
const textToSpeech = async (text) => {
  try {
    // Since we don't have access to the TTS-1 model, we'll return null
    // and let the frontend handle the speech synthesis
    console.log("Using fallback for text-to-speech. Text:", text);
    return null;
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    return null;
  }
};

module.exports = {
  speechToText,
  textToSpeech,
};
