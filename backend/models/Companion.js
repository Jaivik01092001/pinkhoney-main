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
