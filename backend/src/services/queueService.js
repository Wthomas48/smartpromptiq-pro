const Bull = require('bull');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create demo generation queue with Redis configuration
const demoQueue = new Bull('demo-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50,     // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// AI Service integration for actual generation
const generateDemoLogic = async (demoData) => {
  try {
    const { templateType, userResponses, generateRealPrompt } = demoData;

    // If real AI generation is requested, use actual AI service
    if (generateRealPrompt) {
      const aiService = require('./aiService');

      // Construct a comprehensive prompt based on template and responses
      const aiPrompt = constructAIPrompt(templateType, userResponses);

      // Generate using AI service
      const aiResponse = await aiService.generateContent({
        prompt: aiPrompt,
        maxTokens: 2000,
        temperature: 0.7,
        model: 'gpt-3.5-turbo'
      });

      return {
        title: `AI-Generated ${getTemplateTitle(templateType)}`,
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        model: aiResponse.model,
        generatedAt: new Date().toISOString(),
        isRealGeneration: true
      };
    }

    // Otherwise, return enhanced sample content with dynamic elements
    const sampleContent = generateEnhancedSampleContent(templateType, userResponses);

    return {
      title: sampleContent.title,
      content: sampleContent.content,
      generatedAt: new Date().toISOString(),
      isRealGeneration: false,
      templateType
    };

  } catch (error) {
    console.error('Demo generation logic error:', error);
    throw new Error(`Demo generation failed: ${error.message}`);
  }
};

// Construct AI prompt based on template type and user responses
const constructAIPrompt = (templateType, userResponses) => {
  const basePrompts = {
    'startup-pitch': `Create a comprehensive startup pitch deck based on the following information:
Business Name: ${userResponses.businessName || 'TechStartup'}
Industry: ${userResponses.industry || 'Technology'}
Problem: ${userResponses.problem || 'Market inefficiency'}
Solution: ${userResponses.solution || 'Innovative platform'}
Target Market: ${userResponses.targetMarket || 'Businesses'}
Revenue Model: ${userResponses.revenueModel || 'SaaS Subscription'}

Please create a detailed pitch deck with sections for problem statement, solution, market opportunity, business model, financial projections, and funding request. Make it professional and compelling.`,

    'social-campaign': `Create a comprehensive social media campaign strategy based on:
Product/Service: ${userResponses.productService || 'Digital Product'}
Target Audience: ${userResponses.targetAudience || 'Young professionals'}
Campaign Goal: ${userResponses.campaignGoal || 'Brand Awareness'}
Budget: ${userResponses.budget || '$1,000-5,000'}
Duration: ${userResponses.duration || '4-6 weeks'}
Platforms: ${userResponses.platforms || 'Instagram, Facebook, TikTok'}

Create a detailed campaign strategy with content calendar, platform-specific tactics, budget allocation, and success metrics.`,

    'financial-planner': `Create a comprehensive financial plan based on:
Age Group: ${userResponses.age || '30-40'}
Income Level: ${userResponses.income || '$50K-100K'}
Financial Goals: ${userResponses.goals || 'Save for retirement and home'}
Timeline: ${userResponses.timeline || '5-10 years'}

Create a detailed financial roadmap with investment strategies, savings goals, risk management, and milestone planning.`,

    'course-creator': `Design a comprehensive online course based on:
Topic: ${userResponses.topic || 'Digital Skills'}
Target Audience: ${userResponses.audience || 'Beginners'}
Duration: ${userResponses.duration || '6-8 weeks'}
Format: ${userResponses.format || 'Video lessons and worksheets'}

Create a detailed course structure with modules, learning objectives, assessments, and pricing strategy.`,

    'wellness-coach': `Create a wellness coaching program based on:
Focus Area: ${userResponses.focus || 'Stress Management'}
Duration: ${userResponses.duration || '8 weeks'}
Target Audience: ${userResponses.audience || 'Busy professionals'}
Approach: ${userResponses.approach || 'Mindfulness-based methods'}

Design a comprehensive wellness program with weekly breakdown, tools, resources, and success metrics.`,

    'app-developer': `Create a mobile app development plan based on:
App Type: ${userResponses.appType || 'Productivity'}
Platform: ${userResponses.platform || 'Cross-Platform'}
Core Features: ${userResponses.features || 'Task management and collaboration'}
Timeline: ${userResponses.timeline || '6-9 months'}

Create a detailed development strategy with technical architecture, feature roadmap, team structure, and monetization plan.`
  };

  return basePrompts[templateType] || `Create professional content for ${templateType} based on the provided information: ${JSON.stringify(userResponses)}`;
};

// Get template title for AI generation
const getTemplateTitle = (templateType) => {
  const titles = {
    'startup-pitch': 'Startup Pitch Deck',
    'social-campaign': 'Social Media Campaign Strategy',
    'financial-planner': 'Financial Planning Guide',
    'course-creator': 'Online Course Blueprint',
    'wellness-coach': 'Wellness Coaching Program',
    'app-developer': 'Mobile App Development Plan'
  };
  return titles[templateType] || 'Professional Content';
};

// Enhanced sample content generator with dynamic elements
const generateEnhancedSampleContent = (templateType, userResponses) => {
  // This is the fallback sample content that can be customized based on user responses
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
• Content Creation: 30% (${Math.round(parseInt(userResponses.budget?.replace(/[^0-9]/g, '') || '5000') * 0.3)})
• Paid Advertising: 50% (${Math.round(parseInt(userResponses.budget?.replace(/[^0-9]/g, '') || '5000') * 0.5)})
• Influencer Partnerships: 15% (${Math.round(parseInt(userResponses.budget?.replace(/[^0-9]/g, '') || '5000') * 0.15)})
• Tools & Analytics: 5% (${Math.round(parseInt(userResponses.budget?.replace(/[^0-9]/g, '') || '5000') * 0.05)})

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

## Professional Guidance
Recommended consultation with:
• Fee-only financial advisor
• Tax planning professional
• Estate planning attorney
• Insurance specialist

This comprehensive plan provides a roadmap to achieve ${userResponses.goals || 'your financial goals'} within the specified ${userResponses.timeline || '5-10 year'} timeframe.

*Created using SmartPromptIQ's financial planning AI*`
    }
  };

  // Add other templates here (course-creator, wellness-coach, app-developer)
  // For brevity, using the startup-pitch template as fallback
  return templates[templateType] || templates['startup-pitch'];
};

// Process jobs with concurrency control
demoQueue.process(5, async (job) => {
  const { demoData, userId, requestId } = job.data;

  try {
    console.log(`🎯 Processing demo generation job ${job.id} for user ${userId}`);

    // Update job progress
    await job.progress(10);

    // Log the generation request if userId is provided
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastGenerationAt: new Date(),
          // Increment demo generation count if field exists
        }
      }).catch(err => {
        console.log('Could not update user stats (non-critical):', err.message);
      });
    }

    await job.progress(30);

    // Generate the demo content
    const result = await generateDemoLogic(demoData);

    await job.progress(80);

    // Log successful generation
    console.log(`✅ Demo generation completed for job ${job.id}`);

    await job.progress(100);

    return {
      success: true,
      data: result,
      requestId,
      generatedAt: new Date().toISOString(),
      jobId: job.id
    };

  } catch (error) {
    console.error(`❌ Demo generation failed for job ${job.id}:`, error);

    // Log failed generation attempt
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastGenerationAt: new Date(),
        }
      }).catch(err => {
        console.log('Could not update user stats (non-critical):', err.message);
      });
    }

    throw error;
  }
});

// Queue event handlers
demoQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

demoQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

demoQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled and will be retried`);
});

demoQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

// API endpoint middleware function
const addDemoToQueue = async (req, res) => {
  try {
    const { templateType, userResponses, generateRealPrompt = false } = req.body;
    const userId = req.user?.id; // Optional user ID
    const requestId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate required fields
    if (!templateType) {
      return res.status(400).json({
        success: false,
        error: 'Template type is required'
      });
    }

    // Add job to queue with priority and options
    const job = await demoQueue.add(
      'generateDemo',
      {
        demoData: {
          templateType,
          userResponses: userResponses || {},
          generateRealPrompt
        },
        userId,
        requestId
      },
      {
        priority: generateRealPrompt ? 1 : 5, // Higher priority for real AI generation
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: requestId // Use requestId as jobId for tracking
      }
    );

    console.log(`📥 Demo generation job ${job.id} added to queue for template: ${templateType}`);

    // Wait for job completion with timeout
    const timeoutMs = 30000; // 30 seconds timeout
    const result = await Promise.race([
      job.finished(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Generation timeout')), timeoutMs)
      )
    ]);

    // Return successful result
    res.json({
      success: true,
      message: 'Demo content generated successfully',
      data: result.data,
      meta: {
        jobId: job.id,
        requestId,
        queueStats: await getQueueStats()
      }
    });

  } catch (error) {
    console.error('Demo generation API error:', error);

    // Handle specific error types
    if (error.message === 'Generation timeout') {
      return res.status(408).json({
        success: false,
        error: 'Demo generation timed out. Please try again.',
        code: 'GENERATION_TIMEOUT'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Demo generation failed',
      code: 'GENERATION_ERROR'
    });
  }
};

// Get queue statistics
const getQueueStats = async () => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      demoQueue.getWaiting(),
      demoQueue.getActive(),
      demoQueue.getCompleted(),
      demoQueue.getFailed()
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      total: 0
    };
  }
};

// Queue management endpoints
const getQueueStatus = async (req, res) => {
  try {
    const stats = await getQueueStats();

    res.json({
      success: true,
      data: {
        queueName: 'demo-generation',
        stats,
        health: stats.total < 100 ? 'healthy' : 'high_load',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    });
  }
};

// Clean up completed and failed jobs
const cleanQueue = async (req, res) => {
  try {
    const grace = 24 * 60 * 60 * 1000; // 24 hours

    await Promise.all([
      demoQueue.clean(grace, 'completed'),
      demoQueue.clean(grace, 'failed')
    ]);

    res.json({
      success: true,
      message: 'Queue cleaned successfully'
    });
  } catch (error) {
    console.error('Queue cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clean queue'
    });
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down demo queue...');
  await demoQueue.close();
  await prisma.$disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  demoQueue,
  addDemoToQueue,
  getQueueStatus,
  cleanQueue,
  getQueueStats,
  generateDemoLogic
};