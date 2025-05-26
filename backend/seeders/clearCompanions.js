/**
 * Utility script to clear companions collection
 * Use this if you need to reset the companions data for testing
 * 
 * Usage: node seeders/clearCompanions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Companion = require('../models/Companion');

const clearCompanions = async () => {
  try {
    console.log('🗑️  Clearing companions collection...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connection established');
    
    // Count existing companions
    const count = await Companion.countDocuments();
    console.log(`Found ${count} companions in database`);
    
    if (count === 0) {
      console.log('ℹ️  No companions to clear');
      process.exit(0);
    }
    
    // Clear all companions
    const result = await Companion.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} companions`);
    
    console.log('🎉 Companions collection cleared successfully!');
    console.log('💡 You can now run the seeder to create fresh data');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing companions:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('\n🛑 Received shutdown signal, closing database connection...');
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Run the clear function
if (require.main === module) {
  clearCompanions();
}

module.exports = { clearCompanions };
