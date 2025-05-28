/**
 * Follow-up Controller
 * Handles follow-up timing API endpoints
 */
const followUpService = require("../services/followUpService");
const { validateFollowUpRequest } = require("../middleware/requestValidation");

/**
 * Create or reset follow-up schedule for a user-companion pair
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFollowUpSchedule = async (req, res) => {
  try {
    const { user_id, companion_name, reset_existing } = req.body;

    // Validate required fields
    if (!user_id || !companion_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id or companion_name",
      });
    }

    // Create or update the follow-up schedule
    const schedule = await followUpService.createFollowUpSchedule(
      user_id, 
      companion_name, 
      reset_existing || false
    );

    res.status(200).json({
      success: true,
      message: "Follow-up schedule created successfully",
      schedule: {
        user_id: schedule.user_id,
        companion_name: schedule.companion_name,
        isActive: schedule.timerState.isActive,
        nextAction: schedule.timerState.nextScheduledAction,
        cycle: schedule.timerState.currentCycle,
        timers: {
          twelveHour: schedule.followUpTimers.twelveHourReflection.scheduledTime,
          twentyFourHour: schedule.followUpTimers.twentyFourHourMessage.scheduledTime,
          thirtySixHour: schedule.followUpTimers.thirtySixHourReflection.scheduledTime,
          fortyEightHour: schedule.followUpTimers.fortyEightHourMessage.scheduledTime
        }
      }
    });

  } catch (error) {
    console.error("Error in createFollowUpSchedule:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create follow-up schedule. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Reset follow-up timers when user sends a message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetFollowUpTimers = async (req, res) => {
  try {
    const { user_id, companion_name, is_user_message } = req.body;

    // Validate required fields
    if (!user_id || !companion_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id or companion_name",
      });
    }

    // Reset the follow-up timers
    const schedule = await followUpService.resetFollowUpTimers(
      user_id, 
      companion_name, 
      is_user_message !== false // Default to true if not specified
    );

    res.status(200).json({
      success: true,
      message: "Follow-up timers reset successfully",
      schedule: {
        user_id: schedule.user_id,
        companion_name: schedule.companion_name,
        isActive: schedule.timerState.isActive,
        nextAction: schedule.timerState.nextScheduledAction,
        cycle: schedule.timerState.currentCycle,
        conversationState: schedule.conversationState
      }
    });

  } catch (error) {
    console.error("Error in resetFollowUpTimers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset follow-up timers. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get follow-up schedule status for a user-companion pair
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFollowUpStatus = async (req, res) => {
  try {
    const { user_id, companion_name } = req.query;

    // Validate required fields
    if (!user_id || !companion_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required query parameters: user_id or companion_name",
      });
    }

    // Get the follow-up status
    const status = await followUpService.getFollowUpStatus(user_id, companion_name);

    res.status(200).json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error("Error in getFollowUpStatus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get follow-up status. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Manually trigger a follow-up action (for testing purposes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const triggerFollowUpAction = async (req, res) => {
  try {
    const { user_id, companion_name, action_type } = req.body;

    // Validate required fields
    if (!user_id || !companion_name || !action_type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_id, companion_name, or action_type",
      });
    }

    // Validate action type
    const validActions = ['12h_reflection', '24h_message', '36h_reflection', '48h_message'];
    if (!validActions.includes(action_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action_type. Must be one of: ${validActions.join(', ')}`,
      });
    }

    // This is a development/testing endpoint
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: "Manual trigger not allowed in production",
      });
    }

    // Get the schedule
    const FollowUpSchedule = require("../models/FollowUpSchedule");
    const schedule = await FollowUpSchedule.findOne({
      user_id: user_id,
      companion_name: companion_name
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: "Follow-up schedule not found",
      });
    }

    // Manually execute the action
    const now = new Date();
    if (action_type.includes('reflection')) {
      await followUpService.executeInternalReflection(schedule, action_type.split('_')[0]);
    } else {
      await followUpService.executeFollowUpMessage(schedule, action_type.split('_')[0]);
    }

    res.status(200).json({
      success: true,
      message: `Follow-up action ${action_type} triggered successfully`,
    });

  } catch (error) {
    console.error("Error in triggerFollowUpAction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to trigger follow-up action. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all active follow-up schedules (admin endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllActiveSchedules = async (req, res) => {
  try {
    // This is an admin endpoint
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: "Admin endpoint not available in production",
      });
    }

    const FollowUpSchedule = require("../models/FollowUpSchedule");
    const activeSchedules = await FollowUpSchedule.find({
      'timerState.isActive': true
    }).select('user_id companion_name timerState conversationState followUpTimers');

    res.status(200).json({
      success: true,
      count: activeSchedules.length,
      schedules: activeSchedules
    });

  } catch (error) {
    console.error("Error in getAllActiveSchedules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get active schedules. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Health check for follow-up service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const followUpHealthCheck = async (req, res) => {
  try {
    const isInitialized = followUpService.isInitialized;
    const FollowUpSchedule = require("../models/FollowUpSchedule");
    
    // Count active schedules
    const activeCount = await FollowUpSchedule.countDocuments({
      'timerState.isActive': true
    });

    // Count total schedules
    const totalCount = await FollowUpSchedule.countDocuments();

    res.status(200).json({
      success: true,
      service: {
        initialized: isInitialized,
        status: isInitialized ? 'running' : 'not initialized'
      },
      statistics: {
        activeSchedules: activeCount,
        totalSchedules: totalCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in followUpHealthCheck:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check follow-up service health",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createFollowUpSchedule,
  resetFollowUpTimers,
  getFollowUpStatus,
  triggerFollowUpAction,
  getAllActiveSchedules,
  followUpHealthCheck
};
