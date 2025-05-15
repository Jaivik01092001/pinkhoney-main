/**
 * AI response routes
 */
const express = require('express');
const { getAIResponseHandler } = require('../controllers/aiController');

const router = express.Router();

/**
 * @route   POST /api/get_ai_response
 * @desc    Get AI response for user message
 * @access  Public
 */
router.post('/get_ai_response', getAIResponseHandler);

module.exports = router;
