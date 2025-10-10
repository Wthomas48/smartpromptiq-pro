const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

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

  // Validate client fingerprint format - accept v1:<hex> or legacy versions
  const isValidClientFp = clientFingerprint && /^v[0-9]+:[a-f0-9]{8,}$/i.test(clientFingerprint);
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
    req.context.fingerprint = null;
    if (clientFingerprint) {
      console.log('⚠️ Invalid client fingerprint format:', clientFingerprint);
    } else {
      console.log('⚠️ No client fingerprint provided');
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

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'User-Agent',
    'Accept-Language',
    'X-Requested-With',
    'X-Client-Type',
    'X-Timestamp',
    'x-client-type',
    'x-requested-with',
    'X-Device-Fingerprint'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// Additional manual CORS middleware for extra compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, Origin, Cache-Control, Pragma, User-Agent, Accept-Language, X-Requested-With, X-Client-Type, X-Timestamp, x-client-type, x-requested-with, X-Device-Fingerprint'
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

// Global fingerprint middleware - applied to all routes
app.use(processFingerprintHeader);

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
    const fp = req.context?.fingerprint || null;

    // Log fingerprint status for monitoring
    if (!fp) {
      console.warn('Register without usable fingerprint; issued new cookie');
    }

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password'
      });
    }

    // Simulate user creation (in real app, you'd save to database)
    const userId = Date.now();
    const token = `jwt-${userId}-${Date.now()}`;
    const fullName = `${firstName || 'User'} ${lastName || ''}`.trim();

    console.log('✅ User registration successful:', { email, fingerprint: !!fp });

    // Store fingerprint association for anti-abuse tracking
    // In production: db.users.create({ email, password, fingerprint: fp, ip: req.ip })

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
          registeredAt: new Date().toISOString()
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
app.get('/api/admin/stats', (req, res) => {
  try {
    console.log('Admin stats request');
    res.status(200).json({
      success: true,
      data: {
        totalUsers: 1250,
        activeUsersToday: 320,
        totalRevenue: 45000,
        pendingPayments: 15,
        systemStatus: 'operational'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const { limit } = req.query;
    console.log('Admin users request:', { limit });

    // Generate all users first
    const allUsers = Array.from({ length: parseInt(limit) || 10 }, (_, i) => ({
      id: i + 1,
      email: `user${i + 1}@example.com`,
      firstName: `User`,
      lastName: `${i + 1}`,
      role: i === 0 ? 'ADMIN' : 'USER',
      status: suspendedUserIds.has(i + 1) ? 'suspended' : 'active',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionTier: ['Free', 'Pro', 'Premium'][Math.floor(Math.random() * 3)],
      subscriptionStatus: Math.random() > 0.2 ? 'active' : 'expired',
      tokenBalance: Math.floor(Math.random() * 10000),
      totalSpent: Math.random() * 100,
      lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Filter out deleted users
    const users = allUsers.filter(user => !deletedUserIds.has(user.id));

    res.status(200).json({
      success: true,
      data: { users, total: users.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

app.get('/api/admin/payments', (req, res) => {
  try {
    const { limit } = req.query;
    console.log('Admin payments request:', { limit });

    const payments = Array.from({ length: parseInt(limit) || 10 }, (_, i) => ({
      id: `pay_${i + 1}`,
      userId: i + 1,
      amount: Math.floor(Math.random() * 100) + 10,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Pro subscription'
    }));

    res.status(200).json({
      success: true,
      data: { payments, total: 500 }
    });
  } catch (error) {
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
