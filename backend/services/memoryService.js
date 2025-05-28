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
      console.log(`[MEMORY] Processing conversation memory for ${userId} - ${companionName}`);
      console.log(`[MEMORY] Processing ${newMessages.length} messages`);

      const chatHistory = await ChatHistory.findOne({
        user_id: userId,
        "companion.name": companionName
      });

      if (!chatHistory) {
        console.log(`[MEMORY] No chat history found for ${userId} - ${companionName}`);
        return;
      }

      console.log(`[MEMORY] Found chat history, extracting memory from messages...`);

      // Extract information from recent messages
      const memoryUpdates = await this.extractMemoryFromMessages(newMessages, chatHistory);

      console.log(`[MEMORY] Memory extraction completed, updating database...`);

      // Update memory in database
      await this.updateConversationMemory(chatHistory, memoryUpdates);

      console.log(`[MEMORY] Memory processing completed for ${userId} - ${companionName}`);
    } catch (error) {
      console.error(`[MEMORY] Error processing conversation memory for ${userId} - ${companionName}:`, error);
      console.error(`[MEMORY] Stack trace:`, error.stack);
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

    // Simplified and more reliable memory extraction prompt
    const memoryExtractionPrompt = `
You are a memory extraction system. Analyze this conversation and extract important information.

CONVERSATION:
${conversationText}

EXISTING MEMORY:
${JSON.stringify(existingMemory, null, 2)}

Extract new information and return ONLY a valid JSON object with this exact structure:
{
  "personalDetails": {
    "interests": [],
    "relationships": [],
    "goals": [],
    "challenges": []
  },
  "conversationPatterns": {
    "nicknames": [],
    "newJokes": [],
    "rituals": []
  },
  "emotionalMoments": [],
  "topics": [],
  "relationshipProgression": ""
}

IMPORTANT RULES:
1. Only include NEW information not in existing memory
2. Use empty arrays [] for no new information
3. Use empty string "" for no relationship progression
4. Return ONLY the JSON object, no explanations
5. Ensure all field names match exactly
6. ALL VALUES MUST BE STRINGS - do not use objects or nested structures
7. For relationships, use format: "sister: Sarah (studying medicine)"
8. For interests, use simple strings: "guitar", "music"
9. For nicknames, use simple strings: "Ace", "buddy"

Focus on:
- Nicknames or terms of endearment used
- Personal details shared by the user
- Emotional moments or connections
- Inside jokes or recurring themes

EXAMPLE CORRECT FORMAT:
{
  "personalDetails": {
    "interests": ["guitar", "music"],
    "relationships": ["sister: Sarah (studying medicine)"],
    "goals": ["learn piano"],
    "challenges": ["time management"]
  },
  "conversationPatterns": {
    "nicknames": ["Ace"],
    "newJokes": ["that guitar joke"],
    "rituals": ["always asks about music"]
  },
  "emotionalMoments": [],
  "topics": ["music", "family"],
  "relationshipProgression": "shared personal family information"
}
`;

    try {
      console.log(`[MEMORY] Processing ${messages.length} messages for memory extraction`);

      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: "user", content: memoryExtractionPrompt }],
        temperature: 0.1, // Lower temperature for more consistent JSON
        max_tokens: 800
      });

      let content = response.choices[0].message.content.trim();
      //console.log(`[MEMORY] Raw OpenAI response: ${content.substring(0, 200)}...`);

      // More aggressive cleanup of markdown and formatting
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      content = content.replace(/`/g, '');
      content = content.replace(/^\s*[\r\n]+/gm, ''); // Remove empty lines

      // Find JSON object boundaries
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("[MEMORY] No valid JSON object found in response");
        return this.getEmptyMemoryUpdate();
      }

      content = content.substring(jsonStart, jsonEnd + 1);
      // console.log(`[MEMORY] Cleaned content: ${content}`);

      const memoryUpdates = JSON.parse(content);

      // Validate the structure
      if (!this.validateMemoryStructure(memoryUpdates)) {
        console.error("[MEMORY] Invalid memory structure returned");
        return this.getEmptyMemoryUpdate();
      }

      //console.log(`[MEMORY] Successfully extracted memory:`, JSON.stringify(memoryUpdates, null, 2));
      return memoryUpdates;

    } catch (error) {
      console.error("[MEMORY] Error extracting memory:", error.message);
      if (error.name === 'SyntaxError') {
        console.error("[MEMORY] JSON Parse Error - Raw content:", response?.choices?.[0]?.message?.content);
      }
      return this.getEmptyMemoryUpdate();
    }
  }

  /**
   * Get empty memory update structure
   */
  getEmptyMemoryUpdate() {
    return {
      personalDetails: {
        interests: [],
        relationships: [],
        goals: [],
        challenges: []
      },
      conversationPatterns: {
        nicknames: [],
        newJokes: [],
        rituals: []
      },
      emotionalMoments: [],
      topics: [],
      relationshipProgression: ""
    };
  }

  /**
   * Validate memory update structure and ensure all values are strings
   */
  validateMemoryStructure(memoryUpdates) {
    if (!memoryUpdates || typeof memoryUpdates !== 'object') return false;

    const requiredFields = ['personalDetails', 'conversationPatterns', 'emotionalMoments', 'topics', 'relationshipProgression'];

    for (const field of requiredFields) {
      if (!(field in memoryUpdates)) {
        console.error(`[MEMORY] Missing required field: ${field}`);
        return false;
      }
    }

    // Validate personalDetails structure
    if (!memoryUpdates.personalDetails || typeof memoryUpdates.personalDetails !== 'object') return false;
    const personalDetailsFields = ['interests', 'relationships', 'goals', 'challenges'];
    for (const field of personalDetailsFields) {
      if (!Array.isArray(memoryUpdates.personalDetails[field])) {
        console.error(`[MEMORY] Invalid personalDetails.${field} - should be array`);
        return false;
      }
      // Ensure all items in arrays are strings or can be converted to strings
      memoryUpdates.personalDetails[field] = memoryUpdates.personalDetails[field].map(item => {
        if (typeof item === 'object' && item !== null) {
          console.warn(`[MEMORY] Converting object to string in personalDetails.${field}:`, item);
          return JSON.stringify(item);
        }
        return String(item);
      });
    }

    // Validate conversationPatterns structure
    if (!memoryUpdates.conversationPatterns || typeof memoryUpdates.conversationPatterns !== 'object') return false;
    const patternFields = ['nicknames', 'newJokes', 'rituals'];
    for (const field of patternFields) {
      if (!Array.isArray(memoryUpdates.conversationPatterns[field])) {
        console.error(`[MEMORY] Invalid conversationPatterns.${field} - should be array`);
        return false;
      }
      // Ensure all items in arrays are strings
      memoryUpdates.conversationPatterns[field] = memoryUpdates.conversationPatterns[field].map(item => {
        if (typeof item === 'object' && item !== null) {
          console.warn(`[MEMORY] Converting object to string in conversationPatterns.${field}:`, item);
          return JSON.stringify(item);
        }
        return String(item);
      });
    }

    // Validate topics array
    if (Array.isArray(memoryUpdates.topics)) {
      memoryUpdates.topics = memoryUpdates.topics.map(item => String(item));
    }

    // Validate emotionalMoments array
    if (Array.isArray(memoryUpdates.emotionalMoments)) {
      memoryUpdates.emotionalMoments = memoryUpdates.emotionalMoments.map(item => {
        if (typeof item === 'object' && item !== null) {
          return JSON.stringify(item);
        }
        return String(item);
      });
    }

    return true;
  }

  /**
   * Update conversation memory in database
   */
  async updateConversationMemory(chatHistory, memoryUpdates) {
    //console.log(`[MEMORY] Updating conversation memory with:`, JSON.stringify(memoryUpdates, null, 2));

    // Initialize memory structure if it doesn't exist
    const memory = chatHistory.conversationMemory || {
      longTermMemory: {
        userProfile: {
          personalDetails: { interests: [], relationships: [], goals: [], challenges: [] },
          preferences: {}
        },
        relationshipMilestones: [],
        establishedPatterns: { insideJokes: [], nicknames: [], conversationRituals: [] },
        emotionalHistory: []
      },
      recentContext: { lastNMessages: [], currentSessionThemes: [] },
      memoryStats: { totalConversations: 0, relationshipDepth: 1 }
    };

    let hasNewMemory = false;

    // Update user profile with new personal details
    if (memoryUpdates.personalDetails) {
      const currentDetails = memory.longTermMemory.userProfile.personalDetails || { interests: [], relationships: [], goals: [], challenges: [] };

      // Add new interests (avoid duplicates)
      if (memoryUpdates.personalDetails.interests && memoryUpdates.personalDetails.interests.length > 0) {
        const newInterests = memoryUpdates.personalDetails.interests.filter(interest =>
          !currentDetails.interests.includes(interest)
        );
        if (newInterests.length > 0) {
          currentDetails.interests.push(...newInterests);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new interests: ${newInterests.join(', ')}`);
        }
      }

      // Add new relationships (avoid duplicates) - handle both string and object formats
      if (memoryUpdates.personalDetails.relationships && memoryUpdates.personalDetails.relationships.length > 0) {
        const processedRelationships = memoryUpdates.personalDetails.relationships.map(rel => {
          // If it's an object, convert to string format
          if (typeof rel === 'object' && rel !== null) {
            if (rel.name && rel.relation) {
              return `${rel.relation}: ${rel.name}${rel.details ? ` (${rel.details})` : ''}`;
            } else {
              return JSON.stringify(rel);
            }
          }
          // If it's already a string, use as is
          return String(rel);
        });

        const newRelationships = processedRelationships.filter(rel =>
          !currentDetails.relationships.includes(rel)
        );
        if (newRelationships.length > 0) {
          currentDetails.relationships.push(...newRelationships);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new relationships: ${newRelationships.join(', ')}`);
        }
      }

      // Add new goals (avoid duplicates)
      if (memoryUpdates.personalDetails.goals && memoryUpdates.personalDetails.goals.length > 0) {
        const newGoals = memoryUpdates.personalDetails.goals.filter(goal =>
          !currentDetails.goals.includes(goal)
        );
        if (newGoals.length > 0) {
          currentDetails.goals.push(...newGoals);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new goals: ${newGoals.join(', ')}`);
        }
      }

      // Add new challenges (avoid duplicates)
      if (memoryUpdates.personalDetails.challenges && memoryUpdates.personalDetails.challenges.length > 0) {
        const newChallenges = memoryUpdates.personalDetails.challenges.filter(challenge =>
          !currentDetails.challenges.includes(challenge)
        );
        if (newChallenges.length > 0) {
          currentDetails.challenges.push(...newChallenges);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new challenges: ${newChallenges.join(', ')}`);
        }
      }

      memory.longTermMemory.userProfile.personalDetails = currentDetails;
    }

    // Update emotional history
    if (memoryUpdates.emotionalMoments && Array.isArray(memoryUpdates.emotionalMoments) && memoryUpdates.emotionalMoments.length > 0) {
      const newEmotionalMoments = memoryUpdates.emotionalMoments.map(moment => ({
        ...moment,
        date: new Date()
      }));
      memory.longTermMemory.emotionalHistory.push(...newEmotionalMoments);
      hasNewMemory = true;
      console.log(`[MEMORY] Added ${newEmotionalMoments.length} emotional moments`);
    }

    // Update conversation patterns
    if (memoryUpdates.conversationPatterns) {
      const currentPatterns = memory.longTermMemory.establishedPatterns || { insideJokes: [], nicknames: [], conversationRituals: [] };

      // Add new nicknames (avoid duplicates)
      if (memoryUpdates.conversationPatterns.nicknames && memoryUpdates.conversationPatterns.nicknames.length > 0) {
        const newNicknames = memoryUpdates.conversationPatterns.nicknames.filter(nickname =>
          !currentPatterns.nicknames.includes(nickname)
        );
        if (newNicknames.length > 0) {
          currentPatterns.nicknames.push(...newNicknames);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new nicknames: ${newNicknames.join(', ')}`);
        }
      }

      // Add new jokes (avoid duplicates)
      if (memoryUpdates.conversationPatterns.newJokes && memoryUpdates.conversationPatterns.newJokes.length > 0) {
        const newJokes = memoryUpdates.conversationPatterns.newJokes.filter(joke =>
          !currentPatterns.insideJokes.includes(joke)
        );
        if (newJokes.length > 0) {
          currentPatterns.insideJokes.push(...newJokes);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new inside jokes: ${newJokes.join(', ')}`);
        }
      }

      // Add new rituals (avoid duplicates)
      if (memoryUpdates.conversationPatterns.rituals && memoryUpdates.conversationPatterns.rituals.length > 0) {
        const newRituals = memoryUpdates.conversationPatterns.rituals.filter(ritual =>
          !currentPatterns.conversationRituals.includes(ritual)
        );
        if (newRituals.length > 0) {
          currentPatterns.conversationRituals.push(...newRituals);
          hasNewMemory = true;
          console.log(`[MEMORY] Added new conversation rituals: ${newRituals.join(', ')}`);
        }
      }

      memory.longTermMemory.establishedPatterns = currentPatterns;
    }

    // Update relationship progression
    if (memoryUpdates.relationshipProgression && memoryUpdates.relationshipProgression.trim() !== "") {
      memory.memoryStats.relationshipDepth = Math.min(10, memory.memoryStats.relationshipDepth + 0.5);
      memory.longTermMemory.relationshipMilestones.push({
        milestone: memoryUpdates.relationshipProgression,
        date: new Date(),
        significance: 3
      });
      hasNewMemory = true;
      console.log(`[MEMORY] Added relationship milestone: ${memoryUpdates.relationshipProgression}`);
    }

    // Only update stats and save if we actually have new memory
    if (hasNewMemory) {
      memory.memoryStats.totalConversations += 1;
      memory.memoryStats.lastMemoryUpdate = new Date();

      console.log(`[MEMORY] Saving updated memory to database for chat ${chatHistory._id}`);

      // Save to database with error handling
      try {
        await ChatHistory.findByIdAndUpdate(chatHistory._id, {
          conversationMemory: memory,
          lastMemoryProcessed: new Date()
        });
        console.log(`[MEMORY] Successfully saved memory updates to database`);
      } catch (saveError) {
        console.error(`[MEMORY] Error saving memory to database:`, saveError);
        throw saveError;
      }
    } else {
      console.log(`[MEMORY] No new memory to save - skipping database update`);
      // Still update the lastMemoryProcessed timestamp to avoid reprocessing
      await ChatHistory.findByIdAndUpdate(chatHistory._id, {
        lastMemoryProcessed: new Date()
      });
    }
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
      console.log(`[MEMORY] Starting memory processing for user ${userId} and companion ${companionName}`);

      const chatHistory = await ChatHistory.findOne({
        user_id: userId,
        "companion.name": companionName
      });

      if (!chatHistory) {
        console.log(`[MEMORY] No chat history found for user ${userId} and companion ${companionName}`);
        return;
      }

      console.log(`[MEMORY] Found chat history with ${chatHistory.messages.length} messages`);

      // Process memory even with just 1 message (for first interactions)
      if (chatHistory.messages.length < 1) {
        console.log(`[MEMORY] Not enough messages for memory processing`);
        return;
      }

      // Get last few messages for memory processing (minimum 2, maximum 6)
      const messageCount = Math.min(6, Math.max(2, chatHistory.messages.length));
      const recentMessages = chatHistory.messages.slice(-messageCount);

      console.log(`[MEMORY] Processing last ${recentMessages.length} messages for memory extraction`);

      if (recentMessages.length > 0) {
        await this.processConversationMemory(userId, companionName, recentMessages);
      }
    } catch (error) {
      console.error("[MEMORY] Error processing memory after conversation:", error);
      console.error("[MEMORY] Stack trace:", error.stack);
    }
  }

  /**
   * Debug method to get memory status for a user-companion pair
   */
  async getMemoryDebugInfo(userId, companionName) {
    try {
      const chatHistory = await ChatHistory.findOne({
        user_id: userId,
        "companion.name": companionName
      });

      if (!chatHistory) {
        return { error: "No chat history found" };
      }

      const memory = chatHistory.conversationMemory;

      return {
        hasMemory: !!memory,
        messageCount: chatHistory.messages.length,
        lastMemoryProcessed: chatHistory.lastMemoryProcessed,
        memoryStats: memory?.memoryStats || null,
        personalDetails: memory?.longTermMemory?.userProfile?.personalDetails || null,
        establishedPatterns: memory?.longTermMemory?.establishedPatterns || null,
        relationshipMilestones: memory?.longTermMemory?.relationshipMilestones || null,
        emotionalHistory: memory?.longTermMemory?.emotionalHistory || null
      };
    } catch (error) {
      console.error("[MEMORY] Error getting debug info:", error);
      return { error: error.message };
    }
  }

  /**
   * Force memory processing for testing (debug method)
   */
  async forceMemoryProcessing(userId, companionName) {
    try {
      console.log(`[MEMORY] Force processing memory for ${userId} - ${companionName}`);
      await this.processMemoryAfterConversation(userId, companionName);
      return { success: true, message: "Memory processing completed" };
    } catch (error) {
      console.error("[MEMORY] Error in force processing:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ConversationMemoryService();
