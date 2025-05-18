/**
 * Cartesia TTS service for voice synthesis
 */
const axios = require('axios');
const config = require('../config/config');

/**
 * Generate speech from text using Cartesia TTS API
 * @param {string} text - The text to convert to speech
 * @param {string} voiceId - The voice ID to use (optional)
 * @returns {Promise<Buffer>} - The audio data as a buffer
 */
const generateSpeech = async (text, voiceId = 'bf0a246a-8642-498a-9950-80c35e9276b5') => {
  try {
    const response = await axios({
      method: 'post',
      url: `${config.cartesia.url}${config.cartesia.endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Cartesia-Version': config.cartesia.version,
        'X-API-Key': config.cartesia.apiKey
      },
      data: {
        model_id: 'sonic-2',
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId
        },
        output_format: {
          container: 'wav',
          encoding: 'pcm_f32le',
          sample_rate: 44100
        },
        language: 'en'
      },
      responseType: 'arraybuffer'
    });

    return response.data;
  } catch (error) {
    console.error('Error generating speech with Cartesia:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get available voices from Cartesia API
 * @returns {Promise<Array>} - List of available voices
 */
const getAvailableVoices = async () => {
  try {
    // This is a placeholder - you would need to implement this based on Cartesia's API
    // for listing available voices if they provide such an endpoint
    return [
      { id: 'bf0a246a-8642-498a-9950-80c35e9276b5', name: 'Default Voice' }
    ];
  } catch (error) {
    console.error('Error getting available voices:', error);
    throw error;
  }
};

module.exports = {
  generateSpeech,
  getAvailableVoices
};
