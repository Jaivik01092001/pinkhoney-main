/**
 * User controller for managing user data
 */
const {
  getUserByEmail,
  createUser,
  updateUser,
  getUserById,
} = require("../services/mongoService");

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

    const { email, clerkId, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Check if user exists
    let user = await getUserByEmail(email);

    if (user) {
      // User exists, update with Clerk ID if provided and not already set
      console.log("Email exists in MongoDB");

      // If clerkId is provided and user doesn't have one yet, update it
      if (clerkId && !user.clerkId) {
        const updateData = { clerkId };

        // Also update name if provided
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;

        await updateUser(user.user_id, updateData);

        // Get updated user
        user = await getUserByEmail(email);
      }

      return res.status(200).json({
        user_id: user.user_id,
        tokens: user.tokens,
        subscribed: user.subscribed,
      });
    } else {
      // User doesn't exist, create new user
      console.log("Email does not exist in MongoDB");

      // Generate random user ID
      const userId = Math.floor(Math.random() * 900000000) + 100000000;

      // Create new user
      const newUser = {
        user_id: userId.toString(),
        email,
        tokens: "0",
        subscribed: "no",
        clerkId: clerkId || null,
        firstName: firstName || null,
        lastName: lastName || null,
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
    const { user_id, selected_plan, email } = req.body;

    console.log("Changing subscription:", { user_id, selected_plan, email });

    if (!user_id || !selected_plan) {
      return res.status(400).json({
        success: false,
        error: "User ID and selected plan are required",
      });
    }

    // Get user by ID
    const user = await getUserById(user_id);

    if (!user) {
      console.log("User does not exist in MongoDB");
      return res.status(404).json({
        status: "failure",
        error: "User not found",
      });
    }

    // Update user subscription
    console.log("User exists in MongoDB, updating subscription to:", selected_plan);

    // Create subscription data based on the selected plan
    const subscriptionData = {
      subscribed: "yes",
      subscription: {
        plan: selected_plan,
        startDate: new Date(),
        endDate:
          selected_plan === "lifetime"
            ? null
            : selected_plan === "yearly"
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    };

    // If plan is "free", set subscribed to "no"
    if (selected_plan === "free") {
      subscriptionData.subscribed = "no";
      subscriptionData.subscription.status = "inactive";
    }

    await updateUser(user.user_id, subscriptionData);
    console.log("Subscription updated successfully");

    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
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
      console.log("User does not exist in MongoDB");
      return res.status(404).json({
        status: "failure",
        error: "User not found",
      });
    }

    // Update user tokens
    console.log("User exists in MongoDB");
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
