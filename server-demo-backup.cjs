const express = require('express');
const path = require('path');
const fs = require('fs');

// Helper functions for demo generation
function generateDemoPrompt(category, answers, customization) {
  const categoryTemplates = {
    business: `
## Business Strategy Blueprint

### Executive Summary
Based on your requirements, here's a comprehensive business strategy framework:

**Target Market:** ${answers?.targetMarket || 'B2B professionals and enterprises'}
**Budget Range:** ${answers?.budget || '$10k-50k initial investment'}
**Timeline:** ${answers?.timeline || '6-12 months implementation'}

### Strategic Framework
1. **Market Analysis & Positioning**
   - Competitive landscape assessment
   - Unique value proposition development
   - Market opportunity sizing

2. **Implementation Roadmap**
   - Phase 1: Foundation & Setup (Months 1-2)
   - Phase 2: Launch & Growth (Months 3-6)
   - Phase 3: Scale & Optimize (Months 7-12)

3. **Key Performance Indicators**
   - Revenue targets and milestones
   - Customer acquisition metrics
   - Market penetration goals

4. **Risk Management**
   - Potential challenges and mitigation strategies
   - Contingency planning
   - Success monitoring framework

### Next Steps
${customization?.tone === 'detailed' ? 'Detailed action items and specific deliverables for each phase.' : 'High-level implementation priorities and immediate actions.'}
`,
    marketing: `
## Marketing Campaign Strategy

### Campaign Overview
**Product/Service:** ${answers?.product || 'Your innovative solution'}
**Target Audience:** ${answers?.audience || 'Tech-savvy professionals aged 25-45'}
**Campaign Goals:** ${answers?.goals || 'Increase brand awareness and drive conversions'}

### Multi-Channel Approach
1. **Digital Marketing Mix**
   - Social media strategy (LinkedIn, Twitter, Facebook)
   - Content marketing and SEO optimization
   - Email marketing automation sequences
   - Paid advertising campaigns (Google Ads, Facebook Ads)

2. **Content Strategy**
   - Educational blog posts and whitepapers
   - Video testimonials and product demos
   - Interactive webinars and workshops
   - Case studies and success stories

3. **Engagement Tactics**
   - Influencer partnerships
   - Community building and forums
   - User-generated content campaigns
   - Referral and loyalty programs

### Campaign Metrics
- Reach and impressions
- Engagement rates and click-through rates
- Conversion rates and ROI
- Customer lifetime value

${customization?.focus === 'roi' ? '### ROI Projections\n- Expected 3:1 return on marketing investment\n- 25% increase in qualified leads within 90 days\n- 15% improvement in conversion rates' : ''}
`,
    product: `
## Product Development & Launch Strategy

### Product Vision
**Product Name:** ${answers?.productName || 'InnovateX Solution'}
**Target Market:** ${answers?.market || 'Enterprise software users'}
**Core Value Proposition:** ${answers?.value || 'Streamline workflows and increase productivity by 40%'}

### Development Roadmap
1. **MVP Development (8-12 weeks)**
   - Core feature set prioritization
   - User experience design
   - Technical architecture planning
   - Prototype development and testing

2. **Beta Testing Phase (4-6 weeks)**
   - Closed beta with select customers
   - Feedback collection and analysis
   - Feature refinement and bug fixes
   - Performance optimization

3. **Market Launch (2-4 weeks)**
   - Go-to-market strategy execution
   - Marketing campaign launch
   - Sales enablement and training
   - Customer support infrastructure

### Success Metrics
- User adoption rates
- Feature utilization analytics
- Customer satisfaction scores
- Revenue and growth metrics

${customization?.detail === 'technical' ? '### Technical Specifications\n- Scalable cloud infrastructure\n- API-first architecture\n- Enterprise security standards\n- Integration capabilities' : ''}
`,
    education: `
## Educational Program Development

### Learning Objectives
**Program Focus:** ${answers?.subject || 'Professional Development & Skills Enhancement'}
**Target Learners:** ${answers?.audience || 'Working professionals seeking career advancement'}
**Duration:** ${answers?.duration || '12-week comprehensive program'}

### Curriculum Structure
1. **Foundation Modules (Weeks 1-4)**
   - Core concepts and principles
   - Fundamental skills development
   - Assessment and baseline establishment
   - Learning path customization

2. **Intermediate Application (Weeks 5-8)**
   - Practical exercises and projects
   - Real-world case studies
   - Peer collaboration activities
   - Skill reinforcement workshops

3. **Advanced Mastery (Weeks 9-12)**
   - Complex problem-solving scenarios
   - Capstone project development
   - Portfolio creation and review
   - Certification preparation

### Learning Delivery Methods
- Interactive online modules
- Live virtual workshops
- Hands-on practice sessions
- Mentorship and coaching support

### Assessment Framework
- Regular progress evaluations
- Peer reviews and feedback
- Final project presentations
- Certification requirements

${customization?.format === 'hybrid' ? '### Hybrid Learning Approach\n- 60% online self-paced modules\n- 30% live virtual sessions\n- 10% in-person workshops (optional)' : ''}
`,
    personal: `
## Personal Development Action Plan

### Goal Setting Framework
**Primary Objective:** ${answers?.goal || 'Achieve better work-life balance and career growth'}
**Timeline:** ${answers?.timeframe || '6 months focused development'}
**Success Metrics:** ${answers?.metrics || 'Measurable improvements in productivity and satisfaction'}

### Development Areas
1. **Skill Enhancement**
   - Identify core competencies to develop
   - Create learning schedule and milestones
   - Seek mentorship and guidance opportunities
   - Practice and application strategies

2. **Habit Formation**
   - Morning routine optimization
   - Productivity system implementation
   - Health and wellness integration
   - Mindfulness and stress management

3. **Relationship Building**
   - Network expansion strategies
   - Communication skills improvement
   - Leadership development activities
   - Community involvement opportunities

### Implementation Strategy
- Weekly goal setting and review
- Daily habit tracking and accountability
- Monthly progress assessment
- Quarterly strategy adjustment

### Support System
- Accountability partners
- Professional coaching or mentoring
- Peer support groups
- Resource libraries and tools

${customization?.approach === 'holistic' ? '### Holistic Wellness Integration\n- Physical health and fitness goals\n- Mental wellness and mindfulness practices\n- Emotional intelligence development\n- Social connection and community engagement' : ''}
`
  };

  return categoryTemplates[category] || categoryTemplates.business;
}

function refinePromptDemo(currentPrompt, refinementQuery, category) {
  const queryLower = refinementQuery.toLowerCase();

  if (queryLower.includes('detailed') || queryLower.includes('specific')) {
    return `${currentPrompt}

## Enhanced Details & Specifications

Based on your request for more detailed information:

### Detailed Implementation Steps
1. **Phase 1: Planning & Analysis**
   - Stakeholder interviews and requirements gathering
   - Market research and competitive analysis
   - Resource assessment and team formation
   - Risk identification and mitigation planning

2. **Phase 2: Development & Execution**
   - Pilot program launch with limited scope
   - Iterative development and testing cycles
   - Quality assurance and performance monitoring
   - Feedback collection and incorporation

3. **Phase 3: Scaling & Optimization**
   - Full-scale implementation and rollout
   - Performance optimization and fine-tuning
   - Training and change management programs
   - Success measurement and reporting

### Resource Requirements
- **Human Resources:** Project manager, 2-3 specialists, support team
- **Technology:** Cloud infrastructure, software licenses, development tools
- **Budget Allocation:** 40% personnel, 30% technology, 20% marketing, 10% contingency
- **Timeline:** 3-6 months for full implementation

### Success Metrics & KPIs
- **Quantitative:** Revenue growth, user adoption, efficiency gains
- **Qualitative:** User satisfaction, team engagement, stakeholder feedback
- **Timeline:** Weekly progress reviews, monthly milestone assessments`;
  }

  if (queryLower.includes('example') || queryLower.includes('case')) {
    return `${currentPrompt}

## Real-World Examples & Case Studies

### Case Study 1: TechCorp Implementation
**Challenge:** Needed to modernize their customer service operations
**Solution:** Implemented AI-powered chatbot system with human handoff
**Results:**
- 60% reduction in response time
- 85% customer satisfaction improvement
- $2M annual cost savings
- ROI achieved within 8 months

### Case Study 2: StartupX Growth Strategy
**Challenge:** Scaling from 10 to 100 employees while maintaining culture
**Solution:** Structured onboarding, mentorship program, and culture documentation
**Results:**
- 95% employee retention rate
- 40% faster time-to-productivity
- Maintained 4.8/5 culture satisfaction score
- Successful $50M Series B funding

### Best Practices & Lessons Learned
- **Start Small:** Begin with pilot programs before full rollout
- **Measure Everything:** Establish baseline metrics and track progress
- **Communicate Often:** Keep all stakeholders informed throughout process
- **Be Flexible:** Adapt strategy based on feedback and results
- **Celebrate Wins:** Recognize milestones and team achievements`;
  }

  if (queryLower.includes('roi') || queryLower.includes('business value') || queryLower.includes('financial')) {
    return `${currentPrompt}

## Financial Impact & ROI Analysis

### Investment Breakdown
**Initial Investment:** $75,000 - $125,000
- Technology & Infrastructure: $30,000 - $45,000
- Personnel & Training: $25,000 - $40,000
- Marketing & Launch: $15,000 - $25,000
- Contingency Buffer: $5,000 - $15,000

### Revenue Projections
**Year 1:** $200,000 - $350,000
- Month 1-3: $10,000 - $20,000/month (ramp-up phase)
- Month 4-6: $25,000 - $40,000/month (growth phase)
- Month 7-12: $35,000 - $60,000/month (optimization phase)

**Year 2-3:** 150-300% growth trajectory
- Year 2: $500,000 - $800,000
- Year 3: $1,200,000 - $2,000,000

### ROI Calculations
- **Break-even Point:** Month 6-8
- **First Year ROI:** 180-250%
- **Three-Year ROI:** 800-1,200%
- **Payback Period:** 6-9 months

### Cost Savings & Efficiency Gains
- **Operational Efficiency:** 35-50% improvement
- **Time Savings:** 20-30 hours per week
- **Error Reduction:** 60-80% decrease
- **Customer Satisfaction:** 25-40% improvement`;
  }

  if (queryLower.includes('timeline') || queryLower.includes('schedule') || queryLower.includes('milestone')) {
    return `${currentPrompt}

## Detailed Timeline & Milestones

### Phase 1: Foundation & Setup (Weeks 1-4)
**Week 1:**
- Stakeholder alignment meeting
- Project charter and scope definition
- Team formation and role assignments
- Budget approval and resource allocation

**Week 2:**
- Requirements gathering and documentation
- Market research and competitive analysis
- Technical architecture planning
- Risk assessment and mitigation strategies

**Week 3:**
- Design mockups and user experience planning
- Vendor selection and contract negotiations
- Development environment setup
- Communication plan establishment

**Week 4:**
- Prototype development initiation
- Initial testing framework setup
- Stakeholder review and feedback collection
- Phase 1 milestone review and approval

### Phase 2: Development & Testing (Weeks 5-10)
**Weeks 5-6:** Core development and feature implementation
**Weeks 7-8:** Integration testing and quality assurance
**Weeks 9-10:** User acceptance testing and refinements

### Phase 3: Launch & Optimization (Weeks 11-12)
**Week 11:** Production deployment and soft launch
**Week 12:** Full launch, monitoring, and optimization

### Key Milestones & Deliverables
- ✅ Week 4: Project foundation complete
- ✅ Week 8: MVP ready for testing
- ✅ Week 10: All testing completed
- ✅ Week 12: Full production launch

### Success Checkpoints
- Weekly progress reviews with team
- Bi-weekly stakeholder updates
- Monthly milestone assessments
- Quarterly strategy reviews`;
  }

  // Default refinement
  return `${currentPrompt}

## Enhanced Content & Improvements

Based on your refinement request, here are the key enhancements:

### Additional Considerations
- **Implementation Flexibility:** Multiple approaches to achieve the same goals
- **Scalability Planning:** Framework designed to grow with your needs
- **Quality Assurance:** Built-in checkpoints and validation processes
- **Continuous Improvement:** Regular review and optimization cycles

### Action Items & Next Steps
1. **Immediate Actions (Next 7 days)**
   - Finalize project scope and requirements
   - Secure necessary approvals and budget
   - Begin team formation and resource allocation

2. **Short-term Goals (Next 30 days)**
   - Complete initial planning and design phase
   - Establish key partnerships and vendor relationships
   - Launch pilot program or initial implementation

3. **Medium-term Objectives (Next 90 days)**
   - Achieve first major milestone
   - Collect and analyze initial performance data
   - Refine strategy based on early results

### Risk Mitigation & Contingencies
- **Technical Risks:** Backup solutions and alternative approaches
- **Resource Risks:** Flexible team structure and external support options
- **Market Risks:** Adaptive strategy and pivot capabilities
- **Timeline Risks:** Buffer periods and prioritized feature rollout

This enhanced framework provides greater depth while maintaining practical applicability for your specific situation.`;
}

const app = express();
const PORT = process.env.PORT || 5001;

// Try to load optional middleware, fallback gracefully if not available
let cors, helmet, compression, morgan;
try {
  cors = require('cors');
} catch (e) {
  console.log('CORS not available, using basic headers');
}
try {
  helmet = require('helmet');
} catch (e) {
  console.log('Helmet not available, skipping security headers');
}
try {
  compression = require('compression');
} catch (e) {
  console.log('Compression not available, skipping');
}
try {
  morgan = require('morgan');
} catch (e) {
  console.log('Morgan not available, skipping request logging');
}

// 🚀 RAILWAY DEPLOYMENT DEBUGGING
console.log('='.repeat(50));
console.log('🚀 RAILWAY SERVER STARTUP DEBUG');
console.log('='.repeat(50));
console.log('📍 Current working directory:', process.cwd());
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT from env:', process.env.PORT);
console.log('📡 Server will start on PORT:', PORT);
console.log('🏗️ Railway environment variables:');
console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('   RAILWAY_PROJECT_NAME:', process.env.RAILWAY_PROJECT_NAME);
console.log('   RAILWAY_SERVICE_NAME:', process.env.RAILWAY_SERVICE_NAME);
console.log('   RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN);
console.log('='.repeat(50));

// Essential middleware
app.use(express.json());

// Apply middleware conditionally
if (helmet) {
  app.use(helmet());
}

if (compression) {
  app.use(compression());
}

if (morgan) {
  app.use(morgan('dev'));
}

// CORS configuration - use library if available, otherwise use basic headers
if (cors) {
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  }));
} else {
  // Fallback CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

// Serve static files from the React app build directory
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('🔍 Looking for frontend build at:', clientDistPath);

// Check if the directory exists at startup
if (fs.existsSync(clientDistPath)) {
  console.log('✅ Frontend build directory exists');
  const files = fs.readdirSync(clientDistPath);
  console.log('📁 Build directory contents:', files);
  app.use(express.static(clientDistPath));
} else {
  console.log('❌ Frontend build directory does NOT exist');
  console.log('📂 Current directory contents:', fs.readdirSync(__dirname));
}

// Enhanced health check endpoint for Railway - INSTANT RESPONSE
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested at:', new Date().toISOString());
  try {
    // Immediate response for Railway - NO JSON PARSING DELAYS
    res.status(200).send('OK');
    console.log('✅ Health check response sent');
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).send('ERROR');
  }
});

// Detailed health check for debugging
app.get('/health/detailed', (req, res) => {
  console.log('🔍 Detailed health check accessed');
  try {
    const healthData = {
      status: 'healthy',
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      port: PORT,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      railway: {
        environment: process.env.RAILWAY_ENVIRONMENT,
        projectName: process.env.RAILWAY_PROJECT_NAME,
        serviceName: process.env.RAILWAY_SERVICE_NAME,
        publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN
      },
      frontend: {
        buildExists: fs.existsSync(clientDistPath),
        buildPath: clientDistPath
      }
    };

    res.status(200).json(healthData);
    console.log('✅ Detailed health check successful');
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API health check
app.get('/api/health', (req, res) => {
  console.log('🔍 API health check accessed');
  res.status(200).json({
    status: 'healthy',
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: ['/health', '/api/health', '/api/auth/login', '/api/auth/register']
  });
});

// Demo API endpoints (simplified)
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Auth login request:', req.body);

  const { email, password } = req.body;

  // Check for admin credentials
  const isAdmin = email === 'admin@smartpromptiq.com' || email === 'admin@example.com';

  // Demo authentication logic
  if (email && password) {
    const userData = isAdmin ? {
      id: 'admin-demo',
      email: email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      tokenBalance: 10000,
      permissions: ['all']
    } : {
      id: 'demo',
      email: email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
      tokenBalance: 1000
    };

    res.json({
      success: true,
      data: {
        token: 'demo-token',
        user: userData
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token',
    user: { id: 'demo', email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName }
  });
});

// Auth me endpoint
app.get('/api/auth/me', (req, res) => {
  console.log('🔍 Auth me request received');

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No authorization header'
    });
  }

  // Demo user response
  res.json({
    success: true,
    data: {
      user: {
        id: 'demo-user',
        email: 'demo@smartpromptiq.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'USER',
        roles: [],
        permissions: [],
        subscriptionTier: 'pro',
        tokenBalance: 1000,
        generationsUsed: 47283,
        generationsLimit: 50000
      }
    }
  });
});

// ===== ADMIN ENDPOINTS =====

// Admin stats endpoint
app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Admin stats request');

  const demoStats = {
    totalUsers: 8947,
    activeUsers: 2341,
    totalPrompts: 47283,
    revenue: 125840,
    systemHealth: 'healthy',
    apiCalls: 156789,
    subscriptions: {
      free: 6847,
      starter: 1200,
      pro: 650,
      business: 180,
      enterprise: 70
    },
    systemInfo: {
      uptime: '15 days, 7 hours',
      version: '2.1.4',
      lastBackup: '2 hours ago',
      environment: 'production'
    },
    realTimeMetrics: {
      cpuUsage: 45,
      memoryUsage: 68,
      diskUsage: 23,
      networkTraffic: 1250,
      activeConnections: 234,
      responseTime: 180,
      errorRate: 0.3,
      throughput: 450
    }
  };

  res.json({
    success: true,
    data: demoStats
  });
});

// Admin users endpoint
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Admin users request');

  const demoUsers = [
    {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      subscriptionTier: 'pro',
      tokenBalance: 850,
      lastActive: '2 hours ago',
      totalPrompts: 45,
      lastLogin: '2025-09-22',
      country: 'USA'
    },
    {
      id: 'user-2',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'USER',
      subscriptionTier: 'business',
      tokenBalance: 2340,
      lastActive: '1 hour ago',
      totalPrompts: 127,
      lastLogin: '2025-09-22',
      country: 'Canada'
    },
    {
      id: 'admin-demo',
      email: 'admin@smartpromptiq.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      subscriptionTier: 'enterprise',
      tokenBalance: 10000,
      lastActive: 'Now',
      totalPrompts: 0,
      lastLogin: '2025-09-22',
      country: 'USA'
    }
  ];

  res.json({
    success: true,
    data: demoUsers
  });
});

// Admin user analytics endpoint
app.get('/api/admin/user-analytics', (req, res) => {
  console.log('📈 Admin analytics request');

  const demoAnalytics = {
    totalUsers: 8947,
    newUsersToday: 23,
    activeUsersToday: 1567,
    avgSessionDuration: '12 minutes',
    topCountries: ['USA', 'Canada', 'UK', 'Germany', 'France'],
    userGrowth: [
      { month: 'Jan', users: 5200 },
      { month: 'Feb', users: 6100 },
      { month: 'Mar', users: 7300 },
      { month: 'Apr', users: 8947 }
    ]
  };

  res.json({
    success: true,
    data: demoAnalytics
  });
});

// Admin active sessions endpoint
app.get('/api/admin/active-sessions', (req, res) => {
  console.log('🔗 Admin sessions request');

  const demoSessions = [
    {
      id: 'session-1',
      userId: 'user-1',
      email: 'john.doe@example.com',
      currentPage: '/generate',
      sessionDuration: 145,
      activityScore: 85,
      ipAddress: '192.168.1.1',
      device: 'Chrome/Windows'
    },
    {
      id: 'session-2',
      userId: 'user-2',
      email: 'sarah.wilson@company.com',
      currentPage: '/dashboard',
      sessionDuration: 67,
      activityScore: 92,
      ipAddress: '10.0.0.1',
      device: 'Safari/macOS'
    }
  ];

  res.json({
    success: true,
    data: demoSessions
  });
});

// Admin activities endpoint
app.get('/api/admin/activities', (req, res) => {
  console.log('📋 Admin activities request');

  const demoActivities = [
    {
      id: 'act-1',
      type: 'user_registration',
      message: 'New user registered: alice@example.com',
      timestamp: new Date().toISOString(),
      userId: 'user-3'
    },
    {
      id: 'act-2',
      type: 'prompt_generated',
      message: 'High-value prompt generated by john.doe@example.com',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: 'user-1'
    },
    {
      id: 'act-3',
      type: 'subscription_upgrade',
      message: 'User upgraded to Pro plan: sarah.wilson@company.com',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'user-2'
    }
  ];

  res.json({
    success: true,
    data: demoActivities
  });
});

// Admin actions endpoint
app.post('/api/admin/actions/:action', (req, res) => {
  console.log('⚡ Admin action request:', req.params.action, req.body);

  const { action } = req.params;
  const { data } = req.body;

  res.json({
    success: true,
    message: `Admin action '${action}' executed successfully`,
    data: { action, processed: data }
  });
});

// Demo generation endpoint
app.post('/api/generate-prompt', (req, res) => {
  console.log('🚀 Demo generation request received:', req.body);

  const { category, answers, customization } = req.body;

  // Demo prompt generation
  const demoPrompt = generateDemoPrompt(category, answers, customization);

  res.json({
    success: true,
    data: {
      prompt: demoPrompt,
      category: category || 'general',
      generatedAt: new Date(),
      usage: { type: 'demo', tokens: 0 }
    }
  });
});

// Alternative generate endpoint (for different client calls)
app.post('/api/generate', (req, res) => {
  console.log('🚀 Alternative generate endpoint accessed:', req.body);

  const { category, answers, customization } = req.body;
  const demoPrompt = generateDemoPrompt(category, answers, customization);

  res.json({
    success: true,
    prompt: demoPrompt,
    category: category || 'general',
    generatedAt: new Date()
  });
});

// Demo refinement endpoint
app.post('/api/demo-refine', (req, res) => {
  console.log('🔧 Demo refinement request received:', req.body);

  const { currentPrompt, refinementQuery, category = 'general' } = req.body;

  // Demo refinement
  const refinedPrompt = refinePromptDemo(currentPrompt, refinementQuery, category);

  res.json({
    success: true,
    data: {
      refinedPrompt,
      refinementApplied: refinementQuery,
      timestamp: new Date(),
      usage: { type: 'demo', tokens: 0 }
    }
  });
});

// Generation stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      generationsUsed: 47283,
      generationsLimit: 50000,
      totalPrompts: 8947,
      recentPrompts: [
        { id: '1', title: 'Business Strategy Prompt', category: 'business', createdAt: new Date() },
        { id: '2', title: 'Marketing Campaign', category: 'marketing', createdAt: new Date() },
        { id: '3', title: 'Product Launch Plan', category: 'product', createdAt: new Date() }
      ],
      categoryBreakdown: [
        { category: 'business', count: 2547 },
        { category: 'marketing', count: 1892 },
        { category: 'product', count: 1634 },
        { category: 'education', count: 1298 },
        { category: 'personal', count: 876 }
      ],
      aiProvider: 'OpenAI GPT-4',
      aiConfigured: true
    }
  });
});

// Prompts list endpoint
app.get('/api/prompts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Business Strategy Blueprint',
        category: 'business',
        content: 'Create a comprehensive business strategy...',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'Marketing Campaign Generator',
        category: 'marketing',
        content: 'Design an effective marketing campaign...',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  });
});

// Templates endpoint
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Business Strategy Template',
        category: 'business',
        questions: [
          { id: '1', text: 'What is your target market?', type: 'text' },
          { id: '2', text: 'What is your budget range?', type: 'select', options: ['$0-10k', '$10k-50k', '$50k+'] }
        ]
      },
      {
        id: '2',
        name: 'Marketing Campaign Template',
        category: 'marketing',
        questions: [
          { id: '1', text: 'What product/service are you promoting?', type: 'text' },
          { id: '2', text: 'Who is your target audience?', type: 'textarea' }
        ]
      }
    ]
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please check if the build exists.');
  }
});

// Start server with Railway-compatible binding
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVER SUCCESSFULLY STARTED');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Server bound to 0.0.0.0:${PORT} for Railway compatibility`);
  console.log(`📱 Frontend served from: ${clientDistPath}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🔗 API health check: http://localhost:${PORT}/api/health`);
  console.log(`🏠 Root endpoint: http://localhost:${PORT}/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`🚀 Railway URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  }

  console.log('='.repeat(50));
  console.log('✅ Ready to receive requests!');
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});