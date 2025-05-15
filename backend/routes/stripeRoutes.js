/**
 * Stripe payment routes
 */
const express = require('express');
const { createCheckoutSessionHandler, webhookHandler } = require('../controllers/stripeController');

const router = express.Router();

// Special middleware for Stripe webhooks to get raw body
const stripeWebhookMiddleware = express.raw({ type: 'application/json' });

/**
 * @route   GET /api/create_checkout_session
 * @desc    Create a checkout session for subscription
 * @access  Public
 */
router.get('/create_checkout_session', createCheckoutSessionHandler);

/**
 * @route   POST /api/webhook
 * @desc    Handle webhook events from Stripe
 * @access  Public
 */
router.post('/webhook', stripeWebhookMiddleware, webhookHandler);

module.exports = router;
