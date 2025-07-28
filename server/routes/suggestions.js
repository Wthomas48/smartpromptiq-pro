const express = require('express');
const router = express.Router();

// Personalized suggestions endpoint
router.get('/personalized', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Mock data for now - replace with your database logic
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
      }
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Trending suggestions endpoint
router.get('/trending', async (req, res) => {
  try {
    const suggestions = [
      {
        id: '3',
        title: 'Business Strategy Guide',
        description: 'Develop effective business strategies',
        category: 'business',
        prompt: 'Create a business strategy for...',
        tags: ['business', 'strategy', 'planning'],
        relevanceScore: 0.92,
        estimatedTokens: 180
      }
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trending suggestions' });
  }
});

// Record interaction endpoint
router.post('/interaction', async (req, res) => {
  try {
    const { suggestionId, action } = req.body;
    // Log interaction - replace with database logic
    console.log(`User ${action} suggestion ${suggestionId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

module.exports = router;
