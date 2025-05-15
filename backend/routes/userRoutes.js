/**
 * User routes
 */
const express = require('express');
const { checkEmail, changeSubscription, increaseTokens } = require('../controllers/userController');

const router = express.Router();

/**
 * @route   POST /api/check_email
 * @desc    Check if a user exists by email, create if not exists
 * @access  Public
 */
router.post('/check_email', checkEmail);

/**
 * @route   POST /api/change_subscription
 * @desc    Change user subscription status
 * @access  Public
 */
router.post('/change_subscription', changeSubscription);

/**
 * @route   POST /api/increase_tokens
 * @desc    Increase user tokens
 * @access  Public
 */
router.post('/increase_tokens', increaseTokens);

module.exports = router;
