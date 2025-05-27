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
  }
}, {
  timestamps: true
});

// Create a compound index on user_id and companion.name
ChatHistorySchema.index({ user_id: 1, 'companion.name': 1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
