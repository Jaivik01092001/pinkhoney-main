/**
 * CORS middleware configuration
 * Provides secure cross-origin resource sharing settings
 */
const cors = require("cors");
const config = require("../config/config");

/**
 * Configure CORS options with enhanced security
 * - Restricts origins to only the frontend URL
 * - Limits HTTP methods to only those needed
 * - Specifies allowed headers
 * - Enables credentials for authenticated requests
 * - Sets max age for preflight requests
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin matches allowed origins
    const allowedOrigins = [
      config.server.frontendUrl,
      // Add development origins if in development mode
      ...(config.server.env === "development" ? ["http://localhost:3000"] : []),
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Length", "Content-Type"],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);
