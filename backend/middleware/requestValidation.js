/**
 * Request validation middleware using Joi
 * Validates request data against predefined schemas
 */
const Joi = require("joi");

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) {
      return next();
    }
    
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    
    console.log("Validation error:", errors);
    
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: errors,
    });
  };
};

// User-related validation schemas
const userSchemas = {
  checkEmail: Joi.object({
    email: Joi.string().email().required(),
    clerkId: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
  }),
  
  changeSubscription: Joi.object({
    email: Joi.string().email().required(),
    subscriptionType: Joi.string().valid("free", "premium", "lifetime").required(),
  }),
  
  increaseTokens: Joi.object({
    email: Joi.string().email().required(),
    amount: Joi.number().integer().min(1).required(),
  }),
};

// AI-related validation schemas
const aiSchemas = {
  getAIResponse: Joi.object({
    message: Joi.string().required(),
    name: Joi.string().required(),
    personality: Joi.string().required(),
    image: Joi.string().optional(),
    user_id: Joi.string().optional(),
  }),
  
  getChatHistory: Joi.object({
    user_id: Joi.string().required(),
    companion_name: Joi.string().required(),
  }).unknown(true),
};

// Voice-related validation schemas
const voiceSchemas = {
  initiateCall: Joi.object({
    user_id: Joi.string().optional(),
    companion_name: Joi.string().required(),
    personality: Joi.string().required(),
  }),
  
  endCall: Joi.object({
    call_id: Joi.string().required(),
  }),
};

// Stripe-related validation schemas
const stripeSchemas = {
  createCheckoutSession: Joi.object({
    priceId: Joi.string().optional(),
    email: Joi.string().email().optional(),
    plan: Joi.string().valid("monthly", "yearly", "lifetime").optional(),
    success_url: Joi.string().uri().optional(),
    cancel_url: Joi.string().uri().optional(),
  }).unknown(true),
};

// Export validation middleware functions
module.exports = {
  validateUserEmail: validate(userSchemas.checkEmail),
  validateSubscriptionChange: validate(userSchemas.changeSubscription),
  validateTokenIncrease: validate(userSchemas.increaseTokens),
  
  validateAIResponse: validate(aiSchemas.getAIResponse),
  validateChatHistory: validate(aiSchemas.getChatHistory, "query"),
  
  validateInitiateCall: validate(voiceSchemas.initiateCall),
  validateEndCall: validate(voiceSchemas.endCall),
  
  validateCheckoutSession: validate(stripeSchemas.createCheckoutSession, "query"),
};
