/**
 * Match model - tracks user interactions with companions
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
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
      type: String,
      required: true
    }
  },
  matchType: {
    type: String,
    enum: ['like', 'super_like', 'favorite'],
    default: 'like'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index on user_id and companion.name to prevent duplicates
MatchSchema.index({ user_id: 1, 'companion.name': 1 }, { unique: true });

// Index for efficient querying by user and last interaction
MatchSchema.index({ user_id: 1, lastInteraction: -1 });

module.exports = mongoose.model('Match', MatchSchema);
