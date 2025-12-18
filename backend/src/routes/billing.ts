import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Log pricing configuration status on startup
const pricingValidation = validatePricingConfiguration();
if (!pricingValidation.valid) {
  console.warn('⚠️ Missing Stripe Price IDs:', pricingValidation.missing.join(', '));
} else {
  console.log('✅ All Stripe Price IDs configured');
}

// Create Stripe customer and subscription
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { priceId } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    let customerId = user!.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user!.email,
        metadata: { userId: user!.id }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user!.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
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
    const { packageKey, paymentMethodId } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

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

    let customerId = user!.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user!.email,
        metadata: { userId: user!.id }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user!.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create payment intent for one-time token purchase
    const paymentIntent = await stripe.paymentIntents.create({
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
      // Add tokens to user account
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90); // 90-day expiry

      await prisma.user.update({
        where: { id: user!.id },
        data: {
          tokenBalance: { increment: tokenPackage.tokens }
        }
      });

      // Log the purchase (you might want to create a token_purchases table)

      res.json({
        success: true,
        data: {
          tokensAdded: tokenPackage.tokens,
          newBalance: (user!.tokenBalance || 0) + tokenPackage.tokens,
          paymentIntentId: paymentIntent.id,
          expiryDate
        }
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

    if (user!.stripeCustomerId) {
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

/**
 * POST /api/billing/create-checkout-session
 * Creates a Stripe Checkout Session for subscription or one-time payment
 * Accepts either priceId directly OR tierId + billingCycle to look up the price
 */
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    let { priceId, tierId, billingCycle = 'monthly', mode = 'subscription', successUrl, cancelUrl } = req.body;

    // If tierId is provided instead of priceId, look up the correct Stripe price ID
    if (!priceId && tierId) {
      const stripePriceIds = getStripePriceIds();
      const tierKey = tierId.toUpperCase().replace('-', '_').replace(' ', '_');
      const cycleKey = billingCycle.toUpperCase();
      const lookupKey = `${tierKey}_${cycleKey}`;

      console.log(`💳 Looking up price for tier: ${tierId}, cycle: ${billingCycle}, key: ${lookupKey}`);

      // Map tier IDs to Stripe price ID keys
      const tierMapping: Record<string, string> = {
        'FREE_MONTHLY': '', // Free tier - no payment needed
        'FREE_YEARLY': '',
        'ACADEMY_MONTHLY': stripePriceIds.ACADEMY_MONTHLY,
        'ACADEMY_YEARLY': stripePriceIds.ACADEMY_YEARLY,
        'PRO_MONTHLY': stripePriceIds.PRO_MONTHLY,
        'PRO_YEARLY': stripePriceIds.PRO_YEARLY,
        'STARTER_MONTHLY': stripePriceIds.PRO_MONTHLY, // Alias for pro
        'STARTER_YEARLY': stripePriceIds.PRO_YEARLY,
        'TEAM_PRO_MONTHLY': stripePriceIds.TEAM_PRO_MONTHLY,
        'TEAM_PRO_YEARLY': stripePriceIds.TEAM_PRO_YEARLY,
        'TEAM_MONTHLY': stripePriceIds.TEAM_PRO_MONTHLY, // Alias
        'TEAM_YEARLY': stripePriceIds.TEAM_PRO_YEARLY,
        'ENTERPRISE_MONTHLY': stripePriceIds.ENTERPRISE_MONTHLY,
        'ENTERPRISE_YEARLY': stripePriceIds.ENTERPRISE_YEARLY,
      };

      priceId = tierMapping[lookupKey];

      if (!priceId && tierId.toLowerCase() !== 'free') {
        console.error(`❌ No price ID found for: ${lookupKey}`);
        return res.status(400).json({
          success: false,
          message: `No Stripe price configured for tier: ${tierId} (${billingCycle}). Please check your Stripe configuration.`,
          availableTiers: Object.keys(tierMapping).filter(k => tierMapping[k])
        });
      }
    }

    // Handle free tier - no checkout needed
    if (!priceId || tierId?.toLowerCase() === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Free tier does not require payment. Your account is already set up!'
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

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Determine base URLs
    const baseUrl = process.env.FRONTEND_URL ||
                    process.env.RENDER_EXTERNAL_URL ||
                    'http://localhost:5173';

    // Create Checkout Session
    const sessionConfig: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode, // 'subscription' or 'payment'
      success_url: successUrl || `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        priceId: priceId
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    };

    // Add subscription-specific options
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          userId: user.id
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`💳 Checkout session created: ${session.id} for user ${user.id}`);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
});

/**
 * POST /api/billing/create-token-checkout
 * Creates a Checkout Session specifically for token purchases (one-time payment)
 */
router.post('/create-token-checkout', authenticate, async (req, res) => {
  try {
    const { packageKey } = req.body;

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
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const baseUrl = process.env.FRONTEND_URL ||
                    process.env.RENDER_EXTERNAL_URL ||
                    'http://localhost:5173';

    // Create one-time payment session
    const session = await stripe.checkout.sessions.create({
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

    const session = await stripe.billingPortal.sessions.create({
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
    const priceIds = getStripePriceIds();
    const results: Record<string, { valid: boolean; name?: string; amount?: number; interval?: string; error?: string }> = {};

    // Check each price ID
    for (const [key, priceId] of Object.entries(priceIds)) {
      if (!priceId || priceId === '') {
        results[key] = { valid: false, error: 'Not configured' };
        continue;
      }

      try {
        const price = await stripe.prices.retrieve(priceId);
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
 * GET /api/billing/checkout-session/:sessionId
 * Retrieves checkout session details (for success page)
 */
router.get('/checkout-session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
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

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata.type === 'token_purchase') {
          await handleTokenPurchaseSuccess(paymentIntent);
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customer }
  });

  if (user) {
    const priceId = subscription.items.data[0].price.id;

    // Use centralized pricing config to get plan from price ID
    const plan = getPlanFromPriceId(priceId);
    const subscriptionTier = getSubscriptionTier(plan);
    const generationsLimit = getGenerationLimits(plan);

    // Determine billing cycle
    const billingCycle = subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly';
    const priceInCents = subscription.items.data[0].price.unit_amount || 0;

    console.log(`📊 Subscription update: priceId=${priceId}, plan=${plan}, tier=${subscriptionTier}, limits=${generationsLimit}`);

    // Update user record
    await prisma.user.update({
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
    try {
      await prisma.academySubscription.upsert({
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

      console.log(`✅ Created/updated AcademySubscription for user ${user.id}, tier: ${subscriptionTier}`);
    } catch (academySubError) {
      console.error('⚠️ Failed to create AcademySubscription (non-critical):', academySubError);
      // Continue even if this fails - user record is updated
    }
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'FREE',
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        generationsLimit: 5
      }
    });

    // Update AcademySubscription to canceled
    try {
      await prisma.academySubscription.update({
        where: { userId: user.id },
        data: {
          tier: 'free',
          status: 'canceled'
        }
      });
      console.log(`✅ Canceled AcademySubscription for user ${user.id}`);
    } catch (error) {
      console.error('⚠️ Failed to cancel AcademySubscription (non-critical):', error);
    }
  }
}

async function handleTokenPurchaseSuccess(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;
  const tokenCount = parseInt(paymentIntent.metadata.tokenCount);

  if (userId && tokenCount) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      // Add tokens to user account
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { increment: tokenCount }
        }
      });

      console.log(`Added ${tokenCount} tokens to user ${userId} via webhook`);
    }
  }
}

export default router;
