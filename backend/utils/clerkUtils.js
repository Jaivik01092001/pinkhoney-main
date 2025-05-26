/**
 * Clerk utility functions
 */
const crypto = require('crypto');
const config = require('../config/config');

/**
 * Verify Clerk webhook signature
 * @param {Object|String} payload - Request body (raw string or parsed object)
 * @param {String} signature - Svix signature from headers
 * @returns {Boolean} Whether the signature is valid
 */
const verifyClerkWebhookSignature = (payload, signature) => {
  try {
    // Get the webhook secret from config
    const webhookSecret = config.clerk.webhookSecret;
    
    if (!webhookSecret) {
      console.error('Missing Clerk webhook secret');
      return false;
    }
    
    // Parse the signature header
    const svixHeaders = parseSvixHeaders(signature);
    
    if (!svixHeaders || !svixHeaders.timestamp || !svixHeaders.signature) {
      console.error('Invalid Svix headers');
      return false;
    }
    
    // Convert payload to string if it's an object
    const payloadString = typeof payload === 'string' 
      ? payload 
      : JSON.stringify(payload);
    
    // Create the signature message
    const timestampedPayload = `${svixHeaders.timestamp}.${payloadString}`;
    
    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(timestampedPayload)
      .digest('hex');
    
    // Compare with the provided signature
    const providedSignature = svixHeaders.signature;
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );
  } catch (error) {
    console.error('Error verifying Clerk webhook signature:', error);
    return false;
  }
};

/**
 * Parse Svix headers from the signature string
 * @param {String} signature - Svix signature from headers
 * @returns {Object|null} Parsed headers or null if invalid
 */
const parseSvixHeaders = (signature) => {
  try {
    const pairs = signature.split(',');
    const result = {};
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      result[key.trim()] = value.trim();
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing Svix headers:', error);
    return null;
  }
};

module.exports = {
  verifyClerkWebhookSignature,
};
