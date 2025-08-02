import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ensureDatabaseSetup, closeDatabaseConnection } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected!' });
});

// *** SUGGESTIONS ENDPOINTS ***
app.get('/api/suggestions/personalized', (req, res) => {
  try {
    const { category } = req.query;
    
    const suggestions = [
      {
        id: '1',
        title: 'Marketing Campaign Planner',
        description: 'Generate comprehensive marketing campaign strategies',
        category: category || 'marketing',
        prompt: 'Create a detailed marketing campaign for...',
        tags: ['marketing', 'strategy', 'campaign'],
        relevanceScore: 0.95,
        estimatedTokens: 150
      },
      {
        id: '2', 
        title: 'Content Creation Assistant',
        description: 'Help create engaging content for your audience',
        category: category || 'content',
        prompt: 'Write engaging content that...',
        tags: ['content', 'writing', 'engagement'],
        relevanceScore: 0.88,
        estimatedTokens: 120
      },
      {
        id: '3',
        title: 'Business Strategy Guide',
        description: 'Develop effective business strategies for ' + (category || 'any industry'),
        category: category || 'business',
        prompt: 'Create a business strategy for...',
        tags: ['business', 'strategy', 'planning'],
        relevanceScore: 0.92,
        estimatedTokens: 180
      }
    ];
    console.log(`📡 Suggestions requested for category: ${category}`);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

app.get('/api/suggestions/trending', (req, res) => {
  try {
    const suggestions = [
      {
        id: '4',
        title: 'AI Prompt Engineering',
        description: 'Master the art of AI prompt engineering',
        category: 'technical',
        prompt: 'Create effective AI prompts for...',
        tags: ['AI', 'prompt', 'engineering'],
        relevanceScore: 0.97,
        estimatedTokens: 200
      }
    ];
    console.log('📈 Trending suggestions requested');
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trending suggestions' });
  }
});

app.post('/api/suggestions/interaction', (req, res) => {
  try {
    const { suggestionId, action } = req.body;
    console.log(`👤 User ${action} suggestion ${suggestionId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

app.post('/api/suggestions/generate', (req, res) => {
  try {
    const { prompt, context } = req.body;
    console.log('🎯 Generating suggestions for:', prompt);
    const generatedSuggestions = [
      {
        id: Date.now().toString(),
        title: 'Generated Suggestion',
        description: `AI-generated suggestion based on: ${prompt}`,
        prompt: `Enhanced prompt: ${prompt}`,
        category: 'generated'
      }
    ];
    res.json({ suggestions: generatedSuggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

app.post('/api/suggestions/rate', (req, res) => {
  try {
    const { suggestionId, rating } = req.body;
    console.log(`⭐ Suggestion ${suggestionId} rated: ${rating}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate suggestion' });
  }
});

// *** FINANCIAL PLANNING ENDPOINTS ***
app.post('/api/financial/revenue-model', (req, res) => {
  try {
    const data = req.body;
    console.log('💰 Revenue model request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Revenue Model for ${data.businessType || 'Business'}`,
      prompt: `Create a comprehensive revenue model for a ${data.businessType} business targeting ${data.targetMarket} with ${data.revenueStreams} revenue streams.`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    console.error('Error in revenue model:', error);
    res.status(500).json({ error: 'Failed to generate revenue model' });
  }
});

app.post('/api/financial/funding-strategy', (req, res) => {
  try {
    const data = req.body;
    console.log('🏦 Funding strategy request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Funding Strategy for ${data.fundingType || 'Startup'}`,
      prompt: `Develop a funding strategy for ${data.fundingAmount} in ${data.fundingType} funding for a ${data.businessStage} company.`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate funding strategy' });
  }
});

app.post('/api/financial/pitch-deck', (req, res) => {
  try {
    const data = req.body;
    console.log('📊 Pitch deck request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Pitch Deck for ${data.companyName || 'Startup'}`,
      prompt: `Create a compelling pitch deck for ${data.companyName} that addresses ${data.problemStatement} with solution ${data.solution}.`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate pitch deck' });
  }
});

app.post('/api/financial/projections', (req, res) => {
  try {
    const data = req.body;
    console.log('📈 Financial projections request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Financial Projections for ${data.timeframe || '3 years'}`,
      prompt: `Create detailed financial projections for ${data.timeframe} including revenue, expenses, and growth assumptions.`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate projections' });
  }
});

// *** MARKETING ENDPOINTS ***
app.post('/api/marketing/social-campaign', (req, res) => {
  try {
    const data = req.body;
    console.log('📱 Social campaign request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Social Campaign for ${data.product || 'Product'}`,
      prompt: `Create a social media campaign for ${data.product} on ${data.platform} targeting ${data.audience}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate social campaign' });
  }
});

app.post('/api/marketing/seo-strategy', (req, res) => {
  try {
    const data = req.body;
    console.log('🔍 SEO strategy request:', data);
    const result = {
      id: Date.now().toString(),
      title: `SEO Strategy for ${data.website || 'Website'}`,
      prompt: `Develop an SEO strategy for ${data.website} targeting keywords: ${data.keywords}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate SEO strategy' });
  }
});

app.post('/api/marketing/brand-strategy', (req, res) => {
  try {
    const data = req.body;
    console.log('🎨 Brand strategy request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Brand Strategy for ${data.brandName || 'Brand'}`,
      prompt: `Create a brand strategy for ${data.brandName} targeting ${data.targetAudience} with positioning: ${data.positioning}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate brand strategy' });
  }
});

app.post('/api/marketing/content-ideas', (req, res) => {
  try {
    const data = req.body;
    console.log('💡 Content ideas request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Content Ideas for ${data.contentType || 'Content'}`,
      prompt: `Generate ${data.contentType} content ideas for ${data.platform} about ${data.topic}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate content ideas' });
  }
});

app.post('/api/marketing/keyword-strategy', (req, res) => {
  try {
    const data = req.body;
    console.log('🔑 Keyword strategy request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Keyword Strategy for ${data.niche || 'Business'}`,
      prompt: `Develop a keyword strategy for ${data.niche} focusing on ${data.keywordType} keywords`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate keyword strategy' });
  }
});

app.post('/api/marketing/brand-messaging', (req, res) => {
  try {
    const data = req.body;
    console.log('📢 Brand messaging request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Brand Messaging for ${data.brand || 'Brand'}`,
      prompt: `Create brand messaging for ${data.brand} that communicates ${data.value} to ${data.audience}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate brand messaging' });
  }
});

// *** PRODUCT DEVELOPMENT ENDPOINTS ***
app.post('/api/product/mvp-planning', (req, res) => {
  try {
    const data = req.body;
    console.log('🚀 MVP planning request:', data);
    const result = {
      id: Date.now().toString(),
      title: `MVP Plan for ${data.productName || 'Product'}`,
      prompt: `Create an MVP plan for ${data.productName} with core features: ${data.coreFeatures}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate MVP plan' });
  }
});

app.post('/api/product/ux-design', (req, res) => {
  try {
    const data = req.body;
    console.log('🎨 UX design request:', data);
    const result = {
      id: Date.now().toString(),
      title: `UX Design for ${data.productType || 'Product'}`,
      prompt: `Design UX for ${data.productType} focusing on ${data.userGoals} and ${data.designPrinciples}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate UX design' });
  }
});

app.post('/api/product/competitive-analysis', (req, res) => {
  try {
    const data = req.body;
    console.log('🔍 Competitive analysis request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Competitive Analysis for ${data.industry || 'Industry'}`,
      prompt: `Analyze competitors in ${data.industry} focusing on ${data.analysisAreas}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate competitive analysis' });
  }
});

// *** EDUCATION ENDPOINTS ***
app.post('/api/education/course-creation', (req, res) => {
  try {
    const data = req.body;
    console.log('📚 Course creation request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Course: ${data.courseTitle || 'Educational Course'}`,
      prompt: `Create a course on ${data.subject} for ${data.audience} with ${data.duration} duration`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate course' });
  }
});

app.post('/api/education/skill-development', (req, res) => {
  try {
    const data = req.body;
    console.log('🎯 Skill development request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Skill Development: ${data.skillArea || 'Professional Skills'}`,
      prompt: `Develop a plan for learning ${data.skillArea} at ${data.currentLevel} level`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate skill development plan' });
  }
});

app.post('/api/education/research-insights', (req, res) => {
  try {
    const data = req.body;
    console.log('🔬 Research insights request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Research: ${data.researchTopic || 'Academic Research'}`,
      prompt: `Conduct research on ${data.researchTopic} focusing on ${data.researchScope}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate research insights' });
  }
});

// *** PERSONAL DEVELOPMENT ENDPOINTS ***
app.post('/api/personal/goal-setting', (req, res) => {
  try {
    const data = req.body;
    console.log('🎯 Goal setting request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Goal Setting: ${data.goalType || 'Personal Goals'}`,
      prompt: `Create a goal-setting plan for ${data.goalType} over ${data.timeframe}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate goal setting plan' });
  }
});

app.post('/api/personal/public-speaking', (req, res) => {
  try {
    const data = req.body;
    console.log('🎤 Public speaking request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Public Speaking: ${data.speechType || 'Presentation'}`,
      prompt: `Prepare a ${data.speechType} for ${data.audience} about ${data.topic}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate public speaking guide' });
  }
});

app.post('/api/personal/networking', (req, res) => {
  try {
    const data = req.body;
    console.log('🤝 Networking request:', data);
    const result = {
      id: Date.now().toString(),
      title: `Networking Strategy for ${data.industry || 'Professional'}`,
      prompt: `Create a networking strategy for ${data.industry} professionals focusing on ${data.goals}`,
      generatedAt: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate networking strategy' });
  }
});

// *** CORE PROMPT GENERATION ENDPOINTS ***
app.post('/api/generate-prompt', (req, res) => {
  try {
    const { answers, category } = req.body;
    console.log('🎯 Generating prompt for category:', category);
    const result = {
      id: Date.now().toString(),
      prompt: `Generated prompt based on your ${category} requirements: ${JSON.stringify(answers)}`,
      category,
      generatedAt: new Date().toISOString(),
      tokens: Math.floor(Math.random() * 200) + 50
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

app.post('/api/prompts', (req, res) => {
  try {
    const { title, prompt, category, tags } = req.body;
    console.log('💾 Saving prompt:', title);
    const result = {
      id: Date.now().toString(),
      title,
      prompt,
      category,
      tags,
      createdAt: new Date().toISOString(),
      userId: 'demo-user-1'
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save prompt' });
  }
});

app.get('/api/prompts', (req, res) => {
  try {
    console.log('📋 Fetching user prompts');
    const mockPrompts = [
      {
        id: '1',
        title: 'Marketing Campaign',
        prompt: 'Create a marketing campaign for...',
        category: 'marketing',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Product Strategy',
        prompt: 'Develop a product strategy for...',
        category: 'product',
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockPrompts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    console.log('📊 Fetching user stats');
    const stats = {
      totalPrompts: 45,
      promptsThisMonth: 12,
      favoriteCategory: 'marketing',
      tokensUsed: 15420,
      avgTokensPerPrompt: 342
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// *** ADDITIONAL ENDPOINTS (Billing, Teams, etc.) ***
app.get('/api/billing/info', (req, res) => {
  try {
    const billingInfo = {
      plan: 'Free',
      usage: { prompts: 15, limit: 50 },
      nextBilling: null
    };
    res.json(billingInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing info' });
  }
});

app.post('/api/billing/upgrade', (req, res) => {
  try {
    const { plan } = req.body;
    console.log('💳 Upgrade request to plan:', plan);
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
});

app.get('/api/teams', (req, res) => {
  try {
    const teams = [
      { id: '1', name: 'Marketing Team', members: 5 },
      { id: '2', name: 'Product Team', members: 3 }
    ];
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/refine-prompt', (req, res) => {
  try {
    const { prompt, refinementType } = req.body;
    console.log('✨ Refining prompt:', refinementType);
    const refined = {
      originalPrompt: prompt,
      refinedPrompt: `Refined ${refinementType}: ${prompt}`,
      improvements: ['More specific', 'Better structure', 'Clearer context']
    };
    res.json(refined);
  } catch (error) {
    res.status(500).json({ error: 'Failed to refine prompt' });
  }
});

// *** ADMIN ENDPOINTS ***
app.post('/api/admin/verify', (req, res) => {
  try {
    const { email, password } = req.body;
    // Simple admin check
    if (email === 'admin@smartpromptiq.net' && password === 'admin123') {
      res.json({ success: true, role: 'admin' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Admin verification failed' });
  }
});

async function startServer() {
  try {
    console.log('🔄 Connecting to database...');
    await ensureDatabaseSetup();
    console.log('✅ Database connected successfully at:', new Date().toISOString());
    console.log('📦 Database setup complete');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

startServer();

// Import and use marketing routes
import socialCampaignRoutes from './routes/marketing/socialCampaign';
app.use('/api/marketing', socialCampaignRoutes);