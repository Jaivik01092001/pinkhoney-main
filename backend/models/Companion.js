/**
 * AI Companion model
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  personality: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Companion', CompanionSchema);
