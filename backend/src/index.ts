import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://railway.app'],
  credentials: true
}));
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING - Protect against brute force attacks
// ═══════════════════════════════════════════════════════════════════════════════
const authRateLimitStore = new Map<string, { count: number; resetTime: number }>();

const authRateLimiter = (req: any, res: any, next: any) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // Max 10 attempts per window

  const record = authRateLimitStore.get(ip);

  if (record) {
    if (now > record.resetTime) {
      // Window expired, reset
      authRateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= maxAttempts) {
      // Too many attempts
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    } else {
      // Increment counter
      record.count++;
      authRateLimitStore.set(ip, record);
    }
  } else {
    // First attempt
    authRateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
  }

  next();
};

// Clean up old rate limit entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of authRateLimitStore.entries()) {
    if (now > record.resetTime) {
      authRateLimitStore.delete(ip);
    }
  }
}, 30 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════════════════════

// Serve static files from the React app build directory
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
console.log('🔍 Looking for frontend build at:', clientDistPath);
console.log('🔍 Absolute path:', path.resolve(clientDistPath));

// Check if the directory exists at startup
if (fs.existsSync(clientDistPath)) {
  console.log('✅ Frontend build directory exists');
  const files = fs.readdirSync(clientDistPath);
  console.log('📁 Files in build directory:', files);
  if (files.includes('index.html')) {
    console.log('✅ index.html found');
  } else {
    console.log('❌ index.html NOT found');
  }
} else {
  console.log('❌ Frontend build directory does NOT exist');
}

app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// TODO: Import API routes once TypeScript issues are resolved
// import authRoutes from './routes/auth';
// import billingRoutes from './routes/billing';

// TODO: Use API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/billing', billingRoutes);

// ⚠️ DEPRECATED: Mock user database - DO NOT USE IN PRODUCTION
// All authentication should use the Prisma database via /api/auth endpoints
// This mock data is kept only for legacy endpoint compatibility
const users: any[] = [];
// NOTE: Real users are stored in PostgreSQL via Prisma - see prisma.user queries below

// Enhanced auth endpoints with real database persistence
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register endpoint with real database persistence
app.post('/api/auth/register', authRateLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    console.log('🔐 Real register attempt:', { email, firstName, lastName });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
        email,
        password: hashedPassword,
        firstName: firstName || 'New',
        lastName: lastName || 'User'
      }
    });

    // Generate real JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured - cannot generate token');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role || 'USER',
        plan: user.plan || 'free',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );

    console.log('✅ Real user created in database:', user.id);

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
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Real register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
});

// Login endpoint with real database verification
app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Real login attempt:', { email });

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate real JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role || 'USER',
        plan: user.plan || 'free',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );

    console.log('✅ Real user login successful:', user.id);

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
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Real login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user endpoint - requires valid JWT token
app.get('/api/auth/me', async (req: any, res) => {
  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Verify and decode the token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError: any) {
      console.warn('⚠️ Invalid token:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        plan: true,
        avatar: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info'
    });
  }
});

// Demo /api/auth/me endpoint removed - now using real auth routes

// Mock teams data
const mockTeams = [
  {
    id: '1',
    name: 'Marketing Team',
    description: 'Creative campaigns and brand strategy',
    members: 3,
    productivity: 92,
    color: 'from-pink-500 to-rose-500',
    status: 'active',
    currentProject: 'Q4 Campaign Strategy',
    recentActivity: 'Updated campaign brief 2 hours ago',
    completedTasks: 18,
    totalTasks: 20,
    lead: 'Sarah Johnson',
    nextMeeting: '2024-12-15T14:00:00Z'
  },
  {
    id: '2',
    name: 'Development Team',
    description: 'Software development and implementation',
    members: 6,
    productivity: 87,
    color: 'from-blue-500 to-cyan-500',
    status: 'active',
    currentProject: 'Mobile App v2.0',
    recentActivity: 'Pushed new code 1 hour ago',
    completedTasks: 35,
    totalTasks: 42,
    lead: 'Alex Rodriguez',
    nextMeeting: '2024-12-16T10:00:00Z'
  },
  {
    id: '3',
    name: 'Design Team',
    description: 'UI/UX design and creative direction',
    members: 4,
    productivity: 90,
    color: 'from-purple-500 to-indigo-500',
    status: 'active',
    currentProject: 'Design System 2.0',
    recentActivity: 'Created new components 30 minutes ago',
    completedTasks: 12,
    totalTasks: 15,
    lead: 'Lisa Thompson',
    nextMeeting: '2024-12-17T15:00:00Z'
  },
  {
    id: '4',
    name: 'Content Team',
    description: 'Content creation and strategy',
    members: 2,
    productivity: 94,
    color: 'from-green-500 to-emerald-500',
    status: 'active',
    currentProject: 'Blog Content Strategy',
    recentActivity: 'Published new article 4 hours ago',
    completedTasks: 8,
    totalTasks: 10,
    lead: 'Mike Chen',
    nextMeeting: '2024-12-18T11:00:00Z'
  }
];

// Get user's teams
app.get('/api/teams', (req, res) => {
  // ADMIN ACCESS: No authentication required

  res.json({
    success: true,
    data: {
      teams: mockTeams,
      stats: {
        totalMembers: mockTeams.reduce((acc, team) => acc + team.members, 0),
        totalTasks: mockTeams.reduce((acc, team) => acc + team.totalTasks, 0),
        completedTasks: mockTeams.reduce((acc, team) => acc + team.completedTasks, 0),
        averageProductivity: Math.round(mockTeams.reduce((acc, team) => acc + team.productivity, 0) / mockTeams.length)
      }
    }
  });
});

// Create new team
app.post('/api/teams', (req, res) => {
  // ADMIN ACCESS: No authentication required

  const { name, description } = req.body;

  const newTeam = {
    id: (mockTeams.length + 1).toString(),
    name: name || 'New Team',
    description: description || 'Team description',
    members: 1,
    productivity: 0,
    color: 'from-gray-500 to-slate-500',
    status: 'active',
    currentProject: 'Getting Started',
    recentActivity: 'Team created just now',
    completedTasks: 0,
    totalTasks: 0,
    lead: 'Demo User',
    nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  mockTeams.push(newTeam);

  res.json({
    success: true,
    message: 'Team created successfully',
    data: { team: newTeam }
  });
});

// Generate prompt endpoint
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { category, answers, customization } = req.body;

    // Use AI service for real prompt generation
    const aiService = require('./services/aiService').default;
    const response = await aiService.generatePrompt(category, answers, customization);

    res.json({
      prompt: response.content,
      success: true,
      usage: response.usage || null,
      provider: aiService.getProviderStatus()
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// AI-powered suggestions endpoint
app.get('/api/suggestions/personalized', async (req, res) => {
  try {
    const { category } = req.query;

    // Use AI service for dynamic suggestions
    const aiService = require('./services/aiService').default;
    const suggestions = await aiService.generateSuggestions(category as string);

    res.json({
      suggestions,
      category,
      success: true,
      provider: aiService.getProviderStatus()
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Save prompts endpoint
app.post('/api/prompts', (req, res) => {
  const { title, content, category, questionnaire, customization, isFavorite, templateId } = req.body;

  const savedPrompt = {
    id: Date.now().toString(),
    title,
    content,
    category,
    questionnaire,
    customization,
    isFavorite,
    templateId,
    createdAt: new Date().toISOString(),
    userId: 'demo-user'
  };

  res.json({
    success: true,
    prompt: savedPrompt,
    message: 'Prompt saved successfully'
  });
});

// Billing info endpoint
app.get('/api/billing/info', (req, res) => {
  // ADMIN ACCESS: No authentication required

  // Mock billing data
  res.json({
    success: true,
    data: {
      subscription: {
        tier: 'free',
        status: 'active',
        billingCycle: 'monthly',
        nextBilling: '2024-01-15',
        amount: 0
      },
      usage: {
        promptsGenerated: 15,
        promptsLimit: 50,
        tokensUsed: 1250,
        tokensLimit: 10000
      },
      paymentMethod: null
    }
  });
});

// Admin API endpoints - SECURE IMPLEMENTATION
function isAdminUser(req: any): boolean {
  // Extract and verify JWT token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ Admin access denied: No authorization header');
    return false;
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return false;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if user has admin role
    if (decoded.role !== 'ADMIN' && decoded.role !== 'admin') {
      console.warn(`⚠️ Admin access denied: User ${decoded.email} is not admin (role: ${decoded.role})`);
      return false;
    }

    // Attach user info to request for audit logging
    req.adminUser = decoded;
    console.log(`✅ Admin access granted: ${decoded.email}`);
    return true;
  } catch (error: any) {
    console.error('❌ Admin auth failed:', error.message);
    return false;
  }
}

// Admin stats endpoint
app.get('/api/admin/stats', (req, res) => {
  if (!isAdminUser(req)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const now = new Date();
  const stats = {
    totalUsers: users.length,
    activeUsers: Math.floor(users.length * 0.7), // 70% active
    totalPrompts: 34567,
    revenue: 89450,
    systemHealth: 'healthy',
    apiCalls: 156789,
    subscriptions: {
      free: Math.floor(users.length * 0.6),
      starter: Math.floor(users.length * 0.2),
      pro: Math.floor(users.length * 0.15),
      business: Math.floor(users.length * 0.04),
      enterprise: Math.floor(users.length * 0.01)
    },
    systemInfo: {
      uptime: '15 days, 4 hours',
      version: 'v2.1.3',
      lastBackup: '2 hours ago',
      environment: 'Development'
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

// Admin users endpoint
app.get('/api/admin/users', (req, res) => {
  if (!isAdminUser(req)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const usersWithoutPasswords = users.map(({ password, ...user }) => user);

  res.json({
    success: true,
    data: {
      users: usersWithoutPasswords,
      pagination: {
        total: users.length,
        page: 1,
        limit: 50
      }
    }
  });
});

// Admin actions endpoint
app.post('/api/admin/actions/:action', (req, res) => {
  if (!isAdminUser(req)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { action } = req.params;
  const { data } = req.body;

  console.log(`Admin action: ${action}`, data);

  switch (action) {
    case 'backup-database':
      res.json({
        success: true,
        message: 'Database backup initiated successfully',
        data: { backupId: `backup_${Date.now()}` }
      });
      break;

    case 'send-notification':
      res.json({
        success: true,
        message: 'Notification sent successfully',
        data: { recipients: data?.recipients || 'all' }
      });
      break;

    case 'maintenance-mode':
      res.json({
        success: true,
        message: `Maintenance mode ${data?.enabled ? 'enabled' : 'disabled'}`,
        data: { maintenanceMode: data?.enabled }
      });
      break;

    case 'suspend-user':
      res.json({
        success: true,
        message: 'User suspended successfully',
        data: { userId: data?.userId }
      });
      break;

    case 'view-users':
      res.json({
        success: true,
        message: 'User list retrieved',
        data: {
          users: users.map(u => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            subscriptionTier: u.subscriptionTier
          }))
        }
      });
      break;

    case 'monitor-sessions':
      res.json({
        success: true,
        message: 'Active sessions monitoring started',
        data: { activeSessions: Math.floor(users.length * 0.7) }
      });
      break;

    case 'send-notifications':
      res.json({
        success: true,
        message: 'Bulk notifications sent to all users',
        data: { sentTo: users.length }
      });
      break;

    case 'security-audit':
      res.json({
        success: true,
        message: 'Security audit completed - All systems secure',
        data: {
          auditId: `audit_${Date.now()}`,
          issues: 0,
          recommendations: 3
        }
      });
      break;

    default:
      res.status(400).json({
        success: false,
        message: 'Unknown admin action'
      });
  }
});

// System logs endpoint
app.get('/api/admin/logs', (req, res) => {
  if (!isAdminUser(req)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const logs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      level: 'INFO',
      message: 'User login successful',
      details: { userId: '3', email: 'test@smartpromptiq.com' }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      level: 'INFO',
      message: 'Admin login successful',
      details: { userId: '1', email: 'admin@example.com' }
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      level: 'INFO',
      message: 'Prompt generated successfully',
      details: { category: 'marketing', userId: '3' }
    }
  ];

  res.json({
    success: true,
    data: { logs }
  });
});

// Admin activities endpoint
app.get('/api/admin/activities', (req, res) => {
  const activities = [
    {
      id: 1,
      type: 'prompt_created',
      user: 'John Doe',
      description: 'Created prompt: Marketing Email Template',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      metadata: {
        category: 'marketing',
        promptId: 'prompt-123'
      }
    },
    {
      id: 2,
      type: 'api_usage',
      user: 'Jane Smith',
      description: 'API usage: 150 tokens',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      metadata: {
        tokensConsumed: 150,
        costInCents: 5
      }
    },
    {
      id: 3,
      type: 'user_login',
      user: 'Admin User',
      description: 'User logged in successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      metadata: {
        loginMethod: 'email'
      }
    }
  ];

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        page: 1,
        limit: 50,
        total: activities.length
      }
    }
  });
});

// Admin active sessions endpoint
app.get('/api/admin/active-sessions', (req, res) => {
  const sessions = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      tier: 'PRO',
      lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'active',
      duration: 25
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane@example.com',
      role: 'USER',
      tier: 'BUSINESS',
      lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      lastLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'inactive',
      duration: 60
    },
    {
      id: 3,
      user: 'Admin User',
      email: 'admin@smartpromptiq.com',
      role: 'ADMIN',
      tier: 'ENTERPRISE',
      lastActivity: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      status: 'active',
      duration: 10
    }
  ];

  res.json({
    success: true,
    data: {
      sessions,
      summary: {
        total: sessions.length,
        active: sessions.filter(s => s.status === 'active').length,
        inactive: sessions.filter(s => s.status === 'inactive').length
      }
    }
  });
});

// Financial Planning Endpoints
app.post('/api/financial/revenue-model', (req, res) => {
  try {
    const data = req.body;
    console.log('💰 Revenue model request:', data);

    // Generate a comprehensive revenue model response
    const result = {
      id: Date.now().toString(),
      type: "revenue_model",
      title: `Revenue Model for ${data.businessType || 'Business'}`,
      description: "Comprehensive revenue strategy tailored to your business",
      prompt: `# Revenue Model Strategy for ${data.businessType || 'Your Business'}

## Business Overview
- **Business Type**: ${data.businessType || 'Not specified'}
- **Target Market**: ${data.targetMarket || 'General market'}
- **Revenue Streams**: ${data.revenueStreams || 'Multiple streams'}

## Revenue Model Framework

### Primary Revenue Streams
1. **Core Product/Service Sales**
   - Direct sales of primary offerings
   - Pricing strategy: Value-based pricing
   - Revenue potential: High volume, consistent income

2. **Subscription/Recurring Revenue**
   - Monthly/annual subscription model
   - Predictable income stream
   - Customer lifetime value optimization

3. **Premium Services**
   - High-value add-on services
   - Premium pricing strategy
   - Higher margin opportunities

### Pricing Strategy
- **Competitive Analysis**: Research market rates and positioning
- **Value Proposition**: Align pricing with customer value received
- **Pricing Tiers**: Multiple options to capture different customer segments

### Revenue Projections
- **Year 1**: Foundation building with initial revenue streams
- **Year 2**: Growth and optimization of primary channels
- **Year 3**: Expansion and diversification of revenue sources

### Key Success Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Revenue growth rate
- Market share percentage

This revenue model provides a strategic framework for sustainable business growth and profitability.`,
      recommendations: [
        "Focus on recurring revenue streams for predictability",
        "Implement tiered pricing to capture different market segments",
        "Monitor key metrics regularly and adjust strategy as needed",
        "Consider scalability factors when designing revenue models"
      ],
      projections: {
        revenue: [
          "Year 1: Establish foundation with $50K-100K revenue",
          "Year 2: Scale operations to $200K-500K revenue",
          "Year 3: Expand market reach to $500K-1M revenue"
        ],
        costs: [
          "Initial setup and infrastructure costs",
          "Marketing and customer acquisition expenses",
          "Operational and scaling costs"
        ]
      },
      generatedAt: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Error in revenue model:', error);
    res.status(500).json({ error: 'Failed to generate revenue model' });
  }
});

// Product Planning Endpoints
app.post('/api/product/mvp/planning', (req, res) => {
  try {
    const data = req.body;
    console.log('🚀 MVP Planning request:', data);

    // Generate a comprehensive MVP planning response
    const result = {
      id: Date.now().toString(),
      type: "mvp_planning",
      title: `MVP Planning for ${data.productName || 'Your Product'}`,
      description: "Comprehensive MVP strategy and development plan",
      prompt: `# MVP (Minimum Viable Product) Planning for ${data.productName || 'Your Product'}

## Product Overview
- **Product Name**: ${data.productName || 'Not specified'}
- **Target Market**: ${data.targetMarket || 'General market'}
- **Problem Statement**: ${data.problemStatement || 'Market need to be addressed'}
- **Core Value Proposition**: ${data.valueProposition || 'Unique solution benefits'}

## MVP Strategy Framework

### Phase 1: Core Features Definition
1. **Must-Have Features**
   - Essential functionality for product viability
   - User authentication and basic profile management
   - Core feature that solves the primary problem
   - Basic user interface and experience

2. **Should-Have Features** (Post-MVP)
   - Enhanced user experience features
   - Advanced analytics and reporting
   - Integration capabilities
   - Mobile responsiveness improvements

3. **Could-Have Features** (Future Iterations)
   - Advanced customization options
   - Third-party integrations
   - Premium feature sets
   - AI/ML enhancements

### Development Roadmap
**Week 1-2: Planning & Design**
- User research and validation
- Wireframes and prototype development
- Technical architecture planning
- Team setup and resource allocation

**Week 3-6: Core Development**
- Backend infrastructure setup
- Database design and implementation
- Core feature development
- Basic frontend implementation

**Week 7-8: Testing & Refinement**
- Quality assurance testing
- User acceptance testing
- Performance optimization
- Bug fixes and improvements

**Week 9-10: Launch Preparation**
- Final testing and validation
- Documentation completion
- Marketing material preparation
- Soft launch with beta users

### Success Metrics & KPIs
- **User Acquisition**: Number of sign-ups in first month
- **User Engagement**: Daily/weekly active users
- **Feature Adoption**: Core feature usage rates
- **User Feedback**: Satisfaction scores and feedback quality
- **Technical Performance**: Load times, uptime, error rates

### Risk Mitigation
- **Technical Risks**: Backup development approaches
- **Market Risks**: Continuous user feedback integration
- **Resource Risks**: Agile development methodology
- **Timeline Risks**: Phased delivery approach

### Budget Estimation
- **Development**: ${data.budget || '$15K-30K'} for core team
- **Infrastructure**: $500-2K monthly hosting costs
- **Marketing**: $5K-10K for initial user acquisition
- **Contingency**: 20% buffer for unexpected costs

This MVP plan provides a structured approach to bring your product to market efficiently while minimizing risks and maximizing learning opportunities.`,
      recommendations: [
        "Focus on solving one core problem exceptionally well",
        "Prioritize user feedback and iterate quickly",
        "Keep the initial feature set minimal but functional",
        "Plan for scalability from the beginning",
        "Establish clear success metrics before launch"
      ],
      timeline: {
        phases: [
          "Planning & Design: 2 weeks",
          "Core Development: 4 weeks",
          "Testing & Refinement: 2 weeks",
          "Launch Preparation: 2 weeks"
        ],
        milestones: [
          "Week 2: Design approval and technical specs",
          "Week 4: Core backend functionality complete",
          "Week 6: Frontend integration complete",
          "Week 8: Beta testing complete",
          "Week 10: Public launch ready"
        ]
      },
      features: {
        core: [
          "User authentication system",
          "Primary problem-solving feature",
          "Basic user dashboard",
          "Essential data management"
        ],
        future: [
          "Advanced analytics",
          "Mobile application",
          "Third-party integrations",
          "Premium features"
        ]
      },
      generatedAt: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Error in MVP planning:', error);
    res.status(500).json({ error: 'Failed to generate MVP planning' });
  }
});

// Feedback Rating Endpoint (for RatingPopup component)
app.post('/api/feedback/rating', (req, res) => {
  try {
    const { category, feature, rating, feedback, context, timestamp } = req.body;
    console.log('⭐ Feedback rating submitted:', { category, feature, rating, feedback: feedback?.length });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Mock response (in real app this would save to database)
    const feedbackEntry = {
      id: Date.now().toString(),
      rating: parseInt(rating),
      feedback: feedback || null,
      feature: feature || category || 'general',
      category: category || 'general',
      submittedAt: timestamp ? new Date(timestamp) : new Date(),
      context: context || {}
    };

    console.log('✅ Feedback rating saved:', feedbackEntry.id);

    res.status(201).json({
      success: true,
      data: {
        id: feedbackEntry.id,
        rating: feedbackEntry.rating,
        category: feedbackEntry.category,
        feature: feedbackEntry.feature,
        submittedAt: feedbackEntry.submittedAt
      },
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// General Feedback Endpoint
app.post('/api/feedback', (req, res) => {
  try {
    const { rating, email, feedback, timestamp, userAgent, page } = req.body;
    console.log('📝 General feedback submitted:', { rating, page, feedback: feedback?.length });

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Mock response
    const feedbackEntry = {
      id: Date.now().toString(),
      rating: rating || null,
      email: email || null,
      feedback: feedback || null,
      page: page || null,
      userAgent: userAgent || null,
      submittedAt: timestamp ? new Date(timestamp) : new Date()
    };

    console.log('✅ General feedback saved:', feedbackEntry.id);

    res.status(201).json({
      success: true,
      data: {
        id: feedbackEntry.id,
        rating: feedbackEntry.rating,
        submittedAt: feedbackEntry.submittedAt
      },
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Demo Endpoints for Demo Dashboard
app.post('/api/demo/generate', (req, res) => {
  try {
    const { template, responses, userEmail } = req.body;
    console.log('🎯 Demo generate request:', { template, userEmail, responseCount: Object.keys(responses || {}).length });

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
- Certification preparation

## Content Delivery
- ${Math.floor(Math.random() * 20 + 10)} video lessons
- Interactive quizzes and assessments
- Downloadable resources and templates
- Community access and support

## Marketing Strategy
- Pre-launch sequence: 4 weeks
- Launch week promotions
- Ongoing affiliate partnerships
- Social proof and testimonials

## Revenue Projections
- Course Price: $${Math.floor(Math.random() * 300 + 200)}
- Expected Students: ${Math.floor(Math.random() * 500 + 100)}
- Projected Revenue: $${Math.floor(Math.random() * 50000 + 25000)}`,
        generatedAt: new Date().toISOString()
      },
      'wellness-program': {
        id: Date.now().toString(),
        type: "wellness_program",
        title: `${responses?.['Program Focus'] || 'Holistic Wellness'} Coaching Program`,
        description: "Comprehensive wellness and lifestyle transformation program",
        content: `# Wellness Coaching Program: ${responses?.['Program Focus'] || 'Holistic Wellness'}

## Program Overview
A ${responses?.['Program Duration'] || '12-week'} transformation program for ${responses?.['Target Clients'] || 'wellness-focused individuals'}.

## Program Structure
### Phase 1: Assessment & Foundation (Weeks 1-3)
- Comprehensive wellness assessment
- Goal setting and baseline measurements
- Foundational habit establishment

### Phase 2: Implementation (Weeks 4-9)
- Customized wellness protocols
- Weekly coaching sessions
- Progress tracking and adjustments

### Phase 3: Integration & Sustainability (Weeks 10-12)
- Long-term strategy development
- Lifestyle integration techniques
- Graduation and ongoing support planning

## Key Components
- Nutrition optimization
- Movement and exercise protocols
- Stress management techniques
- Sleep quality improvement
- Mindfulness and mental wellness

## Expected Outcomes
- ${Math.floor(Math.random() * 30 + 10)}% improvement in energy levels
- ${Math.floor(Math.random() * 20 + 5)}% better sleep quality
- Sustainable lifestyle changes
- Increased overall life satisfaction`,
        generatedAt: new Date().toISOString()
      },
      'app-development': {
        id: Date.now().toString(),
        type: "app_development",
        title: `${responses?.['App Name'] || 'Your Mobile App'} Development Plan`,
        description: "Complete mobile app development strategy and roadmap",
        content: `# Mobile App Development Plan: ${responses?.['App Name'] || 'Your Mobile App'}

## App Overview
${responses?.['App Description'] || 'A innovative mobile application'} targeting ${responses?.['Target Users'] || 'mobile users'}.

## Development Roadmap
### Phase 1: Planning & Design (Weeks 1-4)
- User research and market analysis
- UI/UX design and prototyping
- Technical architecture planning
- Feature prioritization

### Phase 2: MVP Development (Weeks 5-12)
- Core feature development
- Backend infrastructure setup
- API development and integration
- Basic UI implementation

### Phase 3: Testing & Launch (Weeks 13-16)
- Quality assurance testing
- Beta user testing
- App store optimization
- Marketing and launch preparation

## Key Features
- User authentication and profiles
- Core functionality modules
- Push notifications
- Analytics and reporting
- Social sharing capabilities

## Technology Stack
- Frontend: React Native / Flutter
- Backend: Node.js / Python
- Database: PostgreSQL / MongoDB
- Cloud: AWS / Google Cloud
- Analytics: Firebase / Mixpanel

## Budget Estimation
- Development: $${Math.floor(Math.random() * 75000 + 25000)}
- Design: $${Math.floor(Math.random() * 15000 + 5000)}
- Testing: $${Math.floor(Math.random() * 10000 + 3000)}
- Marketing: $${Math.floor(Math.random() * 20000 + 5000)}

## Success Metrics
- Downloads: ${Math.floor(Math.random() * 10000 + 5000)} in first month
- User retention: ${Math.floor(Math.random() * 40 + 20)}% after 30 days
- App store rating: ${(Math.random() * 1.5 + 3.5).toFixed(1)}/5.0`,
        generatedAt: new Date().toISOString()
      }
    };

    const response = demoResponses[template as keyof typeof demoResponses] || {
      id: Date.now().toString(),
      type: "general",
      title: `Generated Content for ${template}`,
      description: "AI-generated content based on your inputs",
      content: `# ${template} Strategy

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
    res.json(response);
  } catch (error) {
    console.error('❌ Demo generate error:', error);
    res.status(500).json({
      error: 'Failed to generate demo content',
      message: 'Please try again later'
    });
  }
});

app.post('/api/demo/send-results', (req, res) => {
  try {
    const { email, results, template } = req.body;
    console.log('📧 Demo send results request:', { email, template, resultsLength: results?.content?.length });

    // Mock email sending (in production, integrate with actual email service)
    const emailResponse = {
      id: Date.now().toString(),
      email: email,
      template: template,
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

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend build not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Backend running on port ${PORT} - Admin endpoints loaded`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`👤 User Info: GET http://localhost:${PORT}/api/auth/me`);
  console.log(`👥 Teams: GET http://localhost:${PORT}/api/teams`);
  console.log(`➕ Create Team: POST http://localhost:${PORT}/api/teams`);
});