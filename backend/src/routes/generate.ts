import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authenticateWithSubscription, requireTokens, trackApiUsage } from '../middleware/subscriptionAuth';
import prisma from '../config/database';
import aiService from '../services/aiService';
import emailService from '../services/emailService';

const router = express.Router();

// Generate AI prompt
router.post('/generate-prompt', [
  authenticateWithSubscription,
  trackApiUsage,
  requireTokens(1, 'standard'),
  body('category').notEmpty().trim(),
  body('answers').isObject(),
  body('customization').isObject()
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check user's generation limit
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user!.generationsUsed >= user!.generationsLimit) {
      return res.status(403).json({
        success: false,
        message: 'Generation limit exceeded. Please upgrade your plan.'
      });
    }

    const { category, answers, customization, provider: preferredProvider } = req.body;

    console.log('🚀 Generating prompt with AI service:', {
      category,
      preferredProvider: preferredProvider || 'default',
      provider: aiService.getProviderStatus(),
      configured: aiService.isConfigured()
    });

    // Generate the AI prompt using the AI service
    const result = await aiService.generatePrompt(category, answers, customization, preferredProvider);

    // Update user's generation count
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        generationsUsed: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: {
        prompt: result.content,
        category,
        generatedAt: new Date(),
        provider: result.provider || aiService.getProviderStatus(),
        model: result.model,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refine existing prompt
router.post('/refine-prompt', [
  authenticateWithSubscription,
  trackApiUsage,
  requireTokens(1, 'standard'),
  body('currentPrompt').notEmpty().trim(),
  body('refinementQuery').notEmpty().trim(),
  body('category').notEmpty().trim()
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check user's generation limit
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user!.generationsUsed >= user!.generationsLimit) {
      return res.status(403).json({
        success: false,
        message: 'Generation limit exceeded. Please upgrade your plan.'
      });
    }

    const { currentPrompt, refinementQuery, category, originalAnswers, provider: preferredProvider } = req.body;

    console.log('🔧 Refining prompt with AI service:', {
      category,
      preferredProvider: preferredProvider || 'default',
      provider: aiService.getProviderStatus(),
      refinementQuery: refinementQuery.substring(0, 50) + '...'
    });

    // Refine the prompt using the AI service
    const result = await aiService.refinePrompt(currentPrompt, refinementQuery, category, originalAnswers, preferredProvider);

    // Update user's generation count for refinements
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        generationsUsed: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: {
        refinedPrompt: result.content,
        refinementApplied: refinementQuery,
        timestamp: new Date(),
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Refine prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Demo generate prompt endpoint (no auth required)
router.post('/demo-generate-prompt', [
  body('category').notEmpty().trim(),
  body('answers').isObject(),
  body('customization').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category, answers, customization } = req.body;

    console.log('🚀 Demo generating prompt for category:', category);

    // Generate a demo prompt based on category and answers
    const demoPrompt = generateDemoPrompt(category, answers, customization);

    res.json({
      success: true,
      data: {
        prompt: demoPrompt,
        category,
        generatedAt: new Date(),
        usage: { type: 'demo', tokens: 0 }
      }
    });
  } catch (error) {
    console.error('Demo generate prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Demo refinement endpoint (no auth required)
router.post('/demo-refine', [
  body('currentPrompt').notEmpty().trim(),
  body('refinementQuery').notEmpty().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPrompt, refinementQuery, category = 'general' } = req.body;

    console.log('🔧 Demo refining prompt:', {
      category,
      refinementQuery: refinementQuery.substring(0, 50) + '...'
    });

    // For demo purposes, create a simple refinement simulation
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

    // Create a refined version (demo simulation)
    const refinedPrompt = `${currentPrompt}\n\n## Enhanced Content (${refinementType}):\n\n${generateRefinementText(refinementQuery, category)}`;

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
    console.error('Demo refine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function for demo refinement
function generateRefinementText(refinementQuery: string, category: string): string {
  const queryLower = refinementQuery.toLowerCase();

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

// Helper function for demo prompt generation
function generateDemoPrompt(category: string, answers: any, customization: any): string {
  const categoryTemplates = {
    'marketing': {
      title: 'Strategic Marketing Campaign Blueprint',
      base: `# Strategic Marketing Campaign Blueprint

## Campaign Overview
Based on your responses, here's a comprehensive marketing strategy tailored to your needs:

### Primary Objective
- **Goal:** ${answers.marketing_goal || 'Brand awareness and lead generation'}
- **Target Audience:** ${answers.target_audience || 'Young professionals and entrepreneurs'}
- **Budget Range:** ${answers.budget_range || 'Small to medium business budget'}
- **Timeline:** ${answers.campaign_urgency || 'Medium-term strategy (3-6 months)'}

## Strategic Framework

### 1. Audience Targeting Strategy
**Primary Demographics:**
- Age Range: 25-40 years old
- Income Level: Middle to upper-middle class
- Interests: Professional development, technology, lifestyle
- Platforms: LinkedIn, Instagram, Email

**Messaging Pillars:**
- Value-driven communication
- Results-oriented benefits
- Social proof and testimonials
- Clear call-to-actions

### 2. Multi-Channel Approach
**Digital Channels:**
- Content Marketing: Blog posts, whitepapers, case studies
- Social Media: LinkedIn thought leadership, Instagram stories
- Email Marketing: Nurture sequences, newsletters
- Paid Advertising: Google Ads, Facebook/Instagram ads

**Traditional Channels:**
- Networking events and conferences
- Partnership collaborations
- PR and media outreach

### 3. Content Strategy
**Educational Content (40%):**
- Industry insights and trends
- How-to guides and tutorials
- Best practices and frameworks

**Promotional Content (30%):**
- Product/service highlights
- Customer success stories
- Special offers and announcements

**Engaging Content (30%):**
- Behind-the-scenes content
- User-generated content
- Interactive polls and Q&As

## Implementation Timeline

### Month 1: Foundation
- Set up tracking and analytics
- Create content calendar
- Launch awareness campaigns

### Month 2-3: Engagement
- Increase content production
- Build community engagement
- Optimize based on performance

### Month 4-6: Conversion
- Focus on lead generation
- Implement retargeting campaigns
- Scale successful initiatives

## Success Metrics
- **Awareness:** Reach, impressions, brand mentions
- **Engagement:** Likes, shares, comments, time spent
- **Conversion:** Leads generated, cost per acquisition
- **Revenue:** Sales attributed to marketing efforts

## Budget Allocation
- Content Creation: 30%
- Paid Advertising: 40%
- Tools and Software: 15%
- Events and Partnerships: 15%

This blueprint provides a solid foundation for your marketing success. Customize and adapt based on your specific industry and market conditions.`
    },
    'business-strategy': {
      title: 'Comprehensive Business Strategy Framework',
      base: `# Comprehensive Business Strategy Framework

## Strategic Overview
Based on your business stage and objectives, here's a tailored strategic framework:

### Business Context
- **Current Stage:** ${answers.business_stage || 'Growth phase'}
- **Strategic Focus:** ${answers.strategy_focus || 'Market expansion'}
- **Organization Size:** ${answers.business_size || 'Medium business'}
- **Planning Horizon:** ${answers.timeline_horizon || '1-3 years'}

## Strategic Analysis

### 1. Market Position Assessment
**Current Strengths:**
- Established customer base
- Proven product-market fit
- Strong operational capabilities
- Brand recognition in target market

**Growth Opportunities:**
- Market expansion possibilities
- Product/service diversification
- Strategic partnerships
- Digital transformation initiatives

**Key Challenges:**
- Competitive pressure
- Resource allocation
- Scalability requirements
- Market saturation risks

### 2. Strategic Objectives Framework
**Primary Goals:**
- Revenue growth: 25-40% annually
- Market share expansion
- Operational efficiency improvement
- Customer satisfaction enhancement

**Supporting Initiatives:**
- Technology infrastructure upgrades
- Team development and training
- Process optimization
- Quality assurance programs

### 3. Implementation Strategy

#### Phase 1: Foundation (Months 1-3)
**Immediate Actions:**
- Conduct comprehensive market analysis
- Assess internal capabilities and resources
- Establish clear success metrics
- Create cross-functional teams

**Deliverables:**
- Market research report
- Resource allocation plan
- Performance dashboard
- Team structure optimization

#### Phase 2: Execution (Months 4-9)
**Core Initiatives:**
- Launch key strategic projects
- Implement process improvements
- Expand market presence
- Develop strategic partnerships

**Key Activities:**
- Product/service enhancements
- Sales and marketing campaigns
- Operational optimization
- Technology implementations

#### Phase 3: Optimization (Months 10-12)
**Focus Areas:**
- Performance monitoring and adjustment
- Scaling successful initiatives
- Risk mitigation strategies
- Future planning preparation

## Risk Management

### Identified Risks:
1. **Market Risks:** Economic downturns, competitive threats
2. **Operational Risks:** Resource constraints, execution challenges
3. **Financial Risks:** Cash flow, investment returns
4. **Strategic Risks:** Wrong market timing, misaligned priorities

### Mitigation Strategies:
- Diversified revenue streams
- Agile planning and execution
- Strong financial reserves
- Continuous market monitoring

## Success Metrics

### Financial KPIs:
- Revenue growth rate
- Profit margins
- Return on investment
- Cash flow management

### Operational KPIs:
- Customer satisfaction scores
- Employee engagement
- Process efficiency metrics
- Quality indicators

### Strategic KPIs:
- Market share growth
- Brand awareness metrics
- Innovation pipeline
- Partnership effectiveness

This strategic framework provides a comprehensive roadmap for achieving your business objectives while maintaining flexibility to adapt to changing market conditions.`
    },
    'personal-development': {
      title: 'Personal Development Mastery Plan',
      base: `# Personal Development Mastery Plan

## Your Development Journey
Based on your goals and current challenges, here's your personalized growth strategy:

### Development Focus
- **Primary Goal:** ${answers.development_goal || 'Building better habits'}
- **Main Challenge:** ${answers.current_challenge || 'Staying motivated'}
- **Target Timeline:** ${answers.timeline || '90 days'}
- **Success Vision:** Transformed daily routines and enhanced productivity

## The GROWTH Framework

### G - Goal Setting & Clarity
**SMART Objectives:**
- Specific: Clear, well-defined outcomes
- Measurable: Trackable progress indicators
- Achievable: Realistic given your current situation
- Relevant: Aligned with your values and priorities
- Time-bound: Clear deadlines and milestones

**Your Personal Goals:**
1. **Habit Formation:** Establish 3 keystone habits
2. **Skill Development:** Master one high-value skill
3. **Mindset Growth:** Develop resilience and positive thinking
4. **Productivity Enhancement:** Optimize daily workflows

### R - Routine & Systems
**Morning Routine (6:00-8:00 AM):**
- Mindfulness/meditation (10 minutes)
- Physical exercise (30 minutes)
- Goal review and planning (10 minutes)
- Healthy breakfast and hydration

**Work/Focus Blocks:**
- Deep work sessions (90 minutes)
- Regular breaks (15 minutes)
- Priority task completion
- Progress tracking

**Evening Routine (7:00-9:00 PM):**
- Daily reflection and journaling
- Skill practice or learning
- Preparation for next day
- Relaxation and wind-down

### O - Optimization & Tracking
**Weekly Reviews:**
- Goal progress assessment
- Habit tracking analysis
- Challenge identification
- Strategy adjustments

**Monthly Evaluations:**
- Comprehensive progress review
- Skill development assessment
- Goal refinement
- Planning next phase

### W - Willpower & Motivation
**Motivation Strategies:**
- Clear "why" statements
- Visual progress tracking
- Accountability partnerships
- Reward systems

**Overcoming Obstacles:**
- Identify common triggers
- Prepare response strategies
- Build support systems
- Practice self-compassion

### T - Transformation & Results
**Expected Outcomes (30 Days):**
- Consistent daily routines
- Improved focus and productivity
- Initial habit establishment
- Increased self-awareness

**Mid-term Results (90 Days):**
- Fully automated habits
- Significant skill progress
- Enhanced confidence
- Measurable goal achievement

### H - Habits & Consistency
**Keystone Habits to Develop:**
1. **Morning Meditation:** 10 minutes daily
2. **Evening Reflection:** Journal writing
3. **Continuous Learning:** 30 minutes daily
4. **Physical Activity:** Exercise routine

**Habit Stacking Strategy:**
- Link new habits to existing routines
- Start with micro-habits (2 minutes)
- Gradually increase duration/intensity
- Track consistency, not perfection

## Implementation Tools

### Tracking Methods:
- Habit tracking apps
- Physical journals
- Progress photography
- Accountability check-ins

### Resources:
- Recommended books and podcasts
- Online courses and tutorials
- Community groups and forums
- Professional coaching options

### Support System:
- Accountability partner
- Mentorship opportunities
- Online communities
- Progress sharing platforms

## Troubleshooting Common Challenges

### When Motivation Drops:
1. Revisit your "why"
2. Celebrate small wins
3. Adjust goals if needed
4. Seek support from others

### When Progress Stalls:
1. Analyze current strategies
2. Experiment with new approaches
3. Break goals into smaller steps
4. Consider external feedback

### When Life Gets Busy:
1. Focus on minimum viable habits
2. Protect non-negotiable time blocks
3. Adapt routines to circumstances
4. Maintain long-term perspective

This comprehensive plan provides the structure and flexibility needed for sustainable personal growth. Remember: progress over perfection, consistency over intensity.`
    }
  };

  const template = categoryTemplates[category as keyof typeof categoryTemplates] || categoryTemplates['marketing'];

  // Customize based on tone and detail level from customization
  let prompt = template.base;

  if (customization.tone === 'casual') {
    prompt = prompt.replace(/###/g, '##').replace(/formal language/g, 'friendly conversation');
  }

  if (customization.detailLevel === 'brief') {
    prompt = prompt.substring(0, Math.floor(prompt.length * 0.6)) + '\n\n*This is a condensed version focused on key actionables.*';
  }

  return prompt;
}

// Get available AI providers
router.get('/providers', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        providers: aiService.getAvailableProviders(),
        defaultProvider: aiService.getProviderStatus(),
      }
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provider list'
    });
  }
});

// Get generation stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        generationsUsed: true,
        generationsLimit: true
      }
    });

    const promptsCount = await prisma.prompt.count({
      where: { userId: req.user!.id }
    });

    const recentPrompts = await prisma.prompt.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true
      }
    });

    const categoryStats = await prisma.prompt.groupBy({
      by: ['category'],
      where: { userId: req.user!.id },
      _count: {
        category: true
      }
    });

    res.json({
      success: true,
      data: {
        generationsUsed: user?.generationsUsed || 0,
        generationsLimit: user?.generationsLimit || 100,
        totalPrompts: promptsCount,
        recentPrompts,
        categoryBreakdown: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.category
        })),
        aiProvider: aiService.getProviderStatus(),
        aiConfigured: aiService.isConfigured()
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test email functionality
router.post('/test-email', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send test email
    const result = await emailService.sendTestEmail(user.email);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      emailSent: result,
      emailStatus: emailService.getStatus()
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

// System status endpoint
router.get('/system-status', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    const systemStatus = {
      timestamp: new Date().toISOString(),
      services: {
        ai: {
          provider: aiService.getProviderStatus(),
          configured: aiService.isConfigured(),
          status: 'operational'
        },
        email: {
          ...emailService.getStatus(),
          status: 'operational'
        },
        database: {
          status: 'operational',
          connected: true
        }
      },
      user: {
        id: user?.id,
        email: user?.email,
        tier: user?.tier,
        generationsUsed: user?.generationsUsed,
        generationsLimit: user?.generationsLimit
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      }
    };

    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status'
    });
  }
});

export default router;