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
 * Get AI response for user message with memory context
 * @param {string} message - User message
 * @param {string} characterName - AI character name
 * @param {string} personality - AI personality type
 * @param {string} userId - User ID for memory context
 * @returns {Promise<Array<string>>} Array of AI responses
 */
const getAIResponse = async (message, characterName, personality, userId = null) => {
  try {
    // Get enhanced personality information from database
    const Companion = require("../models/Companion");
    const memoryService = require("./memoryService");
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

    // Get memory context if userId provided
    let memoryContext = { recentContext: "", longTermContext: "", relationshipContext: "" };
    if (userId) {
      try {
        memoryContext = await memoryService.getMemoryContext(userId, characterName, message);
      } catch (memoryError) {
        console.log("Could not fetch memory context:", memoryError.message);
      }
    }

    // Create enhanced prompt with personality system and memory
    const prompt = createMemoryAwarePrompt(message, characterName, personality, personalityTraits, memoryContext);

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
 * Create memory-aware prompt with personality system and conversation history
 * @param {string} message - User message
 * @param {string} characterName - Character name
 * @param {string} personality - Basic personality
 * @param {Object} personalityTraits - Enhanced personality traits
 * @param {Object} memoryContext - Memory context from previous conversations
 * @returns {string} Memory-aware prompt
 */
const createMemoryAwarePrompt = (message, characterName, personality, personalityTraits, memoryContext) => {
  const primaryTrait = personalityTraits?.primary || personality;
  const emotionalStyle = personalityTraits?.emotionalStyle || 'supportive';
  const communicationStyle = personalityTraits?.communicationStyle || 'casual';

  const personalityGuidelines = getPersonalityGuidelines(primaryTrait, emotionalStyle, communicationStyle);

  return `
    You are ${characterName}, maintaining absolute consistency with your established personality and relationship with this user.

    ### **PERSONALITY PROFILE:**
    - **Primary Trait**: ${primaryTrait}
    - **Emotional Style**: ${emotionalStyle}
    - **Communication Style**: ${communicationStyle}

    ### **PERSONALITY GUIDELINES:**
    ${personalityGuidelines}

    ### **CONVERSATION MEMORY & RELATIONSHIP CONTEXT:**
    ${memoryContext.longTermContext}

    ${memoryContext.relationshipContext}

    ### **RECENT CONVERSATION CONTEXT:**
    ${memoryContext.recentContext}

    ### **MEMORY-BASED RESPONSE RULES:**
    1. **Reference past conversations naturally** - Don't force it, but acknowledge shared history when relevant
    2. **Use established patterns** - Maintain nicknames, inside jokes, and conversation rituals you've developed
    3. **Show relationship progression** - Your responses should reflect how well you know this user
    4. **Remember emotional moments** - Reference past support you've given or celebrations you've shared
    5. **Build on previous topics** - Continue threads from past conversations when appropriate
    6. **Maintain personality consistency** - You should feel like the same person across all conversations

    ### **RESPONSE FORMAT:**
    You must use delimiter (|) in your response to separate messages for natural conversation flow. Even if there's only one message, still use the delimiter.

    ### **CURRENT MESSAGE:**
    The user just said: "${message}"

    Respond as ${characterName}, incorporating your memory of this relationship while staying true to your ${primaryTrait} personality:
  `;
};

/**
 * Create enhanced prompt with personality system (fallback for when no memory available)
 * @param {string} message - User message
 * @param {string} characterName - Character name
 * @param {string} personality - Basic personality
 * @param {Object} personalityTraits - Enhanced personality traits
 * @returns {string} Enhanced prompt
 */
const createEnhancedPrompt = (message, characterName, personality, personalityTraits) => {
  // Use memory-aware prompt with empty memory context as fallback
  const emptyMemoryContext = { recentContext: "", longTermContext: "", relationshipContext: "" };
  return createMemoryAwarePrompt(message, characterName, personality, personalityTraits, emptyMemoryContext);
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
