/**
 * Follow-up Routes
 * API endpoints for follow-up timing management
 */
const express = require("express");
const router = express.Router();

// Import controllers
const {
  createFollowUpSchedule,
  resetFollowUpTimers,
  getFollowUpStatus,
  triggerFollowUpAction,
  getAllActiveSchedules,
  followUpHealthCheck
} = require("../controllers/followUpController");

// Import middleware
const { requireAuth } = require("@clerk/express");
const { conditionalAuth } = require("../middleware/securityMiddleware");
const {
  validateFollowUpCreate,
  validateFollowUpReset,
  validateFollowUpTrigger,
  validateFollowUpStatus
} = require("../middleware/requestValidation");

/**
 * @route POST /api/follow-up/create
 * @desc Create or reset follow-up schedule for a user-companion pair
 * @access Private
 * @body {string} user_id - User ID
 * @body {string} companion_name - Companion name
 * @body {boolean} [reset_existing] - Whether to reset existing schedule
 */
router.post(
  "/create",
  conditionalAuth(requireAuth()),
  validateFollowUpCreate,
  createFollowUpSchedule
);

/**
 * @route POST /api/follow-up/reset
 * @desc Reset follow-up timers when user sends a message
 * @access Private
 * @body {string} user_id - User ID
 * @body {string} companion_name - Companion name
 * @body {boolean} [is_user_message] - Whether this is a user message (default: true)
 */
router.post(
  "/reset",
  conditionalAuth(requireAuth()),
  validateFollowUpReset,
  resetFollowUpTimers
);

/**
 * @route GET /api/follow-up/status
 * @desc Get follow-up schedule status for a user-companion pair
 * @access Private
 * @query {string} user_id - User ID
 * @query {string} companion_name - Companion name
 */
router.get(
  "/status",
  conditionalAuth(requireAuth()),
  validateFollowUpStatus,
  getFollowUpStatus
);

/**
 * @route POST /api/follow-up/trigger
 * @desc Manually trigger a follow-up action (development/testing only)
 * @access Private (Development only)
 * @body {string} user_id - User ID
 * @body {string} companion_name - Companion name
 * @body {string} action_type - Action type (12h_reflection, 24h_message, 36h_reflection, 48h_message)
 */
router.post(
  "/trigger",
  conditionalAuth(requireAuth()),
  validateFollowUpTrigger,
  triggerFollowUpAction
);

/**
 * @route GET /api/follow-up/admin/schedules
 * @desc Get all active follow-up schedules (admin endpoint)
 * @access Private (Development only)
 */
router.get(
  "/admin/schedules",
  conditionalAuth(requireAuth()),
  getAllActiveSchedules
);

/**
 * @route GET /api/follow-up/health
 * @desc Health check for follow-up service
 * @access Private
 */
router.get(
  "/health",
  conditionalAuth(requireAuth()),
  followUpHealthCheck
);

module.exports = router;
