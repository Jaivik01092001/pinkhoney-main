/**
 * Companion Controller
 * Handles companion-related API endpoints
 */
const Companion = require('../models/Companion');

/**
 * Get all active companions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCompanions = async (req, res) => {
  try {
    // Fetch all active companions from database
    const companions = await Companion.find({ isActive: true })
      .select('name age bio personality interests imageUrl voiceId')
      .sort({ createdAt: 1 }); // Sort by creation date for consistent order

    // Transform data to match frontend expectations
    const transformedCompanions = companions.map((companion, index) => ({
      id: index + 1, // Frontend expects sequential IDs
      name: companion.name,
      age: companion.age,
      bio: companion.bio,
      personality: companion.personality,
      interests: companion.interests,
      image: companion.imageUrl, // Map imageUrl to image for frontend compatibility
      imageUrl: companion.imageUrl,
      voiceId: companion.voiceId,
      _id: companion._id // Keep MongoDB ID for reference
    }));

    res.status(200).json({
      success: true,
      data: transformedCompanions,
      count: transformedCompanions.length
    });

  } catch (error) {
    console.error('Error fetching companions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companions',
      message: error.message
    });
  }
};

/**
 * Get companion by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCompanionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find companion by MongoDB ID
    const companion = await Companion.findById(id);

    if (!companion) {
      return res.status(404).json({
        success: false,
        error: 'Companion not found'
      });
    }

    if (!companion.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Companion is not active'
      });
    }

    // Transform data to match frontend expectations
    const transformedCompanion = {
      name: companion.name,
      age: companion.age,
      bio: companion.bio,
      personality: companion.personality,
      interests: companion.interests,
      image: companion.imageUrl,
      imageUrl: companion.imageUrl,
      voiceId: companion.voiceId,
      _id: companion._id
    };

    res.status(200).json({
      success: true,
      data: transformedCompanion
    });

  } catch (error) {
    console.error('Error fetching companion by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companion',
      message: error.message
    });
  }
};

/**
 * Get companion by name (for chat functionality)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCompanionByName = async (req, res) => {
  try {
    const { name } = req.params;

    // Find companion by name (case-insensitive)
    const companion = await Companion.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });

    if (!companion) {
      return res.status(404).json({
        success: false,
        error: 'Companion not found'
      });
    }

    // Transform data to match frontend expectations
    const transformedCompanion = {
      name: companion.name,
      age: companion.age,
      bio: companion.bio,
      personality: companion.personality,
      interests: companion.interests,
      image: companion.imageUrl,
      imageUrl: companion.imageUrl,
      voiceId: companion.voiceId,
      _id: companion._id
    };

    res.status(200).json({
      success: true,
      data: transformedCompanion
    });

  } catch (error) {
    console.error('Error fetching companion by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companion',
      message: error.message
    });
  }
};

module.exports = {
  getAllCompanions,
  getCompanionById,
  getCompanionByName
};
