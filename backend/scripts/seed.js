/**
 * Seed script for MongoDB
 * Run with: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Companion = require('../models/Companion');

// Sample data
const companions = [
  {
    name: 'Susan',
    personality: 'Playful and Flirty',
    description: 'Susan is a playful and flirty companion who loves to tease and joke around.',
    image: '/companions/susan.jpg',
    isActive: true
  },
  {
    name: 'Mabel',
    personality: 'Caring and Supportive',
    description: 'Mabel is a caring and supportive companion who is always there to listen and help.',
    image: '/companions/mabel.jpg',
    isActive: true
  },
  {
    name: 'Isobel',
    personality: 'Intellectual and Curious',
    description: 'Isobel is an intellectual and curious companion who loves to learn and discuss ideas.',
    image: '/companions/isobel.jpg',
    isActive: true
  },
  {
    name: 'Cynthia',
    personality: 'Adventurous and Bold',
    description: 'Cynthia is an adventurous and bold companion who loves to try new things.',
    image: '/companions/cynthia.jpg',
    isActive: true
  },
  {
    name: 'Pearl',
    personality: 'Calm and Wise',
    description: 'Pearl is a calm and wise companion who offers thoughtful advice and perspective.',
    image: '/companions/pearl.jpg',
    isActive: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await Companion.deleteMany({});
    console.log('Cleared existing companions');
    
    // Insert new data
    const createdCompanions = await Companion.insertMany(companions);
    console.log(`Inserted ${createdCompanions.length} companions`);
    
    // Create a test user if none exists
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      await User.create({
        user_id: '123456789',
        email: 'test@example.com',
        tokens: '100',
        subscribed: 'yes',
        subscription: {
          plan: 'monthly',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      });
      console.log('Created test user');
    }
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
