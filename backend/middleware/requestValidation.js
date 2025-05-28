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
    user_id: Joi.string().required(),
    selected_plan: Joi.string().valid("monthly", "yearly", "lifetime", "free").required(),
    session_id: Joi.string().optional(),
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
    user_id: Joi.string().required(),
    priceId: Joi.string().optional(),
    email: Joi.string().email().optional(),
    plan: Joi.string().valid("monthly", "yearly", "lifetime").optional(),
    selected_plan: Joi.string().valid("monthly", "yearly", "lifetime").optional(),
    success_url: Joi.string().uri().optional(),
    cancel_url: Joi.string().uri().optional(),
    // Token purchase parameters
    tokens: Joi.number().integer().min(1).optional(),
    price: Joi.number().min(0.01).optional(),
    product_name: Joi.string().optional(),
  }).unknown(true),
};

// Follow-up related validation schemas
const followUpSchemas = {
  createSchedule: Joi.object({
    user_id: Joi.string().required(),
    companion_name: Joi.string().required(),
    reset_existing: Joi.boolean().optional(),
  }),

  resetTimers: Joi.object({
    user_id: Joi.string().required(),
    companion_name: Joi.string().required(),
    is_user_message: Joi.boolean().optional(),
  }),

  triggerAction: Joi.object({
    user_id: Joi.string().required(),
    companion_name: Joi.string().required(),
    action_type: Joi.string().valid('12h_reflection', '24h_message', '36h_reflection', '48h_message').required(),
  }),

  getStatus: Joi.object({
    user_id: Joi.string().required(),
    companion_name: Joi.string().required(),
  }),
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

  validateCheckoutSession: validate(stripeSchemas.createCheckoutSession, "body"),

  // Follow-up validation
  validateFollowUpCreate: validate(followUpSchemas.createSchedule),
  validateFollowUpReset: validate(followUpSchemas.resetTimers),
  validateFollowUpTrigger: validate(followUpSchemas.triggerAction),
  validateFollowUpStatus: validate(followUpSchemas.getStatus, "query"),
};
