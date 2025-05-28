/**
 * Follow-up Schedule model
 * Manages timing for automated follow-up messages and internal reflections
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowUpScheduleSchema = new Schema({
  // User and companion identification
  user_id: {
    type: String,
    required: true,
    index: true
  },
  companion_name: {
    type: String,
    required: true
  },
  
  // Follow-up timing configuration
  followUpTimers: {
    // 12-hour internal reflection timer
    twelveHourReflection: {
      scheduledTime: Date,
      completed: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false },
      reflectionText: String // Internal reflection content
    },
    
    // 24-hour follow-up message timer
    twentyFourHourMessage: {
      scheduledTime: Date,
      completed: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false },
      messageText: String // Follow-up message content
    },
    
    // 36-hour internal reflection timer (only if both have messaged)
    thirtySixHourReflection: {
      scheduledTime: Date,
      completed: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false },
      reflectionText: String,
      requiresBothMessaged: { type: Boolean, default: true }
    },
    
    // 48-hour follow-up message timer (only if both have messaged)
    fortyEightHourMessage: {
      scheduledTime: Date,
      completed: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false },
      messageText: String,
      requiresBothMessaged: { type: Boolean, default: true }
    }
  },
  
  // Conversation state tracking
  conversationState: {
    lastUserMessageTime: Date,
    lastBotMessageTime: Date,
    bothHaveMessaged: { type: Boolean, default: false },
    totalUserMessages: { type: Number, default: 0 },
    totalBotMessages: { type: Number, default: 0 }
  },
  
  // Timer management
  timerState: {
    isActive: { type: Boolean, default: true },
    lastResetTime: { type: Date, default: Date.now },
    currentCycle: { type: Number, default: 1 }, // Track follow-up cycles
    nextScheduledAction: {
      type: String,
      enum: ['12h_reflection', '24h_message', '36h_reflection', '48h_message', 'none'],
      default: '12h_reflection'
    }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound index for efficient queries
FollowUpScheduleSchema.index({ user_id: 1, companion_name: 1 }, { unique: true });

// Index for scheduled time queries
FollowUpScheduleSchema.index({ 
  'followUpTimers.twelveHourReflection.scheduledTime': 1,
  'followUpTimers.twelveHourReflection.completed': 1,
  'followUpTimers.twelveHourReflection.cancelled': 1
});

FollowUpScheduleSchema.index({ 
  'followUpTimers.twentyFourHourMessage.scheduledTime': 1,
  'followUpTimers.twentyFourHourMessage.completed': 1,
  'followUpTimers.twentyFourHourMessage.cancelled': 1
});

FollowUpScheduleSchema.index({ 
  'followUpTimers.thirtySixHourReflection.scheduledTime': 1,
  'followUpTimers.thirtySixHourReflection.completed': 1,
  'followUpTimers.thirtySixHourReflection.cancelled': 1
});

FollowUpScheduleSchema.index({ 
  'followUpTimers.fortyEightHourMessage.scheduledTime': 1,
  'followUpTimers.fortyEightHourMessage.completed': 1,
  'followUpTimers.fortyEightHourMessage.cancelled': 1
});

// Pre-save middleware to update timestamps
FollowUpScheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
FollowUpScheduleSchema.methods.cancelAllPendingTimers = function() {
  const timers = this.followUpTimers;
  
  // Cancel all non-completed timers
  if (!timers.twelveHourReflection.completed) {
    timers.twelveHourReflection.cancelled = true;
  }
  if (!timers.twentyFourHourMessage.completed) {
    timers.twentyFourHourMessage.cancelled = true;
  }
  if (!timers.thirtySixHourReflection.completed) {
    timers.thirtySixHourReflection.cancelled = true;
  }
  if (!timers.fortyEightHourMessage.completed) {
    timers.fortyEightHourMessage.cancelled = true;
  }
  
  this.timerState.isActive = false;
  this.timerState.lastResetTime = new Date();
};

FollowUpScheduleSchema.methods.resetTimers = function() {
  // Cancel existing timers
  this.cancelAllPendingTimers();
  
  // Reset timer state
  this.timerState.isActive = true;
  this.timerState.lastResetTime = new Date();
  this.timerState.currentCycle += 1;
  this.timerState.nextScheduledAction = '12h_reflection';
  
  // Clear previous timer data
  this.followUpTimers = {
    twelveHourReflection: { completed: false, cancelled: false },
    twentyFourHourMessage: { completed: false, cancelled: false },
    thirtySixHourReflection: { completed: false, cancelled: false, requiresBothMessaged: true },
    fortyEightHourMessage: { completed: false, cancelled: false, requiresBothMessaged: true }
  };
};

FollowUpScheduleSchema.methods.scheduleNextFollowUp = function(baseTime = new Date()) {
  const timers = this.followUpTimers;
  
  // Schedule 12-hour reflection
  timers.twelveHourReflection.scheduledTime = new Date(baseTime.getTime() + (12 * 60 * 60 * 1000));
  
  // Schedule 24-hour message
  timers.twentyFourHourMessage.scheduledTime = new Date(baseTime.getTime() + (24 * 60 * 60 * 1000));
  
  // Schedule 36-hour reflection (only if both have messaged)
  if (this.conversationState.bothHaveMessaged) {
    timers.thirtySixHourReflection.scheduledTime = new Date(baseTime.getTime() + (36 * 60 * 60 * 1000));
  }
  
  // Schedule 48-hour message (only if both have messaged)
  if (this.conversationState.bothHaveMessaged) {
    timers.fortyEightHourMessage.scheduledTime = new Date(baseTime.getTime() + (48 * 60 * 60 * 1000));
  }
  
  this.timerState.nextScheduledAction = '12h_reflection';
};

module.exports = mongoose.model('FollowUpSchedule', FollowUpScheduleSchema);
