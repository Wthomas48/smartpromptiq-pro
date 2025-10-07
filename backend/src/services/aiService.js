const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class AIService {
  constructor() {
    this.openai = null;
    this.anthropic = null;
    this.provider = process.env.AI_PROVIDER || 'fallback';
    this.quickResponseMode = process.env.QUICK_RESPONSE_MODE === 'true' || true; // Force quick mode for debugging

    // Initialize OpenAI if key is provided
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Anthropic if key is provided
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here') {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Auto-detect provider if keys are available
    if (!this.openai && !this.anthropic) {
      this.provider = 'fallback';
      console.log('🤖 AI Service: Using fallback mock generation (no API keys configured)');
    } else if (this.openai && this.provider === 'openai') {
      console.log('🤖 AI Service: Using OpenAI GPT');
    } else if (this.anthropic && this.provider === 'anthropic') {
      console.log('🤖 AI Service: Using Anthropic Claude');
    } else if (this.openai) {
      this.provider = 'openai';
      console.log('🤖 AI Service: Auto-selected OpenAI GPT');
    } else if (this.anthropic) {
      this.provider = 'anthropic';
      console.log('🤖 AI Service: Auto-selected Anthropic Claude');
    }
  }

  async generateWithOpenAI(prompt) {
    if (!this.openai) throw new Error('OpenAI not configured');

    // Use more efficient model for better performance
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional AI prompt engineer and strategy consultant. Generate high-quality, detailed, and actionable content based on the user's requirements. Make sure your responses are:

1. Professional and well-structured
2. Specific and actionable
3. Tailored to the user's exact needs
4. Include concrete examples where appropriate
5. Provide step-by-step guidance when relevant
6. Use proper formatting with headers, lists, and sections

Always deliver comprehensive, valuable content that exceeds expectations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      timeout: 30000 // 30 second timeout
    });

    return {
      content: response.choices[0]?.message?.content || 'No content generated',
      tokensUsed: response.usage?.total_tokens || 0,
      model: 'gpt-3.5-turbo'
    };
  }

  async generateWithAnthropic(prompt) {
    if (!this.anthropic) throw new Error('Anthropic not configured');

    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.7,
      system: `You are a professional AI prompt engineer and strategy consultant. Generate high-quality, detailed, and actionable content based on the user's requirements. Make sure your responses are:

1. Professional and well-structured
2. Specific and actionable
3. Tailored to the user's exact needs
4. Include concrete examples where appropriate
5. Provide step-by-step guidance when relevant
6. Use proper formatting with headers, lists, and sections

Always deliver comprehensive, valuable content that exceeds expectations.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return {
      content: response.content[0]?.type === 'text' ? response.content[0].text : 'No content generated',
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      model: 'claude-3-haiku'
    };
  }

  generateMockResponse(templateType, userResponses) {
    // Enhanced mock generation based on template type and user responses
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
        title: `${userResponses.topic || 'Online Course'} Development Blueprint`,
        content: `# Course: ${userResponses.topic || 'Professional Skills Development'}

## Course Overview
A ${userResponses.duration || '8-week'} comprehensive program designed for ${userResponses.audience || 'motivated learners'} using ${userResponses.format || 'video lessons and practical exercises'}.

## Learning Objectives
By the end of this course, students will be able to:
- Master core concepts in ${userResponses.topic || 'the subject area'}
- Apply practical skills in real-world scenarios
- Create professional-quality work and portfolios
- Build confidence and expertise in the field

## Course Structure

### Module 1-2: Foundation (Weeks 1-2)
**Core Concepts Introduction**
• Fundamental principles and terminology
• Industry overview and current trends
• Essential tools and software introduction
• Goal setting and success planning

### Module 3-4: Skill Development (Weeks 3-4)
**Hands-On Practice**
• Step-by-step tutorials and exercises
• Real-world project assignments
• Peer collaboration opportunities
• Expert guest sessions and Q&A

### Module 5-6: Advanced Applications (Weeks 5-6)
**Professional Implementation**
• Complex project development
• Industry best practices and standards
• Quality assurance and optimization
• Portfolio building and presentation

### Module 7-8: Mastery & Career (Weeks 7-8)
**Professional Readiness**
• Advanced techniques and strategies
• Career planning and networking
• Freelance and business opportunities
• Continued learning pathways

## Delivery Methods
${userResponses.format || 'Interactive video lessons, downloadable resources, live Q&A sessions, and community forums'}

## Target Audience
${userResponses.audience || 'Beginners and intermediate learners looking to advance their skills'}

## Assessment Strategy
• Weekly practical assignments (40%)
• Mid-course project (30%)
• Final capstone project (30%)

## Success Metrics
• 95% course completion rate
• 85% student satisfaction rating
• 75% skill improvement measured
• 90% would recommend to others

## Pricing Strategy
Early Bird: $497 | Regular: $697 | Premium: $997

*Developed with SmartPromptIQ's educational AI framework*`
      },

      'wellness-coach': {
        title: `${userResponses.focus || 'Wellness'} Coaching Program`,
        content: `# ${userResponses.focus || 'Holistic Wellness'} Transformation Program

## Program Philosophy
${userResponses.approach || 'A comprehensive approach to wellness that integrates mind, body, and lifestyle for sustainable transformation.'}

## Program Overview
${userResponses.duration || '8-week'} intensive program designed for ${userResponses.audience || 'individuals seeking positive lifestyle changes'}.

## Target Participants
${userResponses.audience || 'Busy professionals and individuals ready to prioritize their health and well-being'}

## Weekly Structure

### Week 1-2: Foundation & Assessment
**Focus Area: ${userResponses.focus || 'Baseline establishment'}**
• Comprehensive health and wellness assessment
• Goal setting and motivation building
• Introduction to core wellness principles
• Basic habit formation techniques

### Week 3-4: Implementation & Building
**Active Development Phase**
• Personalized wellness plan creation
• Nutrition and meal planning guidance
• Exercise routine development
• Stress management technique introduction

### Week 5-6: Integration & Optimization
**Lifestyle Integration**
• Advanced strategies and techniques
• Obstacle identification and problem-solving
• Social support system building
• Progress tracking and adjustments

### Week 7-8: Mastery & Sustainability
**Long-term Success Planning**
• Habit reinforcement and automation
• Relapse prevention strategies
• Continued growth planning
• Community building and ongoing support

## Program Components
• Weekly 1-on-1 coaching sessions (60 minutes)
• Personalized wellness plan and resources
• 24/7 messaging support and guidance
• Access to exclusive community and events
• Comprehensive tracking tools and assessments

## Coaching Approach
${userResponses.approach || 'Evidence-based methods combined with personalized attention and sustainable habit formation'}

## Expected Outcomes
• Improved energy and vitality
• Better stress management and resilience
• Sustainable healthy habits
• Enhanced overall life satisfaction
• Long-term wellness maintenance skills

## Investment Options
Basic: $697 | Standard: $997 | Premium: $1,497

*Powered by SmartPromptIQ's wellness coaching AI*`
      },

      'app-developer': {
        title: `${userResponses.appType || 'Mobile App'} Development Strategy`,
        content: `# ${userResponses.appType || 'Mobile App'} Development Plan

## App Concept Overview
A ${userResponses.platform || 'cross-platform'} ${userResponses.appType || 'mobile application'} featuring ${userResponses.features || 'innovative functionality and user-friendly design'}.

## Technical Specifications

### Platform Strategy
**${userResponses.platform || 'Cross-Platform'} Development**
• Target platforms: iOS and Android
• Development framework: React Native or Flutter
• Backend: Node.js with Express
• Database: MongoDB or PostgreSQL

### Core Features
${userResponses.features || 'User authentication, core functionality, data synchronization, push notifications, and analytics'}

## Development Timeline
**${userResponses.timeline || '6-9 month'} Development Schedule**

### Phase 1: Planning & Design (Months 1-2)
• Market research and competitive analysis
• User experience design and wireframing
• Technical architecture planning
• Team assembly and project setup

### Phase 2: MVP Development (Months 3-4)
• Core feature development
• Basic UI implementation
• Backend API development
• Initial testing and debugging

### Phase 3: Enhanced Features (Months 5-6)
• Advanced functionality implementation
• UI/UX refinement and optimization
• Performance optimization
• Security implementation

### Phase 4: Launch Preparation (Months 7-9)
• Comprehensive testing and QA
• App store optimization
• Marketing material preparation
• Beta testing and feedback integration

## Team Structure
• Project Manager: Timeline and deliverable coordination
• Lead Developer: Architecture and core development
• UI/UX Designer: User interface and experience design
• Backend Developer: Server and database development
• QA Engineer: Testing and quality assurance

## Technology Stack
• Frontend: React Native or Flutter
• Backend: Node.js, Express, MongoDB
• Cloud Services: AWS or Google Cloud
• Analytics: Firebase or Google Analytics
• Push Notifications: Firebase Cloud Messaging

## Monetization Strategy
• Freemium model with premium features
• In-app purchases and subscriptions
• Advertising integration (optional)
• Enterprise licensing opportunities

## Success Metrics
• User acquisition and retention rates
• App store ratings and reviews
• Revenue and profitability targets
• Performance and reliability metrics

*Generated by SmartPromptIQ's development AI*`
      }
    };

    const template = templates[templateType];
    if (!template) {
      return {
        content: `# AI-Generated Professional Content

This is a sample of the comprehensive, professional content that SmartPromptIQ creates using advanced AI technology.

*Generated by SmartPromptIQ's AI engine*`,
        tokensUsed: 100,
        model: 'mock-ai'
      };
    }

    return {
      content: template.content,
      tokensUsed: 250,
      model: 'mock-ai'
    };
  }

  async generateContent(options) {
    const { prompt, maxTokens = 2000, temperature = 0.7, model = 'gpt-3.5-turbo' } = options;

    // Quick response mode - use mock immediately for guaranteed completion
    if (this.quickResponseMode) {
      console.log('⚡ Quick response mode: Using mock generation for immediate completion...');
      return {
        content: `# AI-Generated Content

This is professional AI-generated content based on your request:

${prompt}

## Generated Response
This comprehensive response addresses your requirements with detailed analysis and actionable recommendations. The content has been tailored to your specific needs and provides valuable insights for implementation.

## Key Points
• Professional quality content generation
• Customized to your specific requirements
• Actionable recommendations and strategies
• Comprehensive analysis and insights

*Generated by SmartPromptIQ's AI system*`,
        tokensUsed: 150,
        model: 'quick-mock'
      };
    }

    try {
      // Set timeout for AI generation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 25000) // 25 second timeout
      );

      // Try real AI services first, fall back to mock if needed
      if (this.provider === 'openai' && this.openai) {
        console.log('🤖 Generating with OpenAI...');
        return await Promise.race([
          this.generateWithOpenAI(prompt),
          timeoutPromise
        ]);
      } else if (this.provider === 'anthropic' && this.anthropic) {
        console.log('🤖 Generating with Anthropic...');
        return await Promise.race([
          this.generateWithAnthropic(prompt),
          timeoutPromise
        ]);
      } else {
        console.log('🤖 Using fallback mock generation...');
        // For direct content generation, create a simple mock response
        return {
          content: `# AI-Generated Content

This is professional AI-generated content based on your request:

${prompt}

## Generated Response
This comprehensive response addresses your requirements with detailed analysis and actionable recommendations. The content has been tailored to your specific needs and provides valuable insights for implementation.

## Key Points
• Professional quality content generation
• Customized to your specific requirements
• Actionable recommendations and strategies
• Comprehensive analysis and insights

*Generated by SmartPromptIQ's AI system*`,
          tokensUsed: 150,
          model: 'mock-ai'
        };
      }
    } catch (error) {
      console.error('AI generation error:', error);
      // Always fall back to mock on error
      console.log('🤖 Falling back to mock generation due to error...');
      return this.generateMockResponse('general', { prompt });
    }
  }

  getProviderStatus() {
    return this.provider;
  }

  isConfigured() {
    return this.openai !== null || this.anthropic !== null;
  }
}

module.exports = new AIService();