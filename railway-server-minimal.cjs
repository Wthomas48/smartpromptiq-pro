const express = require('express');
const path = require('path');
const fs = require('fs');

// Import rate limiter middleware
const {
  createRateLimiter,
  demoRateLimiter,
  dynamicRateLimiter,
  ipRateLimiter,
  burstProtection
} = require('./middleware/rateLimiter.cjs');

console.log('🚀 RAILWAY SERVER STARTING...');
console.log('Current time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Railway deployment (behind nginx/Railway proxy)
// This is required for express-rate-limit to work correctly with X-Forwarded-For header
app.set('trust proxy', true);
console.log('🔗 Trust proxy enabled for Railway');

// Minimal essential middleware
app.use(express.json({ limit: '1mb' }));

// CORS headers - Allow specific origins when credentials are included
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    // Production domains
    'https://smartpromptiq.com',
    'https://www.smartpromptiq.com',
    'https://smartpromptiq.net',
    'https://www.smartpromptiq.net',
    // Railway deployment URLs
    'https://smartpromptiq.up.railway.app',
    'https://smartpromptiq-pro.up.railway.app',
    'https://smartpromptiq.railway.app',
    'https://smartpromptiq-pro.railway.app',
    // Local development
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:8080'
  ];

  // Handle all origins permissively for now (debugging)
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for origin:', origin);
    } else {
      console.log('⚠️ CORS allowing non-whitelisted origin:', origin);
    }
  } else {
    // Handle null origin (local file:// protocol)
    res.header('Access-Control-Allow-Origin', '*');
    console.log('⚠️ CORS null origin - using wildcard');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Fingerprint, X-Client-Type, Origin, Cache-Control, Pragma');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  if (req.method === 'OPTIONS') {
    console.log('🔍 OPTIONS preflight request from origin:', origin || 'null');
    return res.status(200).end();
  }
  next();
});

// 🛡️ REDIS-BASED RATE LIMITING MIDDLEWARE
// TEMPORARILY DISABLED - Rate limiters are causing X-Forwarded-For validation errors
// The limiters are instantiated when imported (before trust proxy is set)
// We rely on the per-route rate limiters instead (registration, demo, etc.)
// app.use(ipRateLimiter);
// app.use(burstProtection);

// 🛡️ SECURITY MIDDLEWARE LAYER (Legacy - keeping as fallback)
// Rate limiting storage
const rateLimitStore = new Map();
const captchaStore = new Map();
const registrationAttempts = new Map();
const suspiciousIPs = new Set();

// Security configuration
const SECURITY_CONFIG = {
  RATE_LIMITS: {
    registration: { max: 3, window: 15 * 60 * 1000 }, // 3 attempts per 15 minutes
    login: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    captcha: { max: 10, window: 60 * 1000 }, // 10 captcha requests per minute
    demo: { max: 5, window: 5 * 60 * 1000 } // 5 demo requests per 5 minutes
  },
  CAPTCHA_EXPIRE: 5 * 60 * 1000, // 5 minutes
  SUSPICIOUS_THRESHOLD: 10, // Failed attempts before IP is marked suspicious
  BAN_DURATION: 24 * 60 * 60 * 1000 // 24 hours
};

// Device fingerprint validation - RELAXED for production compatibility
const validateFingerprint = (fingerprint) => {
  // Accept any reasonable fingerprint format for now
  if (!fingerprint || typeof fingerprint !== 'string') return true; // Changed to true to allow missing fingerprints
  if (fingerprint.length < 5 || fingerprint.length > 200) return true; // More permissive length
  return true; // Always return true for now - fingerprint is optional
};

// Rate limiting middleware
const rateLimit = (type) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${type}:${clientIP}`;
    const now = Date.now();
    const config = SECURITY_CONFIG.RATE_LIMITS[type];

    // Check if IP is suspicious
    if (suspiciousIPs.has(clientIP)) {
      return res.status(429).json({
        success: false,
        error: 'IP temporarily blocked due to suspicious activity',
        retryAfter: SECURITY_CONFIG.BAN_DURATION / 1000
      });
    }

    // Get or create rate limit entry
    let rateLimitData = rateLimitStore.get(key);
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: now + config.window };
    }

    // Check rate limit
    if (rateLimitData.count >= config.max) {
      // Mark IP as suspicious after multiple rate limit violations
      const suspiciousKey = `suspicious:${clientIP}`;
      let suspiciousData = rateLimitStore.get(suspiciousKey) || { count: 0 };
      suspiciousData.count++;

      if (suspiciousData.count >= 3) {
        suspiciousIPs.add(clientIP);
        console.log(`🚨 IP ${clientIP} marked as suspicious`);
        setTimeout(() => suspiciousIPs.delete(clientIP), SECURITY_CONFIG.BAN_DURATION);
      }

      rateLimitStore.set(suspiciousKey, suspiciousData);

      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
      });
    }

    // Update rate limit
    rateLimitData.count++;
    rateLimitStore.set(key, rateLimitData);

    console.log(`🔒 Rate limit ${type}: ${clientIP} - ${rateLimitData.count}/${config.max}`);
    next();
  };
};

// Bot detection middleware
const botDetection = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  // Common bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
    /python/i, /java/i, /go-http/i, /ruby/i, /php/i
  ];

  // Suspicious patterns
  const suspiciousPatterns = [
    /^$/,  // Empty user agent
    /^Mozilla\/5\.0$/,  // Generic Mozilla only
    /.{500,}/,  // Extremely long user agent
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isBot) {
    console.log(`🤖 Bot detected: ${clientIP} - ${userAgent}`);
    return res.status(403).json({
      success: false,
      error: 'Automated access not allowed'
    });
  }

  if (isSuspicious) {
    console.log(`🚨 Suspicious user agent: ${clientIP} - ${userAgent}`);
    // Allow but monitor
    req.suspicious = true;
  }

  next();
};

// CAPTCHA endpoints
app.post('/api/security/captcha/generate', rateLimit('captcha'), (req, res) => {
  try {
    const { deviceFingerprint } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    if (!validateFingerprint(deviceFingerprint)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid device fingerprint'
      });
    }

    // Generate math problem
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
    }

    const token = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const challenge = {
      question: `${num1} ${operation === '*' ? '×' : operation} ${num2}`,
      answer,
      ip: clientIP,
      deviceFingerprint,
      expires: Date.now() + SECURITY_CONFIG.CAPTCHA_EXPIRE
    };

    captchaStore.set(token, challenge);

    console.log(`🧩 CAPTCHA generated for ${clientIP}: ${challenge.question} = ${answer}`);

    res.json({
      success: true,
      token,
      question: challenge.question
    });
  } catch (error) {
    console.error('❌ CAPTCHA generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CAPTCHA'
    });
  }
});

app.post('/api/security/captcha/verify', (req, res) => {
  try {
    const { token, solution, deviceFingerprint } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    const challenge = captchaStore.get(token);
    if (!challenge) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired CAPTCHA token'
      });
    }

    // Verify expiration
    if (Date.now() > challenge.expires) {
      captchaStore.delete(token);
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA expired'
      });
    }

    // Verify device fingerprint and IP
    if (challenge.deviceFingerprint !== deviceFingerprint || challenge.ip !== clientIP) {
      console.log(`🚨 CAPTCHA security violation: ${clientIP}`);
      captchaStore.delete(token);
      return res.status(403).json({
        success: false,
        error: 'Security validation failed'
      });
    }

    // Verify solution
    const isCorrect = parseInt(solution) === challenge.answer;
    captchaStore.delete(token);

    if (isCorrect) {
      console.log(`✅ CAPTCHA verified for ${clientIP}`);
      res.json({
        success: true,
        verified: true
      });
    } else {
      console.log(`❌ CAPTCHA failed for ${clientIP}: expected ${challenge.answer}, got ${solution}`);
      res.json({
        success: true,
        verified: false
      });
    }
  } catch (error) {
    console.error('❌ CAPTCHA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify CAPTCHA'
    });
  }
});

// Rate limit check endpoint
app.post('/api/security/rate-limit/check', (req, res) => {
  try {
    const { action } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${action}:${clientIP}`;
    const now = Date.now();
    const config = SECURITY_CONFIG.RATE_LIMITS[action];

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    const rateLimitData = rateLimitStore.get(key);
    if (!rateLimitData || now > rateLimitData.resetTime) {
      res.json({
        success: true,
        allowed: true,
        remaining: config.max - 1
      });
    } else {
      const remaining = config.max - rateLimitData.count;
      res.json({
        success: true,
        allowed: remaining > 0,
        remaining: Math.max(0, remaining)
      });
    }
  } catch (error) {
    console.error('❌ Rate limit check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check rate limit'
    });
  }
});

// 🔗 ZAPIER WEBHOOK ENDPOINTS
const webhookStore = new Map();
const webhookSubscriptions = new Map();

// Zapier webhook registration (for Zapier to subscribe to events)
app.post('/api/webhooks/zapier/subscribe', (req, res) => {
  try {
    const { event, targetUrl, subscriptionId } = req.body;

    if (!event || !targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Event type and target URL are required'
      });
    }

    const subscription = {
      id: subscriptionId || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      targetUrl,
      createdAt: new Date().toISOString(),
      active: true
    };

    webhookSubscriptions.set(subscription.id, subscription);
    console.log(`🔗 Zapier subscription created: ${event} → ${targetUrl}`);

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('❌ Zapier subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// Zapier webhook unsubscription
app.delete('/api/webhooks/zapier/subscribe/:id', (req, res) => {
  try {
    const { id } = req.params;
    const subscription = webhookSubscriptions.get(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    webhookSubscriptions.delete(id);
    console.log(`🗑️ Zapier subscription removed: ${id}`);

    res.json({
      success: true,
      message: 'Subscription removed'
    });
  } catch (error) {
    console.error('❌ Zapier unsubscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove subscription'
    });
  }
});

// Webhook trigger endpoint (called by frontend)
app.post('/api/webhooks/zapier', (req, res) => {
  try {
    const { event, data, timestamp } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    console.log(`🎯 Zapier webhook triggered: ${event} from ${clientIP}`);

    // Store webhook data
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const webhookData = {
      id: webhookId,
      event,
      data,
      timestamp: timestamp || new Date().toISOString(),
      ip: clientIP,
      processed: false
    };

    webhookStore.set(webhookId, webhookData);

    // Send to all subscribed Zapier endpoints
    const relevantSubscriptions = Array.from(webhookSubscriptions.values())
      .filter(sub => sub.active && sub.event === event);

    const deliveryPromises = relevantSubscriptions.map(async (subscription) => {
      try {
        const response = await fetch(subscription.targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SmartPromptIQ-Webhooks/1.0'
          },
          body: JSON.stringify({
            event,
            data,
            timestamp: webhookData.timestamp,
            subscription_id: subscription.id,
            source: 'smartpromptiq'
          })
        });

        console.log(`📤 Webhook delivered to ${subscription.targetUrl}: ${response.status}`);
        return { success: true, subscription: subscription.id, status: response.status };
      } catch (error) {
        console.error(`❌ Webhook delivery failed to ${subscription.targetUrl}:`, error);
        return { success: false, subscription: subscription.id, error: error.message };
      }
    });

    // Execute all deliveries
    Promise.allSettled(deliveryPromises).then(results => {
      const delivered = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;

      console.log(`📊 Webhook delivery complete: ${delivered} success, ${failed} failed`);

      // Mark as processed
      webhookData.processed = true;
      webhookData.deliveryResults = results;
      webhookStore.set(webhookId, webhookData);
    });

    res.json({
      success: true,
      webhookId,
      subscriptions: relevantSubscriptions.length,
      message: `Webhook triggered for ${relevantSubscriptions.length} subscription(s)`
    });

  } catch (error) {
    console.error('❌ Webhook trigger error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger webhook'
    });
  }
});

// Zapier webhook test endpoint (for Zapier app setup)
app.post('/api/webhooks/zapier/test', (req, res) => {
  console.log('🧪 Zapier test webhook received');
  res.json({
    success: true,
    message: 'SmartPromptIQ webhook endpoint is working!',
    timestamp: new Date().toISOString(),
    events: [
      'user_registered',
      'prompt_generated',
      'pdf_generated',
      'template_completed',
      'demo_used'
    ]
  });
});

// Get webhook history (for debugging)
app.get('/api/webhooks/history', (req, res) => {
  try {
    const webhooks = Array.from(webhookStore.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Last 50 webhooks

    res.json({
      success: true,
      webhooks,
      total: webhookStore.size
    });
  } catch (error) {
    console.error('❌ Webhook history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook history'
    });
  }
});

// CRITICAL: Railway health check - IMMEDIATE RESPONSE
app.get('/health', (req, res) => {
  console.log('🏥 Health check at:', new Date().toISOString());
  res.status(200).send('OK');
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('📁 Frontend path:', clientDistPath);

if (fs.existsSync(clientDistPath)) {
  console.log('✅ Frontend build found');
  app.use(express.static(clientDistPath));
} else {
  console.log('⚠️ Frontend build not found - serving basic routes only');
}

// Basic auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password, isAdminLogin } = req.body;

  console.log('🔐 Login attempt:', { email, isAdminLogin, hasPassword: !!password });

  // Check for admin credentials
  const adminEmails = ['admin@admin.com', 'admin@smartpromptiq.net', 'admin@smartpromptiq.com'];
  const adminPassword = 'admin123'; // Demo admin password

  if (isAdminLogin || adminEmails.includes(email)) {
    // Admin login validation
    if (adminEmails.includes(email) && password === adminPassword) {
      console.log('✅ Admin login successful for:', email);
      res.json({
        success: true,
        data: {
          token: 'admin-token-' + Date.now(),
          user: {
            id: 'admin-' + Date.now(),
            email: email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            subscriptionTier: 'enterprise',
            plan: 'enterprise',
            tokenBalance: 999999
          }
        }
      });
    } else {
      console.log('❌ Admin login failed for:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } else {
    // Regular user login (demo)
    console.log('✅ User login successful for:', email);
    res.json({
      success: true,
      data: {
        token: 'demo-token',
        user: {
          id: 'demo-' + Date.now(),
          email: email || 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'USER',
          subscriptionTier: 'free',
          plan: 'free',
          tokenBalance: 1000
        }
      }
    });
  }
});

// Enhanced registration endpoint with security
app.post('/api/auth/register', rateLimit('registration'), botDetection, (req, res) => {
  try {
    const { email, firstName, lastName, captchaToken, captchaSolution, deviceFingerprint } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate device fingerprint - DISABLED FOR PRODUCTION COMPATIBILITY
    // Device fingerprint is now optional - frontend will send it when available
    /*
    if (!validateFingerprint(deviceFingerprint)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid device fingerprint'
      });
    }
    */
    console.log('✅ Registration request accepted (fingerprint validation disabled)');

    // Verify CAPTCHA if provided
    if (captchaToken && captchaSolution) {
      const challenge = captchaStore.get(captchaToken);
      if (!challenge) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired CAPTCHA'
        });
      }

      if (challenge.deviceFingerprint !== deviceFingerprint || challenge.ip !== clientIP) {
        return res.status(403).json({
          success: false,
          error: 'CAPTCHA security validation failed'
        });
      }

      if (parseInt(captchaSolution) !== challenge.answer) {
        return res.status(400).json({
          success: false,
          error: 'Incorrect CAPTCHA solution'
        });
      }

      captchaStore.delete(captchaToken);
    }

    // Check for suspicious registration patterns
    const registrationKey = `reg:${email}:${deviceFingerprint}`;
    const existingAttempt = registrationAttempts.get(registrationKey);
    if (existingAttempt && Date.now() - existingAttempt < 60000) {
      return res.status(429).json({
        success: false,
        error: 'Please wait before registering again'
      });
    }

    // Log successful registration
    registrationAttempts.set(registrationKey, Date.now());
    console.log(`✅ User registration: ${email} from ${clientIP}`);

    // Generate secure user data
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: 'USER',
        subscriptionTier: 'free',
        plan: 'free',
        tokenBalance: 1000,
        verified: true,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// User profile endpoint
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'demo-user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
      subscriptionTier: 'free',
      plan: 'free',
      tokenBalance: 1000
    }
  });
});

// Basic endpoints for demo functionality
app.get('/api/prompts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Sample Business Strategy',
        content: 'A comprehensive business strategy prompt for demo purposes.',
        category: 'business',
        createdAt: new Date().toISOString(),
        isFavorite: false
      }
    ]
  });
});

app.post('/api/prompts', (req, res) => {
  const { title, content, category } = req.body;
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      title: title || 'New Prompt',
      content: content || '',
      category: category || 'business',
      createdAt: new Date().toISOString(),
      isFavorite: false
    }
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      promptsGenerated: 127,
      tokensUsed: 2450,
      tokensRemaining: 2550,
      promptsThisMonth: 34,
      averageRating: 4.7,
      favoritePrompts: 15
    }
  });
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  console.log('🔐 Admin auth check:', { authHeader, token });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }

  // Check if token is an admin token or a valid admin session
  if (token.startsWith('admin-token-') || token === 'demo-token') {
    console.log('✅ Admin token validated');
    next();
  } else {
    console.log('❌ Invalid admin token');
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Admin endpoints
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  console.log('📊 Admin stats requested');
  res.json({
    success: true,
    data: {
      totalUsers: 8947,
      activeUsers: 2345,
      totalRevenue: 125340.50,
      monthlyRevenue: 34500.25,
      totalPrompts: 47283,
      successfulPayments: 1234,
      refundedPayments: 23,
      pendingPayments: 45,
      systemHealth: 'healthy'
    }
  });
});

app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  console.log('👥 Admin users list requested');
  const mockUsers = Array.from({ length: 20 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    firstName: `User`,
    lastName: `${i + 1}`,
    subscriptionTier: i % 3 === 0 ? 'premium' : 'free',
    subscriptionStatus: 'active',
    tokenBalance: Math.floor(Math.random() * 5000),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalSpent: Math.floor(Math.random() * 500)
  }));

  res.json({
    success: true,
    data: mockUsers
  });
});

app.get('/api/admin/payments', authenticateAdmin, (req, res) => {
  console.log('💳 Admin payments list requested');
  const mockPayments = Array.from({ length: 15 }, (_, i) => ({
    id: `payment-${i + 1}`,
    userId: `user-${i + 1}`,
    userEmail: `user${i + 1}@example.com`,
    amount: (Math.random() * 100 + 10).toFixed(2),
    currency: 'USD',
    status: ['succeeded', 'pending', 'failed', 'refunded'][Math.floor(Math.random() * 4)],
    stripePaymentId: `pi_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'SmartPromptIQ Premium Subscription'
  }));

  res.json({
    success: true,
    data: mockPayments
  });
});

app.get('/api/admin/token-monitoring', authenticateAdmin, (req, res) => {
  console.log('🔑 Admin token monitoring requested');
  res.json({
    success: true,
    data: {
      totalTokensUsed: 2345678,
      averageTokensPerUser: 523,
      topTokenUsers: [
        { userId: 'user-1', email: 'user1@example.com', tokensUsed: 12500 },
        { userId: 'user-2', email: 'user2@example.com', tokensUsed: 9800 },
        { userId: 'user-3', email: 'user3@example.com', tokensUsed: 8750 }
      ]
    }
  });
});

app.get('/api/admin/password-security', authenticateAdmin, (req, res) => {
  console.log('🔒 Admin password security requested');
  res.json({
    success: true,
    data: {
      weakPasswords: 23,
      reusedPasswords: 5,
      securityScore: 8.7,
      lastSecurityAudit: new Date().toISOString()
    }
  });
});

app.get('/api/admin/email-management', authenticateAdmin, (req, res) => {
  console.log('📧 Admin email management requested');
  res.json({
    success: true,
    data: {
      emailsSent: 15430,
      emailsDelivered: 15241,
      emailsBounced: 89,
      emailsOpened: 12876,
      openRate: 84.5
    }
  });
});

app.get('/api/admin/system-monitoring', authenticateAdmin, (req, res) => {
  console.log('🖥️ Admin system monitoring requested');
  res.json({
    success: true,
    data: {
      uptime: '99.97%',
      responseTime: '245ms',
      errorRate: '0.03%',
      lastDeployment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

app.get('/api/admin/active-sessions', authenticateAdmin, (req, res) => {
  console.log('👤 Admin active sessions requested');
  res.json({
    success: true,
    data: Array.from({ length: 10 }, (_, i) => ({
      id: `session-${i + 1}`,
      userId: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }))
  });
});

app.get('/api/admin/recent-registrations', authenticateAdmin, (req, res) => {
  console.log('📝 Admin recent registrations requested');
  res.json({
    success: true,
    data: Array.from({ length: 5 }, (_, i) => ({
      id: `new-user-${i + 1}`,
      email: `newuser${i + 1}@example.com`,
      firstName: `New`,
      lastName: `User${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }))
  });
});

app.get('/api/admin/logs', authenticateAdmin, (req, res) => {
  console.log('📜 Admin logs requested');
  res.json({
    success: true,
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)],
      message: `Sample log message ${i + 1}`,
      userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 100)}` : null
    }))
  });
});

// Admin action endpoints (POST requests)
app.post('/api/admin/payments/:id/refund', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  console.log(`💸 Admin refund requested for payment ${id}, reason: ${reason}`);
  res.json({
    success: true,
    message: 'Refund processed successfully'
  });
});

app.post('/api/admin/actions/:action', (req, res) => {
  const { action } = req.params;
  const { userId, data } = req.body;
  console.log(`⚡ Admin action "${action}" for user ${userId}`);
  res.json({
    success: true,
    message: `Action ${action} completed successfully`
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Admin delete user ${id}`);
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

app.post('/api/admin/users/:id/suspend', (req, res) => {
  const { id } = req.params;
  const { reason, duration } = req.body;
  console.log(`⏸️ Admin suspend user ${id}, reason: ${reason}, duration: ${duration}`);
  res.json({
    success: true,
    message: 'User suspended successfully'
  });
});

app.post('/api/admin/users/:id/unsuspend', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  console.log(`▶️ Admin unsuspend user ${id}, reason: ${reason}`);
  res.json({
    success: true,
    message: 'User unsuspended successfully'
  });
});

// Templates endpoint
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'startup-pitch',
        name: 'Startup Pitch Template',
        description: 'Create compelling investor presentations',
        category: 'business',
        isPremium: false
      },
      {
        id: 'social-campaign',
        name: 'Social Media Campaign',
        description: 'Plan and execute social media strategies',
        category: 'marketing',
        isPremium: false
      }
    ]
  });
});

// Email endpoints
// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', (req, res) => {
  try {
    const { email, name, source } = req.body;
    console.log('📧 Newsletter subscription:', { email, name, source });

    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Mock newsletter subscription (in production, integrate with email service)
    const subscription = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name: name || '',
      source: source || 'website',
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };

    console.log('✅ Newsletter subscription successful:', subscription.id);
    res.json({
      success: true,
      data: subscription,
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Newsletter subscription failed',
      message: 'Please try again later'
    });
  }
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;
    console.log('📞 Contact form submission:', { name, email, subject, category });

    // Input validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, email, and message are required'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Mock contact form handling (in production, send email to admin and auto-reply to user)
    const contactSubmission = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      subject: subject || 'General Inquiry',
      message,
      category: category || 'general',
      submittedAt: new Date().toISOString(),
      status: 'received'
    };

    console.log('✅ Contact form submission received:', contactSubmission.id);
    res.json({
      success: true,
      data: contactSubmission,
      message: 'Thank you for your message! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Contact form submission failed',
      message: 'Please try again later'
    });
  }
});

// Email test endpoint for admins
app.post('/api/email/test', (req, res) => {
  try {
    const { email, templateType } = req.body;
    console.log('🧪 Email test request:', { email, templateType });

    // Input validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Mock email test (in production, use actual email service)
    const testEmail = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      templateType: templateType || 'test',
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    console.log('✅ Test email sent:', testEmail.id);
    res.json({
      success: true,
      data: testEmail,
      message: 'Test email sent successfully!'
    });

  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({
      success: false,
      error: 'Email test failed',
      message: 'Please try again later'
    });
  }
});

// Welcome email endpoint (for new user registration)
app.post('/api/email/welcome', (req, res) => {
  try {
    const { email, name } = req.body;
    console.log('👋 Welcome email request:', { email, name });

    // Input validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Mock welcome email (in production, use actual email service)
    const welcomeEmail = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name: name || 'User',
      templateType: 'welcome',
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    console.log('✅ Welcome email sent:', welcomeEmail.id);
    res.json({
      success: true,
      data: welcomeEmail,
      message: 'Welcome email sent successfully!'
    });

  } catch (error) {
    console.error('❌ Welcome email error:', error);
    res.status(500).json({
      success: false,
      error: 'Welcome email failed',
      message: 'Please try again later'
    });
  }
});

// Demo rate limiting - simple in-memory store for production
const demoUsage = new Map();
const requestCache = new Map(); // Cache for similar requests
const DEMO_LIMITS = {
  MAX_REQUESTS_PER_IP: 100, // Increased: 100 requests per IP per hour
  MAX_REQUESTS_PER_EMAIL: 50, // Increased: 50 requests per email per 5 minutes
  WINDOW_MS: 5 * 60 * 1000, // Changed to 5 minutes for demo tier
  MAX_DAILY_TOTAL: 10000, // Increased daily limit
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes cache
};

let dailyDemoCount = 0;
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;

// Demo generation endpoint with Redis-based rate limiting
app.post('/api/demo/generate', demoRateLimiter, (req, res) => {
  try {
    const { template, templateType, responses, userResponses, userEmail } = req.body;
    // Support both 'template' and 'templateType' field names for compatibility
    const templateToUse = template || templateType;
    const responsesToUse = responses || userResponses;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Reset daily counter if needed
    if (now > dailyResetTime) {
      dailyDemoCount = 0;
      dailyResetTime = now + 24 * 60 * 60 * 1000;
    }

    // Check daily limit
    if (dailyDemoCount >= DEMO_LIMITS.MAX_DAILY_TOTAL) {
      return res.status(429).json({
        error: 'Demo service temporarily unavailable',
        message: 'Daily demo limit reached. Please try again tomorrow.',
        retryAfter: Math.ceil((dailyResetTime - now) / 1000)
      });
    }

    // Rate limiting by IP
    const ipKey = `ip:${clientIP}`;
    const ipUsage = demoUsage.get(ipKey) || { count: 0, resetTime: now + DEMO_LIMITS.WINDOW_MS };

    if (now > ipUsage.resetTime) {
      ipUsage.count = 0;
      ipUsage.resetTime = now + DEMO_LIMITS.WINDOW_MS;
    }

    if (ipUsage.count >= DEMO_LIMITS.MAX_REQUESTS_PER_IP) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please wait before making another request.',
        retryAfter: Math.ceil((ipUsage.resetTime - now) / 1000)
      });
    }

    // Rate limiting by email (if provided)
    if (userEmail) {
      const emailKey = `email:${userEmail.toLowerCase()}`;
      const emailUsage = demoUsage.get(emailKey) || { count: 0, resetTime: now + DEMO_LIMITS.WINDOW_MS };

      if (now > emailUsage.resetTime) {
        emailUsage.count = 0;
        emailUsage.resetTime = now + DEMO_LIMITS.WINDOW_MS;
      }

      if (emailUsage.count >= DEMO_LIMITS.MAX_REQUESTS_PER_EMAIL) {
        return res.status(429).json({
          error: 'Email limit exceeded',
          message: `Demo limit: ${DEMO_LIMITS.MAX_REQUESTS_PER_EMAIL} requests per ${Math.floor(DEMO_LIMITS.WINDOW_MS / 60000)} minutes`,
          retryAfter: Math.ceil((emailUsage.resetTime - now) / 1000),
          remaining: 0,
          resetTime: emailUsage.resetTime,
          limit: DEMO_LIMITS.MAX_REQUESTS_PER_EMAIL,
          windowMs: DEMO_LIMITS.WINDOW_MS
        });
      }

      // Update email usage
      emailUsage.count++;
      demoUsage.set(emailKey, emailUsage);
    }

    // Update IP usage
    ipUsage.count++;
    demoUsage.set(ipKey, ipUsage);

    // Increment daily counter
    dailyDemoCount++;

    // Input validation
    if (!templateToUse || typeof templateToUse !== 'string') {
      return res.status(400).json({
        error: 'Invalid template',
        message: 'Template parameter is required and must be a string'
      });
    }

    if (templateToUse.length > 50) {
      return res.status(400).json({
        error: 'Template name too long',
        message: 'Template name must be 50 characters or less'
      });
    }

    if (responses && typeof responses === 'object') {
      // Limit number of response fields
      if (Object.keys(responses).length > 20) {
        return res.status(400).json({
          error: 'Too many response fields',
          message: 'Maximum 20 response fields allowed'
        });
      }

      // Limit response field sizes
      for (const [key, value] of Object.entries(responses)) {
        if (typeof key !== 'string' || key.length > 100) {
          return res.status(400).json({
            error: 'Invalid response field',
            message: 'Response field names must be strings with max 100 characters'
          });
        }
        if (typeof value === 'string' && value.length > 1000) {
          return res.status(400).json({
            error: 'Response value too long',
            message: 'Response values must be 1000 characters or less'
          });
        }
      }
    }

    if (userEmail && (typeof userEmail !== 'string' || userEmail.length > 254)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Email must be a valid string with max 254 characters'
      });
    }

    // Check cache first (before rate limiting to improve UX)
    const cacheKey = `cache:${templateToUse}:${JSON.stringify(responsesToUse || {})}`;
    const cachedResult = requestCache.get(cacheKey);
    if (cachedResult && now < cachedResult.expires) {
      console.log('✅ Returning cached result for:', templateToUse);
      return res.json({
        ...cachedResult.data,
        cached: true,
        cacheAge: Math.floor((now - cachedResult.created) / 1000)
      });
    }

    console.log('🎯 Demo generate request:', {
      template: templateToUse,
      userEmail,
      clientIP,
      responseCount: Object.keys(responsesToUse || {}).length,
      dailyCount: dailyDemoCount,
      ipUsage: ipUsage.count,
      emailUsage: userEmail ? demoUsage.get(`email:${userEmail.toLowerCase()}`)?.count : 'N/A'
    });

    // Template responses based on demo template type
    const demoResponses = {
      'startup-pitch': {
        id: Date.now().toString(),
        type: "startup_pitch",
        title: `${responses?.['Business Name'] || 'Your Startup'} - Investor Pitch Deck`,
        description: "Compelling pitch presentation designed to secure funding",
        content: `# ${responses?.['Business Name'] || 'Your Startup'} Pitch Deck

## The Problem
${responses?.['Problem'] || 'A significant market problem that needs solving'} affects millions of potential customers, creating a $${Math.floor(Math.random() * 50 + 10)}B market opportunity.

## Our Solution
${responses?.['Solution'] || 'An innovative solution'} that addresses this problem through cutting-edge technology and user-centered design.

## Target Market
${responses?.['Target Market'] || 'Our target demographic'} represents a growing segment with high purchasing power and unmet needs.

## Business Model
${responses?.['Revenue Model'] || 'Subscription-based revenue model'} with multiple revenue streams ensuring sustainable growth.

## Market Opportunity
- Total Addressable Market: $${Math.floor(Math.random() * 100 + 50)}B
- Serviceable Addressable Market: $${Math.floor(Math.random() * 20 + 5)}B
- Growing at ${Math.floor(Math.random() * 20 + 15)}% annually

## Competitive Advantage
- First-mover advantage in emerging market
- Proprietary technology and patents
- Strong team with domain expertise
- Strategic partnerships in place

## Financial Projections
- Year 1: $${Math.floor(Math.random() * 500 + 100)}K revenue
- Year 2: $${Math.floor(Math.random() * 2000 + 500)}K revenue
- Year 3: $${Math.floor(Math.random() * 5000 + 2000)}K revenue

## Funding Requirements
Seeking $${Math.floor(Math.random() * 2000 + 500)}K to accelerate growth and market expansion.`,
        generatedAt: new Date().toISOString()
      },
      'social-campaign': {
        id: Date.now().toString(),
        type: "social_campaign",
        title: `${responses?.['Product/Service'] || 'Your Product'} - Social Media Strategy`,
        description: "Comprehensive social media campaign for maximum engagement",
        content: `# Social Media Campaign: ${responses?.['Product/Service'] || 'Your Product'}

## Campaign Overview
A ${responses?.['Duration'] || '6-week'} integrated social media campaign targeting ${responses?.['Target Audience'] || 'your ideal customers'} with a budget of ${responses?.['Budget'] || '$5,000'}.

## Content Strategy
### Week 1-2: Awareness Building
- Educational content about product benefits
- Behind-the-scenes content creation
- User-generated content campaigns

### Week 3-4: Engagement & Community
- Interactive polls and Q&As
- Live demonstrations and tutorials
- Customer testimonials and reviews

### Week 5-6: Conversion Focus
- Limited-time offers and promotions
- Product launch announcements
- Call-to-action focused content

## Platform Strategy
${responses?.['Platforms'] || 'Instagram, TikTok, Facebook'} optimized content with platform-specific formats and timing.

## Expected Results
- Reach: ${Math.floor(Math.random() * 500 + 100)}K users
- Engagement Rate: ${Math.floor(Math.random() * 5 + 3)}%
- Lead Generation: ${Math.floor(Math.random() * 1000 + 200)} qualified leads
- ROI: ${Math.floor(Math.random() * 300 + 200)}%`,
        generatedAt: new Date().toISOString()
      },
      'financial-planner': {
        id: Date.now().toString(),
        type: "financial_plan",
        title: `Financial Roadmap for ${responses?.['Target Age Group'] || '30-40'} Year Olds`,
        description: "Comprehensive financial planning strategy",
        content: `# Financial Planning Guide for ${responses?.['Target Age Group'] || '30-40'} Year Olds

## Financial Goals
${responses?.['Financial Goals'] || 'Building wealth and financial security'} over a ${responses?.['Planning Timeline'] || '5-year'} timeline.

## Income Analysis
Based on ${responses?.['Income Level'] || '$75,000'} annual income:
- Monthly Net Income: $${Math.floor((parseInt(responses?.['Income Level']?.replace(/[^0-9]/g, '') || '75000') * 0.75) / 12)}
- Recommended Savings Rate: 20%
- Monthly Savings Target: $${Math.floor((parseInt(responses?.['Income Level']?.replace(/[^0-9]/g, '') || '75000') * 0.15) / 12)}

## Investment Strategy
### Short-term (1-2 years)
- Emergency Fund: 6 months expenses
- High-yield savings accounts
- Short-term CDs

### Medium-term (3-5 years)
- Balanced portfolio (60/40 stocks/bonds)
- Target-date funds
- Real estate down payment fund

### Long-term (5+ years)
- Aggressive growth portfolio
- Retirement accounts (401k, IRA)
- Index fund investments

## Milestone Timeline
- Year 1: Emergency fund complete
- Year 2: Investment portfolio established
- Year 3: ${responses?.['Financial Goals']?.includes('home') ? 'Home down payment ready' : 'Investment goals on track'}
- Year 5: Significant wealth accumulation

## Risk Management
- Life insurance: 10x annual income
- Disability insurance: 60% income replacement
- Health insurance optimization`,
        generatedAt: new Date().toISOString()
      },
      'course-creator': {
        id: Date.now().toString(),
        type: "course_plan",
        title: `Online Course: ${responses?.['Course Topic'] || 'Your Subject Matter'}`,
        description: "Complete online course development strategy",
        content: `# Online Course Creation Plan

## Course Overview
"${responses?.['Course Topic'] || 'Your Subject Matter'}" designed for ${responses?.['Target Audience'] || 'professionals and enthusiasts'}.

## Course Structure
### Module 1: Foundation
- Introduction and basics
- Core concepts and principles
- Hands-on exercises

### Module 2: Intermediate Skills
- Advanced techniques
- Practical applications
- Case studies and examples

### Module 3: Mastery
- Expert-level strategies
- Real-world projects
- Certification and next steps

## Pricing Strategy
- Course Price: ${responses?.['Course Price'] || '$299'}
- Early Bird Discount: 30% off
- Payment Plans: 3-month installments available

## Marketing Plan
### Pre-Launch (4 weeks)
- Build email list with free content
- Social media teasers and behind-the-scenes
- Partner outreach and collaborations

### Launch Week
- Special launch pricing
- Live Q&A sessions
- Student testimonials and case studies

### Post-Launch
- Continuous content updates
- Community building
- Affiliate program launch

## Expected Outcomes
- Students: ${Math.floor(Math.random() * 500 + 100)} enrolled
- Revenue: $${Math.floor(Math.random() * 50000 + 20000)}
- Completion Rate: ${Math.floor(Math.random() * 30 + 60)}%
- Satisfaction Score: ${(Math.random() * 1 + 4).toFixed(1)}/5.0`,
        generatedAt: new Date().toISOString()
      }
    };

    const response = demoResponses[templateToUse] || {
      id: Date.now().toString(),
      type: "general",
      title: `Generated Content for ${templateToUse}`,
      description: "AI-generated content based on your inputs",
      content: `# ${templateToUse} Strategy

Thank you for using our demo! Based on your inputs, here's a comprehensive strategy tailored to your needs.

## Overview
Your responses have been analyzed to create a customized plan that addresses your specific requirements and goals.

## Key Recommendations
1. Focus on your core value proposition
2. Implement systematic tracking and measurement
3. Build sustainable processes for long-term success
4. Regularly review and optimize performance

## Next Steps
1. Review this generated content
2. Customize further based on your specific needs
3. Implement the recommended strategies
4. Track progress and iterate as needed

Generated on: ${new Date().toISOString()}`,
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Demo content generated successfully:', response.id);

    // Cache the successful response for future requests
    requestCache.set(cacheKey, {
      data: response,
      created: now,
      expires: now + DEMO_LIMITS.CACHE_DURATION
    });
    console.log('💾 Response cached for:', templateToUse);

    res.json(response);
  } catch (error) {
    console.error('❌ Demo generate error:', error);
    res.status(500).json({
      error: 'Failed to generate demo content',
      message: 'Please try again later'
    });
  }
});

// Rate limit status endpoint
app.get('/api/demo/rate-limit-status', (req, res) => {
  try {
    const { userEmail } = req.query;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const ipKey = `ip:${clientIP}`;
    const ipUsage = demoUsage.get(ipKey) || { count: 0, resetTime: now + DEMO_LIMITS.WINDOW_MS };

    let emailUsage = null;
    if (userEmail) {
      const emailKey = `email:${userEmail.toString().toLowerCase()}`;
      emailUsage = demoUsage.get(emailKey) || { count: 0, resetTime: now + DEMO_LIMITS.WINDOW_MS };
    }

    // Reset if window expired
    if (now > ipUsage.resetTime) {
      ipUsage.count = 0;
      ipUsage.resetTime = now + DEMO_LIMITS.WINDOW_MS;
    }
    if (emailUsage && now > emailUsage.resetTime) {
      emailUsage.count = 0;
      emailUsage.resetTime = now + DEMO_LIMITS.WINDOW_MS;
    }

    res.json({
      success: true,
      data: {
        ip: {
          remaining: Math.max(0, DEMO_LIMITS.MAX_REQUESTS_PER_IP - ipUsage.count),
          limit: DEMO_LIMITS.MAX_REQUESTS_PER_IP,
          resetTime: ipUsage.resetTime,
          windowMs: DEMO_LIMITS.WINDOW_MS
        },
        email: emailUsage ? {
          remaining: Math.max(0, DEMO_LIMITS.MAX_REQUESTS_PER_EMAIL - emailUsage.count),
          limit: DEMO_LIMITS.MAX_REQUESTS_PER_EMAIL,
          resetTime: emailUsage.resetTime,
          windowMs: DEMO_LIMITS.WINDOW_MS
        } : null,
        daily: {
          remaining: Math.max(0, DEMO_LIMITS.MAX_DAILY_TOTAL - dailyDemoCount),
          limit: DEMO_LIMITS.MAX_DAILY_TOTAL,
          resetTime: dailyResetTime
        }
      }
    });
  } catch (error) {
    console.error('❌ Rate limit status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limit status'
    });
  }
});

// Demo send results endpoint
app.post('/api/demo/send-results', (req, res) => {
  try {
    const { email, templateName, generatedPrompt, results, template } = req.body;
    console.log('📧 Demo send results request:', { email, templateName, promptLength: generatedPrompt?.length });

    // Input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Email is required'
      });
    }

    // Check for both old and new parameter formats
    const content = generatedPrompt || results?.content;
    const templateTitle = templateName || template;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content',
        message: 'Generated prompt content is required'
      });
    }

    // Mock email sending (in production, integrate with actual email service)
    const emailResponse = {
      id: Date.now().toString(),
      email: email,
      template: templateTitle,
      contentLength: content.length,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    console.log('✅ Demo results sent via email:', emailResponse.id);

    res.json({
      success: true,
      data: emailResponse,
      message: 'Results sent to your email successfully!'
    });
  } catch (error) {
    console.error('❌ Demo send results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send results',
      message: 'Please try again later'
    });
  }
});

// Demo rate limit reset endpoint (for development/testing)
app.post('/api/demo/reset-limits', (req, res) => {
  try {
    // Clear all rate limiting data
    demoUsage.clear();
    dailyDemoCount = 0;
    dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;

    console.log('🔄 Demo rate limits reset');

    res.json({
      success: true,
      message: 'Demo rate limits have been reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Reset limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset limits'
    });
  }
});

// Additional generation endpoints used by the app

// Product planning endpoints
app.post('/api/product/mvp-planning', demoRateLimiter, (req, res) => {
  try {
    const { productName, targetAudience, coreFeatures, timeline, budget } = req.body;

    console.log('🎯 Product MVP planning request:', { productName, targetAudience, timeline });

    // Generate MVP planning content
    const mvpPlan = {
      success: true,
      data: {
        productName: productName || 'Your Product',
        planningPhase: 'MVP Development Strategy',
        content: `# ${productName || 'Product'} MVP Development Plan

## Executive Summary
A comprehensive MVP (Minimum Viable Product) strategy for ${productName || 'your product'} targeting ${targetAudience || 'your target audience'}.

## Product Overview
**Product Name:** ${productName || 'Your Product'}
**Target Audience:** ${targetAudience || 'Target market to be defined'}
**Timeline:** ${timeline || '3-6 months'}
**Budget Range:** ${budget || 'To be determined'}

## Core MVP Features
${coreFeatures ?
  (Array.isArray(coreFeatures) ?
    coreFeatures.map(feature => `• ${feature}`).join('\n') :
    `• ${coreFeatures}`) :
  `• User authentication and registration
• Core functionality implementation
• Basic user interface
• Essential integrations`
}

## Development Phases

### Phase 1: Foundation (Weeks 1-4)
• Market research and validation
• Technical architecture planning
• Core feature specification
• Team setup and project initialization

### Phase 2: Core Development (Weeks 5-12)
• MVP feature development
• User interface implementation
• Basic testing and QA
• Initial user feedback collection

### Phase 3: Launch Preparation (Weeks 13-16)
• Beta testing with select users
• Performance optimization
• Launch strategy execution
• Feedback integration and iteration

## Success Metrics
• User acquisition targets
• Feature adoption rates
• User retention metrics
• Revenue/conversion goals

## Risk Mitigation
• Technical feasibility assessment
• Market competition analysis
• Resource allocation planning
• Contingency planning

*Generated by SmartPromptIQ's product planning AI*`,
        generatedAt: new Date().toISOString(),
        id: `mvp_${Date.now()}`
      }
    };

    res.json(mvpPlan);

  } catch (error) {
    console.error('❌ Product MVP planning error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate MVP plan'
    });
  }
});

// UX Design endpoint
app.post('/api/product/ux-design', demoRateLimiter, (req, res) => {
  try {
    const { productType, userPersonas, designGoals, platform, constraints } = req.body;

    console.log('🎯 UX Design request:', { productType, platform });

    const uxDesign = {
      success: true,
      data: {
        type: 'ux_design',
        title: `UX Design Strategy for ${productType || 'Your Product'}`,
        description: 'Comprehensive user experience design framework',
        content: `# UX Design Strategy: ${productType || 'Product'}

## Design Overview
**Product Type:** ${productType || 'Digital Product'}
**Target Platform:** ${platform || 'Web & Mobile'}
**Design Goals:** ${designGoals || 'Enhanced user experience and engagement'}

## User Personas
${userPersonas ?
  (Array.isArray(userPersonas) ?
    userPersonas.map(persona => `• ${persona}`).join('\n') :
    `• ${userPersonas}`) :
  `• Primary User: Tech-savvy professionals
• Secondary User: Casual consumers
• Tertiary User: Enterprise clients`
}

## Design Framework

### 1. User Research & Analysis
• Conduct user interviews and surveys
• Analyze user behavior patterns
• Create detailed user journey maps
• Identify pain points and opportunities

### 2. Information Architecture
• Site mapping and content organization
• Navigation structure design
• Content hierarchy planning
• Search and filtering systems

### 3. Wireframing & Prototyping
• Low-fidelity wireframes
• Interactive prototypes
• User flow documentation
• Accessibility considerations

### 4. Visual Design System
• Brand identity integration
• Color palette and typography
• Component library creation
• Responsive design guidelines

## Platform-Specific Considerations
**${platform || 'Multi-Platform'}:**
• Platform design guidelines adherence
• Native interaction patterns
• Performance optimization
• Cross-platform consistency

## Design Constraints
${constraints ?
  (Array.isArray(constraints) ?
    constraints.map(constraint => `• ${constraint}`).join('\n') :
    `• ${constraints}`) :
  `• Budget limitations
• Timeline constraints
• Technical limitations
• Brand guidelines`
}

## Success Metrics
• User engagement rates
• Task completion efficiency
• User satisfaction scores
• Conversion rate improvements

*Generated by SmartPromptIQ's UX design AI*`,
        generatedAt: new Date().toISOString(),
        id: `ux_${Date.now()}`
      }
    };

    res.json(uxDesign);

  } catch (error) {
    console.error('❌ UX Design error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate UX design strategy'
    });
  }
});

// Competitive Analysis endpoint
app.post('/api/product/competitive-analysis', demoRateLimiter, (req, res) => {
  try {
    const { industry, competitors, analysisScope, businessModel } = req.body;

    console.log('🎯 Competitive Analysis request:', { industry, analysisScope });

    const competitiveAnalysis = {
      success: true,
      data: {
        type: 'competitive_analysis',
        title: `Competitive Analysis: ${industry || 'Market'} Industry`,
        description: 'Strategic competitive landscape assessment',
        content: `# Competitive Analysis: ${industry || 'Industry'} Market

## Analysis Overview
**Industry:** ${industry || 'Technology Sector'}
**Analysis Scope:** ${analysisScope || 'Direct and indirect competitors'}
**Business Model:** ${businessModel || 'B2B SaaS'}

## Competitive Landscape

### Direct Competitors
${competitors ?
  (Array.isArray(competitors) ?
    competitors.slice(0, 3).map((comp, i) => `
#### Competitor ${i + 1}: ${comp}
• Market Position: Established player
• Key Strengths: Brand recognition, market share
• Weaknesses: Legacy technology, pricing
• Differentiation: Feature comparison needed`).join('\n') :
    `#### ${competitors}
• Market Position: Primary competitor
• Key Strengths: Market leadership
• Weaknesses: Areas for improvement
• Differentiation: Competitive advantages`) :
  `#### Competitor A
• Market Position: Market leader
• Key Strengths: Strong brand, extensive features
• Weaknesses: High pricing, complex interface
• Differentiation: Premium positioning

#### Competitor B
• Market Position: Growing challenger
• Key Strengths: Innovative features, competitive pricing
• Weaknesses: Limited market presence
• Differentiation: Technology focus

#### Competitor C
• Market Position: Niche player
• Key Strengths: Specialized features
• Weaknesses: Limited scalability
• Differentiation: Vertical focus`
}

### Market Analysis

#### Market Size & Growth
• Total Addressable Market (TAM): Significant opportunity
• Serviceable Addressable Market (SAM): Growing segment
• Market Growth Rate: Strong positive trajectory
• Key Market Drivers: Digital transformation, efficiency needs

#### Customer Segments
• Enterprise clients: Large organizations
• SMB market: Small to medium businesses
• Individual users: Consumer market
• Vertical markets: Industry-specific needs

### Competitive Positioning

#### Feature Comparison Matrix
• Core Features: Industry standard capabilities
• Advanced Features: Differentiation opportunities
• Pricing Models: Various approaches in market
• Customer Support: Service level variations

#### SWOT Analysis
**Strengths:**
• Innovation potential
• Team expertise
• Market timing
• Technology advantages

**Weaknesses:**
• Brand recognition
• Resource limitations
• Market presence
• Customer base

**Opportunities:**
• Market gaps identified
• Emerging technologies
• Customer pain points
• Geographic expansion

**Threats:**
• Established competitors
• Market saturation
• Technology changes
• Economic factors

## Strategic Recommendations

### Differentiation Strategy
• Focus on unique value proposition
• Leverage technology advantages
• Target underserved segments
• Develop specialized features

### Go-to-Market Approach
• Direct sales strategy
• Partnership channels
• Digital marketing focus
• Customer success emphasis

### Product Development
• Feature prioritization
• User experience focus
• Integration capabilities
• Scalability planning

*Generated by SmartPromptIQ's competitive analysis AI*`,
        generatedAt: new Date().toISOString(),
        id: `analysis_${Date.now()}`
      }
    };

    res.json(competitiveAnalysis);

  } catch (error) {
    console.error('❌ Competitive Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive analysis'
    });
  }
});

// Marketing endpoints
app.post('/api/marketing/social-campaign', demoRateLimiter, (req, res) => {
  try {
    const { platform, audience, goals, budget, duration } = req.body;
    console.log('🎯 Social Campaign request:', { platform, audience, goals });

    const campaign = {
      success: true,
      data: {
        type: 'social_campaign',
        title: `Social Media Campaign Strategy for ${platform || 'Multi-Platform'}`,
        content: `# Social Media Campaign Strategy

## Campaign Overview
**Platform:** ${platform || 'Instagram, Facebook, TikTok'}
**Target Audience:** ${audience || 'Young professionals aged 25-35'}
**Duration:** ${duration || '6 weeks'}
**Budget:** ${budget || '$5,000'}

## Campaign Goals
${goals || '• Increase brand awareness\n• Drive website traffic\n• Generate leads\n• Build community engagement'}

## Content Strategy
### Week 1-2: Awareness Building
• Educational content and industry insights
• Behind-the-scenes content
• User-generated content campaigns

### Week 3-4: Engagement Focus
• Interactive polls and Q&A sessions
• Live streaming events
• Community challenges

### Week 5-6: Conversion Drive
• Product demonstrations
• Customer testimonials
• Limited-time offers

## Success Metrics
• Reach: 250K+ unique users
• Engagement Rate: 4.5%+
• Website Traffic: 30% increase
• Conversions: 500+ leads

*Generated by SmartPromptIQ's marketing AI*`,
        generatedAt: new Date().toISOString(),
        id: `social_${Date.now()}`
      }
    };
    res.json(campaign);
  } catch (error) {
    console.error('❌ Social Campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate social campaign' });
  }
});

app.post('/api/marketing/seo-strategy', demoRateLimiter, (req, res) => {
  try {
    const { website, keywords, competitors, goals } = req.body;
    console.log('🎯 SEO Strategy request:', { website, keywords });

    const seoStrategy = {
      success: true,
      data: {
        type: 'seo_strategy',
        title: `SEO Strategy for ${website || 'Your Website'}`,
        content: `# SEO Strategy Plan

## Website Analysis
**Target Website:** ${website || 'your-website.com'}
**Primary Keywords:** ${keywords || 'digital marketing, online presence, web optimization'}

## Technical SEO
• Website speed optimization
• Mobile responsiveness
• Schema markup implementation
• Internal linking structure

## Content Strategy
• Keyword-optimized blog posts
• Landing page optimization
• Meta descriptions and titles
• Content gap analysis

## Link Building
• Guest posting opportunities
• Industry partnerships
• Resource page listings
• Broken link recovery

## Monitoring & Analytics
• Google Analytics setup
• Search Console optimization
• Keyword ranking tracking
• Competitor analysis

*Generated by SmartPromptIQ's SEO AI*`,
        generatedAt: new Date().toISOString(),
        id: `seo_${Date.now()}`
      }
    };
    res.json(seoStrategy);
  } catch (error) {
    console.error('❌ SEO Strategy error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate SEO strategy' });
  }
});

app.post('/api/marketing/brand-strategy', demoRateLimiter, (req, res) => {
  try {
    const { brandName, industry, values, positioning } = req.body;
    console.log('🎯 Brand Strategy request:', { brandName, industry });

    const brandStrategy = {
      success: true,
      data: {
        type: 'brand_strategy',
        title: `Brand Strategy for ${brandName || 'Your Brand'}`,
        content: `# Brand Strategy Framework

## Brand Identity
**Brand Name:** ${brandName || 'Your Brand'}
**Industry:** ${industry || 'Technology'}
**Core Values:** ${values || 'Innovation, Trust, Excellence'}

## Brand Positioning
${positioning || 'Market leader in innovative solutions that transform how businesses operate'}

## Brand Architecture
• Brand mission and vision
• Value proposition development
• Brand personality definition
• Voice and tone guidelines

## Visual Identity
• Logo design principles
• Color palette strategy
• Typography selection
• Brand imagery guidelines

## Brand Experience
• Customer touchpoint mapping
• Brand consistency standards
• Employee brand training
• Brand monitoring protocols

*Generated by SmartPromptIQ's brand AI*`,
        generatedAt: new Date().toISOString(),
        id: `brand_${Date.now()}`
      }
    };
    res.json(brandStrategy);
  } catch (error) {
    console.error('❌ Brand Strategy error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate brand strategy' });
  }
});

app.post('/api/marketing/content-ideas', demoRateLimiter, (req, res) => {
  try {
    const { niche, contentType, audience, frequency } = req.body;
    console.log('🎯 Content Ideas request:', { niche, contentType });

    const contentIdeas = {
      success: true,
      data: {
        type: 'content_ideas',
        title: `Content Ideas for ${niche || 'Your Niche'}`,
        content: `# Content Marketing Ideas

## Content Strategy
**Niche:** ${niche || 'Digital Marketing'}
**Content Type:** ${contentType || 'Blog posts, videos, infographics'}
**Target Audience:** ${audience || 'Small business owners'}
**Publishing Frequency:** ${frequency || '3 times per week'}

## Blog Post Ideas
• "10 Essential Tools Every ${audience || 'Professional'} Needs"
• "Complete Guide to ${niche || 'Digital Marketing'} in 2024"
• "Common Mistakes in ${niche || 'Your Industry'} and How to Avoid Them"
• "Case Study: How We Achieved [Specific Result]"
• "Behind the Scenes: Our ${niche || 'Process'} Revealed"

## Video Content Ideas
• Tutorial series on ${niche || 'key topics'}
• Customer success stories
• Live Q&A sessions
• Product demonstrations
• Industry trend discussions

## Social Media Content
• Quick tips and tricks
• Motivational quotes
• User-generated content
• Polls and interactive posts
• Behind-the-scenes content

*Generated by SmartPromptIQ's content AI*`,
        generatedAt: new Date().toISOString(),
        id: `content_${Date.now()}`
      }
    };
    res.json(contentIdeas);
  } catch (error) {
    console.error('❌ Content Ideas error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate content ideas' });
  }
});

app.post('/api/marketing/keyword-strategy', demoRateLimiter, (req, res) => {
  try {
    const { industry, location, competition } = req.body;
    console.log('🎯 Keyword Strategy request:', { industry, location });

    const keywordStrategy = {
      success: true,
      data: {
        type: 'keyword_strategy',
        title: `Keyword Strategy for ${industry || 'Your Industry'}`,
        content: `# Keyword Research Strategy

## Primary Keywords
• ${industry || 'digital marketing'} services
• ${industry || 'digital marketing'} ${location || 'near me'}
• best ${industry || 'digital marketing'} company
• ${industry || 'digital marketing'} consultant

## Long-tail Keywords
• how to improve ${industry || 'digital marketing'} ROI
• ${industry || 'digital marketing'} strategy for small business
• ${industry || 'digital marketing'} trends 2024
• affordable ${industry || 'digital marketing'} services

## Local SEO Keywords
• ${industry || 'digital marketing'} ${location || 'your city'}
• ${location || 'local'} ${industry || 'digital marketing'} expert
• ${industry || 'digital marketing'} agency ${location || 'your area'}

## Keyword Analysis
• Search volume assessment
• Competition level evaluation
• Keyword difficulty scoring
• Content gap identification

*Generated by SmartPromptIQ's keyword AI*`,
        generatedAt: new Date().toISOString(),
        id: `keyword_${Date.now()}`
      }
    };
    res.json(keywordStrategy);
  } catch (error) {
    console.error('❌ Keyword Strategy error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate keyword strategy' });
  }
});

app.post('/api/marketing/brand-messaging', demoRateLimiter, (req, res) => {
  try {
    const { brand, audience, values, tone } = req.body;
    console.log('🎯 Brand Messaging request:', { brand, audience });

    const brandMessaging = {
      success: true,
      data: {
        type: 'brand_messaging',
        title: `Brand Messaging for ${brand || 'Your Brand'}`,
        content: `# Brand Messaging Framework

## Core Message
${brand || 'Your Brand'} empowers ${audience || 'businesses'} to achieve exceptional results through innovative solutions and expert guidance.

## Value Propositions
• Proven expertise in ${values || 'delivering results'}
• Customer-centric approach
• Innovative solutions
• Reliable partnership

## Brand Voice
**Tone:** ${tone || 'Professional yet approachable'}
• Confident and knowledgeable
• Supportive and encouraging
• Clear and actionable
• Inspiring and motivational

## Key Messages
• "Transforming ${audience || 'businesses'} through innovation"
• "Your success is our priority"
• "Proven results, exceptional service"
• "Leading the way in ${values || 'industry excellence'}"

*Generated by SmartPromptIQ's messaging AI*`,
        generatedAt: new Date().toISOString(),
        id: `messaging_${Date.now()}`
      }
    };
    res.json(brandMessaging);
  } catch (error) {
    console.error('❌ Brand Messaging error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate brand messaging' });
  }
});

// Financial Planning endpoints
app.post('/api/financial/revenue-model', demoRateLimiter, (req, res) => {
  try {
    const { businessType, targetMarket, pricing, revenueStreams } = req.body;
    console.log('🎯 Revenue Model request:', { businessType, targetMarket });

    const revenueModel = {
      success: true,
      data: {
        type: 'revenue_model',
        title: `Revenue Model for ${businessType || 'Your Business'}`,
        content: `# Revenue Model Strategy

## Business Overview
**Business Type:** ${businessType || 'SaaS Platform'}
**Target Market:** ${targetMarket || 'Small to medium businesses'}
**Pricing Strategy:** ${pricing || 'Subscription-based'}

## Revenue Streams
${revenueStreams || '• Monthly subscriptions\n• Annual subscriptions\n• Premium add-ons\n• Professional services'}

## Pricing Tiers
• **Starter:** $49/month - Basic features
• **Professional:** $149/month - Advanced features
• **Enterprise:** $349/month - Full suite + support

## Financial Projections
• Year 1: $500K ARR
• Year 2: $2.5M ARR
• Year 3: $8M ARR

*Generated by SmartPromptIQ's financial AI*`,
        generatedAt: new Date().toISOString(),
        id: `revenue_${Date.now()}`
      }
    };
    res.json(revenueModel);
  } catch (error) {
    console.error('❌ Revenue Model error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate revenue model' });
  }
});

app.post('/api/financial/funding-strategy', demoRateLimiter, (req, res) => {
  try {
    const { fundingAmount, stage, useOfFunds, timeline } = req.body;
    console.log('🎯 Funding Strategy request:', { fundingAmount, stage });

    const fundingStrategy = {
      success: true,
      data: {
        type: 'funding_strategy',
        title: `Funding Strategy: ${stage || 'Series A'} Round`,
        content: `# Funding Strategy Plan

## Funding Overview
**Funding Amount:** ${fundingAmount || '$2M'}
**Funding Stage:** ${stage || 'Series A'}
**Timeline:** ${timeline || '6-9 months'}

## Use of Funds
${useOfFunds || '• Product development (40%)\n• Marketing and sales (30%)\n• Team expansion (20%)\n• Operations (10%)'}

## Investor Targeting
• Early-stage VCs
• Angel investors
• Industry specialists
• Strategic partners

## Funding Timeline
• Month 1-2: Deck preparation
• Month 3-4: Initial outreach
• Month 5-6: Due diligence
• Month 7-9: Closing

*Generated by SmartPromptIQ's funding AI*`,
        generatedAt: new Date().toISOString(),
        id: `funding_${Date.now()}`
      }
    };
    res.json(fundingStrategy);
  } catch (error) {
    console.error('❌ Funding Strategy error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate funding strategy' });
  }
});

app.post('/api/financial/pitch-deck', demoRateLimiter, (req, res) => {
  try {
    const { companyName, problem, solution, market } = req.body;
    console.log('🎯 Pitch Deck request:', { companyName, problem });

    const pitchDeck = {
      success: true,
      data: {
        type: 'pitch_deck',
        title: `Pitch Deck for ${companyName || 'Your Company'}`,
        content: `# ${companyName || 'Company'} Pitch Deck

## Slide Structure

### 1. Company Introduction
**${companyName || 'Your Company'}** - Transforming ${market || 'the industry'} through innovation

### 2. Problem Statement
${problem || 'Current market inefficiencies cost businesses millions annually'}

### 3. Solution
${solution || 'Our AI-driven platform provides real-time solutions'}

### 4. Market Opportunity
• Total Addressable Market: $5B+
• Growing at 25% annually
• Underserved segments identified

### 5. Business Model
• SaaS subscription model
• Multiple revenue streams
• Scalable pricing tiers

### 6. Traction
• Customer growth metrics
• Revenue milestones
• Key partnerships

### 7. Financial Projections
• 3-year revenue forecast
• Path to profitability
• Funding requirements

### 8. Team
• Experienced leadership
• Technical expertise
• Advisory board

### 9. Funding Ask
• Investment amount
• Use of funds
• Expected outcomes

*Generated by SmartPromptIQ's pitch AI*`,
        generatedAt: new Date().toISOString(),
        id: `pitch_${Date.now()}`
      }
    };
    res.json(pitchDeck);
  } catch (error) {
    console.error('❌ Pitch Deck error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate pitch deck' });
  }
});

app.post('/api/financial/projections', demoRateLimiter, (req, res) => {
  try {
    const { timeframe, revenueModel, expenses, growth } = req.body;
    console.log('🎯 Financial Projections request:', { timeframe, revenueModel });

    const projections = {
      success: true,
      data: {
        type: 'financial_projections',
        title: `${timeframe || '3-Year'} Financial Projections`,
        content: `# Financial Projections

## Revenue Forecasting
**Model:** ${revenueModel || 'SaaS Subscription'}
**Growth Rate:** ${growth || '25% annually'}

### Year 1
• Revenue: $500K
• Expenses: $400K
• Net Income: $100K

### Year 2
• Revenue: $2.5M
• Expenses: $1.8M
• Net Income: $700K

### Year 3
• Revenue: $8M
• Expenses: $5.5M
• Net Income: $2.5M

## Key Assumptions
• Customer acquisition cost: $200
• Customer lifetime value: $2,500
• Monthly churn rate: 3%
• Average selling price: $150/month

## Break-even Analysis
• Break-even point: Month 8
• Cash flow positive: Month 12
• Profitability: Month 18

*Generated by SmartPromptIQ's financial AI*`,
        generatedAt: new Date().toISOString(),
        id: `projections_${Date.now()}`
      }
    };
    res.json(projections);
  } catch (error) {
    console.error('❌ Financial Projections error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate financial projections' });
  }
});

// Education endpoints
app.post('/api/education/course-creation', demoRateLimiter, (req, res) => {
  try {
    const { topic, audience, format, duration } = req.body;
    console.log('🎯 Course Creation request:', { topic, audience });

    const course = {
      success: true,
      data: {
        type: 'course_creation',
        title: `Course: ${topic || 'Professional Development'}`,
        content: `# Course Development Plan

## Course Overview
**Topic:** ${topic || 'Professional Skills Development'}
**Target Audience:** ${audience || 'Working professionals'}
**Format:** ${format || 'Online video course'}
**Duration:** ${duration || '8 weeks'}

## Learning Objectives
• Master core concepts
• Apply practical skills
• Build professional portfolio
• Develop expertise

## Course Structure
### Module 1-2: Foundation
• Core concepts introduction
• Essential tools and software
• Goal setting

### Module 3-4: Skill Development
• Hands-on practice
• Real-world projects
• Peer collaboration

### Module 5-6: Advanced Applications
• Complex projects
• Best practices
• Quality assurance

### Module 7-8: Mastery
• Advanced techniques
• Career planning
• Continued learning

*Generated by SmartPromptIQ's education AI*`,
        generatedAt: new Date().toISOString(),
        id: `course_${Date.now()}`
      }
    };
    res.json(course);
  } catch (error) {
    console.error('❌ Course Creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate course plan' });
  }
});

app.post('/api/education/skill-development', demoRateLimiter, (req, res) => {
  try {
    const { skills, level, goals, timeline } = req.body;
    console.log('🎯 Skill Development request:', { skills, level });

    const skillPlan = {
      success: true,
      data: {
        type: 'skill_development',
        title: `Skill Development Plan: ${skills || 'Professional Skills'}`,
        content: `# Skill Development Strategy

## Target Skills
**Primary Skills:** ${skills || 'Leadership, Communication, Technical Skills'}
**Current Level:** ${level || 'Intermediate'}
**Timeline:** ${timeline || '6 months'}

## Development Goals
${goals || '• Improve leadership capabilities\n• Enhance communication skills\n• Master technical competencies\n• Build professional network'}

## Learning Path
### Phase 1: Assessment (Weeks 1-2)
• Skill gap analysis
• Baseline measurement
• Goal refinement

### Phase 2: Foundation (Weeks 3-8)
• Core skill building
• Practical exercises
• Knowledge acquisition

### Phase 3: Application (Weeks 9-16)
• Real-world practice
• Project implementation
• Feedback integration

### Phase 4: Mastery (Weeks 17-24)
• Advanced techniques
• Mentoring others
• Continuous improvement

*Generated by SmartPromptIQ's skill AI*`,
        generatedAt: new Date().toISOString(),
        id: `skill_${Date.now()}`
      }
    };
    res.json(skillPlan);
  } catch (error) {
    console.error('❌ Skill Development error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate skill plan' });
  }
});

app.post('/api/education/research-insights', demoRateLimiter, (req, res) => {
  try {
    const { researchTopic, methodology, scope, timeline } = req.body;
    console.log('🎯 Research Insights request:', { researchTopic, methodology });

    const research = {
      success: true,
      data: {
        type: 'research_insights',
        title: `Research Plan: ${researchTopic || 'Industry Analysis'}`,
        content: `# Research Methodology

## Research Overview
**Topic:** ${researchTopic || 'Industry Trends and Analysis'}
**Methodology:** ${methodology || 'Mixed methods approach'}
**Scope:** ${scope || 'Industry-wide analysis'}
**Timeline:** ${timeline || '3 months'}

## Research Framework
### Primary Research
• Surveys and interviews
• Focus groups
• Observational studies
• Case studies

### Secondary Research
• Literature review
• Industry reports
• Market analysis
• Competitor research

## Data Collection
• Quantitative metrics
• Qualitative insights
• Statistical analysis
• Trend identification

## Analysis Plan
• Data processing
• Pattern recognition
• Insight generation
• Recommendation development

*Generated by SmartPromptIQ's research AI*`,
        generatedAt: new Date().toISOString(),
        id: `research_${Date.now()}`
      }
    };
    res.json(research);
  } catch (error) {
    console.error('❌ Research Insights error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate research plan' });
  }
});

// Personal Development endpoints
app.post('/api/personal/goal-setting', demoRateLimiter, (req, res) => {
  try {
    const { goals, timeframe, priorities, challenges } = req.body;
    console.log('🎯 Goal Setting request:', { goals, timeframe });

    const goalPlan = {
      success: true,
      data: {
        type: 'goal_setting',
        title: `Goal Setting Framework: ${timeframe || '12 Month'} Plan`,
        content: `# Personal Goal Setting Strategy

## Goal Overview
**Primary Goals:** ${goals || 'Career advancement, skill development, work-life balance'}
**Timeframe:** ${timeframe || '12 months'}
**Priority Level:** ${priorities || 'High importance, career-focused'}

## SMART Goals Framework
### Specific Goals
• Define clear, specific objectives
• Identify measurable outcomes
• Set achievable targets
• Ensure relevance to values
• Establish time-bound deadlines

## Goal Categories
### Career Goals
• Professional advancement
• Skill development
• Network building
• Leadership growth

### Personal Goals
• Health and wellness
• Relationships
• Learning and education
• Financial stability

## Action Planning
### Monthly Milestones
• Track progress indicators
• Adjust strategies as needed
• Celebrate achievements
• Learn from setbacks

### Weekly Actions
• Specific tasks and activities
• Time allocation
• Resource requirements
• Progress measurement

*Generated by SmartPromptIQ's goal-setting AI*`,
        generatedAt: new Date().toISOString(),
        id: `goals_${Date.now()}`
      }
    };
    res.json(goalPlan);
  } catch (error) {
    console.error('❌ Goal Setting error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate goal plan' });
  }
});

app.post('/api/personal/public-speaking', demoRateLimiter, (req, res) => {
  try {
    const { experience, audience, goals, timeline } = req.body;
    console.log('🎯 Public Speaking request:', { experience, audience });

    const speakingPlan = {
      success: true,
      data: {
        type: 'public_speaking',
        title: `Public Speaking Development Plan`,
        content: `# Public Speaking Mastery Program

## Assessment
**Current Experience:** ${experience || 'Beginner to intermediate'}
**Target Audience:** ${audience || 'Professional conferences and meetings'}
**Development Goals:** ${goals || 'Confident presentation delivery'}
**Timeline:** ${timeline || '6 months'}

## Skill Development Areas
### Foundation Skills
• Voice projection and clarity
• Body language and posture
• Eye contact and engagement
• Breathing and relaxation

### Content Development
• Story structure and flow
• Key message clarity
• Supporting evidence
• Call-to-action design

### Delivery Techniques
• Pace and timing
• Emphasis and inflection
• Gesture coordination
• Stage presence

## Practice Framework
### Weekly Practice
• Daily voice exercises
• Weekly video reviews
• Monthly mock presentations
• Quarterly real speaking opportunities

### Progressive Challenges
• Start with small groups
• Progress to larger audiences
• Tackle different topics
• Master various formats

*Generated by SmartPromptIQ's speaking AI*`,
        generatedAt: new Date().toISOString(),
        id: `speaking_${Date.now()}`
      }
    };
    res.json(speakingPlan);
  } catch (error) {
    console.error('❌ Public Speaking error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate speaking plan' });
  }
});

app.post('/api/personal/networking', demoRateLimiter, (req, res) => {
  try {
    const { industry, goals, events, approach } = req.body;
    console.log('🎯 Networking request:', { industry, goals });

    const networkingPlan = {
      success: true,
      data: {
        type: 'networking',
        title: `Networking Strategy for ${industry || 'Professional Growth'}`,
        content: `# Strategic Networking Plan

## Networking Overview
**Industry Focus:** ${industry || 'Technology and Business'}
**Networking Goals:** ${goals || 'Professional advancement and knowledge sharing'}
**Preferred Events:** ${events || 'Industry conferences, meetups, online communities'}
**Approach Style:** ${approach || 'Authentic relationship building'}

## Networking Strategy
### Target Connections
• Industry leaders and influencers
• Peers and colleagues
• Potential mentors
• Emerging professionals

### Networking Venues
• Professional conferences
• Industry meetups
• Online communities
• Alumni networks
• Professional associations

## Relationship Building
### Initial Contact
• Authentic conversation starters
• Value-first introductions
• Mutual interest discovery
• Contact information exchange

### Follow-up Strategy
• Timely follow-up messages
• Value-added content sharing
• Meeting invitations
• Long-term relationship nurturing

### Network Maintenance
• Regular check-ins
• Celebrating others' successes
• Offering assistance and support
• Maintaining visibility

*Generated by SmartPromptIQ's networking AI*`,
        generatedAt: new Date().toISOString(),
        id: `networking_${Date.now()}`
      }
    };
    res.json(networkingPlan);
  } catch (error) {
    console.error('❌ Networking error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate networking plan' });
  }
});

// Main generation endpoint used by Generation.tsx
app.post('/api/demo-generate-prompt', (req, res) => {
  try {
    const { category, answers, customization } = req.body;
    console.log('🎯 Demo generate prompt request:', { category, customization });

    const generatedPrompt = `# ${category?.charAt(0).toUpperCase() + category?.slice(1) || 'Custom'} Strategy Prompt

Based on your requirements and preferences, here's your customized AI prompt:

## Objective
Create a comprehensive ${category || 'business'} strategy that addresses your specific needs and goals.

## Context
${Object.keys(answers || {}).length > 0 ?
  'Based on your questionnaire responses:\n' + Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n') :
  'This prompt is designed for general use and can be customized further.'
}

## Tone & Style
- Tone: ${customization?.tone || 'professional'}
- Detail Level: ${customization?.detailLevel || 'comprehensive'}
- Format: ${customization?.format || 'structured'}

## Instructions
1. Analyze the provided information thoroughly
2. Develop strategic recommendations
3. Provide actionable next steps
4. Include relevant metrics and KPIs
5. Present findings in a clear, ${customization?.format || 'structured'} format

## Expected Output
A detailed ${category || 'business'} strategy document with:
- Executive summary
- Key findings and insights
- Strategic recommendations
- Implementation timeline
- Success metrics

Generated at: ${new Date().toISOString()}`;

    res.json({
      success: true,
      data: {
        prompt: generatedPrompt
      }
    });
  } catch (error) {
    console.error('❌ Generate prompt error:', error);
    res.status(500).json({
      error: 'Failed to generate prompt',
      message: 'Please try again later'
    });
  }
});

// Prompt refinement endpoint for AI-powered prompt improvement
app.post('/api/refine-prompt', (req, res) => {
  try {
    const { currentPrompt, refinementQuery, category } = req.body;
    console.log('🔧 Refine prompt request:', { category, query: refinementQuery?.substring(0, 100) });

    // Simulate AI-powered prompt refinement
    const refinedPrompt = `# Refined ${category?.charAt(0).toUpperCase() + category?.slice(1) || 'Custom'} Prompt

## Enhanced Version
Based on your refinement request: "${refinementQuery}"

${currentPrompt}

## Improvements Applied
✅ Enhanced clarity and specificity
✅ Optimized structure and flow
✅ Added relevant context and examples
✅ Improved actionability and measurability

## Additional Recommendations
- Consider adding specific metrics for success measurement
- Include timeline and milestone checkpoints
- Specify target audience characteristics
- Add contingency planning elements

## Usage Tips
1. Test this prompt with sample data first
2. Adjust tone based on your specific audience
3. Customize examples to match your industry
4. Monitor results and iterate as needed

---
*Prompt refined using AI-powered optimization based on your request: "${refinementQuery}"*
`;

    res.json({
      success: true,
      data: {
        refinedPrompt: refinedPrompt,
        improvements: [
          'Enhanced clarity and specificity',
          'Optimized structure and flow',
          'Added relevant context',
          'Improved actionability'
        ],
        confidence: 0.92
      }
    });

  } catch (error) {
    console.error('❌ Refine prompt error:', error);
    res.status(500).json({
      error: 'Failed to refine prompt',
      message: 'Please try again later'
    });
  }
});

// Demo refinement endpoint (no auth required)
app.post('/api/demo-refine', (req, res) => {
  try {
    const { currentPrompt, refinementQuery, category = 'general' } = req.body;

    if (!currentPrompt || !refinementQuery) {
      return res.status(400).json({
        success: false,
        message: 'Current prompt and refinement query are required'
      });
    }

    console.log('🔧 Demo refining prompt:', {
      category,
      refinementQuery: refinementQuery.substring(0, 50) + '...'
    });

    // Refinement templates for demo
    const refinementTemplates = {
      'more detailed': 'Added comprehensive details and step-by-step breakdowns',
      'specific': 'Enhanced with specific examples and targeted recommendations',
      'conversational': 'Adjusted tone to be more conversational and engaging',
      'professional': 'Refined for professional business context',
      'simple': 'Simplified language and reduced complexity',
      'examples': 'Added real-world examples and case studies',
      'roi': 'Enhanced with ROI calculations and business value metrics',
      'timeline': 'Added timeline, milestones, and implementation schedule'
    };

    // Determine which refinement to apply based on the query
    let refinementType = 'general enhancement';
    for (const [key, description] of Object.entries(refinementTemplates)) {
      if (refinementQuery.toLowerCase().includes(key)) {
        refinementType = description;
        break;
      }
    }

    // Generate refinement text based on query
    function generateRefinementText(query, cat) {
      const queryLower = query.toLowerCase();

      if (queryLower.includes('detailed') || queryLower.includes('specific')) {
        return `Based on your request for more detailed information, here are the enhanced specifications:

• Detailed implementation steps with timelines
• Specific resource requirements and budget allocations
• Risk assessment and mitigation strategies
• Success metrics and key performance indicators
• Stakeholder communication plan
• Quality assurance and testing protocols`;
      }

      if (queryLower.includes('example') || queryLower.includes('case')) {
        return `Here are real-world examples and case studies:

**Case Study 1:** Similar implementation at TechCorp
- 40% efficiency improvement in 6 months
- ROI of 250% within first year
- Key success factors and lessons learned

**Case Study 2:** Best practices from industry leaders
- Proven methodologies and frameworks
- Common pitfalls and how to avoid them
- Scalability considerations for growth`;
      }

      if (queryLower.includes('roi') || queryLower.includes('business value')) {
        return `Business Value and ROI Analysis:

**Financial Impact:**
- Initial investment: $X
- Expected returns: $Y within Z months
- Break-even point: Month X
- 3-year projected value: $Z

**Operational Benefits:**
- Time savings: X hours per week
- Efficiency gains: Y% improvement
- Risk reduction: Z% decrease in errors
- Scalability potential: Up to X% growth capacity`;
      }

      if (queryLower.includes('timeline') || queryLower.includes('schedule')) {
        return `Implementation Timeline and Milestones:

**Phase 1 (Weeks 1-2): Planning & Preparation**
- Requirements gathering and analysis
- Team formation and resource allocation
- Risk assessment and mitigation planning

**Phase 2 (Weeks 3-6): Development & Testing**
- Core implementation and development
- Quality assurance and testing cycles
- User acceptance testing and feedback

**Phase 3 (Weeks 7-8): Deployment & Optimization**
- Production deployment and monitoring
- Performance optimization and fine-tuning
- Training and knowledge transfer`;
      }

      return `Enhanced content based on your refinement request:

• Improved clarity and structure
• Additional context and background information
• Enhanced actionability with specific next steps
• Better organization and flow
• More comprehensive coverage of key topics
• Practical implementation guidance`;
    }

    // Create refined version
    const refinedPrompt = `${currentPrompt}

## Enhanced Content (${refinementType}):

${generateRefinementText(refinementQuery, category)}`;

    res.json({
      success: true,
      data: {
        refinedPrompt,
        refinementApplied: refinementQuery,
        timestamp: new Date(),
        usage: { type: 'demo', tokens: 0 }
      }
    });

  } catch (error) {
    console.error('❌ Demo refine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// General generation endpoint
app.post('/api/generate-prompt', (req, res) => {
  try {
    const { category, answers, customization } = req.body;
    console.log('🎯 Generate prompt request:', { category, customization });

    const generatedPrompt = `# AI-Generated ${category?.charAt(0).toUpperCase() + category?.slice(1) || 'Custom'} Prompt

## Context
${Object.keys(answers || {}).length > 0 ?
  'Based on your inputs:\n' + Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n') :
  'This is a general purpose prompt that can be customized for your specific needs.'
}

## Instructions
Please analyze the provided context and generate a comprehensive response that:
1. Addresses the main objectives
2. Provides actionable insights
3. Includes specific recommendations
4. Maintains a ${customization?.tone || 'professional'} tone
5. Delivers ${customization?.detailLevel || 'comprehensive'} detail

## Output Format
Structure your response as follows:
- Executive Summary
- Key Analysis Points
- Recommendations
- Implementation Steps
- Expected Outcomes

Generated: ${new Date().toISOString()}`;

    res.json({
      success: true,
      prompt: generatedPrompt
    });
  } catch (error) {
    console.error('❌ Generate prompt error:', error);
    res.status(500).json({
      error: 'Failed to generate prompt',
      message: 'Please try again later'
    });
  }
});

// Suggestions generation endpoint
app.post('/api/suggestions/generate', (req, res) => {
  try {
    const { category, context, maxSuggestions = 5 } = req.body;
    console.log('💡 Generate suggestions request:', { category, maxSuggestions });

    const suggestionTemplates = {
      business: [
        'Market Research Analysis',
        'Competitive Strategy Framework',
        'Revenue Optimization Plan',
        'Customer Acquisition Strategy',
        'Operational Efficiency Audit'
      ],
      marketing: [
        'Brand Positioning Strategy',
        'Content Marketing Calendar',
        'Social Media Campaign',
        'Email Marketing Sequence',
        'Conversion Rate Optimization'
      ],
      product: [
        'Product Roadmap Planning',
        'User Experience Audit',
        'Feature Prioritization Matrix',
        'Customer Feedback Analysis',
        'Product Launch Strategy'
      ],
      education: [
        'Curriculum Development Plan',
        'Learning Assessment Framework',
        'Student Engagement Strategy',
        'Educational Technology Integration',
        'Performance Tracking System'
      ],
      personal: [
        'Goal Setting Framework',
        'Skill Development Plan',
        'Time Management System',
        'Personal Brand Strategy',
        'Network Building Plan'
      ]
    };

    const templates = suggestionTemplates[category] || suggestionTemplates.business;
    const suggestions = templates.slice(0, maxSuggestions).map((title, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      title,
      description: `AI-generated ${title.toLowerCase()} tailored for your needs`,
      prompt: `Create a comprehensive ${title.toLowerCase()} that addresses key challenges and opportunities in ${category || 'business'}.

Please provide:
1. Detailed analysis of current situation
2. Strategic recommendations
3. Implementation timeline
4. Success metrics
5. Risk mitigation strategies

Format the response professionally with clear sections and actionable insights.`,
      category: category || 'business',
      tags: [category || 'business', 'strategy', 'ai-generated']
    }));

    res.json({
      success: true,
      suggestions,
      category,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Generate suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      message: 'Please try again later'
    });
  }
});

// Prompts generation endpoint
app.post('/api/prompts/generate', (req, res) => {
  try {
    const { template, variables, customization } = req.body;
    console.log('📝 Generate from template request:', { template, customization });

    const generatedContent = `# Generated Content from Template: ${template || 'Custom'}

## Context
${variables ?
  'Template variables:\n' + Object.entries(variables).map(([key, value]) => `- ${key}: ${value}`).join('\n') :
  'No specific variables provided - using default template structure.'
}

## Generated Content
Based on the template "${template}", here's your customized content:

### Overview
This content has been generated using AI analysis of your template and variables.

### Key Points
1. Strategic alignment with your objectives
2. Customized recommendations based on inputs
3. Actionable implementation steps
4. Measurable success criteria

### Implementation
- Phase 1: Initial setup and preparation
- Phase 2: Core implementation and rollout
- Phase 3: Monitoring and optimization

### Next Steps
1. Review and customize the generated content
2. Adapt recommendations to your specific context
3. Implement the suggested strategies
4. Track progress and iterate as needed

Generated on: ${new Date().toISOString()}
Template: ${template || 'Custom'}
Customization: ${JSON.stringify(customization || {})}`;

    res.json({
      success: true,
      content: generatedContent,
      template,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Template generation error:', error);
    res.status(500).json({
      error: 'Failed to generate from template',
      message: 'Please try again later'
    });
  }
});

// Personalized suggestions endpoint
app.get('/api/suggestions/personalized', (req, res) => {
  try {
    const { category, context, maxSuggestions = 5 } = req.query;
    console.log('🎯 Personalized suggestions request:', { category, maxSuggestions });

    const suggestionTemplates = {
      business: [
        'Strategic Market Analysis',
        'Competitive Intelligence Report',
        'Revenue Optimization Plan',
        'Customer Acquisition Strategy',
        'Operational Excellence Audit'
      ],
      marketing: [
        'Brand Positioning Strategy',
        'Digital Marketing Campaign',
        'Content Strategy Framework',
        'Customer Journey Mapping',
        'Conversion Rate Optimization'
      ],
      product: [
        'Product Roadmap Planning',
        'User Experience Research',
        'Feature Prioritization Matrix',
        'Customer Feedback Analysis',
        'Product Launch Strategy'
      ],
      education: [
        'Curriculum Development Plan',
        'Learning Assessment Strategy',
        'Student Engagement Framework',
        'Educational Technology Integration',
        'Performance Analytics System'
      ],
      personal: [
        'Goal Achievement Framework',
        'Skill Development Roadmap',
        'Time Management System',
        'Personal Brand Strategy',
        'Network Building Plan'
      ],
      creative: [
        'Creative Brief Generator',
        'Brand Identity Development',
        'Storytelling Framework',
        'Visual Design Strategy',
        'Content Creation Workflow'
      ]
    };

    const templates = suggestionTemplates[category] || suggestionTemplates.business;
    const suggestions = templates.slice(0, parseInt(maxSuggestions)).map((title, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      title,
      description: `AI-generated ${title.toLowerCase()} specifically tailored for ${category || 'business'} needs`,
      prompt: `Create a comprehensive ${title.toLowerCase()} that addresses key challenges and opportunities in ${category || 'business'}.

Please provide:
1. Detailed analysis of current situation
2. Strategic recommendations with actionable steps
3. Implementation timeline with key milestones
4. Success metrics and KPIs
5. Risk assessment and mitigation strategies

Format the response professionally with clear sections, specific examples, and practical insights that can be immediately implemented.`,
      category: category || 'business',
      tags: [category || 'business', 'strategy', 'ai-generated', 'personalized'],
      complexity: 'comprehensive',
      estimatedTime: '15-30 minutes'
    }));

    res.json({
      success: true,
      data: suggestions,
      category,
      totalSuggestions: suggestions.length,
      generatedAt: new Date().toISOString(),
      message: `Generated ${suggestions.length} personalized suggestions for ${category || 'business'}`
    });
  } catch (error) {
    console.error('❌ Personalized suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate personalized suggestions',
      message: 'Please try again later'
    });
  }
});

// ===============================================
// PAYMENT & BILLING ENDPOINTS
// ===============================================

// Mock payment data store (in production, use proper database)
const mockPayments = new Map();
const mockSubscriptions = new Map();
const mockUsers = new Map();

// Initialize mock user for testing
mockUsers.set('test-user-123', {
  id: 'test-user-123',
  email: 'test@example.com',
  tokenBalance: 100,
  subscriptionTier: 'free',
  subscriptionStatus: 'active',
  stripeCustomerId: null,
  tokensUsed: 0,
  tokensPurchased: 100
});

// Get billing information
app.get('/api/billing/info', (req, res) => {
  try {
    const userId = 'test-user-123'; // Mock user ID
    const user = mockUsers.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          tokenBalance: user.tokenBalance,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          monthlyUsage: {
            tokensUsed: user.tokensUsed,
            resetDate: new Date()
          },
          lifetime: {
            tokensUsed: user.tokensUsed,
            tokensPurchased: user.tokensPurchased,
            lastPurchase: new Date()
          }
        },
        subscription: user.subscriptionTier !== 'free' ? {
          tier: user.subscriptionTier,
          status: user.subscriptionStatus,
          billingCycle: 'monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        } : null,
        recentPurchases: [],
        costAnalysis: {
          monthlyCosts: 0,
          monthlyRevenue: user.subscriptionTier === 'pro' ? 4999 : 0,
          costSafety: 'safe'
        }
      }
    });
  } catch (error) {
    console.error('❌ Billing info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve billing information'
    });
  }
});

// Purchase tokens
app.post('/api/billing/purchase-tokens', (req, res) => {
  try {
    const { packageKey, paymentMethodId } = req.body;
    const userId = 'test-user-123'; // Mock user ID

    console.log('💳 Token purchase request:', { packageKey, paymentMethodId });

    // Token packages
    const tokenPackages = {
      small: { tokens: 25, priceInCents: 499, name: 'Small Package' },
      medium: { tokens: 100, priceInCents: 1799, name: 'Medium Package' },
      large: { tokens: 500, priceInCents: 7999, name: 'Large Package' },
      bulk: { tokens: 1000, priceInCents: 14999, name: 'Bulk Package' }
    };

    const tokenPackage = tokenPackages[packageKey];
    if (!tokenPackage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token package'
      });
    }

    const user = mockUsers.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock payment processing
    const paymentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const purchase = {
      id: paymentId,
      userId,
      packageKey,
      tokens: tokenPackage.tokens,
      priceInCents: tokenPackage.priceInCents,
      status: 'succeeded',
      createdAt: new Date(),
      paymentMethodId
    };

    // Store payment record
    mockPayments.set(paymentId, purchase);

    // Update user balance
    user.tokenBalance += tokenPackage.tokens;
    user.tokensPurchased += tokenPackage.tokens;
    mockUsers.set(userId, user);

    console.log('✅ Token purchase completed:', {
      paymentId,
      tokens: tokenPackage.tokens,
      newBalance: user.tokenBalance
    });

    res.json({
      success: true,
      data: {
        paymentIntentId: paymentId,
        status: 'succeeded',
        tokensAdded: tokenPackage.tokens,
        newBalance: user.tokenBalance,
        purchase: {
          id: paymentId,
          packageName: tokenPackage.name,
          tokens: tokenPackage.tokens,
          amount: tokenPackage.priceInCents / 100
        }
      },
      message: `Successfully purchased ${tokenPackage.tokens} tokens!`
    });

  } catch (error) {
    console.error('❌ Token purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Token purchase failed'
    });
  }
});

// Get available token packages
app.get('/api/billing/token-packages', (req, res) => {
  try {
    const packages = [
      {
        key: 'small',
        tokens: 25,
        priceInCents: 499,
        pricePerToken: 19.96,
        name: 'Small Package',
        popular: false
      },
      {
        key: 'medium',
        tokens: 100,
        priceInCents: 1799,
        pricePerToken: 17.99,
        name: 'Medium Package',
        popular: true,
        savings: 10
      },
      {
        key: 'large',
        tokens: 500,
        priceInCents: 7999,
        pricePerToken: 15.99,
        name: 'Large Package',
        popular: false,
        savings: 20
      },
      {
        key: 'bulk',
        tokens: 1000,
        priceInCents: 14999,
        pricePerToken: 14.99,
        name: 'Bulk Package',
        popular: false,
        savings: 25
      }
    ];

    res.json({
      success: true,
      data: packages
    });

  } catch (error) {
    console.error('❌ Error getting token packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve token packages'
    });
  }
});

// Create subscription
app.post('/api/billing/create-subscription', (req, res) => {
  try {
    const { tierId, billingCycle = 'monthly', paymentMethodId } = req.body;
    const userId = 'test-user-123'; // Mock user ID

    console.log('📅 Subscription creation request:', { tierId, billingCycle });

    const subscriptionTiers = {
      starter: {
        name: 'Starter',
        monthly: 1499, // $14.99
        yearly: 14990, // $149.90
        tokensPerMonth: 200
      },
      pro: {
        name: 'Pro',
        monthly: 4999, // $49.99
        yearly: 49990, // $499.90
        tokensPerMonth: 1000
      },
      business: {
        name: 'Business',
        monthly: 14999, // $149.99
        yearly: 149990, // $1499.90
        tokensPerMonth: 5000
      }
    };

    const tier = subscriptionTiers[tierId];
    if (!tier) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier'
      });
    }

    const user = mockUsers.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock subscription creation
    const subscriptionId = `sub_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const subscription = {
      id: subscriptionId,
      userId,
      tier: tierId,
      billingCycle,
      status: 'active',
      priceInCents: tier[billingCycle],
      tokensPerMonth: tier.tokensPerMonth,
      createdAt: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    };

    // Store subscription
    mockSubscriptions.set(subscriptionId, subscription);

    // Update user
    user.subscriptionTier = tierId;
    user.subscriptionStatus = 'active';
    user.tokenBalance += tier.tokensPerMonth; // Add first month tokens
    mockUsers.set(userId, user);

    console.log('✅ Subscription created:', {
      subscriptionId,
      tier: tierId,
      billingCycle
    });

    res.json({
      success: true,
      data: {
        subscriptionId,
        status: 'active',
        tier: tierId,
        tokensAdded: tier.tokensPerMonth,
        newBalance: user.tokenBalance
      },
      message: `Successfully subscribed to ${tier.name} plan!`
    });

  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// Get user invoices
app.get('/api/billing/invoices', (req, res) => {
  try {
    const userId = 'test-user-123'; // Mock user ID

    // Mock invoice data
    const invoices = [
      {
        id: `inv_${Date.now()}`,
        amount: 4999,
        currency: 'usd',
        status: 'paid',
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        description: 'Pro Plan - Monthly',
        pdfUrl: '/api/billing/invoice/download/inv_123'
      }
    ];

    res.json({
      success: true,
      data: invoices,
      hasMore: false
    });

  } catch (error) {
    console.error('❌ Error getting invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve invoices'
    });
  }
});

// Update payment method
app.post('/api/billing/update-payment-method', (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = 'test-user-123'; // Mock user ID

    console.log('💳 Payment method update request:', { paymentMethodId });

    const user = mockUsers.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock payment method update
    console.log('✅ Payment method updated:', paymentMethodId);

    res.json({
      success: true,
      message: 'Payment method updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment method'
    });
  }
});

// Payment webhook (mock)
app.post('/api/billing/webhook', (req, res) => {
  try {
    console.log('🔔 Payment webhook received:', req.body);

    // In production, verify webhook signature and process events
    res.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ===============================================
// END PAYMENT & BILLING ENDPOINTS
// ===============================================

// Catch all
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>SmartPromptIQ</title></head>
        <body>
          <h1>SmartPromptIQ Server Running</h1>
          <p>Time: ${new Date().toISOString()}</p>
          <p>Health: <a href="/health">/health</a></p>
          <p>API Health: <a href="/api/health">/api/health</a></p>
        </body>
      </html>
    `);
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(40));
  console.log('🚀 RAILWAY SERVER READY');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Host: 0.0.0.0`);
  console.log(`🏥 Health: /health`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(40));
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Handle shutdown
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`🛑 ${signal} received - shutting down`);
    server.close(() => process.exit(0));
  });
});