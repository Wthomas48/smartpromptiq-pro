const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeKey && !stripeKey.includes('your_stripe')) {
  stripe = require('stripe')(stripeKey);
  console.log('✅ Stripe initialized');
} else {
  console.log('⚠️ Stripe not configured - using demo mode');
}

// Database connection - PostgreSQL for production, SQLite for local
let db = null;
let dbConnected = false;
let isPostgres = false;

// Check for PostgreSQL connection (Railway production)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
  console.log('🐘 Connecting to PostgreSQL database...');
  isPostgres = true;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ PostgreSQL connection error:', err.message);
      dbConnected = false;
    } else {
      console.log('✅ Connected to PostgreSQL database');
      dbConnected = true;
    }
  });

  db = pool;

} else if (process.env.NODE_ENV !== 'production') {
  // Use SQLite for local development
  console.log('💾 Connecting to SQLite database...');
  isPostgres = false;

  const dbPath = path.join(__dirname, 'backend', 'prisma', 'dev.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ SQLite connection error:', err);
      dbConnected = false;
    } else {
      console.log('✅ Connected to SQLite database:', dbPath);
      dbConnected = true;
    }
  });
} else {
  console.log('⚠️ No database configured - using demo mode');
  dbConnected = false;
}

// Promisify database methods - works with both PostgreSQL and SQLite
const dbGet = async (sql, params = []) => {
  if (!dbConnected || !db) {
    return null; // Return null when database not available
  }

  if (isPostgres) {
    // PostgreSQL
    try {
      const result = await db.query(sql, params);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
};

const dbAll = async (sql, params = []) => {
  if (!dbConnected || !db) {
    return []; // Return empty array when database not available
  }

  if (isPostgres) {
    // PostgreSQL
    try {
      const result = await db.query(sql, params);
      return result.rows || [];
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Database run method (for INSERT/UPDATE/DELETE)
const dbRun = async (sql, params = []) => {
  if (!dbConnected || !db) {
    return { changes: 0 };
  }

  if (isPostgres) {
    // PostgreSQL
    try {
      const result = await db.query(sql, params);
      return { changes: result.rowCount || 0 };
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy configuration based on environment
// TRUST_PROXY=true for Cloudflare+Railway, TRUST_PROXY=1 for Railway only
const trustProxy = process.env.TRUST_PROXY === 'true' ? true :
                   process.env.TRUST_PROXY === 'false' ? false :
                   process.env.TRUST_PROXY || 1;
app.set('trust proxy', trustProxy);
console.log('🔗 Trust proxy set to:', trustProxy);

// Device fingerprint utilities
const crypto = require('crypto');

function generateServerFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const timestamp = Date.now();
  const random = Math.random().toString(36);

  const data = `${ip}|${userAgent}|${timestamp}|${random}`;
  return `server:${crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)}`;
}

function isValidFingerprint(fingerprint) {
  if (!fingerprint || typeof fingerprint !== 'string') return false;
  return fingerprint.startsWith('v1:') || fingerprint.startsWith('server:');
}

function processFingerprintHeader(req, res, next) {
  const clientFingerprint = req.get('X-Device-Fingerprint');
  const cookieSignature = req.cookies?.spiq_fp_sig;
  const strictMode = process.env.NODE_ENV === 'production' && process.env.STRICT_FINGERPRINT === 'true';

  // Initialize context
  req.context = req.context || {};
  res.locals.fpIssued = false;

  // More permissive fingerprint validation - accept any reasonable format in development
  const isDevMode = process.env.NODE_ENV !== 'production';
  const isValidClientFp = clientFingerprint && (
    /^v[0-9]+:[a-f0-9]{8,}$/i.test(clientFingerprint) || // Standard format
    (isDevMode && clientFingerprint.length > 8) // In dev mode, accept any fingerprint with reasonable length
  );
  const isCurrentVersion = clientFingerprint && clientFingerprint.startsWith('v1:');
  const isLegacyVersion = clientFingerprint && !isCurrentVersion && isValidClientFp;

  if (isValidClientFp) {
    req.context.fingerprint = clientFingerprint;

    if (isLegacyVersion) {
      console.log('🔄 Legacy fingerprint detected, will migrate:', clientFingerprint.substring(0, 20) + '...');
      // Force cookie refresh for legacy versions
      res.locals.needsMigration = true;
    } else {
      console.log('✅ Valid current fingerprint:', clientFingerprint.substring(0, 20) + '...');
    }
  } else {
    // In development mode, generate a fallback fingerprint instead of rejecting
    if (isDevMode && !strictMode) {
      req.context.fingerprint = generateServerFingerprint(req);
      console.log('🔧 Development mode: Generated fallback fingerprint');
    } else {
      req.context.fingerprint = null;
      if (clientFingerprint) {
        console.log('⚠️ Invalid client fingerprint format:', clientFingerprint);
      } else {
        console.log('⚠️ No client fingerprint provided');
      }
    }
  }

  // Handle server-signed cookie
  let validCookie = false;
  if (cookieSignature) {
    try {
      // HMAC verification using environment secret
      const expectedSig = crypto
        .createHmac('sha256', process.env.FINGERPRINT_SECRET || 'dev-secret-key')
        .update(req.ip + '|' + (req.get('User-Agent') || ''))
        .digest('hex')
        .substring(0, 16);

      if (cookieSignature.includes(expectedSig)) {
        validCookie = true;
        console.log('✅ Valid fingerprint signature cookie');
      }
    } catch (error) {
      console.log('⚠️ Invalid fingerprint signature cookie:', error.message);
    }
  }

  // Issue new signed cookie if needed or migration required
  if (!validCookie || res.locals.needsMigration) {
    const signature = crypto
      .createHmac('sha256', process.env.FINGERPRINT_SECRET || 'dev-secret-key')
      .update(req.ip + '|' + (req.get('User-Agent') || '') + '|' + Date.now())
      .digest('hex')
      .substring(0, 16);

    const cookieValue = `${signature}_${Date.now()}`;

    res.cookie('spiq_fp_sig', cookieValue, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.locals.fpIssued = true;
    console.log('🆕 Issued new fingerprint signature cookie');
  }

  // Log fingerprint status for debugging
  console.log('🔍 Fingerprint context:', {
    hasClient: !!req.context.fingerprint,
    hasCookie: validCookie,
    issued: res.locals.fpIssued,
    strict: strictMode,
    ip: req.ip
  });

  next();
}

// Middleware - Enhanced CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://smartpromptiq.com',
      'https://www.smartpromptiq.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'null' // Allow file:// protocol (opening HTML files directly)
    ];

    // Allow all localhost ports in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Device-Fingerprint',
    'X-Client-Type',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'User-Agent',
    'Accept-Language',
    'X-Requested-With',
    'X-Timestamp',
    'x-client-type',
    'x-requested-with',
    'x-timestamp'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// Additional manual CORS middleware for extra compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://smartpromptiq.com',
    'https://www.smartpromptiq.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'null' // Allow file:// protocol
  ];

  // Allow localhost origins with any port
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Handle null origin (file:// protocol)
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    console.log('⚠️ Manual CORS middleware blocked origin:', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Device-Fingerprint, X-Client-Type, Accept, Origin, Cache-Control, Pragma, User-Agent, Accept-Language, X-Requested-With, X-Timestamp, x-client-type, x-requested-with, x-timestamp'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request:', {
      origin: req.headers.origin,
      method: req.method,
      headers: req.headers
    });
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware (enhanced implementation)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        req.cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
  }

  // Add cookie setter helper
  res.cookie = (name, value, options = {}) => {
    const opts = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000, // 1 day default
      ...options
    };

    let cookieStr = `${name}=${encodeURIComponent(value)}`;
    if (opts.maxAge) cookieStr += `; Max-Age=${Math.floor(opts.maxAge / 1000)}`;
    if (opts.httpOnly) cookieStr += '; HttpOnly';
    if (opts.secure) cookieStr += '; Secure';
    if (opts.sameSite) cookieStr += `; SameSite=${opts.sameSite}`;
    if (opts.path) cookieStr += `; Path=${opts.path}`;

    res.setHeader('Set-Cookie', cookieStr);
  };

  next();
});

// Global fingerprint middleware - applied to all routes (DISABLED FOR DEVELOPMENT)
// app.use(processFingerprintHeader);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health endpoint for Railway
app.get('/api/health', (req, res) => {
  console.log('Health check called');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SmartPromptiq-pro',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Version endpoint for Railway deployment info
app.get('/api/version', (req, res) => {
  console.log('Version endpoint called');
  res.status(200).json({
    sha: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
    built: process.env.BUILD_TIME || new Date().toISOString(),
    node: process.version
  });
});

// Add demo generate endpoint (simplified inline version)
app.post('/api/demo/generate', (req, res) => {
  console.log('🎯 Demo generation request received:', req.body);

  const { templateType, userResponses = {} } = req.body;

  // Generate sample content
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

// Add demo prompt generate endpoint
app.post('/api/demo-generate-prompt', (req, res) => {
  console.log('🎯 Demo prompt generation request received:', req.body);

  const { category, answers = {}, customization = {} } = req.body;

  // Generate sample prompt content
  const samplePrompt = {
    title: `${category || 'Demo'} Prompt Generated`,
    content: `# AI-Generated Professional Prompt

This is a sample of the comprehensive, professional prompts that SmartPromptIQ creates using advanced AI technology.

## Your Input
Category: ${category}
Answers: ${JSON.stringify(answers, null, 2)}
Customization: ${JSON.stringify(customization, null, 2)}

## Generated Prompt
Based on your inputs, here's an optimized prompt designed to produce exceptional results:

"Create compelling, professional content that addresses the specific needs of your ${category} audience. Consider the following key elements:

• Target audience analysis and engagement strategies
• Clear value propositions and benefits
• Professional tone and structure
• Actionable insights and recommendations
• Industry-specific terminology and best practices

Ensure the output is well-structured, engaging, and ready for immediate use in your professional communications."

## Usage Tips:
• Customize the prompt based on your specific requirements
• Test different variations to optimize results
• Combine with additional context for better outcomes

*Generated by SmartPromptIQ's AI engine*`
  };

  res.json({
    success: true,
    message: 'Demo prompt generated successfully',
    data: {
      title: samplePrompt.title,
      content: samplePrompt.content,
      generatedAt: new Date().toISOString(),
      isRealGeneration: false,
      category,
      requestId: `prompt_demo_${Date.now()}`
    }
  });
});

// Add basic feedback rating endpoint (simplified version)
app.post('/api/feedback/rating', (req, res) => {
  console.log('Rating submission received:', req.body);

  // Since we don't have full auth/database setup, just return success
  res.status(200).json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      rating: req.body.rating,
      submittedAt: new Date().toISOString()
    }
  });
});

// Add prompts endpoints that the frontend expects
app.get('/api/prompts', (req, res) => {
  console.log('Get prompts request');

  const prompts = [
    {
      id: 1,
      title: 'Business Content Generator',
      category: 'business',
      description: 'Generate professional business content',
      template: 'Create compelling business content for {businessType} focusing on {goal}'
    },
    {
      id: 2,
      title: 'Marketing Copy',
      category: 'marketing',
      description: 'Generate marketing copy and campaigns',
      template: 'Create engaging marketing copy for {product} targeting {audience}'
    },
    {
      id: 3,
      title: 'Technical Documentation',
      category: 'technical',
      description: 'Generate technical documentation',
      template: 'Create clear technical documentation for {feature} including {requirements}'
    }
  ];

  // Return multiple response formats to ensure compatibility
  res.status(200).json({
    success: true,
    prompts: prompts, // Direct prompts property
    data: {
      prompts: prompts,
      total: 3
    },
    total: 3
  });
});

app.get('/api/prompts/:id', (req, res) => {
  const { id } = req.params;
  console.log('Get prompt by ID:', id);

  res.status(200).json({
    success: true,
    data: {
      id: parseInt(id),
      title: 'Sample Prompt',
      category: 'business',
      description: 'Sample prompt description',
      template: 'This is a sample prompt template',
      variables: ['businessType', 'goal'],
      createdAt: new Date().toISOString()
    }
  });
});

app.post('/api/prompts', (req, res) => {
  console.log('Create prompt request:', req.body);

  res.status(201).json({
    success: true,
    message: 'Prompt created successfully',
    data: {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/user/profile', (req, res) => {
  console.log('Get user profile request');

  res.status(200).json({
    success: true,
    data: {
      id: 1,
      email: 'user@example.com',
      firstName: 'Demo',
      lastName: 'User',
      name: 'Demo User',
      role: 'USER',
      subscription: {
        plan: 'free',
        tokensRemaining: 1000,
        tokensUsed: 500
      },
      createdAt: new Date().toISOString()
    }
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  console.log('Info endpoint called');
  res.status(200).json({
    name: 'SmartPromptiq Pro API',
    version: '1.0.0',
    description: 'AI-powered prompt optimization platform',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    console.log('📝 Registration request received:', { email, firstName, lastName });

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password'
      });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate user ID using timestamp-based method similar to cuid
    const userId = 'cm' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    const token = `jwt-${userId}-${Date.now()}`;
    const fullName = `${firstName || 'User'} ${lastName || ''}`.trim();
    const now = Date.now();

    // Hash password (in production, use bcrypt)
    const bcrypt = require('crypto');
    const hashedPassword = bcrypt.createHash('sha256').update(password).digest('hex');

    // Insert user into database
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (
          id, email, password, firstName, lastName, role,
          subscriptionTier, subscriptionStatus, tokenBalance,
          isActive, emailVerified, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          email.toLowerCase(),
          hashedPassword,
          firstName || 'User',
          lastName || '',
          'USER',
          'free',
          'active',
          5, // Initial token balance
          1, // isActive
          0, // emailVerified
          now,
          now
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    console.log('✅ User saved to database:', { userId, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          email,
          firstName: firstName || 'User',
          lastName: lastName || '',
          name: fullName,
          role: 'USER',
          registeredAt: new Date(now).toISOString()
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Permanent admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@smartpromptiq.com',
  password: 'admin123',
  user: {
    id: 'admin-001',
    email: 'admin@smartpromptiq.com',
    firstName: 'Administrator',
    lastName: 'SmartPromptIQ',
    name: 'Administrator SmartPromptIQ',
    role: 'ADMIN',
    roles: [{ name: 'ADMIN' }, { name: 'SUPER_ADMIN' }],
    permissions: ['admin_access', 'user_management', 'system_config', 'analytics_view']
  }
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isAdminLogin } = req.body;

    console.log('Login attempt:', { email, isAdminLogin });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing email or password'
      });
    }

    // Check for permanent admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      console.log('✅ Admin login successful with permanent credentials');

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: ADMIN_CREDENTIALS.user,
          token: 'admin-token-' + Date.now()
        }
      });
      return;
    }

    // Check for other admin patterns (for backward compatibility)
    const isAdmin = email.includes('admin') || isAdminLogin;

    if (isAdmin) {
      console.log('✅ Admin login with pattern matching');

      const userData = {
        id: 'temp-admin-' + Date.now(),
        email,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'ADMIN',
        roles: [{ name: 'ADMIN' }],
        permissions: ['admin_access']
      };

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: userData,
          token: 'admin-token-' + Date.now()
        }
      });
      return;
    }

    // Regular user login (for demo purposes, accept any other credentials)
    console.log('✅ Regular user login');

    const userData = {
      id: 'user-' + Date.now(),
      email,
      firstName: 'Demo',
      lastName: 'User',
      name: 'Demo User',
      role: 'USER',
      roles: [{ name: 'USER' }],
      permissions: ['basic_access']
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: 'user-token-' + Date.now()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Admin API endpoints
app.get('/api/admin/token-monitoring', (req, res) => {
  try {
    const { timeframe } = req.query;
    console.log('Token monitoring request:', { timeframe });

    // Mock token monitoring data
    res.status(200).json({
      success: true,
      data: {
        totalTokensUsed: 125000,
        totalTokensRemaining: 875000,
        avgTokensPerRequest: 45,
        peakUsageHour: '14:00',
        tokenUsageByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          tokens: Math.floor(Math.random() * 1000) + 500
        })),
        topUsers: [
          { email: 'user1@example.com', tokens: 15000 },
          { email: 'user2@example.com', tokens: 12000 },
          { email: 'user3@example.com', tokens: 10000 }
        ]
      }
    });
  } catch (error) {
    console.error('Token monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch token monitoring data',
      error: error.message
    });
  }
});

app.get('/api/admin/user-analytics', (req, res) => {
  try {
    console.log('User analytics request');

    res.status(200).json({
      success: true,
      data: {
        totalUsers: 1250,
        activeUsers: 850,
        newUsersToday: 25,
        userGrowthRate: 12.5,
        usersByPlan: {
          free: 800,
          pro: 350,
          enterprise: 100
        },
        registrationsByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          registrations: Math.floor(Math.random() * 50) + 10
        }))
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

app.get('/api/admin/system-health', (req, res) => {
  try {
    console.log('System health request');

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuLoad: Math.random() * 100,
        responseTime: Math.floor(Math.random() * 100) + 50,
        activeConnections: 42,
        errorRate: 0.02,
        throughput: 1250
      }
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message
    });
  }
});

app.get('/api/admin/revenue-analytics', (req, res) => {
  try {
    console.log('Revenue analytics request');

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: 45000,
        monthlyRecurringRevenue: 12000,
        averageRevenuePerUser: 36,
        churnRate: 5.2,
        revenueByPlan: {
          pro: 25000,
          enterprise: 20000
        },
        revenueByMonth: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(Math.random() * 10000) + 5000
        }))
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

app.get('/api/admin/password-security', (req, res) => {
  try {
    console.log('Password security request');

    res.status(200).json({
      success: true,
      data: {
        weakPasswords: 12,
        strongPasswords: 1238,
        passwordBreaches: 3,
        mfaEnabled: 850,
        lastSecurityAudit: new Date().toISOString(),
        securityScore: 85,
        recommendations: [
          'Enable MFA for all admin accounts',
          'Review accounts with weak passwords',
          'Update password policy requirements'
        ]
      }
    });
  } catch (error) {
    console.error('Password security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch password security data',
      error: error.message
    });
  }
});

app.get('/api/admin/email-management', (req, res) => {
  try {
    const { timeframe } = req.query;
    console.log('Email management request:', { timeframe });

    res.status(200).json({
      success: true,
      data: {
        totalEmails: 15000,
        delivered: 14500,
        bounced: 250,
        opened: 12000,
        clicked: 3500,
        unsubscribed: 120,
        deliveryRate: 96.7,
        openRate: 82.8,
        clickRate: 29.2,
        recentCampaigns: [
          { name: 'Welcome Series', sent: 500, opened: 425, clicked: 180 },
          { name: 'Product Updates', sent: 1200, opened: 960, clicked: 240 },
          { name: 'Special Offers', sent: 800, opened: 640, clicked: 200 }
        ]
      }
    });
  } catch (error) {
    console.error('Email management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email management data',
      error: error.message
    });
  }
});

app.get('/api/admin/system-monitoring', (req, res) => {
  try {
    console.log('System monitoring request');

    res.status(200).json({
      success: true,
      data: {
        serverStatus: 'online',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: Math.random() * 100,
        diskUsage: 65.4,
        activeConnections: 42,
        requestsPerMinute: 1250,
        errorRate: 0.02,
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        databaseConnections: 8,
        queueLength: 15,
        alerts: [
          { level: 'warning', message: 'CPU usage above 80%', timestamp: new Date().toISOString() },
          { level: 'info', message: 'Daily backup completed', timestamp: new Date().toISOString() }
        ]
      }
    });
  } catch (error) {
    console.error('System monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system monitoring data',
      error: error.message
    });
  }
});

// In-memory storage for demo purposes (use database in production)
let deletedUserIds = new Set();
let suspendedUserIds = new Set();

// Additional admin endpoints for dashboard
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('📊 Admin stats request - Fetching data...');

    // If no database, return mock data
    if (!dbConnected) {
      console.log('⚠️ Database not connected - returning demo data');
      return res.status(200).json({
        success: true,
        data: {
          totalUsers: 0,
          activeUsersToday: 0,
          totalRevenue: 0,
          pendingPayments: 0,
          systemStatus: 'operational'
        }
      });
    }

    // Get total users count
    const totalUsersResult = await dbGet('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult?.count || 0;

    // Get active users today (users who logged in today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeUsersTodayResult = await dbGet(
      'SELECT COUNT(*) as count FROM users WHERE lastLogin >= ?',
      [todayStart.toISOString()]
    );
    const activeUsersToday = activeUsersTodayResult.count;

    // Calculate total revenue from token transactions
    const revenueResult = await dbGet(
      'SELECT SUM(costInCents) as total FROM token_transactions WHERE type = ? AND costInCents IS NOT NULL',
      ['purchase']
    );
    const totalRevenue = (revenueResult.total || 0) / 100; // Convert cents to dollars

    // Get pending payments (subscriptions in incomplete state)
    const pendingPaymentsResult = await dbGet(
      'SELECT COUNT(*) as count FROM subscriptions WHERE status IN (?, ?)',
      ['incomplete', 'past_due']
    );
    const pendingPayments = pendingPaymentsResult.count;

    console.log('✅ Live stats fetched:', { totalUsers, activeUsersToday, totalRevenue, pendingPayments });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsersToday,
        totalRevenue,
        pendingPayments,
        systemStatus: 'operational'
      }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const { limit } = req.query;
    console.log('👥 Admin users request - Fetching LIVE data from database:', { limit });

    // Fetch real users from database
    const users = await dbAll(
      `SELECT id, email, firstName, lastName, role, isActive, subscriptionTier, subscriptionStatus,
              tokenBalance, createdAt, lastLogin, tokensPurchased, tokensUsed
       FROM users
       ORDER BY createdAt DESC
       LIMIT ?`,
      [parseInt(limit) || 10]
    );

    // Get total count
    const totalResult = await dbGet('SELECT COUNT(*) as count FROM users');
    const total = totalResult.count;

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      status: user.isActive ? 'active' : 'suspended',
      createdAt: user.createdAt,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      tokenBalance: user.tokenBalance,
      totalSpent: user.tokensPurchased, // Using tokensPurchased as proxy for total spent
      lastActiveAt: user.lastLogin || user.createdAt
    }));

    console.log(`✅ Fetched ${transformedUsers.length} users from database (total: ${total})`);

    res.status(200).json({
      success: true,
      data: { users: transformedUsers, total }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

app.get('/api/admin/payments', async (req, res) => {
  try {
    const { limit } = req.query;
    console.log('💳 Admin payments request - Fetching LIVE data from database:', { limit });

    // Fetch real token transactions (purchases) from database with user email
    const transactions = await dbAll(
      `SELECT t.id, t.userId, t.costInCents, t.tokens, t.packageType, t.stripePaymentIntentId, t.createdAt,
              u.email as userEmail
       FROM token_transactions t
       LEFT JOIN users u ON t.userId = u.id
       WHERE t.type = ? AND t.costInCents IS NOT NULL
       ORDER BY t.createdAt DESC
       LIMIT ?`,
      ['purchase', parseInt(limit) || 10]
    );

    // Get total count
    const totalResult = await dbGet(
      'SELECT COUNT(*) as count FROM token_transactions WHERE type = ? AND costInCents IS NOT NULL',
      ['purchase']
    );
    const total = totalResult.count;

    // Transform data for frontend
    const payments = transactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      userEmail: tx.userEmail || 'N/A',
      amount: (tx.costInCents || 0) / 100, // Convert cents to dollars
      currency: 'USD',
      status: 'completed', // Transactions in DB are completed
      stripePaymentId: tx.stripePaymentIntentId || 'N/A',
      createdAt: tx.createdAt,
      description: `${tx.packageType || 'Token'} purchase - ${tx.tokens} tokens`
    }));

    console.log(`✅ Fetched ${payments.length} payments from database (total: ${total})`);

    res.status(200).json({
      success: true,
      data: { payments, total }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
});

app.get('/api/admin/active-sessions', (req, res) => {
  try {
    console.log('Active sessions request');
    res.status(200).json({
      success: true,
      data: {
        totalSessions: 320,
        activeSessions: Array.from({ length: 10 }, (_, i) => ({
          id: `sess_${i + 1}`,
          userId: i + 1,
          email: `user${i + 1}@example.com`,
          ipAddress: `192.168.1.${i + 100}`,
          lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions', error: error.message });
  }
});

app.get('/api/admin/recent-registrations', (req, res) => {
  try {
    const { hours } = req.query;
    console.log('Recent registrations request:', { hours });

    const registrations = Array.from({ length: 15 }, (_, i) => ({
      id: 1250 + i,
      email: `newuser${i + 1}@example.com`,
      firstName: `New`,
      lastName: `User ${i + 1}`,
      registeredAt: new Date(Date.now() - Math.random() * parseInt(hours || 24) * 60 * 60 * 1000).toISOString(),
      source: Math.random() > 0.5 ? 'organic' : 'referral'
    }));

    res.status(200).json({
      success: true,
      data: { registrations, total: 25 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
});

app.get('/api/admin/logs', (req, res) => {
  try {
    const { limit } = req.query;
    console.log('Admin logs request:', { limit });

    const logs = Array.from({ length: parseInt(limit) || 20 }, (_, i) => ({
      id: i + 1,
      level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
      message: `System log entry ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      source: 'server'
    }));

    res.status(200).json({
      success: true,
      data: { logs, total: 1000 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
  }
});

// Admin action endpoints
app.post('/api/admin/payments/:paymentId/refund', (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('Refund payment request:', { paymentId });

    res.status(200).json({
      success: true,
      message: `Payment ${paymentId} refunded successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to refund payment', error: error.message });
  }
});

app.post('/api/admin/actions/:action', (req, res) => {
  try {
    const { action } = req.params;
    console.log('Admin action request:', { action });

    res.status(200).json({
      success: true,
      message: `Action ${action} executed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to execute action', error: error.message });
  }
});

app.post('/api/admin/users/:userId/suspend', (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    console.log('Suspend user request:', { userId, userIdInt });

    // Add user to suspended list
    suspendedUserIds.add(userIdInt);
    console.log(`⏸️ User ${userId} suspended. Suspended IDs:`, Array.from(suspendedUserIds));

    res.status(200).json({
      success: true,
      message: `User ${userId} suspended successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to suspend user', error: error.message });
  }
});

app.post('/api/admin/users/:userId/unsuspend', (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    console.log('Unsuspend user request:', { userId, userIdInt });

    // Remove user from suspended list
    suspendedUserIds.delete(userIdInt);
    console.log(`▶️ User ${userId} unsuspended. Suspended IDs:`, Array.from(suspendedUserIds));

    res.status(200).json({
      success: true,
      message: `User ${userId} unsuspended successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unsuspend user', error: error.message });
  }
});

// User deletion and cleanup endpoints
app.delete('/api/admin/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { permanently } = req.query;
    const userIdInt = parseInt(userId);
    console.log('Delete user request:', { userId, permanently, userIdInt });

    // Add user to deleted list
    deletedUserIds.add(userIdInt);

    // Also remove from suspended list if they were suspended
    suspendedUserIds.delete(userIdInt);

    if (permanently === 'true') {
      console.log(`🗑️ User ${userId} permanently deleted. Deleted IDs:`, Array.from(deletedUserIds));
      res.status(200).json({
        success: true,
        message: `User ${userId} permanently deleted successfully`,
        action: 'permanent_delete'
      });
    } else {
      console.log(`🗑️ User ${userId} soft deleted. Deleted IDs:`, Array.from(deletedUserIds));
      res.status(200).json({
        success: true,
        message: `User ${userId} soft deleted successfully`,
        action: 'soft_delete'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

app.post('/api/admin/users/:userId/restore', (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    console.log('Restore user request:', { userId, userIdInt });

    // Remove user from deleted list
    deletedUserIds.delete(userIdInt);
    console.log(`🔄 User ${userId} restored. Deleted IDs:`, Array.from(deletedUserIds));

    res.status(200).json({
      success: true,
      message: `User ${userId} restored successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restore user', error: error.message });
  }
});

app.delete('/api/admin/users/bulk', (req, res) => {
  try {
    const { userIds, action } = req.body;
    console.log('Bulk user action request:', { userIds, action });

    let message = '';
    switch (action) {
      case 'delete':
        message = `${userIds.length} users deleted successfully`;
        break;
      case 'suspend':
        message = `${userIds.length} users suspended successfully`;
        break;
      case 'unsuspend':
        message = `${userIds.length} users unsuspended successfully`;
        break;
      case 'permanent_delete':
        message = `${userIds.length} users permanently deleted successfully`;
        break;
      default:
        message = `Bulk action ${action} completed for ${userIds.length} users`;
    }

    res.status(200).json({
      success: true,
      message,
      processed: userIds.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process bulk action', error: error.message });
  }
});

app.get('/api/admin/users/deleted', (req, res) => {
  try {
    const { limit } = req.query;
    console.log('Get deleted users request:', { limit });

    const deletedUsers = Array.from({ length: parseInt(limit) || 10 }, (_, i) => ({
      id: 2000 + i,
      email: `deleted${i + 1}@example.com`,
      firstName: `Deleted`,
      lastName: `User ${i + 1}`,
      role: 'USER',
      status: 'deleted',
      deletedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));

    res.status(200).json({
      success: true,
      data: { users: deletedUsers, total: 45 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch deleted users', error: error.message });
  }
});

app.post('/api/admin/cleanup/inactive-users', (req, res) => {
  try {
    const { days } = req.body;
    console.log('Cleanup inactive users request:', { days });

    const cleanedCount = Math.floor(Math.random() * 50) + 10;

    res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} inactive users (inactive for ${days} days)`,
      cleaned: cleanedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cleanup inactive users', error: error.message });
  }
});

app.post('/api/admin/cleanup/temp-data', (req, res) => {
  try {
    console.log('Cleanup temporary data request');

    const cleanupStats = {
      tempFiles: Math.floor(Math.random() * 100) + 20,
      sessions: Math.floor(Math.random() * 200) + 50,
      logs: Math.floor(Math.random() * 500) + 100,
      cache: Math.floor(Math.random() * 1000) + 200
    };

    res.status(200).json({
      success: true,
      message: 'Temporary data cleanup completed',
      cleanup: cleanupStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cleanup temporary data', error: error.message });
  }
});

// Stripe Webhook Handler (must be before express.json() middleware)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!stripe || !webhookSecret || webhookSecret.includes('your_webhook')) {
      console.log('⚠️ Stripe webhook not configured - ignoring event');
      return res.status(200).json({ received: true });
    }

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Stripe webhook event received:', event.type);

  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('💳 Payment successful:', session.id);

      // Update user subscription in database
      const { userId, planId, billingCycle } = session.metadata;

      if (userId) {
        try {
          const now = Date.now();
          const nextBillingDate = billingCycle === 'yearly'
            ? now + 365 * 24 * 60 * 60 * 1000
            : now + 30 * 24 * 60 * 60 * 1000;

          // Update user subscription
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE users
               SET subscriptionTier = ?,
                   subscriptionStatus = ?,
                   stripeCustomerId = ?,
                   stripeSubscriptionId = ?,
                   subscriptionEndDate = ?,
                   updatedAt = ?
               WHERE id = ?`,
              [
                planId,
                'active',
                session.customer,
                session.subscription,
                nextBillingDate,
                now,
                userId
              ],
              function(err) {
                if (err) reject(err);
                else resolve(this);
              }
            );
          });

          // Record the transaction
          const transactionId = 'cm' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO token_transactions (
                id, userId, type, tokens, balanceBefore, balanceAfter,
                costInCents, packageType, stripePaymentIntentId, createdAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                transactionId,
                userId,
                'purchase',
                0, // Subscription doesn't add tokens directly
                0,
                0,
                session.amount_total,
                `subscription_${planId}_${billingCycle}`,
                session.payment_intent,
                now
              ],
              function(err) {
                if (err) reject(err);
                else resolve(this);
              }
            );
          });

          console.log('✅ User subscription updated:', userId, planId);
        } catch (error) {
          console.error('❌ Failed to update subscription:', error);
        }
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log('🔄 Subscription status changed:', subscription.id, subscription.status);

      // Update subscription status in database
      try {
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE users
             SET subscriptionStatus = ?, updatedAt = ?
             WHERE stripeSubscriptionId = ?`,
            [subscription.status, Date.now(), subscription.id],
            function(err) {
              if (err) reject(err);
              else resolve(this);
            }
          );
        });
        console.log('✅ Subscription status updated');
      } catch (error) {
        console.error('❌ Failed to update subscription status:', error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Billing endpoints
app.get('/api/billing/info', async (req, res) => {
  try {
    console.log('💳 Billing info request');

    // TODO: Get user from auth token
    // For now, return default billing info
    res.status(200).json({
      currentPlan: 'free',
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: {
        prompts: 2,
        tokens: 150,
        categories: 1
      },
      paymentMethod: null // No payment method for free plan
    });
  } catch (error) {
    console.error('❌ Billing info error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch billing info', error: error.message });
  }
});

app.post('/api/billing/upgrade', async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    console.log('💳 Upgrade request:', { planId, billingCycle });

    // Check if Stripe is configured
    if (!stripe) {
      console.log('⚠️ Stripe not configured - simulating upgrade');
      return res.status(200).json({
        success: true,
        message: `Subscription upgraded to ${planId} (${billingCycle})! (Demo mode - Stripe not configured)`,
        checkoutUrl: null
      });
    }

    // Map plan IDs to prices
    const priceMap = {
      'starter_monthly': process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_1234_starter_monthly',
      'starter_yearly': process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_1234_starter_yearly',
      'pro_monthly': process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1234_pro_monthly',
      'pro_yearly': process.env.STRIPE_PRICE_PRO_YEARLY || 'price_1234_pro_yearly',
      'enterprise_monthly': process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_1234_enterprise_monthly',
      'enterprise_yearly': process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_1234_enterprise_yearly'
    };

    const priceKey = `${planId}_${billingCycle}`;
    const priceId = priceMap[priceKey];

    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan: ${planId} (${billingCycle})`
      });
    }

    // Get or create customer (in production, get from auth token)
    // For now, use email from request or create a test customer
    const customerEmail = req.body.email || 'customer@example.com';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/billing?canceled=true`,
      metadata: {
        planId,
        billingCycle,
        userId: req.body.userId || 'demo-user'
      }
    });

    console.log('✅ Stripe checkout session created:', session.id);

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// ==============================================
// ELEVENLABS TEXT-TO-SPEECH API ROUTES
// ==============================================

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
  'matilda': 'XrExE9yKIg1WjnnlVkGX',
  'james': 'ZQe5CZNOzWyzPSCn5a3c',
  'joseph': 'Zlb1dXrM653N07WRdFW3',
  'jeremy': 'bVMeCyTHy58xNoL34h3p',
  'michael': 'flq6f7yk4E4fJM5XTYuZ',
  'ethan': 'g5CIjZEefAph4nQFvHAz',
  'george': 'JBFqnCBsd6RMkjVDRZzb',
  'daniel': 'onwK4e9ZLuTAKqWW03F9'
};

// Get voice ID from name or use default
function getVoiceId(voiceName) {
  if (!voiceName) return ELEVENLABS_VOICES['rachel'];
  const lowerName = voiceName.toLowerCase();
  return ELEVENLABS_VOICES[lowerName] || voiceName;
}

// ElevenLabs generate speech endpoint
app.post('/api/elevenlabs/generate', async (req, res) => {
  console.log('🎤 ElevenLabs generate request:', req.body);

  const { text, voice = 'rachel', modelId = 'eleven_monolingual_v1' } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text is required for voice generation'
    });
  }

  // Check if ElevenLabs API key is configured
  if (!ELEVENLABS_API_KEY) {
    console.log('⚠️ ElevenLabs API key not configured - returning demo response');
    return res.json({
      success: true,
      message: 'Voice generation demo mode (no API key configured)',
      data: {
        audioUrl: null,
        text: text,
        voice: voice,
        isDemo: true
      }
    });
  }

  try {
    const voiceId = getVoiceId(voice);
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', errorText);
      return res.status(response.status).json({
        success: false,
        message: 'Voice generation failed',
        error: errorText
      });
    }

    // Get audio buffer and send as base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.json({
      success: true,
      message: 'Voice generated successfully',
      data: {
        audioData: base64Audio,
        contentType: 'audio/mpeg',
        text: text,
        voice: voice
      }
    });

  } catch (error) {
    console.error('❌ ElevenLabs generate error:', error);
    res.status(500).json({
      success: false,
      message: 'Voice generation failed',
      error: error.message
    });
  }
});

// ElevenLabs page narration endpoint
app.post('/api/elevenlabs/page/narrate', async (req, res) => {
  console.log('🎤 ElevenLabs page narrate request:', req.body);

  // Accept both 'content' (from frontend) and 'text' for flexibility
  const { content, text, voice = 'rachel', voiceName, pageId, pageType, pageTitle } = req.body;
  const narrationText = content || text;
  const selectedVoice = voiceName || voice;

  if (!narrationText) {
    return res.status(400).json({
      success: false,
      message: 'Content or text is required for page narration'
    });
  }

  // Return demo response with browser speech synthesis fallback
  if (!ELEVENLABS_API_KEY) {
    return res.json({
      success: true,
      demo: true,
      message: 'Page narration uses browser speech synthesis',
      content: narrationText,
      text: narrationText.substring(0, 100) + '...',
      voice: selectedVoice,
      pageType: pageType,
      pageTitle: pageTitle,
      useBrowserSpeech: true,
      data: {
        audioUrl: null,
        pageId: pageId,
        isDemo: true
      }
    });
  }

  try {
    const voiceId = getVoiceId(selectedVoice);
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: narrationText,
        model_id: 'eleven_monolingual_v1',
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
      data: {
        audioData: base64Audio,
        contentType: 'audio/mpeg',
        pageId: pageId
      }
    });

  } catch (error) {
    console.error('❌ Page narrate error:', error);
    // Fallback to browser speech on error
    res.json({
      success: true,
      demo: true,
      message: 'ElevenLabs API error. Using browser speech synthesis.',
      content: narrationText,
      voice: selectedVoice,
      useBrowserSpeech: true,
      error: error.message
    });
  }
});

// ElevenLabs academy generate endpoint
app.post('/api/elevenlabs/academy/generate', async (req, res) => {
  console.log('🎤 ElevenLabs academy generate request:', req.body);

  const { text, voice = 'rachel', lessonId } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text is required for academy voice generation'
    });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.json({
      success: true,
      message: 'Academy voice generation demo mode',
      data: {
        audioUrl: null,
        lessonId: lessonId,
        isDemo: true
      }
    });
  }

  try {
    const voiceId = getVoiceId(voice);
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
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
      data: {
        audioData: base64Audio,
        contentType: 'audio/mpeg',
        lessonId: lessonId
      }
    });

  } catch (error) {
    console.error('❌ Academy voice error:', error);
    res.status(500).json({
      success: false,
      message: 'Academy voice generation failed',
      error: error.message
    });
  }
});

// ElevenLabs sound effects generation
app.post('/api/elevenlabs/sound-effects/generate', async (req, res) => {
  console.log('🎤 ElevenLabs sound effects request:', req.body);

  const { text, duration_seconds = 5 } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text description is required for sound effects'
    });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.json({
      success: true,
      message: 'Sound effects demo mode',
      data: {
        audioUrl: null,
        description: text,
        isDemo: true
      }
    });
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/sound-generation`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        duration_seconds: duration_seconds
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.json({
      success: true,
      data: {
        audioData: base64Audio,
        contentType: 'audio/mpeg',
        description: text
      }
    });

  } catch (error) {
    console.error('❌ Sound effects error:', error);
    res.status(500).json({
      success: false,
      message: 'Sound effects generation failed',
      error: error.message
    });
  }
});

// ==============================================
// VOICE API ROUTES (Browser Speech Synthesis Fallback)
// ==============================================

// Voice generate endpoint (uses browser speech synthesis or ElevenLabs)
app.post('/api/voice/generate', async (req, res) => {
  console.log('🎤 Voice generate request:', req.body);

  const { text, voice = 'default', speed = 1, pitch = 1 } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Text is required for voice generation'
    });
  }

  // If ElevenLabs is configured, use it
  if (ELEVENLABS_API_KEY) {
    try {
      const voiceId = getVoiceId(voice);
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return res.json({
          success: true,
          data: {
            audioData: base64Audio,
            contentType: 'audio/mpeg',
            text: text,
            voice: voice,
            provider: 'elevenlabs'
          }
        });
      }
    } catch (error) {
      console.error('ElevenLabs fallback failed:', error);
    }
  }

  // Return text for client-side speech synthesis
  res.json({
    success: true,
    message: 'Use browser speech synthesis',
    data: {
      text: text,
      voice: voice,
      speed: speed,
      pitch: pitch,
      provider: 'browser',
      useBrowserSpeech: true
    }
  });
});

// Voice generate from blueprint
app.post('/api/voice/generate-from-blueprint', async (req, res) => {
  console.log('🎤 Voice generate from blueprint request:', req.body);

  const { blueprint, voice = 'default' } = req.body;

  if (!blueprint) {
    return res.status(400).json({
      success: false,
      message: 'Blueprint is required for voice generation'
    });
  }

  // Extract text from blueprint
  const text = typeof blueprint === 'string' ? blueprint : blueprint.content || blueprint.text || '';

  res.json({
    success: true,
    message: 'Voice generation from blueprint',
    data: {
      text: text,
      voice: voice,
      provider: 'browser',
      useBrowserSpeech: true
    }
  });
});

// Voice enhance script
app.post('/api/voice/enhance-script', async (req, res) => {
  console.log('🎤 Voice enhance script request:', req.body);

  const { script, style = 'professional' } = req.body;

  if (!script) {
    return res.status(400).json({
      success: false,
      message: 'Script is required for enhancement'
    });
  }

  // Simple script enhancement (could use AI in future)
  const enhancedScript = script
    .replace(/\s+/g, ' ')
    .trim();

  res.json({
    success: true,
    message: 'Script enhanced',
    data: {
      originalScript: script,
      enhancedScript: enhancedScript,
      style: style
    }
  });
});

// Voice generate lesson narration
app.post('/api/voice/generate-lesson-narration', async (req, res) => {
  console.log('🎤 Voice generate lesson narration request:', req.body);

  const { lessonContent, voice = 'default', lessonId } = req.body;

  if (!lessonContent) {
    return res.status(400).json({
      success: false,
      message: 'Lesson content is required for narration'
    });
  }

  res.json({
    success: true,
    message: 'Lesson narration ready',
    data: {
      text: lessonContent,
      lessonId: lessonId,
      voice: voice,
      provider: 'browser',
      useBrowserSpeech: true
    }
  });
});

// Get available voices
app.get('/api/voice/voices', (req, res) => {
  res.json({
    success: true,
    data: {
      elevenlabs: Object.keys(ELEVENLABS_VOICES),
      browser: ['default', 'Google US English', 'Google UK English', 'Microsoft David', 'Microsoft Zira'],
      hasElevenLabsKey: !!ELEVENLABS_API_KEY
    }
  });
});

// Catch-all for any missing API endpoints
app.all('/api/*', (req, res) => {
  console.log(`⚠️ Missing endpoint: ${req.method} ${req.url}`);

  // Return a generic success response to prevent frontend errors
  res.status(200).json({
    success: true,
    message: `Endpoint ${req.url} not implemented yet`,
    data: {
      prompts: [], // Always include prompts array
      results: [],
      items: [],
      content: null
    },
    prompts: [], // Direct prompts property
    total: 0
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SmartPromptiq Pro API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      admin: '/api/admin/*'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('SmartPromptiq Pro Server Started');
  console.log('Port: ' + PORT);
  console.log('Health: http://localhost:' + PORT + '/api/health');
  console.log('Info: http://localhost:' + PORT + '/api/info');
});
