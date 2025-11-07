/**
 * Enhanced Billing API Routes - Handle subscriptions and token purchases
 */

const express = require('express');
const Stripe = require('stripe');
const { authenticate } = require('../middleware/auth');
const { TOKEN_PACKAGES, SUBSCRIPTION_TIERS, calculateOptimalTokenCost } = require('../../../shared/pricing/pricingConfig');
const usageAnalytics = require('../utils/usageAnalytics');
const costCalculator = require('../utils/costCalculator');
const { prisma } = require('../config/database');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/billing/purchase-tokens - Purchase token packages
 */
router.post('/purchase-tokens', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageKey, paymentMethodId } = req.body;

    // Validate package
    const tokenPackage = TOKEN_PACKAGES[packageKey];
    if (!tokenPackage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token package'
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tokenPackage.priceInCents,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/billing/success`,
      metadata: {
        userId,
        packageKey,
        tokens: tokenPackage.tokens.toString(),
        type: 'token_purchase'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Add tokens to user balance
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90); // 90 days expiry

      await prisma.tokenTransaction.create({
        data: {
          userId,
          type: 'purchase',
          tokens: tokenPackage.tokens,
          balanceBefore: user.tokenBalance,
          balanceAfter: user.tokenBalance + tokenPackage.tokens,
          costInCents: tokenPackage.priceInCents,
          packageType: packageKey,
          stripePaymentIntentId: paymentIntent.id,
          expiresAt: expirationDate,
          description: `Purchased ${tokenPackage.tokens} tokens (${packageKey} package)`
        }
      });

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { increment: tokenPackage.tokens },
          tokensPurchased: { increment: tokenPackage.tokens },
          lastTokenPurchase: new Date()
        }
      });

      // Track the purchase
      await usageAnalytics.trackTokenPurchase(userId, {
        tokens: tokenPackage.tokens,
        amountInCents: tokenPackage.priceInCents,
        packageType: packageKey,
        transactionId: paymentIntent.id
      });
    }

    res.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        tokensAdded: paymentIntent.status === 'succeeded' ? tokenPackage.tokens : 0
      }
    });

  } catch (error) {
    console.error('Token purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Token purchase failed'
    });
  }
});

/**
 * GET /api/billing/token-packages - Get available token packages
 */
router.get('/token-packages', async (req, res) => {
  try {
    const packages = Object.entries(TOKEN_PACKAGES).map(([key, pkg]) => ({
      key,
      tokens: pkg.tokens,
      priceInCents: pkg.priceInCents,
      pricePerToken: pkg.pricePerToken,
      stripeId: pkg.stripeId,
      savings: key === 'bulk' ? 25 : key === 'large' ? 20 : key === 'medium' ? 10 : 0 // % savings vs smallest package
    }));

    res.json({
      success: true,
      data: packages
    });

  } catch (error) {
    console.error('Error getting token packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve token packages'
    });
  }
});

/**
 * POST /api/billing/create-subscription - Create a subscription with payment
 */
router.post('/create-subscription', authenticate, async (req, res) => {
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

    // Get or create customer
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

    // Attach payment method
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: tierInfo.stripeIds[billingCycle] }],
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
    await prisma.subscription.create({
      data: {
        userId,
        tier: tierId,
        status: subscription.status,
        billingCycle,
        priceInCents: tierInfo.priceInCents,
        tokensPerMonth: tierInfo.tokensPerMonth,
        maxTokenRollover: tierInfo.maxTokenRollover,
        stripeSubscriptionId: subscription.id,
        stripePriceId: tierInfo.stripeIds[billingCycle],
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      }
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

/**
 * GET /api/billing/info - Get comprehensive billing information
 */
router.get('/info', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, tokenTransactions, activeSubscription] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          tokenBalance: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          billingCycle: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          monthlyTokensUsed: true,
          monthlyResetDate: true,
          tokensUsed: true,
          tokensPurchased: true,
          lastTokenPurchase: true
        }
      }),
      prisma.tokenTransaction.findMany({
        where: { userId, type: 'purchase' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          tokens: true,
          costInCents: true,
          packageType: true,
          createdAt: true,
          expiresAt: true,
          isExpired: true
        }
      }),
      prisma.subscription.findFirst({
        where: { userId, status: { in: ['active', 'trialing'] } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Get Stripe customer info if exists
    let stripeInfo = null;
    if (user.stripeCustomerId) {
      try {
        const [customer, paymentMethods, invoices] = await Promise.all([
          stripe.customers.retrieve(user.stripeCustomerId),
          stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card'
          }),
          stripe.invoices.list({
            customer: user.stripeCustomerId,
            limit: 5
          })
        ]);

        stripeInfo = {
          customer,
          paymentMethods: paymentMethods.data,
          recentInvoices: invoices.data
        };
      } catch (stripeError) {
        console.warn('Error retrieving Stripe info:', stripeError.message);
      }
    }

    // Calculate cost safety metrics
    const monthlyCosts = costCalculator.calculateMonthlyCostProjection({
      promptsGenerated: user.monthlyTokensUsed,
      averageComplexity: 'standard'
    }, user.subscriptionTier);

    const monthlyRevenue = SUBSCRIPTION_TIERS[user.subscriptionTier]?.priceInCents || 0;
    const costSafety = costCalculator.checkCostSafety(
      monthlyCosts.totalCostInCents,
      monthlyRevenue,
      user.subscriptionTier
    );

    res.json({
      success: true,
      data: {
        user: {
          tokenBalance: user.tokenBalance,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
          billingCycle: user.billingCycle,
          monthlyUsage: {
            tokensUsed: user.monthlyTokensUsed,
            resetDate: user.monthlyResetDate
          },
          lifetime: {
            tokensUsed: user.tokensUsed,
            tokensPurchased: user.tokensPurchased,
            lastPurchase: user.lastTokenPurchase
          }
        },
        subscription: activeSubscription,
        recentPurchases: tokenTransactions,
        costAnalysis: {
          monthlyCosts: monthlyCosts.totalCostInCents,
          monthlyRevenue,
          costSafety
        },
        stripe: stripeInfo
      }
    });

  } catch (error) {
    console.error('Billing info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve billing information'
    });
  }
});

/**
 * POST /api/billing/upgrade - Upgrade/change subscription plan
 */
router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, billingCycle = 'monthly' } = req.body;

    // Map frontend plan IDs to backend tier IDs
    const planMapping = {
      'free': 'free',
      'starter': 'starter',
      'pro': 'pro',
      'enterprise': 'business' // Frontend uses 'enterprise', backend uses 'business'
    };

    const tierId = planMapping[planId] || planId;

    // Validate tier
    const tierInfo = SUBSCRIPTION_TIERS[tierId];
    if (!tierInfo) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier'
      });
    }

    // LOCAL DEVELOPMENT MODE: Skip Stripe if ENABLE_STRIPE is false
    if (process.env.ENABLE_STRIPE === 'false') {
      console.log(`🧪 DEV MODE (ENABLE_STRIPE=false): Simulating upgrade to ${tierId} (${billingCycle})`);

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tierId.toUpperCase(),
          subscriptionStatus: 'active',
          billingCycle: billingCycle,
          tokenBalance: tierInfo.tokensPerMonth || 0
        }
      });

      return res.json({
        success: true,
        message: `Successfully upgraded to ${tierInfo.name} plan (DEV MODE - No charge)`,
        devMode: true
      });
    }

    // Handle free tier "upgrade" (cancellation)
    if (tierId === 'free') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeSubscriptionId: true }
      });

      if (user?.stripeSubscriptionId) {
        // Cancel existing subscription
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          billingCycle: 'monthly'
        }
      });

      return res.json({
        success: true,
        message: 'Downgraded to free tier'
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

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: tierInfo.stripeIds[billingCycle],
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
      metadata: {
        userId,
        tier: tierId,
        billingCycle
      }
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Upgrade error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upgrade subscription',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

/**
 * GET /api/billing/invoices - Get user invoices
 */
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, startingAfter } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: parseInt(limit),
      starting_after: startingAfter
    });

    const processedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      pdfUrl: invoice.invoice_pdf,
      description: invoice.lines.data[0]?.description || 'Subscription',
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null
    }));

    res.json({
      success: true,
      data: processedInvoices,
      hasMore: invoices.has_more
    });

  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve invoices'
    });
  }
});

/**
 * POST /api/billing/update-payment-method - Update default payment method
 */
router.post('/update-payment-method', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found'
      });
    }

    // Attach and set as default
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({
      success: true,
      message: 'Payment method updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment method'
    });
  }
});

/**
 * Stripe webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handlePaymentSuccess(paymentIntent) {
  if (paymentIntent.metadata?.type === 'token_purchase') {
    const userId = paymentIntent.metadata.userId;
    const tokens = parseInt(paymentIntent.metadata.tokens);
    
    console.log(`Token purchase completed for user ${userId}: ${tokens} tokens`);
  }
}

async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const tierMapping = Object.entries(SUBSCRIPTION_TIERS).find(([, tier]) => 
    tier.stripeIds.monthly === subscription.items.data[0].price.id ||
    tier.stripeIds.yearly === subscription.items.data[0].price.id
  );

  if (tierMapping) {
    const [tierId, tierInfo] = tierMapping;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tierId,
        subscriptionStatus: subscription.status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id
      }
    });

    // Handle monthly token allocation for subscription users
    if (subscription.status === 'active' && tierInfo.tokensPerMonth > 0) {
      const now = new Date();
      const shouldReset = user.monthlyResetDate < now;

      if (shouldReset) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            monthlyTokensUsed: 0,
            monthlyResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) // First of next month
          }
        });
      }
    }
  }
}

async function handleSubscriptionCancellation(subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        tokenBalance: Math.min(user.tokenBalance, 5) // Free tier token limit
      }
    });
  }
}

async function handlePaymentFailed(invoice) {
  // Handle failed payments - could send notifications, suspend account, etc.
  console.log('Payment failed for invoice:', invoice.id);
}

module.exports = router;