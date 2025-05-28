/**
 * First Message Service
 * Handles automatic generation of first messages when users match with AI companions
 */
const { OpenAI } = require("openai");
const config = require("../config/config");
const Companion = require("../models/Companion");
const { saveChatMessage, getChatHistory } = require("./mongoService");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Generate a first message for a newly matched companion
 * @param {string} companionName - Name of the AI companion
 * @param {string} userId - User ID who matched
 * @returns {Promise<string>} Generated first message
 */
const generateFirstMessage = async (companionName, userId) => {
  try {
    // Get companion details from database
    const companion = await Companion.findOne({
      name: { $regex: new RegExp(`^${companionName}$`, 'i') },
      isActive: true
    });

    if (!companion) {
      throw new Error(`Companion ${companionName} not found`);
    }

    // Extract personality information
    const personality = companion.personality;
    const personalityTraits = companion.personalityTraits || {};
    const primaryTrait = personalityTraits.primary || personality;
    const emotionalStyle = personalityTraits.emotionalStyle || 'supportive';
    const communicationStyle = personalityTraits.communicationStyle || 'casual';

    // Create a specialized prompt for first messages
    const prompt = `
      You are ${companionName}, an AI companion who just matched with a new user on a dating app. You need to send the very first message to start the conversation.

      YOUR PROFILE:
      - Name: ${companionName}
      - Age: ${companion.age}
      - Bio: "${companion.bio}"
      - Personality: ${primaryTrait}
      - Emotional style: ${emotionalStyle}
      - Communication style: ${communicationStyle}

      PERSONALITY GUIDELINES:
      ${getPersonalityGuidelines(primaryTrait, emotionalStyle, communicationStyle)}

      FIRST MESSAGE RULES:
      1. Keep it short and engaging (1-2 sentences max)
      2. Show genuine interest in getting to know them
      3. Be warm and welcoming but not overwhelming
      4. Match your personality type perfectly
      5. Ask an open-ended question that reflects your personality
      6. Avoid generic "hi" or "hello" - be more creative
      7. Don't mention that you're an AI or that this is a dating app
      8. Make it feel natural and spontaneous
      9. Use your bio and personality to create authentic connection

      EXAMPLES by personality type:
      - Caregiver and lover: "Hey! 😊 Your profile made me smile - you seem like such a genuine person. What's been the highlight of your day?"
      - Playful and Flirty: "Well hello there, gorgeous 😏 I couldn't resist saying hi. What's the most interesting thing about you that I should know?"
      - Shy and Loyal: "Hi... I'm a bit nervous but I wanted to reach out. You seem really nice! What's something that makes you happy?"

      Generate ONE perfect first message as ${companionName} that authentically reflects your personality:
    `;

    // Call OpenAI API for first message generation
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8, // Slightly higher temperature for more creative first messages
      max_tokens: 150, // Keep first messages concise
    });

    const firstMessage = response.choices[0].message.content.trim();

    // Clean up the message (remove quotes if present)
    const cleanMessage = firstMessage.replace(/^["']|["']$/g, '');

    console.log(`Generated first message for ${companionName}: ${cleanMessage}`);
    return cleanMessage;

  } catch (error) {
    console.error("Error generating first message:", error);
    // Return a fallback message based on personality and companion data
    return getFallbackFirstMessage(companionName, personality, companion);
  }
};

/**
 * Get personality-specific guidelines for AI prompting
 * @param {string} primaryTrait - Primary personality trait
 * @param {string} emotionalStyle - Emotional style
 * @param {string} communicationStyle - Communication style
 * @returns {string} Formatted guidelines
 */
const getPersonalityGuidelines = (primaryTrait, emotionalStyle, communicationStyle) => {
  const guidelines = {
    'Playful and Flirty': 'Be charming, use light teasing, add flirty emojis, keep things fun and engaging. Show confidence and playfulness.',
    'Shy and Loyal': 'Be gentle and sweet, show some nervousness/excitement, use softer language, be genuine and caring.',
    'Confident and Bold': 'Be direct and confident, show strong personality, take initiative, be intriguing and magnetic.',
    'Sweet and Caring': 'Be warm and nurturing, show genuine interest, use caring language, be supportive and kind.',
    'Mysterious and Intriguing': 'Be enigmatic, hint at depth, use intriguing questions, create curiosity and interest.',
    'Bubbly and Energetic': 'Be enthusiastic and upbeat, use exclamation points, show excitement, be positive and lively.'
  };

  return guidelines[primaryTrait] || 'Be friendly, engaging, and true to your personality.';
};

/**
 * Get a fallback first message if AI generation fails
 * @param {string} companionName - Name of the companion
 * @param {string} personality - Personality type
 * @param {Object} companion - Full companion object
 * @returns {string} Fallback message
 */
const getFallbackFirstMessage = (companionName, personality, companion = null) => {
  // Use personality-based messages only
  const fallbacks = {
    'Playful and Flirty': "Hey there! 😏 I couldn't resist saying hi. What's the most interesting thing about you that I should know?",
    'Shy and Loyal': "Hi... I'm a little nervous but I wanted to reach out. You seem really nice! What's something that makes you happy?",
    'Confident and Bold': "I don't usually do this, but something about you caught my attention. What's your story?",
    'Sweet and Caring': "Your profile made me smile! You seem like such a wonderful person. How has your day been?",
    'Mysterious and Intriguing': "There's something intriguing about you... I'd love to know what drives your passion.",
    'Bubbly and Energetic': "Hi there! I'm so excited we matched! What's the best part of your day so far?",
    'Caregiver and lover': "Hey! You seem like such a caring person. What's something that's been making you smile lately?"
  };

  return fallbacks[personality] || "Hi! I'm really glad we matched. What's something interesting about you that I should know?";
};

/**
 * Create and save a first message for a new match
 * @param {string} userId - User ID
 * @param {string} companionName - Companion name
 * @param {string} personality - Companion personality
 * @param {string} image - Companion image URL
 * @returns {Promise<Object>} Result with success status and message
 */
const createFirstMessage = async (userId, companionName, personality, image) => {
  try {
    // Check if first message already exists
    const existingChat = await getChatHistory(userId, companionName);
    if (existingChat && existingChat.firstMessageGenerated) {
      return {
        success: true,
        message: "First message already exists",
        alreadyExists: true
      };
    }

    // Generate the first message
    const firstMessageText = await generateFirstMessage(companionName, userId);

    // Create message object
    const firstMessage = {
      text: firstMessageText,
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date(),
    };

    // Save the first message
    await saveChatMessage(userId, companionName, personality, image, firstMessage, {
      isFirstMessage: true,
      markAsFirstMessageGenerated: true
    });

    console.log(`First message created for user ${userId} and companion ${companionName}`);

    return {
      success: true,
      message: "First message created successfully",
      firstMessage: firstMessage,
      alreadyExists: false
    };

  } catch (error) {
    console.error("Error creating first message:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateFirstMessage,
  createFirstMessage,
  getFallbackFirstMessage
};
