/**
 * Voice call routes
 */
const express = require('express');
const { initiateCallHandler, endCallHandler } = require('../controllers/voiceController');

const router = express.Router();

/**
 * @route   POST /api/voice/initiate
 * @desc    Initiate a voice call session
 * @access  Public
 */
router.post('/voice/initiate', initiateCallHandler);

/**
 * @route   POST /api/voice/end
 * @desc    End a voice call session
 * @access  Public
 */
router.post('/voice/end', endCallHandler);

module.exports = router;
