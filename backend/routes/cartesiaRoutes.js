/**
 * Cartesia voice API routes
 */
const express = require("express");
const { textToSpeechHandler } = require("../controllers/cartesiaController");

const router = express.Router();

/**
 * @route   POST /api/cartesia/tts
 * @desc    Convert text to speech using Cartesia API
 * @access  Public
 */
router.post("/tts", textToSpeechHandler);

module.exports = router;
