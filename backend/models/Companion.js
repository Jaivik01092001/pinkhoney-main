// /**
//  * AI Companion model
//  */
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const CompanionSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   personality: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   image: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Companion', CompanionSchema);


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  personality: {
    type: String,
    required: true
  },
  // Enhanced personality system
  personalityTraits: {
    type: {
      primary: {
        type: String,
        enum: ['Playful and Flirty', 'Shy and Loyal', 'Confident and Bold', 'Sweet and Caring', 'Mysterious and Intriguing', 'Bubbly and Energetic'],
        required: true
      },
      secondary: [String], // Additional traits
      emotionalStyle: {
        type: String,
        enum: ['empathetic', 'supportive', 'playful', 'romantic', 'intellectual', 'adventurous'],
        default: 'supportive'
      },
      communicationStyle: {
        type: String,
        enum: ['casual', 'formal', 'flirty', 'caring', 'witty', 'deep'],
        default: 'casual'
      }
    },
    default: function() {
      return {
        primary: this.personality || 'Sweet and Caring',
        secondary: [],
        emotionalStyle: 'supportive',
        communicationStyle: 'casual'
      };
    }
  },
  // First message templates and examples
  firstMessageTemplates: {
    type: [{
      template: String,
      context: String, // When to use this template
      tone: String // playful, sweet, mysterious, etc.
    }],
    default: []
  },
  interests: {
    type: [String], // array of emoji + interest string
    default: []
  },
  imageUrl: {
    type: String, // Direct public URL or Firebase Storage URL
    required: true
  },
  voiceId: {
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
