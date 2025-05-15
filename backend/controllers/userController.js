/**
 * User controller for managing user data
 */
const {
  getUserByEmail,
  createUser,
  updateUser,
  getUserById,
} = require("../services/firestoreService");

/**
 * Check if a user exists by email, create if not exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkEmail = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Check if user exists
    let user = await getUserByEmail(email);

    if (user) {
      // User exists, return user data
      console.log("Email exists in Firestore");
      return res.status(200).json({
        user_id: user.user_id,
        tokens: user.tokens,
        subscribed: user.subscribed,
      });
    } else {
      // User doesn't exist, create new user
      console.log("Email does not exist in Firestore");

      // Generate random user ID
      const userId = Math.floor(Math.random() * 900000000) + 100000000;

      // Create new user
      const newUser = {
        user_id: userId.toString(),
        email,
        tokens: "0",
        subscribed: "no",
      };

      await createUser(newUser);

      return res.status(200).json({
        user_id: newUser.user_id,
        tokens: newUser.tokens,
        subscribed: newUser.subscribed,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Change user subscription status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const changeSubscription = async (req, res, next) => {
  try {
    const { user_id, selected_plan } = req.body;

    if (!user_id || !selected_plan) {
      return res.status(400).json({
        success: false,
        error: "User ID and selected plan are required",
      });
    }

    // Get user by ID
    const user = await getUserById(user_id);

    if (!user) {
      console.log("User does not exist in Firestore");
      return res.status(404).json({
        status: "failure",
        error: "User not found",
      });
    }

    // Update user subscription
    console.log("User exists in Firestore");
    await updateUser(user.id, { subscribed: selected_plan });

    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Increase user tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const increaseTokens = async (req, res, next) => {
  try {
    const { user_id, tokens_to_increase } = req.body;

    if (!user_id || !tokens_to_increase) {
      return res.status(400).json({
        success: false,
        error: "User ID and tokens to increase are required",
      });
    }

    // Get user by ID
    const user = await getUserById(user_id);

    if (!user) {
      console.log("User does not exist in Firestore");
      return res.status(404).json({
        status: "failure",
        error: "User not found",
      });
    }

    // Update user tokens
    console.log("User exists in Firestore");
    const currentTokens = parseInt(user.tokens) || 0;
    const newTokens = currentTokens + parseInt(tokens_to_increase);

    await updateUser(user.id, { tokens: newTokens.toString() });

    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkEmail,
  changeSubscription,
  increaseTokens,
};
