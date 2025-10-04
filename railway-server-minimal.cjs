const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 RAILWAY SERVER STARTING...');
console.log('Current time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

// Minimal essential middleware
app.use(express.json({ limit: '1mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
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
  const { email } = req.body;
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
});

app.post('/api/auth/register', (req, res) => {
  const { email, firstName, lastName } = req.body;
  res.json({
    success: true,
    token: 'demo-token',
    user: {
      id: 'demo-' + Date.now(),
      email: email || 'demo@example.com',
      firstName: firstName || 'Demo',
      lastName: lastName || 'User',
      role: 'USER',
      subscriptionTier: 'free',
      plan: 'free',
      tokenBalance: 1000
    }
  });
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

// Demo rate limiting - simple in-memory store for production
const demoUsage = new Map();
const DEMO_LIMITS = {
  MAX_REQUESTS_PER_IP: 20, // 20 requests per IP per hour
  MAX_REQUESTS_PER_EMAIL: 10, // 10 requests per email per hour
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
  MAX_DAILY_TOTAL: 5000 // Total daily limit across all users
};

let dailyDemoCount = 0;
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;

// Demo generation endpoint with rate limiting
app.post('/api/demo/generate', (req, res) => {
  try {
    const { template, responses, userEmail } = req.body;
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
          message: 'You have reached the demo limit for this email. Please try again later.',
          retryAfter: Math.ceil((emailUsage.resetTime - now) / 1000)
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
    if (!template || typeof template !== 'string') {
      return res.status(400).json({
        error: 'Invalid template',
        message: 'Template parameter is required and must be a string'
      });
    }

    if (template.length > 50) {
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

    console.log('🎯 Demo generate request:', {
      template,
      userEmail,
      clientIP,
      responseCount: Object.keys(responses || {}).length,
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

    const response = demoResponses[template] || {
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

// Demo send results endpoint
app.post('/api/demo/send-results', (req, res) => {
  try {
    const { email, results, template } = req.body;
    console.log('📧 Demo send results request:', { email, template, resultsLength: results?.content?.length });

    // Input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Email is required'
      });
    }

    if (!results || !results.content) {
      return res.status(400).json({
        success: false,
        error: 'Invalid results',
        message: 'Results content is required'
      });
    }

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