import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ensureDatabaseSetup, closeDatabaseConnection } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected!' });
});

// *** NEW SUGGESTIONS ENDPOINTS ***
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
