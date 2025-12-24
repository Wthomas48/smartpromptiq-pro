// Simple demo server without Redis dependency
const express = require('express');
const cors = require('cors');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const app = express();

// ✅ LIVE DATA STORAGE for admin dashboard
const liveData = {
  // Track active sessions
  activeSessions: new Map(), // sessionId -> { userId, email, loginTime, lastActivity, ip }

  // Track user registrations
  registrations: [], // { id, email, firstName, lastName, registrationTime, ip }

  // Track system logs
  systemLogs: [], // { timestamp, level, method, url, ip, userAgent, responseTime, error }

  // Track demo generations
  demoGenerations: [], // { timestamp, templateType, ip, success, processingTime }

  // Track API requests
  apiRequests: [], // { timestamp, method, url, ip, userAgent, responseTime, status }

  // System stats
  stats: {
    startTime: Date.now(),
    totalRequests: 0,
    totalErrors: 0,
    totalDemoGenerations: 0,
    totalRegistrations: 0
  }
};

// Helper function to add log entry
const addLog = (level, method, url, ip, userAgent, responseTime, error = null) => {
  const logEntry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    level,
    method,
    url,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown',
    responseTime: responseTime || 0,
    error: error ? error.message || error : null
  };

  liveData.systemLogs.unshift(logEntry); // Add to beginning

  // Keep only last 500 logs to prevent memory issues
  if (liveData.systemLogs.length > 500) {
    liveData.systemLogs = liveData.systemLogs.slice(0, 500);
  }

  // Update stats
  liveData.stats.totalRequests++;
  if (error) liveData.stats.totalErrors++;
};

// Enhanced request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  console.log(`📥 ${req.method} ${req.url}`, req.headers.authorization ? '[AUTH]' : '[NO AUTH]');

  // Track the request
  liveData.apiRequests.unshift({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    authenticated: !!req.headers.authorization
  });

  // Keep only last 200 API requests
  if (liveData.apiRequests.length > 200) {
    liveData.apiRequests = liveData.apiRequests.slice(0, 200);
  }

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;

    // Add log entry
    addLog(
      res.statusCode >= 400 ? 'ERROR' : 'INFO',
      req.method,
      req.url,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      responseTime,
      res.statusCode >= 400 ? { message: `HTTP ${res.statusCode}` } : null
    );

    originalEnd.apply(this, args);
  };

  next();
};

// Enable CORS for frontend - Port 5173 priority with all headers
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5178', 'http://localhost:5179'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'X-Requested-With'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

app.use(express.json());

// ✅ ENHANCED REQUEST LOGGING for admin dashboard
app.use(requestLogger);

// In-memory rate limiting (no Redis required)
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, error: message },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  validate: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Rate limiters for different endpoints - Relaxed for development
const demoLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute (reduced from 15 minutes for dev testing)
  1000, // 1000 demo generations per minute per IP (increased from 50 for dev testing)
  'Too many demo generation requests. Please wait 1 minute before trying again.'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 auth attempts per 15 minutes per IP
  'Too many authentication attempts. Please wait 15 minutes before trying again.'
);

// Simple demo generation logic (same as in queue service but direct)
const generateDemoLogic = (demoData) => {
  const { templateType, userResponses } = demoData;

  const templates = {
    'startup-pitch': {
      title: `${userResponses.businessName || 'Innovative Startup'}: Professional Pitch Deck`,
      content: `# ${userResponses.businessName || 'Innovative Startup'} Pitch Deck

## Executive Summary
${userResponses.businessName || 'Our startup'} is revolutionizing the ${userResponses.industry || 'technology'} industry with an innovative approach to solving critical market challenges.

## The Problem
${userResponses.problem || 'Current market inefficiencies cost businesses millions annually while consumers struggle with outdated solutions.'}

## Our Solution
${userResponses.solution || 'Our AI-driven platform provides real-time analytics and seamless integration with existing workflows.'}

Key Features:
• Advanced ${userResponses.industry || 'technology'} integration
• Real-time data processing and analytics
• Scalable architecture for ${userResponses.targetMarket || 'businesses of all sizes'}
• User-friendly interface designed for efficiency

## Market Opportunity
• Target Market: ${userResponses.targetMarket || 'Small to medium businesses'}
• Industry: ${userResponses.industry || 'Technology'} sector
• Revenue Model: ${userResponses.revenueModel || 'SaaS Subscription'}
• Total Addressable Market: $5B+ by 2025

## Business Model
Revenue Strategy: ${userResponses.revenueModel || 'SaaS Subscription'}
• Starter Plan: $49/month
• Professional Plan: $149/month
• Enterprise Plan: $349/month

## Financial Projections
Year 1: $500K ARR with 200 customers
Year 2: $2.5M ARR with 800 customers
Year 3: $8M ARR with 2,000 customers

## Funding Request
Seeking $2M Series A to accelerate growth and market expansion.

*Generated by SmartPromptIQ's advanced AI system*`
    },

    'social-campaign': {
      title: `${userResponses.productService || 'Product'} Social Media Campaign Strategy`,
      content: `# Social Media Campaign: ${userResponses.productService || 'Product Launch'}

## Campaign Overview
A ${userResponses.duration || '6-week'} strategic social media campaign targeting ${userResponses.targetAudience || 'our ideal customers'} with a focus on ${userResponses.campaignGoal || 'brand awareness and engagement'}.

## Target Audience Analysis
Primary Audience: ${userResponses.targetAudience || 'Young professionals aged 25-35'}
Demographics: Tech-savvy, value-conscious consumers
Platforms: ${userResponses.platforms || 'Instagram, Facebook, TikTok'}

## Campaign Strategy
Goal: ${userResponses.campaignGoal || 'Increase brand awareness and drive conversions'}
Budget: ${userResponses.budget || '$5,000'}
Duration: ${userResponses.duration || '6 weeks'}

## Content Strategy Framework
### Week 1-2: Awareness Building
• Educational content about ${userResponses.productService || 'our product'}
• Behind-the-scenes content
• Industry insights and tips
• User-generated content campaigns

### Week 3-4: Engagement & Community
• Interactive polls and Q&A sessions
• Live streaming events
• Community challenges
• Influencer collaborations

### Week 5-6: Conversion Focus
• Product demonstrations
• Customer testimonials
• Limited-time offers
• Retargeting campaigns

## Platform-Specific Tactics
**Instagram:** Visual storytelling, Stories, Reels, and Shopping features
**Facebook:** Community building, detailed targeting, and video content
**TikTok:** Trend-based content, viral challenges, and authentic messaging

## Budget Allocation
• Content Creation: 30%
• Paid Advertising: 50%
• Influencer Partnerships: 15%
• Tools & Analytics: 5%

## Success Metrics
• Reach: 250K+ unique users
• Engagement Rate: 4.5%+
• Website Traffic: 30% increase
• Conversions: 500+ leads generated
• ROI Target: 300%+

*Powered by SmartPromptIQ's marketing AI platform*`
    },

    'financial-planner': {
      title: `Comprehensive Financial Plan for ${userResponses.age || '30-40'} Age Group`,
      content: `# Personal Financial Roadmap: ${userResponses.timeline || '5-Year'} Strategy

## Financial Profile Assessment
Age Group: ${userResponses.age || '30-40'}
Income Level: ${userResponses.income || '$75,000 annually'}
Financial Goals: ${userResponses.goals || 'Build emergency fund, save for home, plan for retirement'}
Planning Timeline: ${userResponses.timeline || '5-10 years'}

## Strategic Financial Framework

### Phase 1: Foundation Building (Months 1-12)
**Emergency Fund Development**
• Target: 6 months of expenses
• Monthly allocation: 10% of income
• Account type: High-yield savings (current rate: 4.5% APY)

**Debt Management Strategy**
• High-interest debt elimination priority
• Debt consolidation evaluation
• Credit score optimization plan

### Phase 2: Growth & Investment (Years 2-3)
**Investment Portfolio Construction**
• 401(k) contributions: Maximum employer match
• Roth IRA: Annual maximum contribution
• Taxable investment account: Diversified portfolio

**Asset Allocation Strategy**
• Age Group ${userResponses.age || '30-40'}: Aggressive growth portfolio
• 70% Stocks (domestic and international)
• 25% Bonds (government and corporate)
• 5% Alternative investments (REITs, commodities)

### Phase 3: Acceleration & Optimization (Years 4-5+)
**Advanced Wealth Building**
• Increase savings rate to 20%+ of income
• Tax optimization strategies
• Real estate investment consideration
• Estate planning implementation

## Investment Recommendations
**Core Holdings:**
• Total Stock Market Index Fund (40%)
• International Stock Index Fund (20%)
• Bond Market Index Fund (25%)
• REITs and Growth Stocks (15%)

## Goal Achievement Timeline
**Year 1 Targets:**
• Emergency fund: Complete
• Debt reduction: 50%
• Investment account: Established

**${userResponses.timeline || '5-Year'} Targets:**
• Net worth: Significant increase
• Investment portfolio: Well-diversified
• Financial independence: On track

## Risk Management
• Life insurance: 10x annual income
• Disability insurance: 60-70% income replacement
• Health insurance: Comprehensive coverage
• Estate planning: Will and beneficiaries updated

This comprehensive plan provides a roadmap to achieve ${userResponses.goals || 'your financial goals'} within the specified ${userResponses.timeline || '5-10 year'} timeframe.

*Created using SmartPromptIQ's financial planning AI*`
    },

    'course-creator': {
      title: `${userResponses.topic || 'Digital Marketing'} Online Course`,
      content: `# Course: ${userResponses.topic || 'Digital Marketing'} Mastery

## Course Overview
A comprehensive ${userResponses.duration || '8-week'} program designed for ${userResponses.audience || 'professionals looking to master digital marketing'}.

## Learning Objectives
By the end of this course, students will be able to:
• Master core ${userResponses.topic || 'digital marketing'} principles
• Implement practical strategies in real-world scenarios
• Create and execute effective campaigns
• Measure and analyze performance metrics

## Course Structure

### Module 1: Foundations (Week 1)
**Learning Objectives**: Understand fundamentals and set goals
• Introduction to ${userResponses.topic || 'Digital Marketing'}
• Industry best practices and trends
• Goal setting and strategy development
**Format**: ${userResponses.format || 'Video lessons, worksheets, live Q&A'}

### Module 2: Core Strategies (Week 2-3)
**Learning Objectives**: Develop strategic thinking
• Advanced techniques and methodologies
• Case studies and real-world examples
• Hands-on practice exercises

### Module 3: Implementation (Week 4-6)
**Learning Objectives**: Apply knowledge practically
• Project-based learning
• Tools and platform mastery
• Campaign development

### Module 4: Optimization & Scale (Week 7-8)
**Learning Objectives**: Refine and scale efforts
• Performance analysis
• Optimization strategies
• Scaling successful campaigns

## Assessment Methods
• Weekly practical assignments (40%)
• Mid-course project (30%)
• Final comprehensive project (30%)

## Resources Provided
• All video lessons with transcripts
• Downloadable templates and worksheets
• Private community access
• Monthly office hours for 6 months

## Course Investment
• Early Bird: $497 (limited time)
• Regular Price: $697
• Payment Plan: 3 payments of $249

*Developed using SmartPromptIQ's course creation AI*`
    },

    'wellness-coach': {
      title: `${userResponses.duration || '8-Week'} ${userResponses.focus || 'Wellness'} Program`,
      content: `# ${userResponses.focus || 'Wellness'} Mastery: ${userResponses.duration || '8-Week'} Transformation Program

## Program Overview
A comprehensive ${userResponses.duration || '8-week'} coaching program designed for ${userResponses.audience || 'busy professionals seeking wellness balance'}.

## Program Philosophy
"Transform your life through sustainable ${userResponses.focus || 'wellness'} practices that fit your lifestyle."

Our evidence-based approach combines ${userResponses.approach || 'practical strategies with mindful techniques'}.

## Week-by-Week Breakdown

### Week 1: Assessment & Foundation
**Theme: Understanding Your Current State**
• Personal ${userResponses.focus || 'wellness'} assessment
• Goal setting and vision creation
• Building sustainable habits
**Practice**: Daily mindfulness routine

### Week 2: Building Blocks
**Theme: Creating Strong Foundations**
• Core principles of ${userResponses.focus || 'wellness'}
• Practical implementation strategies
• Overcoming common obstacles

### Week 3-4: Implementation Phase
**Theme: Putting Knowledge into Action**
• Daily practice development
• Habit stacking techniques
• Progress tracking methods

### Week 5-6: Integration & Optimization
**Theme: Fine-tuning Your Approach**
• Personalizing your strategy
• Advanced techniques
• Troubleshooting challenges

### Week 7-8: Sustainability & Growth
**Theme: Long-term Success**
• Creating lasting change
• Building support systems
• Planning for continued growth

## Daily Practice Structure (20 minutes total)
### Morning Routine (8 minutes)
• 5-minute focused practice
• 3-minute intention setting

### Midday Check-in (7 minutes)
• 3 x 2-minute reset breaks
• 1-minute progress assessment

### Evening Reflection (5 minutes)
• 3-minute gratitude practice
• 2-minute planning for tomorrow

## Success Metrics
By program completion, participants typically experience:
• 40-60% improvement in target area
• 25% increase in overall well-being
• Sustainable long-term habits established

## Investment Options
### Self-Study Package: $297
• All program content
• Digital tools and resources
• Email support

### Guided Cohort: $697
• Weekly group coaching calls
• Personal check-ins
• Community access

### VIP 1:1 Coaching: $1,497
• Individual coaching sessions
• Personalized strategy
• Extended support

*Powered by SmartPromptIQ's wellness coaching AI*`
    },

    'app-developer': {
      title: `${userResponses.appType || 'Mobile App'} Development Strategy`,
      content: `# ${userResponses.appType || 'Mobile App'} Development Plan

## App Concept Overview
A comprehensive ${userResponses.platform || 'cross-platform'} application for ${userResponses.appType || 'mobile users'} featuring ${userResponses.features || 'core functionality and user engagement tools'}.

## Technical Specifications

### Platform Strategy
**${userResponses.platform || 'Cross-Platform'} Development**
• Single codebase efficiency
• Consistent user experience
• Cost-effective maintenance
• Faster time to market

### Core Architecture
**Frontend Framework:**
• React Native with TypeScript
• Redux for state management
• Native navigation components

**Backend Infrastructure:**
• Node.js with Express
• Cloud database solution
• RESTful API design
• Real-time synchronization

## Feature Development Roadmap

### Phase 1: MVP (Months 1-3)
**Core Features:**
${userResponses.features ? userResponses.features.split(',').map(f => `• ${f.trim()}`).join('\n') : '• User authentication\n• Core functionality\n• Basic UI/UX'}
• User onboarding flow
• Basic analytics

### Phase 2: Enhanced Features (Months 4-6)
**Advanced Functionality:**
• Real-time data synchronization
• Advanced user analytics
• Social integration features
• Push notification system
• Performance optimization

### Phase 3: Premium Features (Months 7+)
**Premium Subscription Features:**
• AI-powered recommendations
• Advanced customization options
• Premium analytics dashboard
• Third-party integrations
• Enhanced security features

## User Experience Design

### Design Principles
• Intuitive and user-friendly interface
• Consistent design system
• Accessibility compliance
• Performance optimization

### User Journey Mapping
1. **Onboarding**: Smooth setup and preference selection
2. **Daily Use**: Quick and efficient core interactions
3. **Engagement**: Features that drive regular usage
4. **Retention**: Value-driven experiences

## Development Timeline
**${userResponses.timeline || '6-9 months'} Development Schedule:**

**Months 1-3**: MVP Development
• Core functionality implementation
• Basic UI/UX design
• Testing and iteration

**Months 4-6**: Feature Enhancement
• Advanced features development
• User feedback integration
• Performance optimization

**Months 7+**: Launch and Scale
• App store deployment
• User acquisition
• Continuous improvement

## Monetization Strategy

### Revenue Model
**Freemium Approach:**
• Free tier with basic features
• Premium subscription for advanced functionality
• In-app purchases for additional content

### Pricing Structure
• Free: Basic features
• Premium: $9.99/month
• Annual: $99.99/year (2 months free)

## Success Metrics
• Downloads: 10K+ in first 6 months
• User Retention: 40%+ after 30 days
• App Store Rating: 4.5+ stars
• Premium Conversion: 5-8%

## Risk Assessment
• Technical challenges mitigation
• Market competition analysis
• User adoption strategies
• Revenue diversification

This development plan provides a comprehensive roadmap for successfully launching your ${userResponses.appType || 'mobile app'} within the ${userResponses.timeline || '6-9 month'} timeframe.

*Generated using SmartPromptIQ's app development AI*`
    }
  };

  const template = templates[templateType];
  if (!template) {
    return {
      title: 'AI-Generated Professional Content',
      content: `# AI-Generated Professional Content

This is a sample of the comprehensive, professional content that SmartPromptIQ creates using advanced AI technology.

*Generated by SmartPromptIQ's AI engine*`,
      generatedAt: new Date().toISOString(),
      isRealGeneration: false
    };
  }

  return {
    title: template.title,
    content: template.content,
    generatedAt: new Date().toISOString(),
    isRealGeneration: false,
    templateType
  };
};

// Demo generation endpoint - Rate limiting disabled for development
app.post('/api/demo/generate', async (req, res) => {
  const startTime = Date.now();
  let success = false;

  try {
    console.log('📥 Demo generation request:', req.body);

    const { templateType, template, userResponses = {}, generateRealPrompt = false } = req.body;

    // Support both templateType and template for backward compatibility
    const actualTemplateType = templateType || template;

    if (!actualTemplateType) {
      return res.status(400).json({
        success: false,
        error: 'Template type is required'
      });
    }

    // Generate demo content
    const result = generateDemoLogic({
      templateType: actualTemplateType,
      userResponses,
      generateRealPrompt
    });

    const processingTime = Date.now() - startTime;
    success = true;

    // ✅ TRACK LIVE DEMO GENERATION DATA
    const generationData = {
      timestamp: new Date().toISOString(),
      templateType: actualTemplateType,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: true,
      processingTime,
      resultLength: result.content ? result.content.length : 0
    };

    liveData.demoGenerations.unshift(generationData);
    liveData.stats.totalDemoGenerations++;

    // Keep only last 1000 generations to prevent memory issues
    if (liveData.demoGenerations.length > 1000) {
      liveData.demoGenerations = liveData.demoGenerations.slice(0, 1000);
    }

    console.log('✅ Demo generation tracked:', {
      templateType: actualTemplateType,
      processingTime,
      totalGenerations: liveData.stats.totalDemoGenerations
    });

    res.json({
      success: true,
      message: 'Demo content generated successfully',
      data: result,
      meta: {
        jobId: `demo_${Date.now()}`,
        requestId: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processingTime,
        queueStats: {
          waiting: 0,
          active: 0,
          completed: liveData.demoGenerations.filter(d => d.success).length,
          failed: liveData.demoGenerations.filter(d => !d.success).length,
          total: liveData.demoGenerations.length
        }
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;

    // ✅ TRACK FAILED DEMO GENERATION
    const generationData = {
      timestamp: new Date().toISOString(),
      templateType: req.body.templateType || req.body.template || 'unknown',
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: false,
      processingTime,
      error: error.message || 'Unknown error'
    };

    liveData.demoGenerations.unshift(generationData);

    console.error('❌ Demo generation error tracked:', {
      templateType: generationData.templateType,
      error: error.message,
      processingTime
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Demo generation failed',
      code: 'GENERATION_ERROR'
    });
  }
});

// ✅ LIVE QUEUE STATUS ENDPOINT - Real queue statistics
app.get('/api/demo/queue/status', (req, res) => {
  const completed = liveData.demoGenerations.filter(d => d.success).length;
  const failed = liveData.demoGenerations.filter(d => !d.success).length;
  const total = liveData.demoGenerations.length;

  res.json({
    success: true,
    data: {
      queueName: 'demo-generation',
      stats: {
        waiting: 0, // Direct processing, no queue
        active: 0, // Direct processing, no queue
        completed,
        failed,
        total
      },
      health: failed > 0 && (failed / total) > 0.1 ? 'warning' : 'healthy',
      timestamp: new Date().toISOString(),
      recentGenerations: liveData.demoGenerations.slice(0, 5).map(g => ({
        timestamp: g.timestamp,
        templateType: g.templateType,
        success: g.success,
        processingTime: g.processingTime
      }))
    }
  });
});

// Simple auth endpoints for demo purposes with rate limiting
app.post('/api/auth/register', authLimiter, (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  console.log('📥 Registration request:', { email, firstName, lastName });

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // For demo purposes, always succeed unless it's an existing test user
  if (email === 'test@example.com') {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Generate user data
  const userId = `user_${Date.now()}`;
  const userFirstName = firstName || email.split('@')[0];
  const userLastName = lastName || '';
  const token = `demo_token_${Date.now()}`;

  const demoUser = {
    id: userId,
    email,
    firstName: userFirstName,
    lastName: userLastName,
    role: 'USER'
  };

  // ✅ TRACK LIVE REGISTRATION DATA
  const registrationData = {
    id: userId,
    email,
    firstName: userFirstName,
    lastName: userLastName,
    registrationTime: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress || 'unknown'
  };

  liveData.registrations.unshift(registrationData);
  liveData.stats.totalRegistrations++;

  // Keep only last 1000 registrations to prevent memory issues
  if (liveData.registrations.length > 1000) {
    liveData.registrations = liveData.registrations.slice(0, 1000);
  }

  // ✅ CREATE ACTIVE SESSION
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  liveData.activeSessions.set(sessionId, {
    userId,
    email,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  });

  console.log('✅ Registration tracked:', { email, userId, totalRegistrations: liveData.registrations.length });

  res.json({
    success: true,
    data: {
      user: demoUser,
      token
    },
    message: 'Registration successful'
  });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Login request:', { email });

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // For demo purposes, accept any login except test@example.com
  if (email === 'test@example.com') {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate user data
  const userId = `user_${Date.now()}`;
  const userFirstName = email.split('@')[0];
  const token = `demo_token_${Date.now()}`;

  const demoUser = {
    id: userId,
    email,
    firstName: userFirstName,
    lastName: '',
    role: 'USER'
  };

  // ✅ CREATE ACTIVE SESSION FOR LOGIN
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  liveData.activeSessions.set(sessionId, {
    userId,
    email,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  });

  console.log('✅ Login session tracked:', { email, userId, activeSessions: liveData.activeSessions.size });

  res.json({
    success: true,
    data: {
      user: demoUser,
      token
    },
    message: 'Login successful'
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // For demo purposes, return a demo user for any valid token
  const demoUser = {
    id: 'demo_user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'USER'
  };

  res.json({
    success: true,
    data: {
      user: demoUser
    }
  });
});

// ✅ ADMIN LOGIN: Support admin authentication for universal access
app.post('/api/auth/admin/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Admin login request:', { email });

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // For demo purposes, accept admin login with demo credentials
  if (email === 'admin@smartpromptiq.com' && password === 'admin123') {
    const adminUser = {
      id: 'admin_user',
      email: 'admin@smartpromptiq.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      permissions: ['admin', 'manage_users', 'view_stats']
    };

    return res.json({
      success: true,
      data: {
        user: adminUser,
        token: `admin_token_${Date.now()}`
      },
      message: 'Admin login successful'
    });
  }

  // Invalid credentials
  res.status(401).json({
    success: false,
    message: 'Invalid admin credentials'
  });
});

// ✅ LIVE ADMIN STATS ENDPOINT - Real data tracking
app.get('/api/admin/stats', (req, res) => {
  const now = Date.now();
  const uptime = now - liveData.stats.startTime;

  // Count active sessions (sessions with activity in last 30 minutes)
  let activeSessions = 0;
  for (const [sessionId, session] of liveData.activeSessions) {
    if (now - new Date(session.lastActivity).getTime() < 30 * 60 * 1000) {
      activeSessions++;
    }
  }

  // Generate recent activity from actual data
  const recentActivity = [];
  const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);

  // Count recent demo generations
  const recentGenerations = liveData.demoGenerations.filter(g =>
    new Date(g.timestamp) > thirtyMinutesAgo
  ).length;

  if (recentGenerations > 0) {
    recentActivity.push({
      type: 'generation',
      count: recentGenerations,
      timestamp: new Date(now - 10 * 60 * 1000).toISOString()
    });
  }

  // Count recent registrations
  const recentRegistrations = liveData.registrations.filter(r =>
    new Date(r.registrationTime) > thirtyMinutesAgo
  ).length;

  if (recentRegistrations > 0) {
    recentActivity.push({
      type: 'registration',
      count: recentRegistrations,
      timestamp: new Date(now - 5 * 60 * 1000).toISOString()
    });
  }

  res.json({
    success: true,
    data: {
      totalUsers: liveData.registrations.length,
      totalGenerations: liveData.stats.totalDemoGenerations,
      activeUsers: activeSessions,
      systemHealth: 'healthy',
      uptime: Math.floor(uptime / 1000), // in seconds like process.uptime()
      memoryUsage: process.memoryUsage(),
      queueStats: {
        waiting: 0,
        active: 0,
        completed: liveData.demoGenerations.filter(d => d.success).length,
        failed: liveData.demoGenerations.filter(d => !d.success).length,
        total: liveData.demoGenerations.length
      },
      recentActivity: recentActivity.length > 0 ? recentActivity : [
        { type: 'system', count: 1, timestamp: new Date().toISOString() }
      ]
    }
  });
});

// ✅ LIVE ACTIVE SESSIONS ENDPOINT - Real session tracking
app.get('/api/admin/active-sessions', (req, res) => {
  const now = Date.now();
  const activeSessionData = [];

  // Convert active sessions to response format
  for (const [sessionId, session] of liveData.activeSessions) {
    const lastActivityTime = new Date(session.lastActivity).getTime();
    const isActive = now - lastActivityTime < 30 * 60 * 1000; // Active within 30 minutes

    if (isActive) {
      activeSessionData.push({
        id: sessionId,
        userId: session.userId,
        email: session.email,
        lastActivity: session.lastActivity,
        location: session.ip ? `${session.ip.slice(0, 8)}...` : 'Unknown',
        device: session.userAgent || 'Unknown Device',
        loginTime: session.loginTime,
        duration: Math.floor((now - new Date(session.loginTime).getTime()) / 1000) // seconds
      });
    }
  }

  // Sort by most recent activity
  activeSessionData.sort((a, b) =>
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  res.json({
    success: true,
    data: activeSessionData
  });
});

// ✅ LIVE RECENT REGISTRATIONS ENDPOINT - Real registration tracking
app.get('/api/admin/recent-registrations', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Filter registrations within the time range
  const recentRegistrations = liveData.registrations
    .filter(reg => new Date(reg.registrationTime) > cutoffTime)
    .map(reg => ({
      id: reg.id,
      email: reg.email,
      firstName: reg.firstName,
      lastName: reg.lastName,
      registeredAt: reg.registrationTime,
      verified: true, // For demo purposes, mark all as verified
      source: 'organic', // Could be enhanced to track actual source
      ip: reg.ip ? `${reg.ip.slice(0, 8)}...` : 'Unknown'
    }))
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

  res.json({
    success: true,
    data: recentRegistrations,
    meta: {
      timeRange: `${hours} hours`,
      totalCount: recentRegistrations.length
    }
  });
});

app.get('/api/admin/system-health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      services: {
        database: 'healthy',
        queue: 'healthy',
        storage: 'healthy',
        ai: 'healthy'
      },
      metrics: {
        responseTime: 85,
        uptime: 99.9,
        errorRate: 0.1
      },
      lastCheck: new Date().toISOString()
    }
  });
});

app.get('/api/admin/usage-analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      daily: [
        { date: '2025-10-01', users: 45, generations: 156 },
        { date: '2025-10-02', users: 52, generations: 189 },
        { date: '2025-10-03', users: 48, generations: 167 },
        { date: '2025-10-04', users: 61, generations: 234 },
        { date: '2025-10-05', users: 55, generations: 201 },
        { date: '2025-10-06', users: 38, generations: 142 }
      ],
      topTemplates: [
        { name: 'startup-pitch', usage: 45 },
        { name: 'social-campaign', usage: 32 },
        { name: 'financial-planner', usage: 28 }
      ]
    }
  });
});

// ✅ LIVE SYSTEM LOGS ENDPOINT - Real log tracking
app.get('/api/admin/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const level = req.query.level; // optional filter: 'INFO', 'ERROR', 'WARN'

  let logs = [...liveData.systemLogs];

  // Filter by level if specified
  if (level) {
    logs = logs.filter(log => log.level === level.toUpperCase());
  }

  // Limit results
  logs = logs.slice(0, limit);

  res.json({
    success: true,
    data: logs,
    meta: {
      totalLogs: liveData.systemLogs.length,
      filteredCount: logs.length,
      limit: limit,
      filter: level || 'all'
    }
  });
});

// ✅ LIVE SYSTEM HEALTH ENDPOINT - Real health tracking
app.get('/api/admin/system-health', (req, res) => {
  const now = Date.now();
  const uptime = now - liveData.stats.startTime;
  const errorRate = liveData.stats.totalRequests > 0
    ? (liveData.stats.totalErrors / liveData.stats.totalRequests) * 100
    : 0;

  res.json({
    success: true,
    data: {
      status: errorRate < 5 ? 'healthy' : 'warning',
      services: {
        database: 'healthy',
        queue: 'healthy',
        storage: 'healthy',
        ai: 'healthy'
      },
      metrics: {
        responseTime: liveData.systemLogs.length > 0
          ? Math.round(liveData.systemLogs.slice(0, 10).reduce((sum, log) => sum + log.responseTime, 0) / Math.min(10, liveData.systemLogs.length))
          : 0,
        uptime: Math.round((uptime / (1000 * 60 * 60)) * 10) / 10, // hours with 1 decimal
        errorRate: Math.round(errorRate * 100) / 100
      },
      lastCheck: new Date().toISOString()
    }
  });
});

// ✅ LIVE USAGE ANALYTICS ENDPOINT - Real usage tracking
app.get('/api/admin/usage-analytics', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const now = new Date();

  // Generate daily data from actual registrations and generations
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayRegistrations = liveData.registrations.filter(r => {
      const regDate = new Date(r.registrationTime);
      return regDate >= dayStart && regDate <= dayEnd;
    }).length;

    const dayGenerations = liveData.demoGenerations.filter(g => {
      const genDate = new Date(g.timestamp);
      return genDate >= dayStart && genDate <= dayEnd;
    }).length;

    daily.push({
      date: dateStr,
      users: dayRegistrations,
      generations: dayGenerations
    });
  }

  // Calculate top templates from actual generation data
  const templateCounts = {};
  liveData.demoGenerations.forEach(gen => {
    templateCounts[gen.templateType] = (templateCounts[gen.templateType] || 0) + 1;
  });

  const topTemplates = Object.entries(templateCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, usage]) => ({ name, usage }));

  res.json({
    success: true,
    data: {
      daily,
      topTemplates: topTemplates.length > 0 ? topTemplates : [
        { name: 'startup-pitch', usage: 0 },
        { name: 'social-campaign', usage: 0 },
        { name: 'financial-planner', usage: 0 }
      ]
    }
  });
});

// ✅ CATCH-ALL for any missing admin endpoints
app.get('/api/admin/*', (req, res) => {
  console.log('🔴 Missing admin endpoint:', req.url);
  res.json({
    success: true,
    data: [],
    message: `Demo data for ${req.url}`
  });
});

// Specific endpoint for demo-generate-prompt
app.post('/api/demo-generate-prompt', async (req, res) => {
  console.log(`📥 POST /api/demo-generate-prompt [Redirecting to demo generation]`);

  const startTime = Date.now();
  try {
    const requestData = {
      templateType: 'prompt-generation',
      userResponses: {
        prompt: req.body.prompt || 'Generate a prompt',
        businessName: 'Demo Business',
        industry: 'General',
        goal: 'Generate prompt content',
        ...req.body
      }
    };
    const result = generateDemoLogic(requestData);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      message: 'Prompt generated successfully',
      data: result,
      meta: {
        jobId: `prompt_${Date.now()}`,
        processingTime
      }
    });
  } catch (error) {
    console.error(`❌ Prompt generation error:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Prompt generation failed'
    });
  }
});

// Catch-all for any generation endpoint - route them all to demo/generate
app.post('/api/*/*', async (req, res) => {
  console.log(`📥 Catch-all: Redirecting ${req.url} to demo generation logic`);

  const startTime = Date.now();
  let success = false;

  try {
    console.log(`📥 Demo generation request:`, req.body);

    // Use the same generation logic as the main endpoint with fallback data
    const requestData = {
      templateType: req.body.templateType || 'general',
      userResponses: req.body.userResponses || {
        businessName: req.body.businessName || 'Demo Business',
        industry: req.body.industry || 'General',
        goal: req.body.goal || 'Generate content',
        ...req.body
      },
      // Add fallback properties that templates might expect
      businessName: req.body.businessName || 'Demo Business',
      industry: req.body.industry || 'General',
      goal: req.body.goal || 'Generate content',
      ...req.body
    };
    const result = generateDemoLogic(requestData);
    const processingTime = Date.now() - startTime;
    success = true;

    // Track the generation
    liveData.demoGenerations.unshift({
      timestamp: new Date().toISOString(),
      templateType: req.body.templateType || 'unknown',
      ip: req.ip || req.connection.remoteAddress,
      success: true,
      processingTime
    });
    liveData.stats.totalDemoGenerations++;

    console.log(`✅ Demo generation tracked:`, {
      templateType: req.body.templateType || 'unknown',
      processingTime,
      totalGenerations: liveData.stats.totalDemoGenerations
    });

    res.json({
      success: true,
      message: 'Demo content generated successfully',
      data: result,
      meta: {
        jobId: `demo_${Date.now()}`,
        requestId: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processingTime,
        queueStats: {
          waiting: 0,
          active: 0,
          completed: liveData.stats.totalDemoGenerations,
          failed: 0,
          total: liveData.stats.totalDemoGenerations
        }
      }
    });
  } catch (error) {
    console.error(`❌ Demo generation error:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Demo generation failed'
    });
  }
});

// Specific endpoint for demo-refine
app.post('/api/demo-refine', async (req, res) => {
  console.log(`📥 POST /api/demo-refine [Redirecting to demo generation]`);

  const startTime = Date.now();
  try {
    const requestData = {
      templateType: 'refined-content',
      userResponses: {
        originalContent: req.body.originalContent || req.body.content || 'Original content to refine',
        refinementInstructions: req.body.instructions || req.body.refinementInstructions || 'Please refine this content',
        businessName: req.body.businessName || 'Demo Business',
        industry: req.body.industry || 'General',
        goal: req.body.goal || 'Refine content',
        ...req.body
      }
    };
    const result = generateDemoLogic(requestData);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      message: 'Content refined successfully',
      data: result,
      meta: {
        jobId: `refine_${Date.now()}`,
        processingTime
      }
    });
  } catch (error) {
    console.error(`❌ Content refinement error:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Content refinement failed'
    });
  }
});

// Catch-all for any GET endpoints that might be missing
app.get('/api/*/*', (req, res) => {
  console.log(`📥 GET Catch-all: Handling ${req.url}`);

  // Return appropriate mock data based on the endpoint
  if (req.url.includes('/suggestions/trending')) {
    res.json({
      success: true,
      data: [
        { id: 1, title: "Business Plan Generator", category: "business", trending: true },
        { id: 2, title: "Email Marketing Template", category: "marketing", trending: true },
        { id: 3, title: "Course Outline Creator", category: "education", trending: true }
      ]
    });
  } else if (req.url.includes('/admin/')) {
    // Admin endpoints - return empty data
    res.json({
      success: true,
      data: [],
      message: "Admin endpoint - demo mode"
    });
  } else {
    // Generic response for any other GET endpoint
    res.json({
      success: true,
      data: [],
      message: "Endpoint available - demo mode"
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Simple demo server is healthy',
    timestamp: new Date().toISOString()
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('🚀 Simple Demo Server Started!');
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Demo API: http://localhost:${PORT}/api/demo/generate`);
  console.log(`📊 Queue Status: http://localhost:${PORT}/api/demo/queue/status`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('✨ No Redis required - Direct processing enabled');
});