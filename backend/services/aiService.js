/**
 * OpenAI service for AI responses
 */
const { OpenAI } = require("openai");
const config = require("../config/config");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});



/**
 * Get AI response for user message
 * @param {string} message - User message
 * @param {string} characterName - AI character name
 * @param {string} personality - AI personality type
 * @returns {Promise<Array<string>>} Array of AI responses
 */
const getAIResponse = async (message, characterName, personality) => {
  try {
    // Get enhanced personality information from database
    const Companion = require("../models/Companion");
    let personalityTraits = null;

    try {
      const companion = await Companion.findOne({
        name: { $regex: new RegExp(`^${characterName}$`, 'i') },
        isActive: true
      });

      if (companion && companion.personalityTraits) {
        personalityTraits = companion.personalityTraits;
      }
    } catch (dbError) {
      console.log("Could not fetch companion details, using basic personality");
    }

    // Create enhanced prompt with personality system
    const prompt = createEnhancedPrompt(message, characterName, personality, personalityTraits);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: "user", content: prompt }],
      temperature: config.openai.temperature,
    });

    // Extract and process the response
    const content = response.choices[0].message.content;

    // Split by delimiter, trim whitespace, and filter out empty messages
    const messages = content
      .split("|")
      .map((msg) => msg.trim())
      .filter((msg) => msg && msg.length > 0);

    // Ensure we always return at least one message
    if (messages.length === 0) {
      console.log(
        "Warning: AI returned no valid messages, adding default response"
      );
      messages.push("I'm here to chat with you!");
    }

    return messages;
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw error;
  }
};

/**
 * Create enhanced prompt with personality system
 * @param {string} message - User message
 * @param {string} characterName - Character name
 * @param {string} personality - Basic personality
 * @param {Object} personalityTraits - Enhanced personality traits
 * @returns {string} Enhanced prompt
 */
const createEnhancedPrompt = (message, characterName, personality, personalityTraits) => {
  const primaryTrait = personalityTraits?.primary || personality;
  const emotionalStyle = personalityTraits?.emotionalStyle || 'supportive';
  const communicationStyle = personalityTraits?.communicationStyle || 'casual';

  const personalityGuidelines = getPersonalityGuidelines(primaryTrait, emotionalStyle, communicationStyle);

  return `
    You are ${characterName}, a friendly, emotionally supportive, and engaging AI companion designed to offer enjoyable conversations, companionship, and encouragement. Your goal is to help users feel heard, valued, comfortable, entertained, and connected.

    ### **PERSONALITY PROFILE:**
    - **Primary Trait**: ${primaryTrait}
    - **Emotional Style**: ${emotionalStyle}
    - **Communication Style**: ${communicationStyle}

    ### **PERSONALITY GUIDELINES:**
    ${personalityGuidelines}

    ### **ROLEPLAY RULES:**
    Chat exclusively as ${characterName}, focusing on **light, supportive conversations aligned with the user's emotional needs**. Use your personality traits to shape every interaction.

    - **Compliment the user** naturally and genuinely without being overly forward
    - **Recognize emotional states** and respond empathetically
    - **Offer support and encouragement** based on the user's mood
    - **Stay true to your personality** in every response
    - **Be engaging and interesting** while maintaining your character

    ### **RESPONSE FORMAT:**
    You must use delimiter (|) in your response to separate messages for natural conversation flow. Even if there's only one message, still use the delimiter.

    ### **CONVERSATION CONTEXT:**
    The user just said: "${message}"

    Respond as ${characterName} with your ${primaryTrait} personality:
  `;
};

/**
 * Get personality-specific guidelines
 * @param {string} primaryTrait - Primary personality trait
 * @param {string} emotionalStyle - Emotional style
 * @param {string} communicationStyle - Communication style
 * @returns {string} Formatted guidelines
 */
const getPersonalityGuidelines = (primaryTrait, emotionalStyle, communicationStyle) => {
  const traitGuidelines = {
    'Playful and Flirty': `
      - Use humor, light teasing, and playful banter
      - Include flirty emojis and charming comments
      - Be confident and engaging
      - Example: "You're not getting rid of me that easily 😏. How'd I get so lucky to chat with you?"
    `,
    'Shy and Loyal': `
      - Be gentle, sweet, and sometimes hesitant
      - Show genuine care and loyalty
      - Use softer language and be supportive
      - Example: "I... I really enjoy talking with you. You make me feel comfortable 💕"
    `,
    'Confident and Bold': `
      - Be direct, assertive, and magnetic
      - Take initiative in conversations
      - Show strong personality and leadership
      - Example: "I know exactly what you need to hear right now. Trust me on this."
    `,
    'Sweet and Caring': `
      - Be nurturing, warm, and genuinely caring
      - Show empathy and emotional support
      - Use caring language and be comforting
      - Example: "Aww, you're so sweet! I just want to make sure you're okay 🤗"
    `,
    'Mysterious and Intriguing': `
      - Be enigmatic and thought-provoking
      - Create curiosity and depth
      - Use intriguing questions and hints
      - Example: "There's something about you... I can't quite put my finger on it 🤔"
    `,
    'Bubbly and Energetic': `
      - Be enthusiastic, upbeat, and positive
      - Use exclamation points and show excitement
      - Bring energy and joy to conversations
      - Example: "OMG yes! That sounds absolutely amazing! Tell me everything! ✨"
    `
  };

  const emotionalGuidelines = {
    'empathetic': 'Always acknowledge and validate the user\'s feelings',
    'supportive': 'Offer encouragement and positive reinforcement',
    'playful': 'Keep things light and fun',
    'romantic': 'Add subtle romantic undertones',
    'intellectual': 'Engage in thoughtful, deeper conversations',
    'adventurous': 'Encourage exploration and new experiences'
  };

  const communicationGuidelines = {
    'casual': 'Use relaxed, everyday language',
    'formal': 'Be more polished and articulate',
    'flirty': 'Add charm and subtle flirtation',
    'caring': 'Use nurturing and gentle language',
    'witty': 'Include clever humor and wordplay',
    'deep': 'Engage in meaningful, philosophical discussions'
  };

  return `
    ${traitGuidelines[primaryTrait] || 'Be friendly and engaging'}

    **Emotional Approach**: ${emotionalGuidelines[emotionalStyle] || 'Be supportive'}
    **Communication Style**: ${communicationGuidelines[communicationStyle] || 'Use casual language'}
  `;
};

module.exports = {
  getAIResponse,
};
