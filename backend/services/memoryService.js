/**
 * Conversation Memory Service
 * Handles memory processing and retrieval for AI companions
 */
const { OpenAI } = require("openai");
const config = require("../config/config");
const ChatHistory = require("../models/ChatHistory");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

class ConversationMemoryService {
  /**
   * Extract and update memory from conversation
   */
  async processConversationMemory(userId, companionName, newMessages) {
    try {
      const chatHistory = await ChatHistory.findOne({
        user_id: userId,
        "companion.name": companionName
      });

      if (!chatHistory) return;

      // Extract information from recent messages
      const memoryUpdates = await this.extractMemoryFromMessages(newMessages, chatHistory);
      
      // Update memory in database
      await this.updateConversationMemory(chatHistory, memoryUpdates);
      
      console.log(`Memory updated for ${userId} - ${companionName}`);
    } catch (error) {
      console.error("Error processing conversation memory:", error);
    }
  }

  /**
   * Extract memory-worthy information from messages
   */
  async extractMemoryFromMessages(messages, existingHistory) {
    const conversationText = messages
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');

    const existingMemory = existingHistory.conversationMemory?.longTermMemory || {};

    const memoryExtractionPrompt = `
      Analyze this conversation and extract important information to remember:

      CONVERSATION:
      ${conversationText}

      EXISTING MEMORY CONTEXT:
      User Details: ${JSON.stringify(existingMemory.userProfile || {})}
      Relationship Patterns: ${JSON.stringify(existingMemory.establishedPatterns || {})}

      Extract and return JSON with:
      {
        "personalDetails": {
          "newFacts": ["any new personal information about user"],
          "interests": ["new interests mentioned"],
          "relationships": ["family/friends mentioned"],
          "goals": ["aspirations or goals shared"],
          "challenges": ["problems or struggles mentioned"]
        },
        "emotionalMoments": [{
          "emotion": "user's emotion",
          "context": "what caused it",
          "aiResponse": "how AI responded",
          "significance": 1-5
        }],
        "conversationPatterns": {
          "newJokes": ["any inside jokes or funny moments"],
          "nicknames": ["terms of endearment used"],
          "rituals": ["conversation patterns established"]
        },
        "topics": ["main topics discussed"],
        "relationshipProgression": "how relationship deepened (if at all)"
      }

      Only include NEW information not already in existing memory. Return empty arrays if nothing new.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: "user", content: memoryExtractionPrompt }],
        temperature: 0.3,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Error extracting memory:", error);
      return {};
    }
  }

  /**
   * Update conversation memory in database
   */
  async updateConversationMemory(chatHistory, memoryUpdates) {
    const memory = chatHistory.conversationMemory || {
      longTermMemory: { 
        userProfile: { personalDetails: {}, preferences: {} }, 
        relationshipMilestones: [], 
        establishedPatterns: {}, 
        emotionalHistory: [] 
      },
      recentContext: { lastNMessages: [], currentSessionThemes: [] },
      memoryStats: { totalConversations: 0, relationshipDepth: 1 }
    };

    // Update user profile
    if (memoryUpdates.personalDetails) {
      const currentDetails = memory.longTermMemory.userProfile.personalDetails || {};
      memory.longTermMemory.userProfile.personalDetails = {
        ...currentDetails,
        interests: [...(currentDetails.interests || []), ...(memoryUpdates.personalDetails.interests || [])],
        relationships: [...(currentDetails.relationships || []), ...(memoryUpdates.personalDetails.relationships || [])],
        goals: [...(currentDetails.goals || []), ...(memoryUpdates.personalDetails.goals || [])],
        challenges: [...(currentDetails.challenges || []), ...(memoryUpdates.personalDetails.challenges || [])]
      };
    }

    // Update emotional history
    if (memoryUpdates.emotionalMoments && memoryUpdates.emotionalMoments.length > 0) {
      memory.longTermMemory.emotionalHistory.push(...memoryUpdates.emotionalMoments.map(moment => ({
        ...moment,
        date: new Date()
      })));
    }

    // Update conversation patterns
    if (memoryUpdates.conversationPatterns) {
      const currentPatterns = memory.longTermMemory.establishedPatterns || {};
      memory.longTermMemory.establishedPatterns = {
        ...currentPatterns,
        insideJokes: [...(currentPatterns.insideJokes || []), ...(memoryUpdates.conversationPatterns.newJokes || [])],
        nicknames: [...(currentPatterns.nicknames || []), ...(memoryUpdates.conversationPatterns.nicknames || [])],
        conversationRituals: [...(currentPatterns.conversationRituals || []), ...(memoryUpdates.conversationPatterns.rituals || [])]
      };
    }

    // Update relationship depth
    if (memoryUpdates.relationshipProgression) {
      memory.memoryStats.relationshipDepth = Math.min(10, memory.memoryStats.relationshipDepth + 0.5);
      memory.longTermMemory.relationshipMilestones.push({
        milestone: memoryUpdates.relationshipProgression,
        date: new Date(),
        significance: 3
      });
    }

    // Update memory stats
    memory.memoryStats.totalConversations += 1;
    memory.memoryStats.lastMemoryUpdate = new Date();

    // Save to database
    await ChatHistory.findByIdAndUpdate(chatHistory._id, {
      conversationMemory: memory,
      lastMemoryProcessed: new Date()
    });
  }

  /**
   * Get relevant memory context for AI response
   */
  async getMemoryContext(userId, companionName, currentMessage) {
    try {
      const chatHistory = await ChatHistory.findOne({
        user_id: userId,
        "companion.name": companionName
      });

      if (!chatHistory?.conversationMemory) {
        return { recentContext: "", longTermContext: "", relationshipContext: "" };
      }

      const memory = chatHistory.conversationMemory;

      // Recent context (last 10 messages)
      const recentMessages = chatHistory.messages.slice(-10);
      const recentContext = recentMessages.length > 0 
        ? recentMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n')
        : "No recent conversation history";

      // Long-term memory context
      const userProfile = memory.longTermMemory.userProfile || {};
      const personalDetails = userProfile.personalDetails || {};
      
      const longTermContext = `
        USER PROFILE:
        - Interests: ${personalDetails.interests?.join(', ') || 'None recorded'}
        - Goals: ${personalDetails.goals?.join(', ') || 'None recorded'}
        - Challenges: ${personalDetails.challenges?.join(', ') || 'None recorded'}
        - Relationships: ${personalDetails.relationships?.join(', ') || 'None recorded'}
      `;

      // Relationship context
      const patterns = memory.longTermMemory.establishedPatterns || {};
      const relationshipContext = `
        RELATIONSHIP PATTERNS:
        - Inside jokes: ${patterns.insideJokes?.join(', ') || 'None'}
        - Nicknames: ${patterns.nicknames?.join(', ') || 'None'}
        - Conversation rituals: ${patterns.conversationRituals?.join(', ') || 'None'}
        - Relationship depth: ${memory.memoryStats?.relationshipDepth || 1}/10
        - Total conversations: ${memory.memoryStats?.totalConversations || 0}
      `;

      return { recentContext, longTermContext, relationshipContext };
    } catch (error) {
      console.error("Error getting memory context:", error);
      return { recentContext: "", longTermContext: "", relationshipContext: "" };
    }
  }

  /**
   * Process memory after conversation (call this after saving new messages)
   */
  async processMemoryAfterConversation(userId, companionName) {
    try {
      const chatHistory = await ChatHistory.findOne({
        user_id: userId,
        "companion.name": companionName
      });

      if (!chatHistory || chatHistory.messages.length < 2) return;

      // Get last few messages for memory processing
      const recentMessages = chatHistory.messages.slice(-4); // Last 4 messages
      
      if (recentMessages.length > 0) {
        await this.processConversationMemory(userId, companionName, recentMessages);
      }
    } catch (error) {
      console.error("Error processing memory after conversation:", error);
    }
  }
}

module.exports = new ConversationMemoryService();
