import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

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
    const planMapping: { [key: string]: string } = {
      'price_pro_monthly': 'PRO',
      'price_team_monthly': 'TEAM',
      'price_enterprise_monthly': 'ENTERPRISE'
    };

    const priceId = subscription.items.data[0].price.id;
    const plan = planMapping[priceId] || 'FREE';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: plan as any,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        generationsLimit: plan === 'PRO' ? 500 : plan === 'TEAM' ? 2000 : plan === 'ENTERPRISE' ? 10000 : 10
      }
    });
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
        subscriptionStatus: 'canceled',
        generationsLimit: 10
      }
    });
  }
}

export default router;
