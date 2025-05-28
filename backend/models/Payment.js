/**
 * Payment model
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    // Store amount in dollars (e.g., 99.96), not cents
    get: function(value) {
      return parseFloat(value.toFixed(2));
    },
    set: function(value) {
      return parseFloat(value.toFixed(2));
    }
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  stripeSessionId: {
    type: String
  },
  stripeCustomerId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  subscriptionPlan: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime', 'tokens'],
    required: true
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Payment', PaymentSchema);
