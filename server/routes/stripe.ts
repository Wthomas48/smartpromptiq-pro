import express from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { 
  db, 
  users, 
  subscriptions, 
  subscriptionPlans 
} from '../db/index';
import { authenticateToken } from '../middleware/auth';
import { stripeConfig, env } from '../config/env';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2024-06-20',
});

// Validation schemas
const createCheckoutSchema = z.object({
  planId: z.string().uuid(),
  billingInterval: z.enum(['month', 'year']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const createPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.priceMonthly);

    res.json({ plans });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: 'Failed to get subscription plans',
      code: 'GET_PLANS_ERROR'
    });
  }
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planId, billingInterval, successUrl, cancelUrl } = createCheckoutSchema.parse(req.body);
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    // Get the subscription plan
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (!plan) {
      return res.status(404).json({
        error: 'Subscription plan not found',
        code: 'PLAN_NOT_FOUND'
      });
    }

    // Get the appropriate price ID
    const priceId = billingInterval === 'year' ? plan.stripeYearlyPriceId : plan.stripeMonthlyPriceId;
    
    if (!priceId) {
      return res.status(400).json({
        error: 'Price not available for selected billing interval',
        code: 'PRICE_NOT_AVAILABLE'
      });
    }

    // Check if user already has a Stripe customer
    const [existingUser] = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    let customerId = existingUser?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${env.CLIENT_URL}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        billingInterval: billingInterval,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
        },
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    console.error('Create checkout session error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      code: 'CHECKOUT_ERROR'
    });
  }
});

// Create customer portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const { returnUrl } = createPortalSchema.parse(req.body);
    const userId = req.user!.id;

    // Get user's Stripe customer ID
    const [userSubscription] = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!userSubscription?.stripeCustomerId) {
      return res.status(404).json({
        error: 'No subscription found',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: returnUrl || `${env.CLIENT_URL}`/dashboard,
    });

    res.json({
      url: portalSession.url,
    });

  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({
      error: 'Failed to create portal session',
      code: 'PORTAL_ERROR'
    });
  }
});

// Get current subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const [subscription] = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        billingInterval: subscriptions.billingInterval,
        planName: subscriptionPlans.name,
        planFeatures: subscriptionPlans.features,
        planLimits: subscriptionPlans.limits,
        priceMonthly: subscriptionPlans.priceMonthly,
        priceYearly: subscriptionPlans.priceYearly,
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription) {
      return res.status(404).json({
        error: 'No subscription found',
        code: 'NO_SUBSCRIPTION'
      });
    }

    res.json({ subscription });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      error: 'Failed to get subscription',
      code: 'GET_SUBSCRIPTION_ERROR'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeConfig.webhookSecret!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log("Unhandled event type: ");
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook event handlers
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  const billingInterval = session.metadata?.billingInterval as 'month' | 'year';

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Get the subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Update or create subscription in database
  await db
    .insert(subscriptions)
    .values({
      userId,
      planId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status as any,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      billingInterval,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        planId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status as any,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        billingInterval,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  console.log("Subscription created/updated for user ");
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata:', subscription.id);
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log("Subscription updated for user ");
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log("Subscription canceled: ");
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("Payment succeeded for subscription: ");
  // Could send success email, update user role, etc.
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Payment failed for subscription: ");
  // Could send payment failure email, downgrade account, etc.
}

export default router;





