const User = require("../models/User");
const { users } = require('@clerk/backend');
const userValidation = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    //let user = await User.findOne({ clerkId });
    console.log("User sync middleware called");
    console.log(req);
    // if (!user) {
    //   const clerkUser = await users.getUser(clerkId);
    //   user = await User.create({
    //     email: clerkUser.emailAddresses[0].emailAddress,
    //     firstName: clerkUser.firstName,
    //     lastName: clerkUser.lastName,
    //     imageUrl: clerkUser.imageUrl,
    //     role: clerkUser.publicMetadata?.role || "user",
    //   });
    // }
    // req.user = user;
    next();
  } catch (err) {
    console.error("User sync error:", err);
    res.status(500).json({ error: "Failed to sync user" });
  }
};

module.exports = { userValidation };
