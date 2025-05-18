/**
 * Clerk webhook routes
 */
const express = require('express');
const { handleClerkWebhook } = require('../controllers/clerkController');

const router = express.Router();

/**
 * @route   POST /api/clerk-webhook
 * @desc    Handle Clerk webhook events
 * @access  Public
 */
router.post('/clerk-webhook', express.raw({ type: 'application/json' }), handleClerkWebhook);

module.exports = router;
