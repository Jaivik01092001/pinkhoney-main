/**
 * Application configuration
 */
require("dotenv").config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o", // Default model
    temperature: 0.0, // Default temperature
  },

  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    priceIds: {
      default:
        process.env.STRIPE_DEFAULT_PRICE_ID || "price_1QIYJBFD9BPCLY6DVkgw69h5",
      lifetime:
        process.env.STRIPE_LIFETIME_PRICE_ID ||
        "price_1QBm77GAYW7BjnuPMV5VgU0f",
      yearly:
        process.env.STRIPE_YEARLY_PRICE_ID || "price_1QCVmqGAYW7BjnuPMO8DL3wa",
      monthly:
        process.env.STRIPE_MONTHLY_PRICE_ID || "price_1QIYJBFD9BPCLY6DVkgw69h5",
    },
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/pinkhoney",
  },

  // Clerk configuration
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY,
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
  },

  // Firebase configuration (kept for backward compatibility)
  firebase: {
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },

  // JWT configuration
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-default-jwt-secret-should-be-changed-in-production",
    expiresIn: "7d", // Token expiration time
  },

  // Security settings
  security: {
    bcryptSaltRounds: 10,
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};
