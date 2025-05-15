/**
 * Firestore database service
 */
const admin = require('firebase-admin');
const config = require('../config/config');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(config.firebase.credentialsPath)
  });
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

const db = admin.firestore();

/**
 * Check if a user exists by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserByEmail = async (email) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    let userData = null;
    snapshot.forEach(doc => {
      userData = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    return userData;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user data
 */
const createUser = async (userData) => {
  try {
    const docRef = db.collection('users').doc();
    await docRef.set(userData);
    
    return {
      id: docRef.id,
      ...userData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update user data
 * @param {string} docId - Document ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
const updateUser = async (docId, userData) => {
  try {
    const docRef = db.collection('users').doc(docId);
    await docRef.update(userData);
    
    const updatedDoc = await docRef.get();
    return {
      id: docId,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserById = async (userId) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('user_id', '==', userId).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    let userData = null;
    snapshot.forEach(doc => {
      userData = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    return userData;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

module.exports = {
  db,
  getUserByEmail,
  createUser,
  updateUser,
  getUserById
};
