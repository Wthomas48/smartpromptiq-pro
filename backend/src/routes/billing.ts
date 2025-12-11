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
