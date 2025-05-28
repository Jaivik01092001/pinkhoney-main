# Follow-up Timing System

This document describes the automated follow-up timing system implemented for the AI companion dating app.

## 🎯 Overview

The follow-up system automatically manages timed interactions between AI companions and users based on conversation activity. It implements a sophisticated timing mechanism that triggers internal reflections and follow-up messages at specific intervals.

## ⏰ Timing Schedule

### **+12 Hours (No User Response)**
- **Action**: Internal reflection only (AI thinks privately, doesn't message)
- **Example**: *Shy and Introspective: {{char}} hopes {{user name}} will message her. She's too shy to message you again, but she's excited to hear from you.*
- **Display**: Gray italic text, internal only
- **Storage**: Saved in database but not sent to user

### **+24 Hours (No User Response)**
- **Action**: Direct outward follow-up message
- **Example**: "Hey {{user name}}, I already miss you. Let me know if you're okay when you get a chance."
- **Display**: Regular message in chat
- **Storage**: Saved to chat history and sent to user

### **+36 Hours (Only if both user + AI have messaged)**
- **Action**: Another internal reflection
- **Example**: *Thoughtful and Reflective: {{char}} wonders if maybe you got busy… or just lost interest. Either way, she still hopes he'll come back.*
- **Condition**: Requires both parties to have sent at least one message
- **Display**: Gray italic text, internal only

### **+48 Hours (Only if both user + AI have messaged)**
- **Action**: Another follow-up message
- **Example**: "I miss our chats, {{user name}}. Reach out when you can!"
- **Condition**: Requires both parties to have sent at least one message
- **Display**: Regular message in chat

## 🔄 Timer Reset Logic

### **When User Sends Any Message**
- ✅ Cancels any pending follow-ups for that cycle
- ✅ Resets the timer to start from zero
- ✅ Next follow-up waits 12h/24h again, based on no further replies
- ✅ Increments cycle counter

### **When AI Sends Message**
- ✅ Updates conversation state
- ✅ Does not reset timers (only user messages reset timers)
- ✅ Tracks that AI has participated in conversation

## 🏗️ Technical Architecture

### **Core Components**

1. **FollowUpService** (`backend/services/followUpService.js`)
   - Main service managing all follow-up logic
   - Handles scheduling, execution, and timer management
   - Uses node-cron for precise timing

2. **FollowUpSchedule Model** (`backend/models/FollowUpSchedule.js`)
   - Database model storing timer states and schedules
   - Tracks conversation metrics and timing data
   - Manages timer cancellation and reset logic

3. **ChatHistory Integration** (`backend/models/ChatHistory.js`)
   - Extended with follow-up tracking fields
   - Automatically updates follow-up metrics
   - Links chat activity to timer management

4. **Follow-up Controller** (`backend/controllers/followUpController.js`)
   - API endpoints for follow-up management
   - Handles schedule creation, reset, and status queries
   - Includes admin and testing endpoints

### **Database Schema**

#### FollowUpSchedule Collection
```javascript
{
  user_id: String,
  companion_name: String,
  followUpTimers: {
    twelveHourReflection: { scheduledTime, completed, cancelled, reflectionText },
    twentyFourHourMessage: { scheduledTime, completed, cancelled, messageText },
    thirtySixHourReflection: { scheduledTime, completed, cancelled, reflectionText },
    fortyEightHourMessage: { scheduledTime, completed, cancelled, messageText }
  },
  conversationState: {
    lastUserMessageTime, lastBotMessageTime, bothHaveMessaged,
    totalUserMessages, totalBotMessages
  },
  timerState: {
    isActive, lastResetTime, currentCycle, nextScheduledAction
  }
}
```

#### ChatHistory Extensions
```javascript
{
  followUpTracking: {
    hasFollowUpSchedule: Boolean,
    lastFollowUpReset: Date,
    followUpCycle: Number,
    conversationMetrics: {
      userMessageCount, botMessageCount,
      lastUserActivity, lastBotActivity, bothParticipated
    }
  }
}
```

## 🚀 API Endpoints

### **POST /api/follow-up/create**
Create or reset follow-up schedule for a user-companion pair
```json
{
  "user_id": "string",
  "companion_name": "string",
  "reset_existing": "boolean (optional)"
}
```

### **POST /api/follow-up/reset**
Reset follow-up timers when user sends a message
```json
{
  "user_id": "string",
  "companion_name": "string",
  "is_user_message": "boolean (optional, default: true)"
}
```

### **GET /api/follow-up/status**
Get follow-up schedule status
```
Query params: user_id, companion_name
```

### **POST /api/follow-up/trigger** (Development only)
Manually trigger a follow-up action for testing
```json
{
  "user_id": "string",
  "companion_name": "string",
  "action_type": "12h_reflection|24h_message|36h_reflection|48h_message"
}
```

### **GET /api/follow-up/health**
Health check for follow-up service

## 🔧 Integration Points

### **Message Saving Integration**
The system automatically integrates with the existing `saveChatMessage` function:
- User messages trigger timer resets
- Bot messages update conversation state
- Follow-up schedules are created automatically

### **AI Response Generation**
Follow-up messages and reflections use OpenAI with personality-aware prompts:
- Maintains character consistency
- Considers conversation context
- Adapts to timeframe (12h vs 48h)

### **Cron Scheduling**
- Runs every minute to check for due follow-ups
- Handles server restarts gracefully
- Marks overdue timers as cancelled

## 🛠️ Configuration

### **Environment Variables**
- Uses existing OpenAI configuration
- No additional environment variables required

### **Timing Adjustments**
To modify timing intervals, update the `scheduleNextFollowUp` method in `FollowUpSchedule.js`:
```javascript
// Current: 12, 24, 36, 48 hours
// Modify these values as needed
timers.twelveHourReflection.scheduledTime = new Date(baseTime.getTime() + (12 * 60 * 60 * 1000));
```

## 🧪 Testing

### **Manual Testing**
Use the trigger endpoint to test follow-up actions:
```bash
POST /api/follow-up/trigger
{
  "user_id": "test_user",
  "companion_name": "Emma",
  "action_type": "24h_message"
}
```

### **Health Monitoring**
Check service status:
```bash
GET /api/follow-up/health
```

### **Admin Monitoring**
View all active schedules (development only):
```bash
GET /api/follow-up/admin/schedules
```

## 🔍 Monitoring & Debugging

### **Logs**
The system provides detailed logging with `[FOLLOW-UP]` prefix:
- Schedule creation/updates
- Timer executions
- Error handling
- Service initialization

### **Database Queries**
Monitor follow-up activity by querying the `followupschedules` collection:
```javascript
// Active schedules
db.followupschedules.find({"timerState.isActive": true})

// Due timers
db.followupschedules.find({
  "followUpTimers.twentyFourHourMessage.scheduledTime": {$lte: new Date()},
  "followUpTimers.twentyFourHourMessage.completed": false
})
```

## 🚨 Error Handling

### **Graceful Degradation**
- Message saving continues even if follow-up updates fail
- OpenAI failures fall back to predefined messages
- Server restarts handle existing schedules appropriately

### **Overdue Timer Management**
- Timers more than 1 hour overdue are marked as cancelled
- Prevents spam from accumulated missed timers
- Maintains system stability during downtime

## 📈 Future Enhancements

### **Potential Improvements**
1. **User Preferences**: Allow users to customize timing intervals
2. **Smart Scheduling**: Adjust timing based on user activity patterns
3. **Rich Reflections**: Include mood tracking and emotional state
4. **Analytics**: Track follow-up effectiveness and engagement
5. **Timezone Support**: Schedule based on user's local time

### **Scalability Considerations**
- Current implementation handles moderate user loads
- For high-scale deployment, consider:
  - Redis for timer management
  - Queue-based processing
  - Distributed cron scheduling
