/**
 * User validation middleware
 * Validates and synchronizes user data from Clerk to our database
 */
const User = require("../models/User");
const { users } = require("@clerk/backend");
const {
  getUserByClerkId,
  createUser,
  updateUser,
} = require("../services/mongoService");

/**
 * Middleware to validate user and sync with database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const userValidation = async (req, res, next) => {
  try {
    // Skip validation if no auth object (for development or public routes)
    if (!req.auth || !req.auth.userId) {
      console.log("No auth data found, skipping user validation");
      return next();
    }

    const clerkId = req.auth.userId;
    console.log(`User validation for Clerk ID: ${clerkId}`);

    // Try to find user in our database
    let user = await getUserByClerkId(clerkId);

    // If user not found, fetch from Clerk and create in our database
    if (!user) {
      try {
        console.log("User not found in database, fetching from Clerk");
        const clerkUser = await users.getUser(clerkId);

        if (!clerkUser) {
          console.error("User not found in Clerk");
          return res.status(404).json({ error: "User not found" });
        }

        // Get primary email from Clerk user
        const email =
          clerkUser.emailAddresses.length > 0
            ? clerkUser.emailAddresses[0].emailAddress
            : null;

        if (!email) {
          console.error("No email found for user");
          return res.status(400).json({ error: "No email found for user" });
        }

        // Create user in our database
        user = await createUser({
          email,
          clerkId,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          imageUrl: clerkUser.imageUrl || "",
          role: clerkUser.publicMetadata?.role || "user",
        });

        console.log(`Created new user with email: ${email}`);
      } catch (clerkError) {
        console.error("Error fetching user from Clerk:", clerkError);
        return res.status(500).json({ error: "Failed to fetch user data" });
      }
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (err) {
    console.error("User validation error:", err);
    res.status(500).json({ error: "Failed to validate user" });
  }
};

module.exports = { userValidation };
