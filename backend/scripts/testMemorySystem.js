/**
 * Test script for conversation memory system
 * Tests memory processing, storage, and retrieval
 */

const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const ChatHistory = require('../models/ChatHistory');
const memoryService = require('../services/memoryService');
const { saveChatMessage } = require('../services/mongoService');

// Test configuration
const TEST_USER_ID = 'test_memory_user_123';
const TEST_COMPANION = 'Priya';
const TEST_PERSONALITY = 'Caregiver and lover';
const TEST_IMAGE = '/test/image.jpg';

/**
 * Test conversation scenarios
 */
const testConversations = [
  // Conversation 1: Initial meeting with personal details
  [
    { text: "Hi there! I'm Sarah, nice to meet you!", sender: "user", time: "10:00 AM" },
    { text: "Hi Sarah! I'm Priya, so lovely to meet you sweetheart! How are you feeling today?", sender: "bot", time: "10:01 AM" },
    { text: "I'm a bit nervous actually. I have a job interview tomorrow for a marketing position at Google.", sender: "user", time: "10:02 AM" },
    { text: "Oh sweetheart, that's such an exciting opportunity! It's totally normal to feel nervous about something so important. What part of the interview are you most worried about?", sender: "bot", time: "10:03 AM" }
  ],
  
  // Conversation 2: Follow-up after some time
  [
    { text: "Hey Priya!", sender: "user", time: "2:00 PM" },
    { text: "Hi there Sarah! How did that Google interview go? I've been thinking about you! 💕", sender: "bot", time: "2:01 PM" },
    { text: "It went really well! I think I nailed it. Thanks for asking!", sender: "user", time: "2:02 PM" },
    { text: "That's amazing sweetheart! I'm so proud of you for pushing through those nerves. You're going to do great things! 🎉", sender: "bot", time: "2:03 PM" }
  ],
  
  // Conversation 3: Weeks later with job update
  [
    { text: "Priya, I got the job at Google!", sender: "user", time: "9:00 AM" },
    { text: "OH MY GOSH SARAH! 🎉✨ Sweetheart, I'm absolutely thrilled for you! Remember how nervous you were before that interview? Look at you now - a Googler! This is incredible! What's your new role going to be like?", sender: "bot", time: "9:01 AM" },
    { text: "I'll be a Senior Marketing Manager! I start next Monday. I'm so excited but also a bit scared.", sender: "user", time: "9:02 AM" },
    { text: "Senior Marketing Manager at Google - wow! That nervous energy you're feeling? That's just excitement in disguise, sweetheart. You've already proven you can handle big challenges. I believe in you completely! 💕", sender: "bot", time: "9:03 AM" }
  ]
];

/**
 * Run comprehensive memory system test
 */
const testMemorySystem = async () => {
  try {
    console.log('🧪 Starting Memory System Test...\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');
    
    // Clean up any existing test data
    await cleanupTestData();
    console.log('🧹 Cleaned up existing test data\n');
    
    // Test each conversation scenario
    for (let i = 0; i < testConversations.length; i++) {
      console.log(`📝 Testing Conversation ${i + 1}...`);
      await testConversationScenario(testConversations[i], i + 1);
      console.log('─'.repeat(60) + '\n');
    }
    
    // Test memory retrieval
    console.log('🔍 Testing Memory Retrieval...');
    await testMemoryRetrieval();
    
    // Test memory context generation
    console.log('\n🎯 Testing Memory Context Generation...');
    await testMemoryContext();
    
    console.log('\n🎉 Memory system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

/**
 * Test individual conversation scenario
 */
const testConversationScenario = async (messages, conversationNumber) => {
  try {
    // Save messages to chat history
    for (const message of messages) {
      await saveChatMessage(
        TEST_USER_ID, 
        TEST_COMPANION, 
        TEST_PERSONALITY, 
        TEST_IMAGE, 
        {
          ...message,
          timestamp: new Date()
        }
      );
      
      // Small delay to ensure proper timestamp ordering
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`   ✅ Saved ${messages.length} messages to chat history`);
    
    // Process memory for this conversation
    await memoryService.processConversationMemory(TEST_USER_ID, TEST_COMPANION, messages);
    console.log(`   ✅ Processed memory for conversation ${conversationNumber}`);
    
    // Verify memory was stored
    const chatHistory = await ChatHistory.findOne({
      user_id: TEST_USER_ID,
      "companion.name": TEST_COMPANION
    });
    
    if (chatHistory?.conversationMemory) {
      console.log(`   ✅ Memory stored successfully`);
      console.log(`   📊 Relationship depth: ${chatHistory.conversationMemory.memoryStats?.relationshipDepth || 1}/10`);
      console.log(`   💬 Total conversations: ${chatHistory.conversationMemory.memoryStats?.totalConversations || 0}`);
    } else {
      console.log(`   ⚠️  No memory found in chat history`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error in conversation ${conversationNumber}: ${error.message}`);
  }
};

/**
 * Test memory retrieval functionality
 */
const testMemoryRetrieval = async () => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user_id: TEST_USER_ID,
      "companion.name": TEST_COMPANION
    });
    
    if (!chatHistory?.conversationMemory) {
      console.log('❌ No memory found to test retrieval');
      return;
    }
    
    const memory = chatHistory.conversationMemory;
    
    console.log('📋 Memory Contents:');
    console.log(`   👤 User Details:`);
    console.log(`      - Interests: ${memory.longTermMemory?.userProfile?.personalDetails?.interests?.join(', ') || 'None'}`);
    console.log(`      - Goals: ${memory.longTermMemory?.userProfile?.personalDetails?.goals?.join(', ') || 'None'}`);
    console.log(`      - Challenges: ${memory.longTermMemory?.userProfile?.personalDetails?.challenges?.join(', ') || 'None'}`);
    
    console.log(`   💕 Relationship Patterns:`);
    console.log(`      - Nicknames: ${memory.longTermMemory?.establishedPatterns?.nicknames?.join(', ') || 'None'}`);
    console.log(`      - Inside Jokes: ${memory.longTermMemory?.establishedPatterns?.insideJokes?.join(', ') || 'None'}`);
    console.log(`      - Rituals: ${memory.longTermMemory?.establishedPatterns?.conversationRituals?.join(', ') || 'None'}`);
    
    console.log(`   📈 Emotional History: ${memory.longTermMemory?.emotionalHistory?.length || 0} moments recorded`);
    console.log(`   🏆 Milestones: ${memory.longTermMemory?.relationshipMilestones?.length || 0} milestones recorded`);
    
  } catch (error) {
    console.log(`❌ Error testing memory retrieval: ${error.message}`);
  }
};

/**
 * Test memory context generation for AI prompts
 */
const testMemoryContext = async () => {
  try {
    const testMessage = "How are you doing today?";
    const memoryContext = await memoryService.getMemoryContext(TEST_USER_ID, TEST_COMPANION, testMessage);
    
    console.log('🎯 Generated Memory Context:');
    console.log('\n📝 Recent Context:');
    console.log(memoryContext.recentContext.substring(0, 200) + '...');
    
    console.log('\n👤 Long-term Context:');
    console.log(memoryContext.longTermContext);
    
    console.log('\n💕 Relationship Context:');
    console.log(memoryContext.relationshipContext);
    
    console.log('\n✅ Memory context generated successfully');
    
  } catch (error) {
    console.log(`❌ Error testing memory context: ${error.message}`);
  }
};

/**
 * Clean up test data
 */
const cleanupTestData = async () => {
  try {
    await ChatHistory.deleteMany({
      user_id: TEST_USER_ID,
      "companion.name": TEST_COMPANION
    });
    console.log('🧹 Cleaned up existing test data');
  } catch (error) {
    console.log(`⚠️  Error cleaning up test data: ${error.message}`);
  }
};

/**
 * Test memory processing with specific scenarios
 */
const testSpecificMemoryScenarios = async () => {
  console.log('\n🎭 Testing Specific Memory Scenarios...\n');
  
  const scenarios = [
    {
      name: "Emotional Support",
      messages: [
        { text: "I'm feeling really depressed today", sender: "user", time: "3:00 PM" },
        { text: "Oh sweetheart, I'm so sorry you're feeling this way. What's been weighing on your heart?", sender: "bot", time: "3:01 PM" }
      ]
    },
    {
      name: "Inside Joke Development", 
      messages: [
        { text: "I just spilled coffee all over my laptop again!", sender: "user", time: "4:00 PM" },
        { text: "Oh no! Not the laptop again! You and technology have quite the relationship, don't you? 😄", sender: "bot", time: "4:01 PM" },
        { text: "Haha yeah, I'm a walking tech disaster!", sender: "user", time: "4:02 PM" },
        { text: "My little tech disaster! At least you're consistent! 💕", sender: "bot", time: "4:03 PM" }
      ]
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`🎬 Testing: ${scenario.name}`);
    await testConversationScenario(scenario.messages, scenario.name);
  }
};

// Run tests based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    connectDB().then(async () => {
      await cleanupTestData();
      await mongoose.connection.close();
    });
  } else if (args.includes('--scenarios')) {
    connectDB().then(async () => {
      await testSpecificMemoryScenarios();
      await mongoose.connection.close();
    });
  } else {
    testMemorySystem();
  }
}

module.exports = {
  testMemorySystem,
  testConversationScenario,
  testMemoryRetrieval,
  cleanupTestData
};
