/**
 * Stripe.js Integration - Production Ready
 *
 * This module handles Stripe checkout using the official Stripe.js SDK.
 * NO MOCK FALLBACKS - All errors are thrown and must be handled by calling code.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validate configuration at module load
if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

// Determine key mode
const isLiveKey = STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_');
const isTestKey = STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');
const stripeMode = isLiveKey ? 'live' : isTestKey ? 'test' : 'invalid';

console.log(`💳 Stripe.js Configuration:`);
console.log(`💳 Mode: ${stripeMode.toUpperCase()}`);
console.log(`💳 Key Prefix: ${STRIPE_PUBLISHABLE_KEY?.substring(0, 12)}...`);

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE INSTANCE (Singleton)
// ═══════════════════════════════════════════════════════════════════════════════

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe instance (lazy loaded singleton)
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.error('❌ Cannot initialize Stripe: VITE_STRIPE_PUBLISHABLE_KEY not set');
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }

  return stripePromise;
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH TOKEN HELPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the current auth token from storage
 * Checks multiple storage locations for compatibility
 */
export function getAuthToken(): string | null {
  // Check localStorage first (primary storage used by AuthContext)
  const token = localStorage.getItem('token');
  if (token) return token;

  // Fallback: check sessionStorage
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) return sessionToken;

  // Legacy fallback: check old key names
  const legacyToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (legacyToken) return legacyToken;

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHECKOUT SESSION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateCheckoutParams {
  tierId: string;
  billingCycle: 'monthly' | 'yearly';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  mode?: 'live' | 'test';
  correlationId?: string;
  error?: string;
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDIRECT TO CHECKOUT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Redirect to Stripe Checkout using Stripe.js
 *
 * This function:
 * 1. Calls the backend to create a checkout session
 * 2. Validates the session ID format (cs_live_ or cs_test_)
 * 3. Uses stripe.redirectToCheckout() for the redirect
 *
 * @throws Error if any step fails - NO MOCK FALLBACKS
 */
export async function redirectToStripeCheckout(
  params: CreateCheckoutParams,
  authToken?: string
): Promise<void> {
  const correlationId = `fe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`\n💳 ═══════════════════════════════════════════════════════════════`);
  console.log(`💳 [${correlationId}] Starting Stripe Checkout`);
  console.log(`💳 ═══════════════════════════════════════════════════════════════`);
  console.log(`💳 [${correlationId}] Tier: ${params.tierId}`);
  console.log(`💳 [${correlationId}] Billing Cycle: ${params.billingCycle}`);
  console.log(`💳 [${correlationId}] Stripe Mode: ${stripeMode.toUpperCase()}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Validate Stripe.js is available
  // ═══════════════════════════════════════════════════════════════════════════
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe is not configured. Please contact support.');
  }

  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Failed to load Stripe. Please refresh the page and try again.');
  }

  console.log(`💳 [${correlationId}] Stripe.js loaded successfully`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Get auth token (use provided or fetch from storage)
  // ═══════════════════════════════════════════════════════════════════════════
  const token = authToken || getAuthToken();
  console.log(`💳 [${correlationId}] Auth token: ${token ? 'Found (' + token.substring(0, 20) + '...)' : 'Not found (guest checkout)'}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Create checkout session via backend
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`💳 [${correlationId}] Creating checkout session via backend...`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/billing/create-checkout-session', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tierId: params.tierId,
      billingCycle: params.billingCycle,
      successUrl: params.successUrl || `${window.location.origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: params.cancelUrl || `${window.location.origin}/pricing?canceled=true`,
    }),
  });

  const data: CheckoutSessionResponse = await response.json();

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: Validate response - NO MOCK FALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════
  if (!response.ok || !data.success) {
    console.error(`❌ [${correlationId}] Backend error:`, data);
    throw new Error(data.message || data.error || 'Failed to create checkout session');
  }

  if (!data.sessionId) {
    console.error(`❌ [${correlationId}] No session ID in response`);
    throw new Error('Invalid response from payment server');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: Validate session ID format
  // ═══════════════════════════════════════════════════════════════════════════
  const sessionId = data.sessionId;
  const expectedPrefix = stripeMode === 'live' ? 'cs_live_' : 'cs_test_';

  // Check for mock/demo session IDs - REJECT THEM
  if (sessionId.startsWith('mock_') ||
      sessionId.startsWith('demo_') ||
      sessionId.startsWith('fake_') ||
      !sessionId.startsWith('cs_')) {
    console.error(`❌ [${correlationId}] INVALID SESSION ID DETECTED: ${sessionId}`);
    console.error(`❌ [${correlationId}] This appears to be a mock session - rejecting`);
    throw new Error('Invalid payment session. Please try again or contact support.');
  }

  // Warn if mode mismatch (but don't fail for test mode)
  if (!sessionId.startsWith(expectedPrefix)) {
    console.warn(`⚠️ [${correlationId}] Session ID prefix mismatch`);
    console.warn(`⚠️ [${correlationId}] Expected: ${expectedPrefix}`);
    console.warn(`⚠️ [${correlationId}] Got: ${sessionId.substring(0, 10)}...`);

    // In live mode with publishable key, this is a critical error
    if (stripeMode === 'live' && !sessionId.startsWith('cs_live_')) {
      throw new Error('Payment configuration error. Please contact support.');
    }
  }

  console.log(`💳 [${correlationId}] Session ID validated: ${sessionId.substring(0, 20)}...`);
  console.log(`💳 [${correlationId}] Backend mode: ${data.mode}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6: Redirect to Stripe Checkout using Stripe.js
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`💳 [${correlationId}] Redirecting to Stripe Checkout...`);

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    console.error(`❌ [${correlationId}] Stripe redirect error:`, error);
    throw new Error(error.message || 'Failed to redirect to checkout');
  }

  // If we get here, the redirect should have happened
  console.log(`💳 [${correlationId}] Redirect initiated successfully`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { stripeMode, isLiveKey, isTestKey };
