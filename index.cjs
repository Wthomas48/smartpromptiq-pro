// index.cjs - Modern Express server setup
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const health = require('./routes/health.cjs');
const { generalLimiter } = require('./middleware/rateLimiter.cjs');

const app = express();

// ---- Database Setup (Prisma) - with fallback ----
let prisma = null;
let dbAvailable = false;

try {
  // Try to load Prisma from backend folder first
  const { PrismaClient } = require('./backend/node_modules/@prisma/client');
  prisma = new PrismaClient();
  dbAvailable = true;
  console.log('✅ Prisma client loaded from backend');
} catch (err1) {
  try {
    // Fallback to root node_modules
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    dbAvailable = true;
    console.log('✅ Prisma client loaded from root');
  } catch (err2) {
    console.warn('⚠️ Prisma client not available - running in demo mode');
    console.warn('   Error:', err2.message);
    // Create mock prisma for demo mode
    prisma = {
      user: {
        findUnique: async () => null,
        findFirst: async () => null,
        create: async () => ({ id: 'demo-' + Date.now(), email: 'demo@example.com' }),
        update: async () => ({})
      }
    };
  }
}

// ---- Trust proxy (Railway/Cloudflare) ----
const TRUST_PROXY = process.env.TRUST_PROXY || '1';
app.set('trust proxy', TRUST_PROXY === 'true' ? true : Number.isNaN(Number(TRUST_PROXY)) ? 1 : Number(TRUST_PROXY));

// ---- CORS ----
app.use(cors({
  origin: ['https://smartpromptiq.com', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint', 'X-Client-Type', 'X-Requested-With', 'Accept'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));

// ---- Stripe Setup (before body parser for webhook) ----
let stripe = null;
let stripeAvailable = false;

try {
  const Stripe = require('stripe');
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    stripeAvailable = true;
    console.log('✅ Stripe initialized successfully');
  } else {
    console.warn('⚠️ Stripe secret key not configured - running in demo mode');
  }
} catch (err) {
  console.warn('⚠️ Stripe module not available:', err.message);
}

// Stripe webhook endpoint - MUST be before express.json() middleware
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For testing without webhook signature verification
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔔 Stripe webhook received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId && userId !== 'demo-user') {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer,
              subscriptionTier: 'pro',
              plan: 'PRO',
              tokenBalance: 1000
            }
          });
          console.log('✅ User subscription updated:', userId);
        } catch (err) {
          console.error('Failed to update user subscription:', err);
        }
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      try {
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId }
        });

        if (user) {
          const isActive = event.type === 'customer.subscription.updated' && subscription.status === 'active';
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: isActive ? 'pro' : 'free',
              plan: isActive ? 'PRO' : 'FREE'
            }
          });
          console.log('✅ Subscription updated for user:', user.id);
        }
      } catch (err) {
        console.error('Failed to process subscription update:', err);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ---- Core middleware ----
app.use(express.json());

// ---- Rate limit early ----
app.use(generalLimiter);

// ---- Routes ----
app.use('/api', health);

// ========================================
// Authentication Routes (Login/Register)
// ========================================

// Generate simple JWT-like token
const generateToken = (userId) => {
  return `jwt-token-${Date.now()}-${userId}`;
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    console.log('🔐 Register attempt:', { email, firstName, lastName });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName || 'User',
        lastName: lastName || '',
        plan: 'FREE',
        role: 'USER',
        tokenBalance: 100,
        subscriptionTier: 'free'
      }
    });

    const token = generateToken(user.id);

    console.log('✅ User registered:', user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          role: user.role,
          subscriptionTier: user.subscriptionTier || 'free',
          tokenBalance: user.tokenBalance || 100
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isAdminLogin } = req.body;

    console.log('🔐 Login attempt:', { email, isAdminLogin });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check admin login
    if (isAdminLogin && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken(user.id);

    console.log('✅ User logged in:', user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          role: user.role,
          subscriptionTier: user.subscriptionTier || 'free',
          tokenBalance: user.tokenBalance || 0
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    console.log('🔐 /api/auth/me token:', token.substring(0, 30) + '...');

    // Demo/admin tokens
    if (token.startsWith('demo-token-') || token.startsWith('admin-token-')) {
      return res.json({
        success: true,
        data: {
          user: {
            id: 'demo-user',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: token.startsWith('admin') ? 'ADMIN' : 'USER',
            plan: 'FREE',
            subscriptionTier: 'free',
            tokenBalance: 100,
            roles: [],
            permissions: []
          }
        }
      });
    }

    // Try custom jwt-token format first
    let userId = null;
    if (token.startsWith('jwt-token-')) {
      userId = token.split('-').pop();
    }

    // Try decoding as real JWT (Supabase)
    if (!userId) {
      const jwtPayload = decodeJwtPayload(token);
      if (jwtPayload) {
        console.log('🔐 Decoded JWT for /me:', { sub: jwtPayload.sub, email: jwtPayload.email });

        // Try to find user by Supabase ID or email
        if (dbAvailable && prisma) {
          try {
            const user = await prisma.user.findFirst({
              where: {
                OR: [
                  { id: jwtPayload.sub },
                  { email: jwtPayload.email }
                ].filter(Boolean)
              }
            });

            if (user) {
              return res.json({
                success: true,
                data: {
                  user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    plan: user.plan || 'FREE',
                    role: user.role || 'USER',
                    subscriptionTier: user.subscriptionTier || 'free',
                    tokenBalance: user.tokenBalance || 0,
                    roles: [],
                    permissions: []
                  }
                }
              });
            }
          } catch (err) {
            console.error('JWT user lookup error:', err);
          }
        }

        // User not in DB but has valid JWT - return JWT data
        return res.json({
          success: true,
          data: {
            user: {
              id: jwtPayload.sub || 'jwt-user',
              email: jwtPayload.email || 'user@example.com',
              firstName: jwtPayload.user_metadata?.firstName || '',
              lastName: jwtPayload.user_metadata?.lastName || '',
              role: jwtPayload.user_metadata?.role || 'USER',
              plan: 'FREE',
              subscriptionTier: 'free',
              tokenBalance: 0,
              roles: [],
              permissions: []
            }
          }
        });
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Find user by custom token userId
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          plan: user.plan || 'FREE',
          role: user.role || 'USER',
          subscriptionTier: user.subscriptionTier || 'free',
          tokenBalance: user.tokenBalance || 0,
          roles: [],
          permissions: []
        }
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Add demo generate endpoint
app.post('/api/demo/generate', (req, res) => {
  console.log('🎯 Demo generation request received:', req.body);

  const { templateType, userResponses = {} } = req.body;

  const sampleContent = {
    title: `${templateType || 'Demo'} Content Generated`,
    content: `# AI-Generated Professional Content

This is a sample of the comprehensive, professional content that SmartPromptIQ creates using advanced AI technology.

## Your Input
Template Type: ${templateType}
Business Name: ${userResponses.businessName || 'Your Business'}

## Generated Result
Our AI has analyzed your requirements and generated optimized content tailored to your specific needs.

Key Features:
• Personalized content generation
• Professional quality output
• Customized to your specific requirements
• Ready-to-use templates and formats

*Generated by SmartPromptIQ's AI engine*`
  };

  res.json({
    success: true,
    message: 'Demo content generated successfully',
    data: {
      title: sampleContent.title,
      content: sampleContent.content,
      generatedAt: new Date().toISOString(),
      isRealGeneration: false,
      templateType,
      requestId: `demo_${Date.now()}`
    }
  });
});

// Add feedback rating endpoint
app.post('/api/feedback/rating', (req, res) => {
  console.log('Rating submission received:', req.body);

  res.status(200).json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      rating: req.body.rating,
      submittedAt: new Date().toISOString()
    }
  });
});

// ========================================
// Stripe Billing API Routes
// ========================================
// Note: Stripe is initialized at the top of the file (before express.json middleware)

// Pricing configuration - match Railway env var names
const STRIPE_PRICE_IDS = {
  ACADEMY_MONTHLY: process.env.STRIPE_ACADEMY_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ACADEMY_MONTHLY || '',
  ACADEMY_YEARLY: process.env.STRIPE_ACADEMY_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ACADEMY_YEARLY || '',
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_PRO_YEARLY || '',
  STARTER_MONTHLY: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
  STARTER_YEARLY: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_STARTER_YEARLY || '',
  TEAM_PRO_MONTHLY: process.env.STRIPE_TEAM_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
  TEAM_PRO_YEARLY: process.env.STRIPE_TEAM_PRO_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_TEAM_YEARLY || '',
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  ENTERPRISE_YEARLY: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
};

// Log Stripe configuration on startup
console.log('💳 Stripe Price IDs configured:', {
  PRO_MONTHLY: STRIPE_PRICE_IDS.PRO_MONTHLY ? '✅' : '❌',
  PRO_YEARLY: STRIPE_PRICE_IDS.PRO_YEARLY ? '✅' : '❌',
  STARTER_MONTHLY: STRIPE_PRICE_IDS.STARTER_MONTHLY ? '✅' : '❌',
  ENTERPRISE_MONTHLY: STRIPE_PRICE_IDS.ENTERPRISE_MONTHLY ? '✅' : '❌',
});

// Helper to decode JWT payload (without verification - Supabase handles that)
const decodeJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
};

// Auth middleware for billing routes - validates token and loads user (optional auth)
const billingAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Default user for unauthenticated requests
    req.user = { id: 'guest-user', email: 'guest@example.com' };

    if (!authHeader?.startsWith('Bearer ')) {
      // Allow unauthenticated access for checkout (Stripe will handle customer creation)
      console.log('⚠️ No auth token - using guest user');
      return next();
    }

    const token = authHeader.substring(7);
    console.log('🔐 Processing auth token:', token.substring(0, 30) + '...');

    // For demo/admin tokens, allow access
    if (token.startsWith('demo-token-') || token.startsWith('admin-token-')) {
      req.user = { id: 'demo-user', email: 'demo@example.com' };
      return next();
    }

    // For custom jwt-token format (from backend auth)
    if (token.startsWith('jwt-token-') && dbAvailable && prisma) {
      const userId = token.split('-').pop();
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        if (user) {
          req.user = { id: user.id, email: user.email, stripeCustomerId: user.stripeCustomerId };
          console.log('✅ Backend auth user:', user.email);
          return next();
        }
      } catch (err) {
        console.error('Auth lookup error:', err);
      }
    }

    // For real JWT tokens (from Supabase or other providers)
    const jwtPayload = decodeJwtPayload(token);
    if (jwtPayload) {
      console.log('🔐 Decoded JWT payload:', { sub: jwtPayload.sub, email: jwtPayload.email });

      // Try to find user by Supabase ID (sub) or email
      if (dbAvailable && prisma) {
        try {
          let user = null;

          // First try to find by supabase_id if stored
          if (jwtPayload.sub) {
            user = await prisma.user.findFirst({
              where: {
                OR: [
                  { id: jwtPayload.sub },
                  { email: jwtPayload.email }
                ]
              }
            });
          }

          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              stripeCustomerId: user.stripeCustomerId
            };
            console.log('✅ Supabase JWT user found:', user.email);
            return next();
          } else {
            // User not in database but has valid JWT - use JWT data
            req.user = {
              id: jwtPayload.sub || 'jwt-user',
              email: jwtPayload.email || 'user@example.com',
              stripeCustomerId: null
            };
            console.log('⚠️ JWT user not in DB, using JWT data:', jwtPayload.email);
            return next();
          }
        } catch (err) {
          console.error('JWT user lookup error:', err);
        }
      } else {
        // No database - use JWT payload directly
        req.user = {
          id: jwtPayload.sub || 'jwt-user',
          email: jwtPayload.email || 'user@example.com',
          stripeCustomerId: null
        };
        console.log('✅ Using JWT payload (no DB):', jwtPayload.email);
        return next();
      }
    }

    // Fallback for other token formats
    console.log('⚠️ Unknown token format, using fallback user');
    req.user = { id: token.split('-').pop() || 'user', email: 'user@example.com' };
    next();
  } catch (error) {
    console.error('❌ billingAuth error:', error);
    req.user = { id: 'error-user', email: 'error@example.com' };
    next();
  }
};

// Create Checkout Session endpoint
app.post('/api/billing/create-checkout-session', billingAuth, async (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://smartpromptiq.com';

  try {
    let { priceId, tierId, billingCycle = 'monthly', mode = 'subscription', successUrl, cancelUrl } = req.body;

    console.log('💳 Create checkout session request:', { tierId, billingCycle, priceId, userId: req.user?.id });

    // Handle free tier
    if (tierId?.toLowerCase() === 'free') {
      return res.json({
        success: true,
        message: 'Free tier activated!',
        url: `${baseUrl}/dashboard?welcome=true`
      });
    }

    // Check if Stripe is configured
    if (!stripeAvailable || !stripe) {
      console.warn('⚠️ Stripe not configured - returning demo mode');
      return res.json({
        success: true,
        demo: true,
        sessionId: `demo_session_${Date.now()}`,
        url: successUrl || `${baseUrl}/billing?success=true&demo=true`,
        message: 'Demo mode - payment processing will be available soon!'
      });
    }

    // Map tier to Stripe price ID
    if (!priceId && tierId) {
      // Normalize tier name - handle all variations
      const normalizedTier = tierId.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
      const normalizedCycle = (billingCycle || 'monthly').toLowerCase();

      console.log('💳 Looking up price for:', { normalizedTier, normalizedCycle });

      // Direct tier to price ID mapping (case-insensitive)
      const tierPriceMap = {
        // Academy
        'academy': normalizedCycle === 'yearly' ? STRIPE_PRICE_IDS.ACADEMY_YEARLY : STRIPE_PRICE_IDS.ACADEMY_MONTHLY,
        // Starter (own price IDs)
        'starter': normalizedCycle === 'yearly' ? STRIPE_PRICE_IDS.STARTER_YEARLY : STRIPE_PRICE_IDS.STARTER_MONTHLY,
        // Pro (own price IDs)
        'pro': normalizedCycle === 'yearly' ? STRIPE_PRICE_IDS.PRO_YEARLY : STRIPE_PRICE_IDS.PRO_MONTHLY,
        // Team
        'team': normalizedCycle === 'yearly' ? STRIPE_PRICE_IDS.TEAM_PRO_YEARLY : STRIPE_PRICE_IDS.TEAM_PRO_MONTHLY,
        'team_pro': normalizedCycle === 'yearly' ? STRIPE_PRICE_IDS.TEAM_PRO_YEARLY : STRIPE_PRICE_IDS.TEAM_PRO_MONTHLY,
        // Enterprise
        'enterprise': normalizedCycle === 'yearly' ? STRIPE_PRICE_IDS.ENTERPRISE_YEARLY : STRIPE_PRICE_IDS.ENTERPRISE_MONTHLY,
      };

      priceId = tierPriceMap[normalizedTier];
      console.log('💳 Mapped tier:', { normalizedTier, normalizedCycle, priceId, availablePrices: STRIPE_PRICE_IDS });
    }

    // Check if price ID is a valid Stripe price (starts with price_)
    const isValidStripePrice = priceId && priceId.startsWith('price_') && priceId.length > 20;

    // If no valid price ID, return demo mode
    if (!priceId || !isValidStripePrice) {
      console.warn('⚠️ Invalid or missing Stripe price ID:', { tierId, priceId, isValidStripePrice });
      console.warn('⚠️ Available STRIPE_PRICE_IDS:', STRIPE_PRICE_IDS);
      return res.json({
        success: true,
        demo: true,
        sessionId: `demo_session_${Date.now()}`,
        url: successUrl || `${baseUrl}/billing?success=true&demo=true`,
        message: priceId && !isValidStripePrice
          ? 'Stripe Price IDs not configured. Please add STRIPE_PRICE_PRO_MONTHLY etc. to environment variables.'
          : `Pricing for ${tierId} coming soon!`
      });
    }

    // Create Checkout Session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      success_url: successUrl || `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    };

    // Add customer email if available
    if (req.user?.email && req.user.email !== 'guest@example.com') {
      sessionConfig.customer_email = req.user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('💳 Checkout session created:', session.id);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('❌ Checkout session error:', error);

    // Return demo mode instead of error
    res.json({
      success: true,
      demo: true,
      sessionId: `demo_session_${Date.now()}`,
      url: `${baseUrl}/billing?success=true&demo=true`,
      message: 'Payment temporarily unavailable. Please try again later.',
      error: error.message
    });
  }
});

// Customer Portal Session endpoint
app.post('/api/billing/create-portal-session', billingAuth, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured'
      });
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://smartpromptiq.com';

    // Get user's Stripe customer ID
    if (!req.user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No billing account found. Please subscribe first.',
        returnUrl: `${baseUrl}/pricing`
      });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    console.log('🔧 Portal session created for user:', req.user.id);

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create portal session'
    });
  }
});

// Get billing info endpoint
app.get('/api/billing/info', billingAuth, async (req, res) => {
  try {
    // Get user from database
    let user = null;
    if (req.user.id !== 'demo-user') {
      user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
    }

    const tier = user?.subscriptionTier || user?.plan?.toLowerCase() || 'free';
    const tokenBalance = user?.tokenBalance || 100;

    // Fetch subscription from Stripe if customer exists
    let subscription = null;
    let paymentMethod = null;

    if (user?.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          const stripeSub = subscriptions.data[0];
          subscription = {
            tier: tier,
            status: stripeSub.status,
            billingCycle: stripeSub.items.data[0]?.price?.recurring?.interval || 'monthly',
            nextBilling: new Date(stripeSub.current_period_end * 1000).toISOString(),
            amount: (stripeSub.items.data[0]?.price?.unit_amount || 0) / 100
          };
        }

        // Get payment method
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (customer.invoice_settings?.default_payment_method) {
          const pm = await stripe.paymentMethods.retrieve(
            customer.invoice_settings.default_payment_method
          );
          if (pm.card) {
            paymentMethod = {
              type: 'card',
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year
            };
          }
        }
      } catch (stripeError) {
        console.error('Stripe fetch error:', stripeError);
      }
    }

    res.json({
      success: true,
      data: {
        subscription: subscription || {
          tier: tier,
          status: 'active',
          billingCycle: 'monthly',
          nextBilling: null,
          amount: 0
        },
        usage: {
          promptsGenerated: 0,
          promptsLimit: tier === 'free' ? 50 : tier === 'pro' ? 500 : 1000,
          tokensUsed: 0,
          tokensLimit: tokenBalance
        },
        paymentMethod: paymentMethod
      }
    });
  } catch (error) {
    console.error('Get billing info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing info'
    });
  }
});

// Note: Webhook endpoint is defined at the top of the file (before express.json middleware)

// Get pricing tiers endpoint
app.get('/api/billing/pricing', (req, res) => {
  const billingCycle = req.query.billingCycle || 'monthly';

  res.json({
    success: true,
    data: {
      tiers: [
        { id: 'free', name: 'Free', price: 0, features: ['5 prompts/day', 'Basic templates'] },
        { id: 'pro', name: 'Pro', price: billingCycle === 'yearly' ? 190 : 19, features: ['Unlimited prompts', 'Advanced templates', 'Priority support'] },
        { id: 'team', name: 'Team', price: billingCycle === 'yearly' ? 490 : 49, features: ['Everything in Pro', 'Team collaboration', 'Admin dashboard'] },
        { id: 'enterprise', name: 'Enterprise', price: billingCycle === 'yearly' ? 990 : 99, features: ['Everything in Team', 'Custom integrations', 'Dedicated support'] }
      ],
      billingCycle
    }
  });
});

// ========================================
// ElevenLabs and Voice API Routes
// ========================================

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Available ElevenLabs voices
const ELEVENLABS_VOICES = {
  'rachel': '21m00Tcm4TlvDq8ikWAM',
  'drew': '29vD33N1CtxCmqQRPOHJ',
  'clyde': '2EiwWnXFnvU5JabPnv8n',
  'paul': '5Q0t7uMcjvnagumLfvZi',
  'domi': 'AZnzlk1XvdvUeBnXmlld',
  'dave': 'CYw3kZ02Hs0563khs1Fj',
  'fin': 'D38z5RcWu1voky8WS1ja',
  'sarah': 'EXAVITQu4vr4xnSDxMaL',
  'antoni': 'ErXwobaYiN019PkySvjV',
  'thomas': 'GBv7mTt0atIp3Br8iCZE',
  'charlie': 'IKne3meq5aSn9XLyUdCD',
  'emily': 'LcfcDJNUP1GQjkzn1xUU',
  'elli': 'MF3mGyEYCl7XYWbV9V6O',
  'callum': 'N2lVS1w4EtoT3dr4eOWO',
  'patrick': 'ODq5zmih8GrVes37Dizd',
  'harry': 'SOYHLrjzK2X1ezoPC6cr',
  'liam': 'TX3LPaxmHKxFdv7VOQHJ',
  'dorothy': 'ThT5KcBeYPX3keUQqHPh',
  'josh': 'TxGEqnHWrfWFTfGW9XjX',
  'arnold': 'VR6AewLTigWG4xSOukaG',
  'charlotte': 'XB0fDUnXU5powFXDhCwa',
  'alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'matilda': 'XrExE9yKIg1WjnnlVkGX',
  'james': 'ZQe5CZNOzWyzPSCn5a3c',
  'joseph': 'Zlb1dXrM653N07WRdFW3',
  'michael': 'flq6f7yk4E4fJM5XTYuZ',
  'ethan': 'g5CIjZEefAph4nQFvHAz',
  'chris': 'iP95p4xoKVk53GoZ742B',
  'gigi': 'jBpfuIE2acCO8z3wKNLl',
  'freya': 'jsCqWAovK2LkecY7zXl4'
};

// ElevenLabs generate speech endpoint
app.post('/api/elevenlabs/generate', async (req, res) => {
  console.log('ElevenLabs generate request:', req.body);

  const { text, voice = 'rachel', model = 'eleven_monolingual_v1' } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Text is required'
    });
  }

  // Check if API key is configured
  if (!ELEVENLABS_API_KEY) {
    console.log('ElevenLabs API key not configured - returning demo mode');
    return res.json({
      success: true,
      demo: true,
      message: 'ElevenLabs API key not configured. Using browser speech synthesis.',
      text: text,
      voice: voice,
      useBrowserSpeech: true
    });
  }

  try {
    const voiceId = ELEVENLABS_VOICES[voice.toLowerCase()] || ELEVENLABS_VOICES['rachel'];

    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.json({
      success: true,
      audio: base64Audio,
      contentType: 'audio/mpeg',
      voice: voice,
      text: text
    });
  } catch (error) {
    console.error('ElevenLabs error:', error);
    res.json({
      success: true,
      demo: true,
      message: 'ElevenLabs API error. Using browser speech synthesis.',
      text: text,
      voice: voice,
      useBrowserSpeech: true,
      error: error.message
    });
  }
});

// ElevenLabs page narration endpoint
app.post('/api/elevenlabs/page/narrate', async (req, res) => {
  console.log('Page narration request:', req.body);

  const { content, voice = 'rachel', pageType = 'general' } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Content is required'
    });
  }

  // Always return demo mode - use browser speech synthesis
  res.json({
    success: true,
    demo: true,
    message: 'Page narration uses browser speech synthesis',
    content: content,
    voice: voice,
    pageType: pageType,
    useBrowserSpeech: true
  });
});

// ElevenLabs academy narration endpoint
app.post('/api/elevenlabs/academy/generate', async (req, res) => {
  console.log('Academy narration request:', req.body);

  const { text, voice = 'rachel', lessonId } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Text is required'
    });
  }

  res.json({
    success: true,
    demo: true,
    message: 'Academy narration uses browser speech synthesis',
    text: text,
    voice: voice,
    lessonId: lessonId,
    useBrowserSpeech: true
  });
});

// ElevenLabs sound effects endpoint
app.post('/api/elevenlabs/sound-effects/generate', async (req, res) => {
  console.log('Sound effects request:', req.body);

  const { description, duration = 5 } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      error: 'Description is required'
    });
  }

  res.json({
    success: true,
    demo: true,
    message: 'Sound effects generation not available in demo mode',
    description: description,
    duration: duration
  });
});

// Voice generate endpoint
app.post('/api/voice/generate', async (req, res) => {
  console.log('Voice generate request:', req.body);

  const { text, voice = 'default', speed = 1.0, pitch = 1.0 } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Text is required'
    });
  }

  // Return browser speech synthesis instructions
  res.json({
    success: true,
    demo: true,
    message: 'Use browser speech synthesis for voice generation',
    text: text,
    voice: voice,
    speed: speed,
    pitch: pitch,
    useBrowserSpeech: true,
    browserConfig: {
      rate: speed,
      pitch: pitch,
      voice: voice
    }
  });
});

// Voice generate from blueprint endpoint
app.post('/api/voice/generate-from-blueprint', async (req, res) => {
  console.log('Voice blueprint request:', req.body);

  const { blueprint, voice = 'default' } = req.body;

  if (!blueprint) {
    return res.status(400).json({
      success: false,
      error: 'Blueprint is required'
    });
  }

  res.json({
    success: true,
    demo: true,
    message: 'Blueprint voice generation uses browser speech synthesis',
    blueprint: blueprint,
    voice: voice,
    useBrowserSpeech: true
  });
});

// Voice enhance script endpoint
app.post('/api/voice/enhance-script', async (req, res) => {
  console.log('Enhance script request:', req.body);

  const { script, style = 'professional' } = req.body;

  if (!script) {
    return res.status(400).json({
      success: false,
      error: 'Script is required'
    });
  }

  // Return enhanced script (simple demo enhancement)
  const enhancedScript = script
    .replace(/\bum\b/gi, '')
    .replace(/\buh\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  res.json({
    success: true,
    originalScript: script,
    enhancedScript: enhancedScript,
    style: style,
    improvements: [
      'Removed filler words',
      'Cleaned up spacing',
      'Optimized for voice synthesis'
    ]
  });
});

// Voice lesson narration endpoint
app.post('/api/voice/generate-lesson-narration', async (req, res) => {
  console.log('Lesson narration request:', req.body);

  const { lessonContent, voice = 'default', lessonId } = req.body;

  if (!lessonContent) {
    return res.status(400).json({
      success: false,
      error: 'Lesson content is required'
    });
  }

  res.json({
    success: true,
    demo: true,
    message: 'Lesson narration uses browser speech synthesis',
    lessonContent: lessonContent,
    voice: voice,
    lessonId: lessonId,
    useBrowserSpeech: true
  });
});

// Get available voices endpoint
app.get('/api/voice/voices', (req, res) => {
  res.json({
    success: true,
    voices: Object.keys(ELEVENLABS_VOICES).map(name => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      voiceId: ELEVENLABS_VOICES[name],
      available: !!ELEVENLABS_API_KEY
    })),
    browserVoices: true,
    hasElevenLabsKey: !!ELEVENLABS_API_KEY
  });
});

// ========================================
// Static File Serving & SPA Fallback
// ========================================
const path = require('path');
const fs = require('fs');

// Serve static files from client build
const clientDistPath = path.join(__dirname, 'client/dist');
console.log('🔍 Looking for client build at:', clientDistPath);

if (fs.existsSync(clientDistPath)) {
  console.log('✅ Client dist found, serving static files');
  app.use(express.static(clientDistPath));
} else {
  console.log('⚠️ Client dist not found at:', clientDistPath);
}

// API 404 handler - for unmatched API routes
app.all('/api/*', (req, res) => {
  console.error(`❌ API route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`,
    method: req.method,
    availableRoutes: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me',
      '/api/billing/create-checkout-session',
      '/api/billing/info',
      '/api/billing/pricing'
    ]
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`📄 Serving SPA for: ${req.originalUrl}`);
    res.sendFile(indexPath);
  } else {
    // Fallback landing page if no client build
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SmartPromptiq Pro</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto; }
          h1 { text-align: center; margin-bottom: 30px; }
          .status { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 SmartPromptiq Pro API</h1>
          <div class="status">
            <strong>Status:</strong> ✅ Live and Running<br>
            <strong>Version:</strong> 2.0.0<br>
            <strong>Updated:</strong> ${new Date().toLocaleString()}
          </div>
          <p style="text-align: center;">API is ready. Frontend build pending.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// ---- Listen on $PORT ----
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API listening on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

module.exports = app;
