import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

/**
 * POST /api/academy/billing/subscribe
 * Create Academy subscription checkout session
 */
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
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
        metadata: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl || `${process.env.FRONTEND_URL}/academy/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/academy/pricing`,
      metadata: {
        userId: user.id,
        type: 'academy_subscription'
      },
      subscription_data: {
        metadata: {
          userId: user.id
        }
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error: any) {
    console.error('Academy subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

/**
 * GET /api/academy/billing/subscription
 * Get user's Academy subscription details
 */
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const academySubscription = await prisma.academySubscription.findUnique({
      where: { userId: req.user!.id }
    });

    if (!academySubscription) {
      return res.json({
        success: true,
        data: null // No subscription (free tier)
      });
    }

    // Get Stripe subscription details if available
    let stripeSubscription = null;
    if (academySubscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(academySubscription.stripeSubscriptionId);
      } catch (error) {
        console.error('Failed to retrieve Stripe subscription:', error);
      }
    }

    res.json({
      success: true,
      data: {
        ...academySubscription,
        stripeDetails: stripeSubscription
      }
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription',
      error: error.message
    });
  }
});

/**
 * POST /api/academy/billing/cancel
 * Cancel Academy subscription at period end
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const academySubscription = await prisma.academySubscription.findUnique({
      where: { userId: req.user!.id }
    });

    if (!academySubscription || !academySubscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel at period end in Stripe
    const subscription = await stripe.subscriptions.update(
      academySubscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    // Update local record
    await prisma.academySubscription.update({
      where: { userId: req.user!.id },
      data: {
        cancelAtPeriodEnd: true
      }
    });

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      data: {
        cancelAt: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

/**
 * POST /api/academy/billing/reactivate
 * Reactivate a canceled subscription
 */
router.post('/reactivate', authenticate, async (req, res) => {
  try {
    const academySubscription = await prisma.academySubscription.findUnique({
      where: { userId: req.user!.id }
    });

    if (!academySubscription || !academySubscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Remove cancel_at_period_end
    await stripe.subscriptions.update(
      academySubscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false
      }
    );

    // Update local record
    await prisma.academySubscription.update({
      where: { userId: req.user!.id },
      data: {
        cancelAtPeriodEnd: false
      }
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });
  } catch (error: any) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
      error: error.message
    });
  }
});

/**
 * POST /api/academy/billing/upgrade
 * Upgrade from Academy to Pro (or other tier)
 */
router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const { newPriceId, successUrl, cancelUrl } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'User must have an existing subscription to upgrade'
      });
    }

    const academySubscription = await prisma.academySubscription.findUnique({
      where: { userId: user.id }
    });

    if (!academySubscription || !academySubscription.stripeSubscriptionId) {
      // No existing subscription - create new checkout session
      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        mode: 'subscription',
        line_items: [{ price: newPriceId, quantity: 1 }],
        success_url: successUrl || `${process.env.FRONTEND_URL}/academy/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/academy/pricing`,
        metadata: { userId: user.id, type: 'academy_upgrade' }
      });

      return res.json({
        success: true,
        data: { sessionId: session.id, url: session.url }
      });
    }

    // Upgrade existing subscription
    const subscription = await stripe.subscriptions.retrieve(academySubscription.stripeSubscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(academySubscription.stripeSubscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations' // Charge prorated amount immediately
    });

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: {
        subscriptionId: updatedSubscription.id
      }
    });
  } catch (error: any) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription',
      error: error.message
    });
  }
});

/**
 * GET /api/academy/billing/portal
 * Get Stripe billing portal URL
 */
router.get('/portal', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No billing account found'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/academy/dashboard`
    });

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error: any) {
    console.error('Billing portal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create billing portal session',
      error: error.message
    });
  }
});

/**
 * GET /api/academy/billing/verify-session/:sessionId
 * Verify Stripe checkout session and return subscription details
 */
router.get('/verify-session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.metadata?.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Session does not belong to this user'
      });
    }

    res.json({
      success: true,
      data: {
        status: session.status,
        subscription: session.subscription,
        customerEmail: session.customer_email
      }
    });
  } catch (error: any) {
    console.error('Verify session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify session',
      error: error.message
    });
  }
});

export default router;
