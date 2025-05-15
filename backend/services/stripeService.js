/**
 * Stripe payment service
 */
const stripe = require('stripe');
const config = require('../config/config');

// Initialize Stripe client
const stripeClient = stripe(config.stripe.secretKey);

/**
 * Create a checkout session for subscription
 * @param {Object} options - Checkout options
 * @param {string} options.userId - User ID
 * @param {string} options.email - User email
 * @param {string} options.plan - Subscription plan (lifetime, yearly, monthly)
 * @returns {Promise<Object>} Stripe checkout session
 */
const createCheckoutSession = async ({ userId, email, plan }) => {
  try {
    // Determine price ID based on selected plan
    let priceId = config.stripe.priceIds.default;
    
    if (plan === 'lifetime') {
      priceId = config.stripe.priceIds.lifetime;
    } else if (plan === 'yearly') {
      priceId = config.stripe.priceIds.yearly;
    } else if (plan === 'monthly') {
      priceId = config.stripe.priceIds.monthly;
    }
    
    // Create checkout session
    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${config.server.frontendUrl}/subscribed?user_id=${userId}&selected_plan=${plan}&email=${email}`,
      customer_email: email,
      // automatic_tax: { enabled: true },
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Handle webhook events from Stripe
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Promise<Object>} Processed event
 */
const handleWebhookEvent = async (payload, signature) => {
  try {
    // Verify and construct the event
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // Payment is successful, update user subscription status
        const session = event.data.object;
        // Process the session
        console.log('Checkout session completed:', session.id);
        break;
        
      case 'invoice.payment_succeeded':
        // Subscription invoice paid
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        break;
        
      case 'customer.subscription.deleted':
        // Subscription canceled or expired
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return event;
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhookEvent
};
