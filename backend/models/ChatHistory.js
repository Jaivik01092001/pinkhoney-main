/**
 * Chat History model
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  time: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatHistorySchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  companion: {
    name: {
      type: String,
      required: true
    },
    personality: {
      type: String,
      required: true
    },
    image: {
      type: String
    }
  },
  messages: [MessageSchema],
  // Message preview and status tracking
  lastMessage: {
    text: {
      type: String,
      default: ''
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      default: 'bot'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  // Track if this is the first conversation (for first message generation)
  isFirstConversation: {
    type: Boolean,
    default: true
  },
  // Track if first message has been generated
  firstMessageGenerated: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Conversation memory system
  conversationMemory: {
    // Long-term memory (persistent relationship data)
    longTermMemory: {
      userProfile: {
        personalDetails: {
          interests: [String],
          relationships: [String], // family, friends mentioned
          goals: [String],
          challenges: [String]
        },
        preferences: {
          communicationStyle: String,
          topicsTheyEnjoy: [String],
          topicsToAvoid: [String],
          preferredSupport: String // "practical", "emotional", "both"
        }
      },

      relationshipMilestones: [{
        milestone: String, // "first deep conversation", "shared vulnerability"
        date: Date,
        context: String,
        significance: Number // 1-5 importance level
      }],

      establishedPatterns: {
        insideJokes: [String],
        nicknames: [String],
        conversationRituals: [String] // "always asks about work first"
      },

      emotionalHistory: [{
        date: Date,
        userEmotion: String,
        aiResponse: String,
        outcome: String, // "helped", "comforted", "celebrated"
        effectiveness: Number // 1-5 how well AI responded
      }]
    },

    // Memory metadata
    memoryStats: {
      totalConversations: { type: Number, default: 0 },
      relationshipDepth: { type: Number, default: 1 }, // 1-10 scale
      lastMemoryUpdate: Date,
      memoryVersion: { type: String, default: "1.0" }
    }
  },

  // Memory processing flags
  needsMemoryUpdate: { type: Boolean, default: false },
  lastMemoryProcessed: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create a compound index on user_id and companion.name
ChatHistorySchema.index({ user_id: 1, 'companion.name': 1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
