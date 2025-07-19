import { useAppStore } from '../store';

// Handle incoming Stripe webhook events
export const handleStripeWebhook = (event: any) => {
  const { updateSubscription, user, setUser } = useAppStore.getState();

  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutCompleted(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      handleSubscriptionCanceled(event.data.object);
      break;
      
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      handlePaymentFailed(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

const handleCheckoutCompleted = (session: any) => {
  const { updateSubscription } = useAppStore.getState();
  
  // Update user with new subscription details
  updateSubscription({
    subscription: 'premium',
    stripeCustomerId: session.customer,
    subscriptionId: session.subscription,
    subscriptionStatus: 'active'
  });
  
  console.log('Checkout completed:', session);
};

const handleSubscriptionUpdated = (subscription: any) => {
  const { updateSubscription } = useAppStore.getState();
  
  updateSubscription({
    subscription: subscription.status === 'active' ? 'premium' : 'free',
    subscriptionStatus: subscription.status,
    subscriptionEndsAt: new Date(subscription.current_period_end * 1000).toISOString()
  });
  
  console.log('Subscription updated:', subscription);
};

const handleSubscriptionCanceled = (subscription: any) => {
  const { updateSubscription } = useAppStore.getState();
  
  updateSubscription({
    subscription: 'free',
    subscriptionStatus: 'canceled',
    subscriptionId: undefined,
    subscriptionEndsAt: undefined
  });
  
  console.log('Subscription canceled:', subscription);
};

const handlePaymentSucceeded = (invoice: any) => {
  // Payment succeeded - subscription should remain active
  console.log('Payment succeeded:', invoice);
};

const handlePaymentFailed = (invoice: any) => {
  const { updateSubscription } = useAppStore.getState();
  
  // Mark subscription as past due
  updateSubscription({
    subscriptionStatus: 'past_due'
  });
  
  console.log('Payment failed:', invoice);
};