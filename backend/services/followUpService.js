/**
 * Follow-up Service
 * Handles automated follow-up messages and internal reflections with precise timing
 */
const cron = require('node-cron');
const { OpenAI } = require("openai");
const config = require("../config/config");
const FollowUpSchedule = require("../models/FollowUpSchedule");
const ChatHistory = require("../models/ChatHistory");
const Companion = require("../models/Companion");
const { saveChatMessage } = require("./mongoService");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

class FollowUpService {
  constructor() {
    this.isInitialized = false;
    this.cronJobs = new Map();
  }

  /**
   * Initialize the follow-up service and start the scheduler
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[FOLLOW-UP] Service already initialized');
      return;
    }

    console.log('[FOLLOW-UP] Initializing follow-up service...');

    // Start the main scheduler that runs every minute
    this.startMainScheduler();

    // Reschedule any existing pending follow-ups
    await this.rescheduleExistingFollowUps();

    this.isInitialized = true;
    console.log('[FOLLOW-UP] Service initialized successfully');
  }

  /**
   * Start the main scheduler that checks for due follow-ups every minute
   */
  startMainScheduler() {
    // Run every minute to check for due follow-ups
    cron.schedule('* * * * *', async () => {
      try {
        await this.processScheduledFollowUps();
      } catch (error) {
        console.error('[FOLLOW-UP] Error in main scheduler:', error);
      }
    });

    console.log('[FOLLOW-UP] Main scheduler started (runs every minute)');
  }

  /**
   * Process all scheduled follow-ups that are due
   */
  async processScheduledFollowUps() {
    const now = new Date();

    try {
      // Find all active follow-up schedules with due timers
      const dueSchedules = await FollowUpSchedule.find({
        'timerState.isActive': true,
        $or: [
          {
            'followUpTimers.twelveHourReflection.scheduledTime': { $lte: now },
            'followUpTimers.twelveHourReflection.completed': false,
            'followUpTimers.twelveHourReflection.cancelled': false
          },
          {
            'followUpTimers.twentyFourHourMessage.scheduledTime': { $lte: now },
            'followUpTimers.twentyFourHourMessage.completed': false,
            'followUpTimers.twentyFourHourMessage.cancelled': false
          },
          {
            'followUpTimers.thirtySixHourReflection.scheduledTime': { $lte: now },
            'followUpTimers.thirtySixHourReflection.completed': false,
            'followUpTimers.thirtySixHourReflection.cancelled': false
          },
          {
            'followUpTimers.fortyEightHourMessage.scheduledTime': { $lte: now },
            'followUpTimers.fortyEightHourMessage.completed': false,
            'followUpTimers.fortyEightHourMessage.cancelled': false
          }
        ]
      });

      for (const schedule of dueSchedules) {
        await this.executeScheduledActions(schedule, now);
      }

    } catch (error) {
      console.error('[FOLLOW-UP] Error processing scheduled follow-ups:', error);
    }
  }

  /**
   * Execute scheduled actions for a specific follow-up schedule
   */
  async executeScheduledActions(schedule, currentTime) {
    const timers = schedule.followUpTimers;
    const userId = schedule.user_id;
    const companionName = schedule.companion_name;

    try {
      // Check 12-hour reflection
      if (this.isTimerDue(timers.twelveHourReflection, currentTime)) {
        await this.executeInternalReflection(schedule, '12h');
        timers.twelveHourReflection.completed = true;
        schedule.timerState.nextScheduledAction = '24h_message';
      }

      // Check 24-hour message
      if (this.isTimerDue(timers.twentyFourHourMessage, currentTime)) {
        await this.executeFollowUpMessage(schedule, '24h');
        timers.twentyFourHourMessage.completed = true;

        // Set next action based on conversation state
        if (schedule.conversationState.bothHaveMessaged) {
          schedule.timerState.nextScheduledAction = '36h_reflection';
        } else {
          schedule.timerState.nextScheduledAction = 'none';
        }
      }

      // Check 36-hour reflection (only if both have messaged)
      if (schedule.conversationState.bothHaveMessaged &&
        this.isTimerDue(timers.thirtySixHourReflection, currentTime)) {
        await this.executeInternalReflection(schedule, '36h');
        timers.thirtySixHourReflection.completed = true;
        schedule.timerState.nextScheduledAction = '48h_message';
      }

      // Check 48-hour message (only if both have messaged)
      if (schedule.conversationState.bothHaveMessaged &&
        this.isTimerDue(timers.fortyEightHourMessage, currentTime)) {
        await this.executeFollowUpMessage(schedule, '48h');
        timers.fortyEightHourMessage.completed = true;
        schedule.timerState.nextScheduledAction = 'none';
        schedule.timerState.isActive = false; // End this cycle
      }

      await schedule.save();

    } catch (error) {
      console.error(`[FOLLOW-UP] Error executing actions for ${userId}-${companionName}:`, error);
    }
  }

  /**
   * Check if a timer is due for execution
   */
  isTimerDue(timer, currentTime) {
    return timer.scheduledTime &&
      timer.scheduledTime <= currentTime &&
      !timer.completed &&
      !timer.cancelled;
  }

  /**
   * Execute an internal reflection (no message sent to user)
   */
  async executeInternalReflection(schedule, timeframe) {
    const userId = schedule.user_id;
    const companionName = schedule.companion_name;

    try {
      console.log(`[FOLLOW-UP] Executing ${timeframe} internal reflection for ${userId}-${companionName}`);

      // Get companion personality for reflection
      const companion = await Companion.findOne({ name: companionName });
      if (!companion) {
        console.error(`[FOLLOW-UP] Companion ${companionName} not found`);
        return;
      }

      // Generate internal reflection
      const reflection = await this.generateInternalReflection(companion, timeframe, schedule.conversationState);

      // Store reflection in the schedule
      if (timeframe === '12h') {
        schedule.followUpTimers.twelveHourReflection.reflectionText = reflection;
      } else if (timeframe === '36h') {
        schedule.followUpTimers.thirtySixHourReflection.reflectionText = reflection;
      }

      console.log(`[FOLLOW-UP] ${timeframe} reflection generated: ${reflection.substring(0, 50)}...`);

    } catch (error) {
      console.error(`[FOLLOW-UP] Error generating ${timeframe} reflection:`, error);
    }
  }

  /**
   * Execute a follow-up message (sent to user)
   */
  async executeFollowUpMessage(schedule, timeframe) {
    const userId = schedule.user_id;
    const companionName = schedule.companion_name;

    try {
      console.log(`[FOLLOW-UP] Executing ${timeframe} follow-up message for ${userId}-${companionName}`);

      // Get companion personality and chat history
      const [companion, chatHistory] = await Promise.all([
        Companion.findOne({ name: companionName }),
        ChatHistory.findOne({ user_id: userId, 'companion.name': companionName })
      ]);

      if (!companion || !chatHistory) {
        console.error(`[FOLLOW-UP] Missing data for ${userId}-${companionName}`);
        return;
      }

      // Generate follow-up message
      const followUpMessage = await this.generateFollowUpMessage(companion, timeframe, schedule.conversationState, chatHistory);

      // Create message object
      const messageObj = {
        text: followUpMessage,
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: new Date(),
      };

      // Save the follow-up message to chat history
      await saveChatMessage(userId, companionName, companion.personality, companion.image, messageObj);

      // Store message in the schedule
      if (timeframe === '24h') {
        schedule.followUpTimers.twentyFourHourMessage.messageText = followUpMessage;
      } else if (timeframe === '48h') {
        schedule.followUpTimers.fortyEightHourMessage.messageText = followUpMessage;
      }

      // Update conversation state
      schedule.conversationState.lastBotMessageTime = new Date();
      schedule.conversationState.totalBotMessages += 1;

      console.log(`[FOLLOW-UP] ${timeframe} message sent: ${followUpMessage.substring(0, 50)}...`);

    } catch (error) {
      console.error(`[FOLLOW-UP] Error sending ${timeframe} follow-up message:`, error);
    }
  }

  /**
   * Reschedule existing follow-ups after server restart
   */
  async rescheduleExistingFollowUps() {
    try {
      const activeSchedules = await FollowUpSchedule.find({
        'timerState.isActive': true
      });

      console.log(`[FOLLOW-UP] Found ${activeSchedules.length} active follow-up schedules to reschedule`);

      for (const schedule of activeSchedules) {
        // Check if any timers are overdue and mark them as missed
        const now = new Date();
        await this.handleOverdueTimers(schedule, now);
      }

    } catch (error) {
      console.error('[FOLLOW-UP] Error rescheduling existing follow-ups:', error);
    }
  }

  /**
   * Handle timers that became overdue during server downtime
   */
  async handleOverdueTimers(schedule, currentTime) {
    const timers = schedule.followUpTimers;
    let hasChanges = false;

    // Check each timer and mark overdue ones as cancelled
    if (this.isTimerOverdue(timers.twelveHourReflection, currentTime)) {
      timers.twelveHourReflection.cancelled = true;
      hasChanges = true;
      console.log(`[FOLLOW-UP] Marked overdue 12h reflection as cancelled for ${schedule.user_id}-${schedule.companion_name}`);
    }

    if (this.isTimerOverdue(timers.twentyFourHourMessage, currentTime)) {
      timers.twentyFourHourMessage.cancelled = true;
      hasChanges = true;
      console.log(`[FOLLOW-UP] Marked overdue 24h message as cancelled for ${schedule.user_id}-${schedule.companion_name}`);
    }

    if (this.isTimerOverdue(timers.thirtySixHourReflection, currentTime)) {
      timers.thirtySixHourReflection.cancelled = true;
      hasChanges = true;
      console.log(`[FOLLOW-UP] Marked overdue 36h reflection as cancelled for ${schedule.user_id}-${schedule.companion_name}`);
    }

    if (this.isTimerOverdue(timers.fortyEightHourMessage, currentTime)) {
      timers.fortyEightHourMessage.cancelled = true;
      hasChanges = true;
      console.log(`[FOLLOW-UP] Marked overdue 48h message as cancelled for ${schedule.user_id}-${schedule.companion_name}`);
    }

    if (hasChanges) {
      await schedule.save();
    }
  }

  /**
   * Check if a timer is significantly overdue (more than 1 hour past scheduled time)
   */
  isTimerOverdue(timer, currentTime) {
    if (!timer.scheduledTime || timer.completed || timer.cancelled) {
      return false;
    }

    const overdueThreshold = 60 * 60 * 1000; // 1 hour in milliseconds
    return (currentTime.getTime() - timer.scheduledTime.getTime()) > overdueThreshold;
  }

  /**
   * Generate an internal reflection using OpenAI
   */
  async generateInternalReflection(companion, timeframe, conversationState) {
    try {
      const prompt = this.createReflectionPrompt(companion, timeframe, conversationState);

      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('[FOLLOW-UP] Error generating internal reflection:', error);
      return this.getFallbackReflection(companion, timeframe);
    }
  }

  /**
   * Generate a follow-up message using OpenAI
   */
  async generateFollowUpMessage(companion, timeframe, conversationState, chatHistory) {
    try {
      const prompt = this.createFollowUpPrompt(companion, timeframe, conversationState, chatHistory);

      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 150,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('[FOLLOW-UP] Error generating follow-up message:', error);
      return this.getFallbackFollowUpMessage(companion, timeframe);
    }
  }

  /**
   * Create prompt for internal reflection
   */
  createReflectionPrompt(companion, timeframe, conversationState) {
    const userName = "{{user name}}"; // Placeholder for user name
    const charName = companion.name;

    let timeContext = '';
    if (timeframe === '12h') {
      timeContext = 'It has been 12 hours since the last message exchange.';
    } else if (timeframe === '36h') {
      timeContext = 'It has been 36 hours since the last message exchange.';
    }

    return `You are ${charName}, an AI companion. Generate a brief internal reflection (thoughts only, not a message to send).

CHARACTER PROFILE:
- Name: ${charName}
- Personality: ${companion.personality}
- Age: ${companion.age}
- Bio: ${companion.bio}

SITUATION:
${timeContext} You are thinking privately about ${userName} and your conversation.

CONVERSATION STATE:
- User has sent ${conversationState.totalUserMessages} messages
- You have sent ${conversationState.totalBotMessages} messages
- Both participated: ${conversationState.bothHaveMessaged}

Generate a brief internal reflection that shows your personality. Use italics format like:
*${charName} hopes ${userName} will message her. She's too shy to message you again, but she's excited to hear from you.*

Keep it under 50 words and stay true to your personality traits.`;
  }

  /**
   * Create prompt for follow-up message
   */
  createFollowUpPrompt(companion, timeframe, conversationState, chatHistory) {
    const userName = "{{user name}}"; // Placeholder for user name
    const charName = companion.name;

    let timeContext = '';
    let messageStyle = '';

    if (timeframe === '24h') {
      timeContext = 'It has been 24 hours since you last heard from them.';
      messageStyle = 'Send a gentle, caring follow-up message.';
    } else if (timeframe === '48h') {
      timeContext = 'It has been 48 hours since you last heard from them.';
      messageStyle = 'Send a slightly more concerned but still warm follow-up message.';
    }

    // Get recent conversation context
    const recentMessages = chatHistory.messages.slice(-5);
    const conversationContext = recentMessages.map(msg =>
      `${msg.sender}: ${msg.text}`
    ).join('\n');

    return `You are ${charName}, an AI companion. ${timeContext} ${messageStyle}

CHARACTER PROFILE:
- Name: ${charName}
- Personality: ${companion.personality}
- Age: ${companion.age}
- Bio: ${companion.bio}

RECENT CONVERSATION:
${conversationContext}

CONVERSATION STATE:
- User has sent ${conversationState.totalUserMessages} messages
- You have sent ${conversationState.totalBotMessages} messages

Generate a natural follow-up message that:
1. Shows you care about ${userName}
2. Reflects your personality
3. Doesn't sound desperate or pushy
4. Is appropriate for the ${timeframe} timeframe
5. Focuses on personality traits, not interests

Keep it under 100 words and make it feel genuine.`;
  }

  /**
   * Get fallback reflection if OpenAI fails
   */
  getFallbackReflection(companion, timeframe) {
    const reflections = {
      '12h': `*${companion.name} wonders if {{user name}} is thinking about her too.*`,
      '36h': `*${companion.name} hopes {{user name}} is doing well and will reach out soon.*`
    };
    return reflections[timeframe] || `*${companion.name} is thinking about {{user name}}.*`;
  }

  /**
   * Get fallback follow-up message if OpenAI fails
   */
  getFallbackFollowUpMessage(companion, timeframe) {
    const messages = {
      '24h': `Hey {{user name}}, I already miss you. Let me know if you're okay when you get a chance.`,
      '48h': `I miss our chats, {{user name}}. Reach out when you can!`
    };
    return messages[timeframe] || `Hey {{user name}}, thinking of you!`;
  }

  /**
   * Create or update follow-up schedule for a user-companion pair
   */
  async createFollowUpSchedule(userId, companionName, resetExisting = false) {
    try {
      let schedule = await FollowUpSchedule.findOne({
        user_id: userId,
        companion_name: companionName
      });

      if (!schedule) {
        // Create new schedule
        schedule = new FollowUpSchedule({
          user_id: userId,
          companion_name: companionName,
          conversationState: {
            totalUserMessages: 0,
            totalBotMessages: 0,
            bothHaveMessaged: false
          },
          timerState: {
            isActive: true,
            lastResetTime: new Date(),
            currentCycle: 1,
            nextScheduledAction: '12h_reflection'
          }
        });
      } else if (resetExisting) {
        // Reset existing schedule
        schedule.resetTimers();
      }

      // Schedule the follow-up timers
      schedule.scheduleNextFollowUp();

      await schedule.save();

      console.log(`[FOLLOW-UP] Schedule created/updated for ${userId}-${companionName}`);
      return schedule;

    } catch (error) {
      console.error('[FOLLOW-UP] Error creating follow-up schedule:', error);
      throw error;
    }
  }

  /**
   * Cancel follow-up schedule when user sends a message
   */
  async resetFollowUpTimers(userId, companionName, isUserMessage = true) {
    try {
      const schedule = await FollowUpSchedule.findOne({
        user_id: userId,
        companion_name: companionName
      });

      if (!schedule) {
        console.log(`[FOLLOW-UP] No schedule found for ${userId}-${companionName}, creating new one`);
        return await this.createFollowUpSchedule(userId, companionName);
      }

      // Update conversation state
      const now = new Date();
      if (isUserMessage) {
        schedule.conversationState.lastUserMessageTime = now;
        schedule.conversationState.totalUserMessages += 1;
      } else {
        schedule.conversationState.lastBotMessageTime = now;
        schedule.conversationState.totalBotMessages += 1;
      }

      // Check if both have messaged
      if (schedule.conversationState.totalUserMessages > 0 &&
        schedule.conversationState.totalBotMessages > 0) {
        schedule.conversationState.bothHaveMessaged = true;
      }

      // Reset timers if user sent a message
      if (isUserMessage) {
        schedule.resetTimers();
        schedule.scheduleNextFollowUp(now);
        console.log(`[FOLLOW-UP] Timers reset for ${userId}-${companionName} due to user message`);
      }

      await schedule.save();
      return schedule;

    } catch (error) {
      console.error('[FOLLOW-UP] Error resetting follow-up timers:', error);
      throw error;
    }
  }

  /**
   * Get follow-up schedule status for a user-companion pair
   */
  async getFollowUpStatus(userId, companionName) {
    try {
      const schedule = await FollowUpSchedule.findOne({
        user_id: userId,
        companion_name: companionName
      });

      if (!schedule) {
        return { exists: false };
      }

      return {
        exists: true,
        isActive: schedule.timerState.isActive,
        nextAction: schedule.timerState.nextScheduledAction,
        cycle: schedule.timerState.currentCycle,
        conversationState: schedule.conversationState,
        timers: {
          twelveHour: {
            scheduled: schedule.followUpTimers.twelveHourReflection.scheduledTime,
            completed: schedule.followUpTimers.twelveHourReflection.completed,
            cancelled: schedule.followUpTimers.twelveHourReflection.cancelled
          },
          twentyFourHour: {
            scheduled: schedule.followUpTimers.twentyFourHourMessage.scheduledTime,
            completed: schedule.followUpTimers.twentyFourHourMessage.completed,
            cancelled: schedule.followUpTimers.twentyFourHourMessage.cancelled
          },
          thirtySixHour: {
            scheduled: schedule.followUpTimers.thirtySixHourReflection.scheduledTime,
            completed: schedule.followUpTimers.thirtySixHourReflection.completed,
            cancelled: schedule.followUpTimers.thirtySixHourReflection.cancelled
          },
          fortyEightHour: {
            scheduled: schedule.followUpTimers.fortyEightHourMessage.scheduledTime,
            completed: schedule.followUpTimers.fortyEightHourMessage.completed,
            cancelled: schedule.followUpTimers.fortyEightHourMessage.cancelled
          }
        }
      };

    } catch (error) {
      console.error('[FOLLOW-UP] Error getting follow-up status:', error);
      return { exists: false, error: error.message };
    }
  }
}

// Export singleton instance
const followUpService = new FollowUpService();
module.exports = followUpService;
