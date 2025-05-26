/**
 * Security middleware collection
 * Centralizes security-related middleware for consistent application
 */
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("../config/config");
const { clerkMiddleware } = require("@clerk/express");

/**
 * Helmet middleware with enhanced security settings
 * Provides protection against common web vulnerabilities
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: [
        "'self'",
        process.env.FRONTEND_URL || "http://localhost:3000",
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: "deny" },
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
});

/**
 * Rate limiting middleware to prevent abuse
 * Limits the number of requests from a single IP
 */
const apiLimiter = rateLimit({
  windowMs: config.security.rateLimiting.windowMs,
  max: config.security.rateLimiting.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

/**
 * Clerk authentication middleware
 * Handles user authentication via Clerk
 */
const authMiddleware = clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Environment-based authentication middleware
 * Uses authentication in production, skips in development
 * @param {Function} middleware - The middleware to conditionally apply
 * @returns {Function} Express middleware function
 */
const conditionalAuth = (middleware) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  return (req, res, next) => {
    if (isProduction) {
      return middleware(req, res, next);
    }
    return next();
  };
};

/**
 * Webhook signature verification middleware factory
 * @param {Function} verifyFn - Function to verify the signature
 * @param {String} headerName - Header containing the signature
 * @returns {Function} Express middleware function
 */
const webhookVerification = (verifyFn, headerName) => {
  return (req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";
    
    if (!isProduction) {
      console.log("Skipping webhook signature verification in development mode");
      return next();
    }
    
    const signature = req.headers[headerName];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: `Missing ${headerName} header`,
      });
    }
    
    try {
      const isValid = verifyFn(req.body, signature);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid signature",
        });
      }
      
      next();
    } catch (error) {
      console.error("Webhook verification error:", error);
      return res.status(500).json({
        success: false,
        error: "Webhook verification failed",
      });
    }
  };
};

module.exports = {
  helmetMiddleware,
  apiLimiter,
  authMiddleware,
  conditionalAuth,
  webhookVerification,
};
