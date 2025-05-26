/**
 * Alternative Companion Database Seeder using Bulk Operations
 * This version uses MongoDB bulk operations for maximum reliability
 * 
 * Usage: node seeders/companionSeederBulk.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Companion = require('../models/Companion');

// Import the same companion data
const { companionSeedData } = require('./companionSeeder');

/**
 * Seed companions using bulk operations (most reliable approach)
 * @param {boolean} isServerStartup - Whether this is being called during server startup
 * @returns {Promise<boolean>} True if seeding was performed, false if skipped
 */
const seedCompanionsBulk = async (isServerStartup = false) => {
  try {
    if (!isServerStartup) {
      console.log('🌱 Starting Companion Database Seeder (Bulk Operations)...');
      await connectDB();
      console.log('✅ Database connection established');
    }
    
    console.log('🚀 Seeding companions data using bulk operations...');
    
    // Prepare bulk operations
    const bulkOps = companionSeedData.map(companion => ({
      updateOne: {
        filter: { name: companion.name },
        update: { $setOnInsert: companion },
        upsert: true
      }
    }));
    
    // Execute bulk operation
    const result = await Companion.bulkWrite(bulkOps, { ordered: false });
    
    // Report results
    const { upsertedCount, modifiedCount, matchedCount } = result;
    
    if (upsertedCount > 0) {
      console.log(`✅ Successfully created ${upsertedCount} new AI companions`);
    }
    
    if (matchedCount > 0) {
      console.log(`ℹ️  Found ${matchedCount} existing companions (no changes needed)`);
    }
    
    if (upsertedCount === 0 && matchedCount === companionSeedData.length) {
      console.log('ℹ️  All companions already exist - no seeding needed');
      if (!isServerStartup) {
        process.exit(0);
      }
      return false;
    }
    
    console.log('🎉 Companion database seeding completed successfully!');
    
    if (!isServerStartup) {
      process.exit(0);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during companion seeding:', error);
    
    if (!isServerStartup) {
      process.exit(1);
    }
    
    return false;
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

// Run the seeder
if (require.main === module) {
  seedCompanionsBulk();
}

module.exports = {
  seedCompanionsBulk
};
