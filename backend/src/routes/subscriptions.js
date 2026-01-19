/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPRECATED: Subscriptions API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ THIS FILE IS DEPRECATED - DO NOT USE FOR NEW DEVELOPMENT ⚠️
 *
 * All subscription management has been consolidated into:
 *   → backend/src/routes/billing.ts
 *
 * Endpoint Migration Map:
 *   GET  /api/subscriptions/tiers          → GET  /api/billing/pricing
 *   GET  /api/subscriptions/current        → GET  /api/billing/subscription-status
 *   POST /api/subscriptions/create         → POST /api/billing/create-checkout-session
 *   PUT  /api/subscriptions/change         → POST /api/billing/upgrade-subscription
 *   POST /api/subscriptions/cancel         → POST /api/billing/cancel-subscription
 *   POST /api/subscriptions/reactivate     → POST /api/billing/reactivate-subscription
 *   GET  /api/subscriptions/preview-change → GET  /api/billing/preview-upgrade
 *
 * Reasons for Deprecation:
 *   1. Dual systems caused state drift between User and Subscription models
 *   2. This file uses Promise.all without transactions (race conditions)
 *   3. billing.ts has proper idempotency, transactions, and webhook handling
 *   4. Frontend exclusively uses /api/billing/* endpoints
 *
 * This file is kept for reference only. It is no longer mounted in server.js.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

console.warn('⚠️ DEPRECATED: subscriptions.js loaded - this module should not be used');

const express = require('express');
const Stripe = require('stripe');
const { authenticate } = require('../middleware/auth');
const { SUBSCRIPTION_TIERS, calculateSubscriptionPrice } = require('../../../shared/pricing/pricingConfig');
const usageAnalytics = require('../utils/usageAnalytics');
const costCalculator = require('../utils/costCalculator');
const prisma = require('../config/database');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Add deprecation middleware to all routes
router.use((req, res, next) => {
  console.warn(`⚠️ DEPRECATED endpoint called: ${req.method} /api/subscriptions${req.path}`);
  res.set('X-Deprecated', 'true');
  res.set('X-Deprecated-Message', 'Use /api/billing/* endpoints instead');
  next();
});

/**
 * GET /api/subscriptions/tiers - Get all available subscription tiers
 */
router.get('/tiers', async (req, res) => {
  try {
    const { billingCycle = 'monthly' } = req.query;

    const tiers = Object.values(SUBSCRIPTION_TIERS).map(tier => ({
      id: tier.id,
      name: tier.name,
      price: billingCycle === 'monthly' ? tier.priceInCents : calculateSubscriptionPrice(tier.id, 'yearly'),
      billingCycle,
      tokensPerMonth: tier.tokensPerMonth,
      features: tier.features,
      rateLimits: tier.rateLimits,
      support: tier.support
    }));

    res.json({
      success: true,
      data: tiers
    });

  } catch (error) {
    console.error('Error getting subscription tiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscription tiers'
    });
  }
});

/**
 * GET /api/subscriptions/current - Get user's current subscription
 */
router.get('/current', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, subscription] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          billingCycle: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          tokenBalance: true,
          monthlyTokensUsed: true,
          monthlyResetDate: true
        }
      }),
      prisma.subscription.findFirst({
        where: { userId, status: { in: ['active', 'trialing'] } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get tier information
    const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier] || SUBSCRIPTION_TIERS.free;

    // Get Stripe subscription info if exists
    let stripeSubscription = null;
    if (user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (stripeError) {
        console.warn('Error retrieving Stripe subscription:', stripeError.message);
      }
    }

    // Calculate usage percentage
    const tokensLimit = tierInfo.tokensPerMonth;
    const usagePercentage = tokensLimit === -1 ? 0 : (user.monthlyTokensUsed / tokensLimit) * 100;

    res.json({
      success: true,
      data: {
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        billingCycle: user.billingCycle,
        endDate: user.subscriptionEndDate,
        tokenBalance: user.tokenBalance,
        monthlyUsage: {
          used: user.monthlyTokensUsed,
          limit: tokensLimit,
          percentage: Math.min(usagePercentage, 100),
          resetDate: user.monthlyResetDate
        },
        tierInfo,
        subscription: subscription || null,
        stripeSubscription: stripeSubscription ? {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscription'
    });
  }
});

/**
 * POST /api/subscriptions/create - Create a new subscription
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tierId, billingCycle = 'monthly', paymentMethodId } = req.body;

    // Validate tier
    const tierInfo = SUBSCRIPTION_TIERS[tierId];
    if (!tierInfo || tierId === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier'
      });
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        metadata: { userId }
      });
      
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create Stripe subscription
    const price = calculateSubscriptionPrice(tierId, billingCycle);
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: tierInfo.stripeIds[billingCycle]
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        tier: tierId,
        billingCycle
      }
    });

    // Create local subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: tierId,
        status: stripeSubscription.status,
        billingCycle,
        priceInCents: price,
        tokensPerMonth: tierInfo.tokensPerMonth,
        maxTokenRollover: tierInfo.maxTokenRollover,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: tierInfo.stripeIds[billingCycle],
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      }
    });

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tierId,
        subscriptionStatus: stripeSubscription.status,
        subscriptionEndDate: new Date(stripeSubscription.current_period_end * 1000),
        billingCycle,
        stripeSubscriptionId: stripeSubscription.id
      }
    });

    // Track the subscription event
    await usageAnalytics.trackSubscriptionEvent(userId, {
      event: 'subscription_created',
      fromTier: 'free',
      toTier: tierId,
      amountInCents: price
    });

    const clientSecret = stripeSubscription.latest_invoice?.payment_intent?.client_secret;

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        clientSecret,
        subscription
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create subscription'
    });
  }
});

/**
 * PUT /api/subscriptions/change - Change subscription tier
 */
router.put('/change', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { newTierId, billingCycle } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const newTierInfo = SUBSCRIPTION_TIERS[newTierId];
    if (!newTierInfo) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier'
      });
    }

    // Update Stripe subscription
    const stripeSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{
        id: (await stripe.subscriptions.retrieve(user.stripeSubscriptionId)).items.data[0].id,
        price: newTierInfo.stripeIds[billingCycle || user.billingCycle]
      }],
      proration_behavior: 'create_prorations'
    });

    // Update local records
    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTierId,
          subscriptionStatus: stripeSubscription.status,
          subscriptionEndDate: new Date(stripeSubscription.current_period_end * 1000),
          billingCycle: billingCycle || user.billingCycle
        }
      }),
      prisma.subscription.updateMany({
        where: { userId, status: 'active' },
        data: {
          tier: newTierId,
          status: stripeSubscription.status,
          billingCycle: billingCycle || user.billingCycle,
          tokensPerMonth: newTierInfo.tokensPerMonth,
          maxTokenRollover: newTierInfo.maxTokenRollover,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
        }
      })
    ]);

    // Track the change event
    await usageAnalytics.trackSubscriptionEvent(userId, {
      event: user.subscriptionTier < newTierId ? 'subscription_upgraded' : 'subscription_downgraded',
      fromTier: user.subscriptionTier,
      toTier: newTierId,
      amountInCents: calculateSubscriptionPrice(newTierId, billingCycle || user.billingCycle)
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        newTier: newTierId,
        status: stripeSubscription.status
      }
    });

  } catch (error) {
    console.error('Error changing subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change subscription'
    });
  }
});

/**
 * POST /api/subscriptions/cancel - Cancel subscription
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { immediate = false, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Cancel Stripe subscription
    let stripeSubscription;
    if (immediate) {
      stripeSubscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } else {
      stripeSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update local records
    const updateData = {
      subscriptionStatus: immediate ? 'canceled' : 'active',
      ...(immediate && { 
        subscriptionTier: 'free',
        tokenBalance: Math.min(user.tokenBalance, 5) // Free tier limit
      })
    };

    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: updateData
      }),
      prisma.subscription.updateMany({
        where: { userId, status: 'active' },
        data: {
          status: immediate ? 'canceled' : 'active',
          cancelAtPeriodEnd: !immediate,
          canceledAt: immediate ? new Date() : null
        }
      })
    ]);

    // Track the cancellation
    await usageAnalytics.trackSubscriptionEvent(userId, {
      event: 'subscription_canceled',
      fromTier: user.subscriptionTier,
      toTier: immediate ? 'free' : user.subscriptionTier,
      amountInCents: 0
    });

    // Log cancellation reason
    if (reason) {
      await usageAnalytics.recordAnalyticsEvent(userId, 'cancellation_reason', 'subscription', 1, {
        reason,
        immediate,
        tier: user.subscriptionTier
      });
    }

    res.json({
      success: true,
      message: immediate ? 'Subscription canceled immediately' : 'Subscription will cancel at period end',
      data: {
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        periodEnd: new Date(stripeSubscription.current_period_end * 1000)
      }
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

/**
 * POST /api/subscriptions/reactivate - Reactivate a canceled subscription
 */
router.post('/reactivate', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Reactivate Stripe subscription
    const stripeSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update local records
    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'active'
        }
      }),
      prisma.subscription.updateMany({
        where: { userId, stripeSubscriptionId: user.stripeSubscriptionId },
        data: {
          status: 'active',
          cancelAtPeriodEnd: false,
          canceledAt: null
        }
      })
    ]);

    // Track the reactivation
    await usageAnalytics.trackSubscriptionEvent(userId, {
      event: 'subscription_reactivated',
      fromTier: user.subscriptionTier,
      toTier: user.subscriptionTier,
      amountInCents: 0
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        status: stripeSubscription.status
      }
    });

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate subscription'
    });
  }
});

/**
 * GET /api/subscriptions/preview-change - Preview subscription change costs
 */
router.get('/preview-change', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { newTierId, billingCycle } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const newTierInfo = SUBSCRIPTION_TIERS[newTierId];
    if (!newTierInfo) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier'
      });
    }

    // Get proration preview from Stripe
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId,
      subscription: user.stripeSubscriptionId,
      subscription_items: [{
        id: (await stripe.subscriptions.retrieve(user.stripeSubscriptionId)).items.data[0].id,
        price: newTierInfo.stripeIds[billingCycle || user.billingCycle]
      }]
    });

    const prorationAmount = invoice.total;
    const nextInvoiceAmount = calculateSubscriptionPrice(newTierId, billingCycle || user.billingCycle);

    res.json({
      success: true,
      data: {
        currentTier: user.subscriptionTier,
        newTier: newTierId,
        prorationAmount,
        nextInvoiceAmount,
        currency: invoice.currency,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000)
      }
    });

  } catch (error) {
    console.error('Error previewing subscription change:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview subscription change'
    });
  }
});

module.exports = router;