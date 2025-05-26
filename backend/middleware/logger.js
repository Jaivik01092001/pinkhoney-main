/**
 * Request logging middleware
 */
const morgan = require('morgan');
const config = require('../config/config');

// Configure Morgan logger based on environment
const logger = morgan(config.server.env === 'production' ? 'combined' : 'dev');

module.exports = logger;
