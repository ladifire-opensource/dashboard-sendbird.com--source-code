import { loadStripe } from '@stripe/stripe-js';

const stripeAPIKey =
  process.env.BUILD_MODE === 'production' ? 'pk_live_SLmfuYTWTQn6u5irDrXhASnO' : 'pk_test_12raUNdgRJGbIcTTtxBjoRLJ';

export const useStripeSDK = async () => {
  return await loadStripe(stripeAPIKey);
};
