import express from 'express';
import Stripe from 'stripe';
import { authenticate, optionalAuth } from '../middleware/auth';
import prisma from '../config/database';
import emailService from '../utils/emailService';
import {
  getPricingTiers,
  getTokenPackages,
  getStripePriceIds,
  getPlanFromPriceId,
  getSubscriptionTier,
  getGenerationLimits,
  validatePricingConfiguration
} from '../config/pricing';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE SECRET KEY VALIDATION & SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL: Environment variables from .env files or Railway may contain quotes,
// newlines, or whitespace that cause ERR_INVALID_CHAR errors in HTTP headers.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate Stripe key with detailed diagnostics
 * HARD FAILS if key contains invalid characters - do not silently sanitize
 * This ensures deployment issues are caught immediately at startup
 */
const validateStripeKey = (key: string | undefined): string => {
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing. Set it in your environment variables.');
  }

  // Diagnostic checks - DO NOT log the actual key value
  const hasNewline = /[\r\n]/.test(key);
  const hasQuotes = /^["'].*["']$/.test(key);
  const hasSpace = /\s/.test(key); // catches tabs/spaces too
  const startsCorrectly = key.startsWith('sk_live_') || key.startsWith('sk_test_');

  console.log('💳 Stripe key diagnostics:', {
    length: key.length,
    startsWith: key.slice(0, 8), // e.g. "sk_live_" or "sk_test_"
    startsCorrectly,
    hasNewline,
    hasQuotes,
    hasSpace,
  });

  // HARD FAIL if key contains invalid characters
  // Do not silently sanitize - this indicates a deployment configuration issue
  if (hasNewline) {
    throw new Error(
      'STRIPE_SECRET_KEY contains newline characters. ' +
      'Fix your Railway/environment variable - do not copy-paste with line breaks.'
    );
  }

  if (hasQuotes) {
    throw new Error(
      'STRIPE_SECRET_KEY is wrapped in quotes. ' +
      'Remove the quotes from your Railway/environment variable. ' +
      'Use: sk_live_xxx NOT "sk_live_xxx"'
    );
  }

  if (!startsCorrectly) {
    throw new Error(
      'STRIPE_SECRET_KEY must start with sk_live_ or sk_test_. ' +
      `Got: ${key.slice(0, 10)}...`
    );
  }

  // Warn about spaces but allow (will be trimmed)
  if (hasSpace) {
    console.warn('⚠️ STRIPE_SECRET_KEY contains whitespace - trimming');
  }

  return key.trim();
};

/**
 * Validate webhook secret with similar checks
 */
const validateWebhookSecretKey = (secret: string | undefined): string | null => {
  if (!secret) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET is not configured - webhooks will fail');
    return null;
  }

  const hasNewline = /[\r\n]/.test(secret);
  const hasQuotes = /^["'].*["']$/.test(secret);

  console.log('💳 Webhook secret diagnostics:', {
    length: secret.length,
    startsWith: secret.slice(0, 6), // "whsec_"
    startsCorrectly: secret.startsWith('whsec_'),
    hasNewline,
    hasQuotes,
  });

  if (hasNewline || hasQuotes) {
    console.error('❌ STRIPE_WEBHOOK_SECRET contains invalid characters (newline/quotes)');
    console.error('❌ Fix your Railway/environment variable');
    return null;
  }

  if (!secret.startsWith('whsec_')) {
    console.error('❌ STRIPE_WEBHOOK_SECRET must start with whsec_');
    return null;
  }

  return secret.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATE KEYS AT STARTUP - Will throw and crash if invalid
// ═══════════════════════════════════════════════════════════════════════════════

let VALIDATED_STRIPE_KEY: string | null = null;
let VALIDATED_WEBHOOK_SECRET: string | null = null;
let stripeKeyError: string | null = null;

try {
  VALIDATED_STRIPE_KEY = validateStripeKey(process.env.STRIPE_SECRET_KEY);
  console.log('✅ STRIPE_SECRET_KEY validated successfully');
} catch (error: any) {
  stripeKeyError = error.message;
  console.error('❌ ═══════════════════════════════════════════════════════════════');
  console.error('❌ STRIPE KEY VALIDATION FAILED');
  console.error('❌ ═══════════════════════════════════════════════════════════════');
  console.error(`❌ ${error.message}`);
  console.error('❌ Stripe checkout will NOT work until this is fixed.');
  console.error('❌ ═══════════════════════════════════════════════════════════════');
}

VALIDATED_WEBHOOK_SECRET = validateWebhookSecretKey(process.env.STRIPE_WEBHOOK_SECRET);

// Legacy aliases for backward compatibility with existing code
const SANITIZED_STRIPE_KEY = VALIDATED_STRIPE_KEY;
const SANITIZED_WEBHOOK_SECRET = VALIDATED_WEBHOOK_SECRET;

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CONFIGURATION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

const validateStripeConfig = () => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || '';

  // Detect production by NODE_ENV, live keys, or production URLs
  const isProductionEnv = process.env.NODE_ENV === 'production';
  const isProductionUrl = frontendUrl.includes('smartpromptiq.com') ||
                          frontendUrl.includes('.render.com') ||
                          frontendUrl.includes('.railway.app') ||
                          frontendUrl.includes('.vercel.app');
  const isProduction = isProductionEnv || isProductionUrl;

  // Check if key validation failed during startup
  if (!VALIDATED_STRIPE_KEY) {
    return {
      valid: false,
      error: stripeKeyError || 'STRIPE_SECRET_KEY validation failed',
      isProduction,
      sanitizedKey: null
    };
  }

  const isLiveKey = VALIDATED_STRIPE_KEY.startsWith('sk_live_');
  const isTestKey = VALIDATED_STRIPE_KEY.startsWith('sk_test_');

  // This should not happen since validateStripeKey already checks this
  if (!isLiveKey && !isTestKey) {
    return { valid: false, error: 'STRIPE_SECRET_KEY must start with sk_live_ or sk_test_', isProduction, sanitizedKey: null };
  }

  // Warn if using test keys in production-like environment
  if (isProduction && !isLiveKey) {
    console.warn('⚠️ WARNING: Using test Stripe key in production-like environment');
    console.warn(`   Frontend URL: ${frontendUrl}`);
    console.warn('   Set NODE_ENV=production and use sk_live_ keys for production');
  }

  // Warn if using live keys in development
  if (!isProduction && isLiveKey) {
    console.warn('⚠️ WARNING: Using LIVE Stripe key in development environment');
    console.warn('   This will process REAL payments! Consider using sk_test_ for development');
  }

  return {
    valid: true,
    mode: isLiveKey ? 'live' : 'test',
    keyPrefix: VALIDATED_STRIPE_KEY.substring(0, 12) + '...',
    isProduction,
    sanitizedKey: VALIDATED_STRIPE_KEY
  };
};

const stripeConfig = validateStripeConfig();
console.log(`\n💳 ═══════════════════════════════════════════════════════════════`);
console.log(`💳 Stripe Configuration Status`);
console.log(`💳 ═══════════════════════════════════════════════════════════════`);
console.log(`💳 Configuration: ${stripeConfig.valid ? '✅ Valid' : '❌ Invalid - ' + stripeConfig.error}`);
console.log(`💳 Stripe Mode: ${stripeConfig.mode || 'N/A'} ${stripeConfig.mode === 'live' ? '(REAL PAYMENTS)' : '(Test Mode)'}`);
console.log(`💳 Key Prefix: ${stripeConfig.keyPrefix || 'Not configured'}`);
console.log(`💳 Environment: ${stripeConfig.isProduction ? 'PRODUCTION' : 'Development'}`);
console.log(`💳 Key Validated: ${VALIDATED_STRIPE_KEY ? '✅ Yes' : '❌ No - ' + (stripeKeyError || 'Unknown error')}`);
console.log(`💳 Webhook Secret: ${VALIDATED_WEBHOOK_SECRET ? '✅ Configured' : '❌ Not configured'}`);
console.log(`💳 ═══════════════════════════════════════════════════════════════\n`);

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CLIENT INITIALIZATION - Uses VALIDATED key only
// ═══════════════════════════════════════════════════════════════════════════════

let stripe: Stripe | null = null;
if (stripeConfig.valid && VALIDATED_STRIPE_KEY) {
  try {
    stripe = new Stripe(VALIDATED_STRIPE_KEY, {
      apiVersion: '2023-10-16',
      timeout: 30000,
      maxNetworkRetries: 3,
      telemetry: false,
      // IMPORTANT: Do not pass any custom httpAgent or headers
      // The Stripe SDK handles Authorization header internally
    });
    console.log('✅ Stripe client initialized with validated key (30s timeout, 3 retries)');
  } catch (initError: any) {
    console.error('❌ Failed to initialize Stripe client:', initError.message);
    stripe = null;
  }
} else if (stripeKeyError) {
  console.error('❌ Stripe client NOT initialized due to key validation failure');
}

// Helper to get Stripe instance or throw
const getStripeOrFail = (res: express.Response, correlationId?: string): Stripe | null => {
  if (!stripeConfig.valid) {
    res.status(503).json({
      success: false,
      error: 'STRIPE_NOT_CONFIGURED',
      message: stripeConfig.error || 'Payment service not configured',
      correlationId
    });
    return null;
  }
  if (!stripe) {
    res.status(503).json({
      success: false,
      error: 'STRIPE_CLIENT_NOT_INITIALIZED',
      message: 'Stripe payment service is not available.',
      correlationId
    });
    return null;
  }
  return stripe;
};

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CUSTOMER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate if a Stripe customer ID is valid (not empty, correct format)
 */
const isValidStripeCustomerId = (customerId: string | null | undefined): customerId is string => {
  if (!customerId) return false;
  if (typeof customerId !== 'string') return false;
  // Stripe customer IDs start with 'cus_'
  if (!customerId.startsWith('cus_')) return false;
  // Must have content after prefix
  if (customerId.length < 10) return false;
  return true;
};

/**
 * Get existing Stripe customer or create a new one
 * Handles the common case where stripeCustomerId is empty string or invalid
 *
 * @param stripeClient - Initialized Stripe client
 * @param user - User object from database
 * @param correlationId - Request correlation ID for logging
 * @returns Stripe customer ID (guaranteed valid)
 */
const getOrCreateStripeCustomer = async (
  stripeClient: Stripe,
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null; stripeCustomerId?: string | null },
  correlationId?: string
): Promise<string> => {
  const logPrefix = correlationId ? `[${correlationId}] ` : '';

  // Check if user has a valid existing Stripe customer ID
  if (isValidStripeCustomerId(user.stripeCustomerId)) {
    try {
      // Verify the customer still exists in Stripe
      const existingCustomer = await stripeClient.customers.retrieve(user.stripeCustomerId);

      // Check if customer was deleted in Stripe
      if ((existingCustomer as any).deleted) {
        console.log(`💳 ${logPrefix}Stripe customer ${user.stripeCustomerId} was deleted, creating new one`);
      } else {
        console.log(`💳 ${logPrefix}Using existing Stripe customer: ${user.stripeCustomerId}`);
        return user.stripeCustomerId;
      }
    } catch (retrieveError: any) {
      // Customer doesn't exist in Stripe (404) or other error
      console.log(`💳 ${logPrefix}Could not retrieve customer ${user.stripeCustomerId}: ${retrieveError.message}`);
      console.log(`💳 ${logPrefix}Creating new Stripe customer...`);
    }
  } else {
    console.log(`💳 ${logPrefix}No valid Stripe customer ID (value: "${user.stripeCustomerId || 'null'}"), creating new one`);
  }

  // Create new Stripe customer
  const customerName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  const newCustomer = await stripeClient.customers.create({
    email: user.email,
    name: customerName || undefined,
    metadata: {
      userId: user.id,
      createdAt: new Date().toISOString(),
      source: 'smartpromptiq'
    }
  });

  console.log(`💳 ${logPrefix}Created new Stripe customer: ${newCustomer.id}`);

  // Persist the new customer ID to database
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: newCustomer.id }
  });

  console.log(`💳 ${logPrefix}Persisted Stripe customer ID to database`);

  return newCustomer.id;
};

/**
 * Normalize subscription status for checkout
 * Free users should have status "none" not "active"
 */
const normalizeSubscriptionStatusForCheckout = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true, subscriptionTier: true }
  });

  if (!user) return;

  // If user is on free tier but has "active" status, normalize to "none"
  const isFreeUser = !user.plan ||
                     user.plan === 'FREE' ||
                     user.plan === 'free' ||
                     user.subscriptionTier === 'free' ||
                     !user.subscriptionTier;

  if (isFreeUser && user.subscriptionStatus === 'active') {
    console.log(`💳 Normalizing subscription status for free user ${userId}: active → none`);
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'none' }
    });
  }
};

// Log pricing configuration status on startup
const pricingValidation = validatePricingConfiguration();
if (!pricingValidation.valid) {
  console.warn('⚠️ Missing Stripe Price IDs:', pricingValidation.missing.join(', '));
} else {
  console.log('✅ All Stripe Price IDs configured');
}

// Webhook config is already validated at startup via validateWebhookSecretKey
const webhookConfig = {
  valid: !!VALIDATED_WEBHOOK_SECRET,
  secret: VALIDATED_WEBHOOK_SECRET,
  error: VALIDATED_WEBHOOK_SECRET ? null : 'Webhook secret not configured or invalid'
};

if (webhookConfig.valid) {
  console.log('✅ Stripe webhook secret validated and ready');
} else {
  console.warn('⚠️ Stripe webhooks will fail - webhook secret not properly configured');
}

// Create Stripe customer and subscription
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: 'Price ID is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        stripeCustomerId: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Normalize subscription status before subscribing
    await normalizeSubscriptionStatusForCheckout(user.id);

    // Use robust customer helper (handles empty strings, deleted customers, etc.)
    const customerId = await getOrCreateStripeCustomer(stripeClient, user);

    // Create subscription
    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription creation failed'
    });
  }
});

// Purchase tokens (add-on)
router.post('/purchase-tokens', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { packageKey, paymentMethodId } = req.body;

    if (!packageKey || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Package key and payment method ID are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        stripeCustomerId: true,
        tokenBalance: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get token packages from centralized pricing config
    const tokenPackagesArray = getTokenPackages();
    const tokenPackagesMap: Record<string, { tokens: number; priceInCents: number; stripeId: string }> = {};
    tokenPackagesArray.forEach(pkg => {
      tokenPackagesMap[pkg.key] = {
        tokens: pkg.tokens,
        priceInCents: pkg.priceInCents,
        stripeId: pkg.stripePriceId
      };
    });

    // Legacy addon mappings for backward compatibility
    const legacyPackages: Record<string, { tokens: number; priceInCents: number; stripeId: string }> = {
      addon_small: { tokens: 20, priceInCents: 500, stripeId: 'price_1QKrTdJNxVjDuJxhRtAMo2L3' },
      addon_medium: { tokens: 50, priceInCents: 1000, stripeId: 'price_1QKrTdJNxVjDuJxhRtAMo2L4' }
    };

    const tokenPackage = tokenPackagesMap[packageKey] || legacyPackages[packageKey];
    if (!tokenPackage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token package'
      });
    }

    // Use robust customer helper (handles empty strings, deleted customers, etc.)
    const customerId = await getOrCreateStripeCustomer(stripeClient, user);

    // Create payment intent for one-time token purchase
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: tokenPackage.priceInCents,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId: user!.id,
        packageKey,
        tokenCount: tokenPackage.tokens.toString(),
        type: 'token_purchase'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // IMPORTANT: Don't credit tokens here - let the webhook handle it
      // This prevents double-crediting when webhook also processes payment_intent.succeeded
      // The webhook will credit tokens with idempotency protection
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90); // 90-day expiry

      console.log(`💰 Token purchase initiated for user ${user!.id}: ${tokenPackage.tokens} tokens (PI: ${paymentIntent.id})`);
      console.log(`   Tokens will be credited via webhook to prevent double-crediting`);

      res.json({
        success: true,
        data: {
          tokensAdded: tokenPackage.tokens,
          newBalance: (user!.tokenBalance || 0) + tokenPackage.tokens, // Expected balance after webhook processes
          paymentIntentId: paymentIntent.id,
          expiryDate,
          note: 'Tokens will be added to your account momentarily'
        }
      });
    } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation') {
      // Payment requires additional action (3D Secure, etc.)
      res.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        paymentStatus: paymentIntent.status,
        message: 'Additional authentication required'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        paymentStatus: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Token purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Token purchase failed'
    });
  }
});

// Get user's billing info
router.get('/info', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    let billingInfo = null;

    if (user!.stripeCustomerId && stripe) {
      const customer = await stripe.customers.retrieve(user!.stripeCustomerId);
      const subscriptions = await stripe.subscriptions.list({
        customer: user!.stripeCustomerId,
        status: 'active'
      });

      billingInfo = {
        customer,
        subscriptions: subscriptions.data
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          plan: user!.plan,
          stripeCustomerId: user!.stripeCustomerId,
          subscriptionStatus: user!.subscriptionStatus
        },
        billingInfo
      }
    });
  } catch (error) {
    console.error('Billing info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve billing info'
    });
  }
});

// Get pricing tiers (public endpoint)
router.get('/pricing', async (req, res) => {
  try {
    const tiers = getPricingTiers();
    const billingCycle = (req.query.billingCycle as string) || 'monthly';

    // Return tiers with proper price based on billing cycle
    const formattedTiers = tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      price: billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice,
      billingCycle,
      stripePriceId: billingCycle === 'yearly' ? tier.stripePriceYearly : tier.stripePriceMonthly,
      features: tier.features,
      limits: tier.limits,
      rateLimits: tier.rateLimits,
      support: tier.support,
      badge: tier.badge,
      popular: tier.popular
    }));

    res.json({
      success: true,
      data: {
        tiers: formattedTiers,
        billingCycle
      }
    });
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pricing'
    });
  }
});

// Get token packages (public endpoint)
router.get('/token-packages', async (req, res) => {
  try {
    const packages = getTokenPackages();

    res.json({
      success: true,
      data: {
        packages
      }
    });
  } catch (error) {
    console.error('Token packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve token packages'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CHECKOUT SESSION - Redirect to Stripe-hosted payment page
// ═══════════════════════════════════════════════════════════════════════════════

// Generate correlation ID for request tracing
const generateCorrelationId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * POST /api/billing/create-checkout-session
 * Creates a Stripe Checkout Session for subscription or one-time payment
 * Accepts either priceId directly OR tierId + billingCycle to look up the price
 *
 * PRODUCTION ONLY - NO MOCK FALLBACKS
 *
 * Authentication:
 * - Subscription mode: REQUIRES authentication (no guest checkout for subscriptions)
 * - Payment mode: Allows guest checkout with optionalAuth
 */
router.post('/create-checkout-session', optionalAuth, async (req, res) => {
  const correlationId = generateCorrelationId();
  const isProduction = stripeConfig.isProduction || false;
  const startTime = Date.now();

  console.log(`\n💳 ═══════════════════════════════════════════════════════════════`);
  console.log(`💳 [${correlationId}] Checkout Session Request`);
  console.log(`💳 [${correlationId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`💳 ═══════════════════════════════════════════════════════════════`);

  // Set response timeout to prevent hanging requests
  res.setTimeout(25000, () => {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [${correlationId}] Response timeout after ${elapsed}ms`);
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: 'GATEWAY_TIMEOUT',
        message: 'Payment request timed out. Please try again.',
        correlationId
      });
    }
  });

  try {
    let { priceId, tierId, billingCycle = 'monthly', mode = 'subscription', successUrl, cancelUrl } = req.body;

    console.log(`💳 [${correlationId}] Request Details:`, {
      tierId,
      billingCycle,
      mode,
      priceId: priceId || 'not provided',
      userId: req.user?.id || 'guest',
      hasValidUser: !!req.user?.id && !!req.user?.email,
      environment: isProduction ? 'PRODUCTION' : 'development'
    });

    // ══════════════════════════════════════════════════════════════════════════
    // AUTHENTICATION VALIDATION
    // ══════════════════════════════════════════════════════════════════════════

    // For subscription mode, REQUIRE valid authentication
    if (mode === 'subscription') {
      if (!req.user?.id || !req.user?.email) {
        console.error(`❌ [${correlationId}] Subscription checkout requires authentication`);
        return res.status(401).json({
          success: false,
          error: 'AUTH_REQUIRED',
          message: 'Please log in to subscribe. Subscription checkout requires a valid account.',
          correlationId
        });
      }

      // Validate the user actually exists in database
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true }
      });

      if (!userExists) {
        console.error(`❌ [${correlationId}] User ${req.user.id} not found in database`);
        return res.status(401).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Your account could not be verified. Please log in again.',
          correlationId
        });
      }

      // Normalize subscription status for free users before checkout
      await normalizeSubscriptionStatusForCheckout(req.user.id);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STRICT VALIDATION: No mock fallbacks allowed
    // ══════════════════════════════════════════════════════════════════════════

    // Handle free tier - no checkout needed
    if (tierId?.toLowerCase() === 'free') {
      console.log(`💳 [${correlationId}] Free tier selected - no checkout needed`);
      return res.status(400).json({
        success: false,
        error: 'FREE_TIER_NO_CHECKOUT',
        message: 'Free tier does not require payment. Your account is already active!'
      });
    }

    // CRITICAL: Validate Stripe is properly configured
    if (!stripeConfig.valid) {
      console.error(`❌ [${correlationId}] Stripe configuration invalid: ${stripeConfig.error}`);
      return res.status(503).json({
        success: false,
        error: 'STRIPE_NOT_CONFIGURED',
        message: stripeConfig.error || 'Payment service not configured',
        correlationId
      });
    }

    // CRITICAL: Ensure Stripe client is initialized
    if (!stripe) {
      console.error(`❌ [${correlationId}] Stripe client not initialized`);
      return res.status(503).json({
        success: false,
        error: 'STRIPE_CLIENT_NOT_INITIALIZED',
        message: 'Stripe payment service is not available. Please contact support.',
        correlationId
      });
    }

    // Use local reference for type narrowing
    const stripeClient = stripe;

    console.log(`💳 [${correlationId}] Stripe Mode: ${stripeConfig.mode?.toUpperCase()}`);
    console.log(`💳 [${correlationId}] Key Prefix: ${stripeConfig.keyPrefix}`);

    // Map tier to Stripe price ID
    if (!priceId && tierId) {
      const stripePriceIds = getStripePriceIds();
      const normalizedTier = tierId.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
      const normalizedCycle = (billingCycle || 'monthly').toLowerCase();

      console.log(`💳 [${correlationId}] Looking up price for tier: ${normalizedTier}, cycle: ${normalizedCycle}`);
      console.log(`💳 [${correlationId}] Available Price IDs:`, {
        STARTER_MONTHLY: stripePriceIds.STARTER_MONTHLY || 'NOT SET',
        STARTER_YEARLY: stripePriceIds.STARTER_YEARLY || 'NOT SET',
        ACADEMY_PLUS_MONTHLY: stripePriceIds.ACADEMY_PLUS_MONTHLY || 'NOT SET',
        ACADEMY_PLUS_YEARLY: stripePriceIds.ACADEMY_PLUS_YEARLY || 'NOT SET',
        PRO_MONTHLY: stripePriceIds.PRO_MONTHLY || 'NOT SET',
        PRO_YEARLY: stripePriceIds.PRO_YEARLY || 'NOT SET',
        TEAM_PRO_MONTHLY: stripePriceIds.TEAM_PRO_MONTHLY || 'NOT SET',
        TEAM_PRO_YEARLY: stripePriceIds.TEAM_PRO_YEARLY || 'NOT SET',
        ENTERPRISE_MONTHLY: stripePriceIds.ENTERPRISE_MONTHLY || 'NOT SET',
        ENTERPRISE_YEARLY: stripePriceIds.ENTERPRISE_YEARLY || 'NOT SET',
      });

      const tierPriceMap: Record<string, string | undefined> = {
        'academy': normalizedCycle === 'yearly' ? stripePriceIds.ACADEMY_PLUS_YEARLY : stripePriceIds.ACADEMY_PLUS_MONTHLY,
        'academy_plus': normalizedCycle === 'yearly' ? stripePriceIds.ACADEMY_PLUS_YEARLY : stripePriceIds.ACADEMY_PLUS_MONTHLY,
        'starter': normalizedCycle === 'yearly' ? stripePriceIds.STARTER_YEARLY : stripePriceIds.STARTER_MONTHLY,
        'pro': normalizedCycle === 'yearly' ? stripePriceIds.PRO_YEARLY : stripePriceIds.PRO_MONTHLY,
        'team': normalizedCycle === 'yearly' ? stripePriceIds.TEAM_PRO_YEARLY : stripePriceIds.TEAM_PRO_MONTHLY,
        'team_pro': normalizedCycle === 'yearly' ? stripePriceIds.TEAM_PRO_YEARLY : stripePriceIds.TEAM_PRO_MONTHLY,
        'enterprise': normalizedCycle === 'yearly' ? stripePriceIds.ENTERPRISE_YEARLY : stripePriceIds.ENTERPRISE_MONTHLY,
      };

      priceId = tierPriceMap[normalizedTier];
      console.log(`💳 [${correlationId}] Resolved priceId: ${priceId || 'NOT FOUND'}`);
    }

    // CRITICAL: Validate price ID format
    if (!priceId) {
      console.error(`❌ [${correlationId}] No price ID found for tier: ${tierId}`);
      return res.status(400).json({
        success: false,
        error: 'PRICE_ID_NOT_FOUND',
        message: `No Stripe price configured for tier "${tierId}" with billing cycle "${billingCycle}"`,
        correlationId
      });
    }

    if (!priceId.startsWith('price_')) {
      console.error(`❌ [${correlationId}] Invalid price ID format: ${priceId}`);
      return res.status(400).json({
        success: false,
        error: 'INVALID_PRICE_ID_FORMAT',
        message: 'Price ID must start with "price_". Please configure valid Stripe Price IDs.',
        correlationId
      });
    }

    console.log(`💳 [${correlationId}] Using priceId: ${priceId}`);

    // Determine base URLs
    const baseUrl = process.env.FRONTEND_URL ||
                    process.env.RENDER_EXTERNAL_URL ||
                    'http://localhost:5173';

    // Build checkout session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: successUrl || `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        correlationId,
        tierId: tierId || 'direct',
        billingCycle,
        userId: req.user?.id || 'guest'
      }
    };

    // ══════════════════════════════════════════════════════════════════════════
    // CUSTOMER HANDLING - Use robust getOrCreateStripeCustomer helper
    // ══════════════════════════════════════════════════════════════════════════
    if (req.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          stripeCustomerId: true
        }
      });

      if (user) {
        // Use the robust helper that handles empty strings, deleted customers, etc.
        const customerId = await getOrCreateStripeCustomer(stripeClient, user, correlationId);
        sessionConfig.customer = customerId;
      } else {
        // For subscription mode, we already validated user exists above
        // This branch only applies to payment mode with invalid auth token
        if (mode === 'subscription') {
          console.error(`❌ [${correlationId}] User not found for subscription checkout`);
          return res.status(401).json({
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'Your account could not be found. Please log in again.',
            correlationId
          });
        }

        // For payment mode, fall back to email-based checkout
        if (req.user.email) {
          sessionConfig.customer_email = req.user.email;
          console.log(`💳 [${correlationId}] User not in DB, using email for checkout: ${req.user.email}`);
        } else {
          console.log(`💳 [${correlationId}] No user found, no email - Stripe will collect`);
        }
      }
    } else {
      // Guest checkout - only allowed for payment mode (subscription mode was rejected above)
      if (mode === 'subscription') {
        // This should never happen due to validation above, but just in case
        console.error(`❌ [${correlationId}] Guest checkout not allowed for subscriptions`);
        return res.status(401).json({
          success: false,
          error: 'AUTH_REQUIRED',
          message: 'Please log in to subscribe.',
          correlationId
        });
      }
      console.log(`💳 [${correlationId}] Guest checkout - Stripe will collect email`);
    }

    // Add subscription-specific options
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          correlationId,
          userId: req.user?.id || 'guest'
        }
      };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CREATE STRIPE CHECKOUT SESSION - This MUST succeed or throw
    // ══════════════════════════════════════════════════════════════════════════
    console.log(`💳 [${correlationId}] Creating Stripe Checkout Session...`);

    const session = await stripeClient.checkout.sessions.create(sessionConfig);

    // ══════════════════════════════════════════════════════════════════════════
    // CRITICAL VALIDATION: Verify session ID format
    // ══════════════════════════════════════════════════════════════════════════
    const expectedPrefix = stripeConfig.mode === 'live' ? 'cs_live_' : 'cs_test_';

    if (!session.id.startsWith(expectedPrefix)) {
      console.error(`❌ [${correlationId}] Session ID mismatch!`);
      console.error(`❌ [${correlationId}] Expected prefix: ${expectedPrefix}`);
      console.error(`❌ [${correlationId}] Actual session.id: ${session.id}`);

      // In production with live keys, this is a critical error
      if (isProduction && stripeConfig.mode === 'live') {
        return res.status(500).json({
          success: false,
          error: 'SESSION_ID_MISMATCH',
          message: 'Stripe returned unexpected session format. Payment cannot proceed.',
          correlationId
        });
      }
    }

    // Log successful session creation
    const elapsed = Date.now() - startTime;
    console.log(`\n💳 ═══════════════════════════════════════════════════════════════`);
    console.log(`✅ [${correlationId}] STRIPE CHECKOUT SESSION CREATED SUCCESSFULLY`);
    console.log(`💳 ═══════════════════════════════════════════════════════════════`);
    console.log(`💳 [${correlationId}] Session ID: ${session.id}`);
    console.log(`💳 [${correlationId}] Stripe Mode: ${stripeConfig.mode?.toUpperCase()}`);
    console.log(`💳 [${correlationId}] Price ID: ${priceId}`);
    console.log(`💳 [${correlationId}] Checkout URL: ${session.url}`);
    console.log(`💳 [${correlationId}] Elapsed Time: ${elapsed}ms`);
    console.log(`💳 ═══════════════════════════════════════════════════════════════\n`);

    // Return successful response
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      mode: stripeConfig.mode,
      correlationId
    });

  } catch (error: any) {
    // ══════════════════════════════════════════════════════════════════════════
    // ERROR HANDLING: Enhanced error classification and user-friendly messages
    // ══════════════════════════════════════════════════════════════════════════
    const elapsed = Date.now() - startTime;
    console.error(`\n❌ ═══════════════════════════════════════════════════════════════`);
    console.error(`❌ [${correlationId}] STRIPE CHECKOUT SESSION FAILED`);
    console.error(`❌ ═══════════════════════════════════════════════════════════════`);
    console.error(`❌ [${correlationId}] Error Type: ${error.type || 'Unknown'}`);
    console.error(`❌ [${correlationId}] Error Code: ${error.code || 'Unknown'}`);
    console.error(`❌ [${correlationId}] Error Message: ${error.message}`);
    console.error(`❌ [${correlationId}] Elapsed Time: ${elapsed}ms`);
    console.error(`❌ [${correlationId}] Full Error:`, error);
    console.error(`❌ ═══════════════════════════════════════════════════════════════\n`);

    // Determine appropriate status code and user-friendly message
    let statusCode = 500;
    let errorCode = 'STRIPE_ERROR';
    let userMessage = 'Failed to create checkout session. Please try again.';

    // Network/connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      statusCode = 503;
      errorCode = 'STRIPE_CONNECTION_ERROR';
      userMessage = 'Unable to connect to payment service. Please try again in a few moments.';
      console.error(`❌ [${correlationId}] NETWORK ERROR: ${error.code} - Check server connectivity to Stripe`);
    } else if (error.message?.includes('connect') || error.message?.includes('network') || error.message?.includes('timeout')) {
      statusCode = 503;
      errorCode = 'STRIPE_NETWORK_ERROR';
      userMessage = 'Payment service temporarily unavailable. Please try again shortly.';
    } else if (error.type === 'StripeConnectionError') {
      statusCode = 503;
      errorCode = 'STRIPE_CONNECTION_ERROR';
      userMessage = 'Unable to reach payment service. Please check your internet connection and try again.';
    } else if (error.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      errorCode = 'STRIPE_INVALID_REQUEST';
      userMessage = error.message || 'Invalid payment request. Please contact support.';
    } else if (error.type === 'StripeAuthenticationError') {
      statusCode = 500; // Don't expose auth issues to users
      errorCode = 'STRIPE_CONFIG_ERROR';
      userMessage = 'Payment configuration error. Please contact support.';
      console.error(`❌ [${correlationId}] CRITICAL: Stripe authentication failed - check API keys`);
    } else if (error.type === 'StripeRateLimitError') {
      statusCode = 429;
      errorCode = 'STRIPE_RATE_LIMIT';
      userMessage = 'Too many payment requests. Please wait a moment and try again.';
    } else if (error.type === 'StripeAPIError') {
      statusCode = 502;
      errorCode = 'STRIPE_API_ERROR';
      userMessage = 'Payment service error. Please try again in a few moments.';
    }

    // Return error response with user-friendly message
    res.status(statusCode).json({
      success: false,
      error: errorCode,
      message: userMessage,
      correlationId,
      stripeErrorCode: error.code || null,
      // Include technical details only in development
      ...(process.env.NODE_ENV !== 'production' && {
        technicalDetails: {
          type: error.type,
          rawMessage: error.message,
          elapsed: `${elapsed}ms`
        }
      })
    });
  }
});

/**
 * POST /api/billing/create-token-checkout
 * Creates a Checkout Session specifically for token purchases (one-time payment)
 */
router.post('/create-token-checkout', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { packageKey } = req.body;

    if (!packageKey) {
      return res.status(400).json({
        success: false,
        message: 'Package key is required'
      });
    }

    // Get token packages
    const tokenPackagesArray = getTokenPackages();
    const tokenPackage = tokenPackagesArray.find(p => p.key === packageKey);

    if (!tokenPackage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token package'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        stripeCustomerId: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use robust customer helper (handles empty strings, deleted customers, etc.)
    const customerId = await getOrCreateStripeCustomer(stripeClient, user);

    const baseUrl = process.env.FRONTEND_URL ||
                    process.env.RENDER_EXTERNAL_URL ||
                    'http://localhost:5173';

    // Create one-time payment session
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokenPackage.tokens} AI Tokens`,
              description: `Add ${tokenPackage.tokens} tokens to your SmartPromptIQ account. Valid for 90 days.`,
            },
            unit_amount: tokenPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/billing?success=true&tokens=${tokenPackage.tokens}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?tab=tokens&canceled=true`,
      metadata: {
        userId: user.id,
        type: 'token_purchase',
        packageKey: packageKey,
        tokenCount: tokenPackage.tokens.toString()
      },
    });

    console.log(`💰 Token checkout session created: ${session.id} for ${tokenPackage.tokens} tokens`);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      tokens: tokenPackage.tokens,
      price: tokenPackage.priceInCents
    });

  } catch (error: any) {
    console.error('Token checkout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create token checkout'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE CUSTOMER PORTAL - Manage subscriptions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/billing/create-portal-session
 * Creates a Stripe Customer Portal session for managing subscriptions
 */
router.post('/create-portal-session', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No billing account found. Please subscribe first.'
      });
    }

    const baseUrl = process.env.FRONTEND_URL ||
                    process.env.RENDER_EXTERNAL_URL ||
                    'http://localhost:5173';

    const session = await stripeClient.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    console.log(`🔧 Portal session created for user ${user.id}`);

    res.json({
      success: true,
      url: session.url
    });

  } catch (error: any) {
    console.error('Portal session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create portal session'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE PRICE VERIFICATION - Verify price IDs exist
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/billing/verify-prices
 * Verifies that all configured Stripe Price IDs exist and are valid
 */
router.get('/verify-prices', async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const priceIds = getStripePriceIds();
    const results: Record<string, { valid: boolean; name?: string; amount?: number; interval?: string; error?: string }> = {};

    // Check each price ID
    for (const [key, priceId] of Object.entries(priceIds)) {
      if (!priceId || priceId === '') {
        results[key] = { valid: false, error: 'Not configured' };
        continue;
      }

      try {
        const price = await stripeClient.prices.retrieve(priceId);
        results[key] = {
          valid: true,
          name: typeof price.product === 'string' ? price.product : (price.product as any)?.name,
          amount: price.unit_amount || 0,
          interval: price.recurring?.interval || 'one_time'
        };
      } catch (err: any) {
        results[key] = {
          valid: false,
          error: err.message || 'Price not found'
        };
      }
    }

    // Summary
    const validCount = Object.values(results).filter(r => r.valid).length;
    const totalCount = Object.keys(results).length;

    res.json({
      success: true,
      summary: {
        valid: validCount,
        total: totalCount,
        allValid: validCount === totalCount
      },
      prices: results
    });

  } catch (error: any) {
    console.error('Price verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify prices'
    });
  }
});

/**
 * GET /api/billing/health
 * Health check endpoint to verify Stripe connectivity
 * Useful for diagnosing connection issues
 */
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  const healthStatus: {
    stripe: { connected: boolean; mode: string | undefined; latency?: number; error?: string };
    config: { valid: boolean; pricesConfigured: boolean; webhookConfigured: boolean };
    environment: string;
  } = {
    stripe: { connected: false, mode: stripeConfig.mode },
    config: {
      valid: stripeConfig.valid,
      pricesConfigured: false,
      webhookConfigured: !!SANITIZED_WEBHOOK_SECRET
    },
    environment: process.env.NODE_ENV || 'development'
  };

  // Check if prices are configured
  const priceValidation = validatePricingConfiguration();
  healthStatus.config.pricesConfigured = priceValidation.valid;

  // Test Stripe connectivity by making a simple API call
  if (stripe && stripeConfig.valid) {
    try {
      // Use balance.retrieve() as a lightweight connectivity test
      await stripe.balance.retrieve();
      healthStatus.stripe.connected = true;
      healthStatus.stripe.latency = Date.now() - startTime;
    } catch (error: any) {
      healthStatus.stripe.connected = false;
      healthStatus.stripe.error = error.type || error.code || error.message || 'Unknown error';
      healthStatus.stripe.latency = Date.now() - startTime;
      console.error('❌ Stripe health check failed:', error.message);
    }
  } else {
    healthStatus.stripe.error = stripeConfig.error || 'Stripe not initialized';
  }

  const isHealthy = healthStatus.stripe.connected && healthStatus.config.valid;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    ...healthStatus,
    // Only show missing prices in development
    ...(process.env.NODE_ENV !== 'production' && !priceValidation.valid && {
      missingPrices: priceValidation.missing
    })
  });
});

/**
 * GET /api/billing/checkout-session/:sessionId
 * Retrieves checkout session details (for success page)
 */
router.get('/checkout-session/:sessionId', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { sessionId } = req.params;

    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'payment_intent']
    });

    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata
      }
    });

  } catch (error: any) {
    console.error('Checkout session retrieval error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve session'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK IDEMPOTENCY - Database-backed tracking to survive server restarts
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a webhook event has already been processed
 * Uses database for persistence across server restarts
 */
async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  try {
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    });
    return existingEvent !== null && existingEvent.processed;
  } catch (error) {
    // If table doesn't exist yet, fall back to allowing processing
    console.warn(`⚠️ Could not check webhook event ${eventId}:`, error);
    return false;
  }
}

/**
 * Mark a webhook event as processed in the database
 */
async function markWebhookEventProcessed(
  eventId: string,
  eventType: string,
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.webhookEvent.upsert({
      where: { id: eventId },
      create: {
        id: eventId,
        type: eventType,
        processed: !errorMessage,
        errorMessage: errorMessage || null,
        processedAt: new Date()
      },
      update: {
        processed: !errorMessage,
        errorMessage: errorMessage || null,
        processedAt: new Date(),
        retryCount: { increment: errorMessage ? 1 : 0 }
      }
    });
  } catch (error) {
    // Log but don't fail - idempotency is best-effort
    console.error(`⚠️ Could not mark webhook event ${eventId} as processed:`, error);
  }
}

/**
 * Cleanup old webhook events (call periodically via cron or startup)
 * Removes events older than 7 days to keep table size manageable
 */
async function cleanupOldWebhookEvents(): Promise<number> {
  const RETENTION_DAYS = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  try {
    const result = await prisma.webhookEvent.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });
    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} old webhook events`);
    }
    return result.count;
  } catch (error) {
    console.error('⚠️ Could not cleanup old webhook events:', error);
    return 0;
  }
}

// Schedule cleanup every 6 hours (won't lose data on restart since it's in DB)
setInterval(() => {
  cleanupOldWebhookEvents().catch(console.error);
}, 6 * 60 * 60 * 1000);

// Run cleanup on startup (delayed to allow DB connection)
setTimeout(() => {
  cleanupOldWebhookEvents().catch(console.error);
}, 30000);

/**
 * POST /api/billing/webhook
 * Stripe webhook handler with idempotency and comprehensive event handling
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION: Ensure Stripe and webhook secret are configured
  // ═══════════════════════════════════════════════════════════════════════════
  if (!stripe) {
    console.error('❌ Webhook received but Stripe client not initialized');
    return res.status(503).json({ error: 'Payment service not configured' });
  }

  if (!sig) {
    console.error('❌ Webhook received without stripe-signature header');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  // Use the sanitized webhook secret (validated at module load)
  if (!SANITIZED_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured or contains invalid characters');
    return res.status(503).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, SANITIZED_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // IDEMPOTENCY: Check if we've already processed this event (database-backed)
  // ═══════════════════════════════════════════════════════════════════════════
  const alreadyProcessed = await isWebhookEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`⚠️ Webhook event ${event.id} already processed, skipping`);
    return res.json({ received: true, duplicate: true });
  }

  console.log(`\n📨 ═══════════════════════════════════════════════════════════════`);
  console.log(`📨 Webhook Event: ${event.type}`);
  console.log(`📨 Event ID: ${event.id}`);
  console.log(`📨 ═══════════════════════════════════════════════════════════════`);

  try {
    switch (event.type) {
      // ─────────────────────────────────────────────────────────────────────────
      // SUBSCRIPTION LIFECYCLE EVENTS
      // ─────────────────────────────────────────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // CHECKOUT COMPLETED - Initial subscription/purchase confirmation
      // ─────────────────────────────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // PAYMENT EVENTS - Success and Failure handling
      // ─────────────────────────────────────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata.type === 'token_purchase') {
          await handleTokenPurchaseSuccess(paymentIntent);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;
      }

      case 'invoice.payment_action_required': {
        const actionRequiredInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentActionRequired(actionRequiredInvoice);
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // CUSTOMER EVENTS
      // ─────────────────────────────────────────────────────────────────────────
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        await handleCustomerUpdated(customer);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
    }

    // Mark event as processed in database (persists across restarts)
    await markWebhookEventProcessed(event.id, event.type);

    console.log(`✅ Webhook ${event.type} processed successfully`);
    res.json({ received: true });

  } catch (error: any) {
    console.error(`❌ Webhook handler error for ${event.type}:`, error);

    // Mark event as failed with error message (for debugging and retry tracking)
    await markWebhookEventProcessed(event.id, event.type, error.message);

    // Return 500 so Stripe will retry
    res.status(500).json({ error: 'Webhook handler failed', message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK HANDLERS - With transactions for data consistency
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle subscription create/update events
 * Uses transaction to ensure User and AcademySubscription stay in sync
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customer }
  });

  if (!user) {
    console.log(`⚠️ No user found for Stripe customer: ${customer}`);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) {
    console.error('❌ No price ID found in subscription');
    return;
  }

  // Use centralized pricing config to get plan from price ID
  const plan = getPlanFromPriceId(priceId);
  const subscriptionTier = getSubscriptionTier(plan);
  const generationsLimit = getGenerationLimits(plan);

  // Determine billing cycle
  const billingCycle = subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly';
  const priceInCents = subscription.items.data[0].price.unit_amount || 0;

  console.log(`📊 Subscription update for user ${user.id}:`);
  console.log(`   priceId=${priceId}, plan=${plan}, tier=${subscriptionTier}`);
  console.log(`   status=${subscription.status}, cancel_at_period_end=${subscription.cancel_at_period_end}`);

  // Use transaction to ensure data consistency
  await prisma.$transaction(async (tx) => {
    // Update user record
    await tx.user.update({
      where: { id: user.id },
      data: {
        plan: plan as any,
        subscriptionTier: subscriptionTier as any,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        generationsLimit: generationsLimit
      }
    });

    // Create or update AcademySubscription record
    await tx.academySubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: subscriptionTier,
        status: subscription.status,
        billingCycle: billingCycle,
        priceInCents: priceInCents,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      update: {
        tier: subscriptionTier,
        status: subscription.status,
        billingCycle: billingCycle,
        priceInCents: priceInCents,
        stripePriceId: priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  });

  console.log(`✅ Updated subscription for user ${user.id}, tier: ${subscriptionTier}`);

  // Send confirmation email (non-blocking)
  try {
    await emailService.sendSubscriptionConfirmation(user.email, {
      plan: plan,
      billingCycle: billingCycle,
      nextBillingDate: new Date(subscription.current_period_end * 1000)
    });
  } catch (emailError) {
    console.error('⚠️ Failed to send subscription confirmation email:', emailError);
  }
}

/**
 * Handle subscription cancellation/deletion
 * Only downgrades when subscription is actually deleted (period ended)
 */
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!user) {
    console.log(`⚠️ No user found for subscription: ${subscription.id}`);
    return;
  }

  console.log(`🚫 Subscription canceled for user ${user.id}`);

  // Use transaction for consistency
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        plan: 'FREE',
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        generationsLimit: 5
      }
    });

    // Use upsert to handle case where AcademySubscription doesn't exist yet
    // This can happen if user subscribed via legacy flow or direct Stripe
    await tx.academySubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: 'free',
        status: 'canceled',
        billingCycle: 'monthly',
        priceInCents: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false
      },
      update: {
        tier: 'free',
        status: 'canceled',
        cancelAtPeriodEnd: false
      }
    });
  });

  console.log(`✅ Downgraded user ${user.id} to free tier`);

  // Send cancellation email (non-blocking)
  try {
    await emailService.sendSubscriptionCancellation(user.email, {
      effectiveDate: new Date()
    });
  } catch (emailError) {
    console.error('⚠️ Failed to send cancellation email:', emailError);
  }
}

/**
 * Handle checkout session completed
 * Links guest checkouts to users and confirms initial payment
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`💳 Checkout completed: ${session.id}`);
  console.log(`   Mode: ${session.mode}, Payment Status: ${session.payment_status}`);
  console.log(`   Customer: ${session.customer}, Email: ${session.customer_email}`);

  // For subscription mode, the subscription webhook will handle updates
  // This handler is for additional tracking and guest checkout linking

  if (session.mode === 'payment' && session.metadata?.type === 'token_purchase') {
    // Token purchase - handled by payment_intent.succeeded
    console.log(`   Token purchase checkout completed`);
    return;
  }

  // Link guest checkout to user if we have customer email
  if (session.customer_email && session.customer) {
    const existingUser = await prisma.user.findUnique({
      where: { email: session.customer_email }
    });

    if (existingUser && !existingUser.stripeCustomerId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { stripeCustomerId: session.customer as string }
      });
      console.log(`   Linked Stripe customer ${session.customer} to user ${existingUser.id}`);
    }
  }
}

/**
 * Handle successful invoice payment (renewals)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.log(`⚠️ No user found for invoice customer: ${customerId}`);
    return;
  }

  console.log(`✅ Invoice payment succeeded for user ${user.id}`);
  console.log(`   Amount: $${(invoice.amount_paid / 100).toFixed(2)}`);
  console.log(`   Billing Reason: ${invoice.billing_reason}`);

  // Update subscription status if it was past_due
  if (user.subscriptionStatus === 'past_due') {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'active' }
    });
    console.log(`   Restored subscription status to active`);
  }

  // Send payment receipt (non-blocking)
  try {
    await emailService.sendPaymentReceipt(user.email, {
      amount: invoice.amount_paid / 100,
      invoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url || undefined
    });
  } catch (emailError) {
    console.error('⚠️ Failed to send payment receipt:', emailError);
  }
}

/**
 * Handle failed invoice payment (failed renewals)
 * Implements dunning: notify user, mark as past_due, eventual downgrade
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.log(`⚠️ No user found for failed invoice customer: ${customerId}`);
    return;
  }

  const attemptCount = invoice.attempt_count || 1;
  const nextAttempt = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000)
    : null;

  console.log(`❌ Invoice payment failed for user ${user.id}`);
  console.log(`   Attempt: ${attemptCount}`);
  console.log(`   Next Retry: ${nextAttempt?.toISOString() || 'Final attempt'}`);

  // Update subscription status to past_due
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: 'past_due' }
  });

  // Send payment failed notification
  try {
    await emailService.sendPaymentFailed(user.email, {
      attemptCount,
      nextRetryDate: nextAttempt,
      updatePaymentUrl: `${process.env.FRONTEND_URL}/billing?update_payment=true`
    });
  } catch (emailError) {
    console.error('⚠️ Failed to send payment failed email:', emailError);
  }

  // If this is the final attempt (Stripe typically retries 3-4 times over ~3 weeks)
  // The subscription.deleted webhook will handle the final downgrade
}

/**
 * Handle payment action required (3D Secure / SCA)
 */
async function handlePaymentActionRequired(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.log(`⚠️ No user found for action required invoice: ${customerId}`);
    return;
  }

  console.log(`⚠️ Payment action required for user ${user.id}`);

  // Send email with link to complete payment
  try {
    await emailService.sendPaymentActionRequired(user.email, {
      invoiceUrl: invoice.hosted_invoice_url || undefined,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined
    });
  } catch (emailError) {
    console.error('⚠️ Failed to send payment action required email:', emailError);
  }
}

/**
 * Handle customer updates (email changes, etc.)
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customer.id }
  });

  if (!user) {
    console.log(`⚠️ No user found for customer update: ${customer.id}`);
    return;
  }

  // If customer email changed and differs from our record, log it
  // (Don't auto-update email as it's a sensitive field)
  if (customer.email && customer.email !== user.email) {
    console.log(`⚠️ Customer email mismatch for user ${user.id}:`);
    console.log(`   Our record: ${user.email}`);
    console.log(`   Stripe: ${customer.email}`);
  }
}

/**
 * Handle token purchase via webhook (with idempotency)
 * Uses payment intent ID to prevent double-crediting
 */
async function handleTokenPurchaseSuccess(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;
  const tokenCount = parseInt(paymentIntent.metadata.tokenCount || '0');
  const paymentIntentId = paymentIntent.id;

  if (!userId || !tokenCount) {
    console.log(`⚠️ Token purchase missing metadata: userId=${userId}, tokenCount=${tokenCount}`);
    return;
  }

  // Check if we've already credited this payment (idempotency)
  const existingPurchase = await prisma.tokenPurchase.findUnique({
    where: { stripePaymentIntentId: paymentIntentId }
  }).catch(() => null); // Table might not exist yet

  if (existingPurchase) {
    console.log(`⚠️ Token purchase ${paymentIntentId} already processed, skipping`);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.log(`⚠️ No user found for token purchase: ${userId}`);
    return;
  }

  // Use transaction to credit tokens and record purchase atomically
  await prisma.$transaction(async (tx) => {
    // Add tokens to user account
    await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: tokenCount }
      }
    });

    // Record the purchase for idempotency and audit trail
    // Note: This requires a TokenPurchase model - create if it doesn't exist
    try {
      await tx.tokenPurchase.create({
        data: {
          userId: userId,
          tokenCount: tokenCount,
          amountInCents: paymentIntent.amount,
          stripePaymentIntentId: paymentIntentId,
          packageKey: paymentIntent.metadata.packageKey || 'unknown'
        }
      });
    } catch (e) {
      // TokenPurchase table might not exist - log but don't fail
      console.log(`⚠️ Could not record token purchase (table may not exist)`);
    }
  });

  console.log(`✅ Added ${tokenCount} tokens to user ${userId} (PI: ${paymentIntentId})`);

  // Send confirmation email
  try {
    await emailService.sendTokenPurchaseConfirmation(user.email, {
      tokenCount,
      newBalance: (user.tokenBalance || 0) + tokenCount
    });
  } catch (emailError) {
    console.error('⚠️ Failed to send token purchase confirmation:', emailError);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/billing/upgrade-subscription
 * Upgrade or downgrade an existing subscription with proration
 */
router.post('/upgrade-subscription', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { newPriceId, billingCycle } = req.body;

    if (!newPriceId) {
      return res.status(400).json({
        success: false,
        message: 'New price ID is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to upgrade. Please subscribe first.'
      });
    }

    // Get current subscription
    const currentSubscription = await stripeClient.subscriptions.retrieve(user.stripeSubscriptionId);

    if (currentSubscription.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upgrade a canceled subscription. Please create a new subscription.'
      });
    }

    const currentItemId = currentSubscription.items.data[0]?.id;
    if (!currentItemId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription state'
      });
    }

    // Update subscription with proration
    const updatedSubscription = await stripeClient.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [{
          id: currentItemId,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations', // Charge/credit difference immediately
        payment_behavior: 'pending_if_incomplete', // Don't fail if payment needs action
      }
    );

    console.log(`✅ Subscription upgraded for user ${user.id} to price ${newPriceId}`);

    res.json({
      success: true,
      data: {
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
      }
    });

  } catch (error: any) {
    console.error('Subscription upgrade error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upgrade subscription'
    });
  }
});

/**
 * GET /api/billing/preview-upgrade
 * Preview the cost of upgrading/downgrading subscription (proration preview)
 * Shows what the user will be charged/credited for the plan change
 */
router.get('/preview-upgrade', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { newPriceId, newTierId, billingCycle } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.stripeSubscriptionId || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found. Please subscribe first.'
      });
    }

    // Determine the new price ID
    let targetPriceId = newPriceId as string;

    if (!targetPriceId && newTierId) {
      // Map tier to price ID
      const stripePriceIds = getStripePriceIds();
      const normalizedTier = (newTierId as string).toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
      const normalizedCycle = ((billingCycle as string) || user.billingCycle || 'monthly').toLowerCase();

      const tierPriceMap: Record<string, string | undefined> = {
        'starter': normalizedCycle === 'yearly' ? stripePriceIds.STARTER_YEARLY : stripePriceIds.STARTER_MONTHLY,
        'academy': normalizedCycle === 'yearly' ? stripePriceIds.ACADEMY_PLUS_YEARLY : stripePriceIds.ACADEMY_PLUS_MONTHLY,
        'academy_plus': normalizedCycle === 'yearly' ? stripePriceIds.ACADEMY_PLUS_YEARLY : stripePriceIds.ACADEMY_PLUS_MONTHLY,
        'pro': normalizedCycle === 'yearly' ? stripePriceIds.PRO_YEARLY : stripePriceIds.PRO_MONTHLY,
        'team': normalizedCycle === 'yearly' ? stripePriceIds.TEAM_PRO_YEARLY : stripePriceIds.TEAM_PRO_MONTHLY,
        'team_pro': normalizedCycle === 'yearly' ? stripePriceIds.TEAM_PRO_YEARLY : stripePriceIds.TEAM_PRO_MONTHLY,
        'enterprise': normalizedCycle === 'yearly' ? stripePriceIds.ENTERPRISE_YEARLY : stripePriceIds.ENTERPRISE_MONTHLY,
      };

      targetPriceId = tierPriceMap[normalizedTier] || '';
    }

    if (!targetPriceId || !targetPriceId.startsWith('price_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier or price ID. Please specify a valid newPriceId or newTierId.'
      });
    }

    // Get current subscription to find the subscription item ID
    const currentSubscription = await stripeClient.subscriptions.retrieve(user.stripeSubscriptionId);
    const currentItemId = currentSubscription.items.data[0]?.id;

    if (!currentItemId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription state - no items found'
      });
    }

    // Check if trying to switch to same price
    const currentPriceId = currentSubscription.items.data[0]?.price?.id;
    if (currentPriceId === targetPriceId) {
      return res.status(400).json({
        success: false,
        message: 'You are already on this plan',
        error: 'SAME_PLAN'
      });
    }

    // Get proration preview from Stripe
    const upcomingInvoice = await stripeClient.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId,
      subscription: user.stripeSubscriptionId,
      subscription_items: [{
        id: currentItemId,
        price: targetPriceId
      }],
      subscription_proration_behavior: 'create_prorations'
    });

    // Get the new price details
    const newPrice = await stripeClient.prices.retrieve(targetPriceId);
    const newPlan = getPlanFromPriceId(targetPriceId);

    // Calculate proration breakdown
    const prorationItems = upcomingInvoice.lines.data.filter(
      line => line.proration
    );
    const prorationCredit = prorationItems
      .filter(line => line.amount < 0)
      .reduce((sum, line) => sum + line.amount, 0);
    const prorationCharge = prorationItems
      .filter(line => line.amount > 0)
      .reduce((sum, line) => sum + line.amount, 0);

    res.json({
      success: true,
      data: {
        currentPlan: {
          tier: user.subscriptionTier,
          priceId: currentPriceId
        },
        newPlan: {
          tier: newPlan.toLowerCase(),
          priceId: targetPriceId,
          unitAmount: newPrice.unit_amount,
          interval: newPrice.recurring?.interval
        },
        proration: {
          total: upcomingInvoice.total, // Net amount due (can be negative for credit)
          credit: prorationCredit,      // Unused time credit (negative)
          charge: prorationCharge,      // New plan charge (positive)
          currency: upcomingInvoice.currency
        },
        billing: {
          immediateCharge: upcomingInvoice.total > 0 ? upcomingInvoice.total : 0,
          immediateCredit: upcomingInvoice.total < 0 ? Math.abs(upcomingInvoice.total) : 0,
          nextInvoiceAmount: newPrice.unit_amount,
          periodStart: new Date((upcomingInvoice as any).period_start * 1000),
          periodEnd: new Date((upcomingInvoice as any).period_end * 1000)
        },
        message: upcomingInvoice.total > 0
          ? `You will be charged $${(upcomingInvoice.total / 100).toFixed(2)} today for the upgrade.`
          : upcomingInvoice.total < 0
            ? `You will receive a $${(Math.abs(upcomingInvoice.total) / 100).toFixed(2)} credit applied to future invoices.`
            : 'No charge for this plan change.'
      }
    });

  } catch (error: any) {
    console.error('Preview upgrade error:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid subscription or price',
        stripeError: error.code
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to preview subscription change'
    });
  }
});

/**
 * POST /api/billing/cancel-subscription
 * Cancel subscription at period end (user keeps access until then)
 */
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const { reason, feedback, immediate = false } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel'
      });
    }

    let canceledSubscription: Stripe.Subscription;

    if (immediate) {
      // Immediate cancellation - ends now
      canceledSubscription = await stripeClient.subscriptions.cancel(user.stripeSubscriptionId);
    } else {
      // Cancel at period end - user keeps access until subscription expires
      canceledSubscription = await stripeClient.subscriptions.update(
        user.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
    }

    // Log cancellation reason for analytics
    console.log(`🚫 Subscription cancellation for user ${user.id}:`);
    console.log(`   Reason: ${reason || 'Not provided'}`);
    console.log(`   Feedback: ${feedback || 'None'}`);
    console.log(`   Immediate: ${immediate}`);

    // Update local records
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: immediate ? 'canceled' : 'active', // Still active until period end
        }
      });

      // Use upsert to handle case where AcademySubscription doesn't exist
      await tx.academySubscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          tier: user.subscriptionTier || 'free',
          status: immediate ? 'canceled' : 'active',
          billingCycle: 'monthly',
          priceInCents: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: !immediate
        },
        update: {
          cancelAtPeriodEnd: !immediate,
          status: immediate ? 'canceled' : 'active'
        }
      });
    });

    res.json({
      success: true,
      data: {
        status: canceledSubscription.status,
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000),
        message: immediate
          ? 'Your subscription has been canceled immediately.'
          : `Your subscription will remain active until ${new Date(canceledSubscription.current_period_end * 1000).toLocaleDateString()}.`
      }
    });

  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription'
    });
  }
});

/**
 * POST /api/billing/reactivate-subscription
 * Reactivate a subscription that was set to cancel at period end
 */
router.post('/reactivate-subscription', authenticate, async (req, res) => {
  try {
    const stripeClient = getStripeOrFail(res);
    if (!stripeClient) return;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription to reactivate'
      });
    }

    // Get current subscription
    const subscription = await stripeClient.subscriptions.retrieve(user.stripeSubscriptionId);

    if (!subscription.cancel_at_period_end) {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not scheduled for cancellation'
      });
    }

    if (subscription.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription has already been canceled. Please create a new subscription.'
      });
    }

    // Reactivate by removing cancel_at_period_end
    const reactivatedSubscription = await stripeClient.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update local records - use upsert to handle missing AcademySubscription
    await prisma.academySubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: user.subscriptionTier || 'free',
        status: 'active',
        billingCycle: 'monthly',
        priceInCents: 0,
        currentPeriodStart: new Date(reactivatedSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(reactivatedSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: reactivatedSubscription.id
      },
      update: {
        cancelAtPeriodEnd: false,
        status: 'active'
      }
    });

    console.log(`✅ Subscription reactivated for user ${user.id}`);

    res.json({
      success: true,
      data: {
        status: reactivatedSubscription.status,
        message: 'Your subscription has been reactivated!'
      }
    });

  } catch (error: any) {
    console.error('Subscription reactivation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reactivate subscription'
    });
  }
});

/**
 * GET /api/billing/subscription-status
 * Get detailed subscription status for the current user
 */
router.get('/subscription-status', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { academySubscription: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let stripeSubscription = null;
    if (user.stripeSubscriptionId && stripe) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (e) {
        console.log(`⚠️ Could not retrieve Stripe subscription: ${user.stripeSubscriptionId}`);
      }
    }

    res.json({
      success: true,
      data: {
        plan: user.plan,
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        cancelAtPeriodEnd: user.academySubscription?.cancelAtPeriodEnd || false,
        tokenBalance: user.tokenBalance,
        generationsLimit: user.generationsLimit,
        stripeSubscription: stripeSubscription ? {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
        } : null
      }
    });

  } catch (error: any) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription status'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS - Webhook Event Monitoring
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/billing/admin/webhook-events
 * Get recent webhook events for debugging (admin only)
 */
router.get('/admin/webhook-events', authenticate, async (req, res) => {
  try {
    // Verify admin access
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { limit = 50, type, failed } = req.query;

    // Build query filters
    const whereClause: any = {};
    if (type) {
      whereClause.type = type as string;
    }
    if (failed === 'true') {
      whereClause.errorMessage = { not: null };
    }

    const [events, stats] = await Promise.all([
      prisma.webhookEvent.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit as string) || 50, 100)
      }),
      prisma.webhookEvent.groupBy({
        by: ['type', 'processed'],
        _count: { id: true },
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    // Calculate summary stats
    const last24Hours = {
      total: stats.reduce((sum, s) => sum + s._count.id, 0),
      successful: stats.filter(s => s.processed).reduce((sum, s) => sum + s._count.id, 0),
      failed: stats.filter(s => !s.processed).reduce((sum, s) => sum + s._count.id, 0),
      byType: stats.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + s._count.id;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      data: {
        events,
        stats: last24Hours
      }
    });

  } catch (error: any) {
    console.error('Webhook events fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch webhook events'
    });
  }
});

/**
 * POST /api/billing/admin/cleanup-webhook-events
 * Manually trigger webhook event cleanup (admin only)
 */
router.post('/admin/cleanup-webhook-events', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const deletedCount = await cleanupOldWebhookEvents();

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old webhook events`
    });

  } catch (error: any) {
    console.error('Webhook cleanup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cleanup webhook events'
    });
  }
});

export default router;
