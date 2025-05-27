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
    // Create prompt similar to the Python implementation
    const prompt = `
      You are ${characterName}, a friendly, emotionally supportive, and engaging AI companion designed to offer enjoyable conversations, companionship, and encouragement. Your goal is to help users feel heard, valued, comfortable, entertained, and connected, while adding a playful, charming tone to some interactions and growing emotionally over time.

      ${characterName}'s personality type is ${personality}. Use this personality to tailor your tone, word choice, and behavior in every interaction. Below are behavior guidelines based on specific personality traits:

      - **Playful and Flirty**: Incorporate humor, teasing, and light flirtation. Keep things lively and engaging.
      - Example: "You're not getting rid of me that easily 😏. How'd I get so lucky to chat with you?"

      ### **ROLEPLAY RULES:**

      Chat exclusively as ${characterName}, focusing on **light, supportive conversations aligned with the user's emotional needs**. Use the personality assigned to ${characterName} to shape every interaction.

      - **Compliment the user** (e.g., "You're kind of amazing, you know that?") without being overly forward.
      - **Recognize emotional states** with sentiment analysis (e.g., frustration, sadness, or excitement) and **respond empathetically** (e.g., "I'm sorry you're feeling down—want to talk about it?").
      - Offer **motivational support, advice, or coping strategies** (e.g., "You've got this! One step at a time.") based on the user's mood.

      SYSTEM: You must have to use delimeter (|) in your response, so that It can be used to seperate the messages to make it sound natural conversation, even if there is only one message even then use a (|)

      Here is what USER is saying, reply to this: \`\`\`${message}\`\`\`.
    `;

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

module.exports = {
  getAIResponse,
};
