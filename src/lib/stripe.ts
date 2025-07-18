import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variables
// This is safe to expose in frontend code
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Stripe configuration
export const stripeConfig = {
  // Your Premium plan price ID from Stripe Dashboard
  PREMIUM_PRICE_ID: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
  
  // Success/cancel URLs
  SUCCESS_URL: `${window.location.origin}/checkout/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${window.location.origin}/pricing?canceled=true`,
  
  // Customer portal URL for subscription management
  CUSTOMER_PORTAL_URL: `${window.location.origin}/api/create-portal-session`,
};

// N8N Webhook URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://franklingraystone.app.n8n.cloud/webhook/5a85cb76-7d25-44ce-8747-cc14d1a6ff30/webhook';

// Utility function to create checkout session
export const createCheckoutSession = async (priceId: string, customerId?: string) => {
  try {
    // Using your N8N webhook endpoint for Stripe operations
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_checkout_session',
        priceId,
        customerId,
        successUrl: stripeConfig.SUCCESS_URL,
        cancelUrl: stripeConfig.CANCEL_URL,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Utility function to create customer portal session
export const createPortalSession = async (customerId: string) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_portal_session',
        customerId,
        returnUrl: `${window.location.origin}/billing`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};