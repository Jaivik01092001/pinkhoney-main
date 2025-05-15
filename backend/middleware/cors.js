/**
 * CORS middleware configuration
 */
const cors = require('cors');
const config = require('../config/config');

// Configure CORS options
const corsOptions = {
  origin: config.server.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = cors(corsOptions);
