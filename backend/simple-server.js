const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Mock user database
const users = [
  { id: '1', email: 'demo@example.com', password: 'password123', firstName: 'Demo', lastName: 'User' }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  // For demo purposes, accept any credentials
  const user = {
    id: '1',
    email: email || 'demo@smartpromptiq.com',
    firstName: 'Demo',
    lastName: 'User',
    subscriptionTier: 'free',
    tokenBalance: 10
  };
  
  const token = 'demo-jwt-token-' + Date.now();
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token
    }
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  console.log('Register attempt:', { email, firstName, lastName });
  
  const user = {
    id: Date.now().toString(),
    email,
    firstName: firstName || 'New',
    lastName: lastName || 'User',
    subscriptionTier: 'free',
    tokenBalance: 10
  };
  
  const token = 'demo-jwt-token-' + Date.now();
  
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      token
    }
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  // Mock user data
  const user = {
    id: '1',
    email: 'demo@smartpromptiq.com',
    firstName: 'Demo',
    lastName: 'User',
    subscriptionTier: 'free',
    tokenBalance: 10
  };
  
  res.json({
    success: true,
    data: { user }
  });
});

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
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
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
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
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

// Add missing API endpoints for templates/suggestions
app.get('/api/suggestions/personalized', (req, res) => {
  const { category } = req.query;

  // Mock suggestions based on category
  const suggestions = [
    `Create a ${category} strategy that focuses on user engagement`,
    `Develop ${category} content that drives measurable results`,
    `Implement ${category} best practices for maximum impact`
  ];

  res.json({
    suggestions,
    category,
    success: true
  });
});

// Generate prompt endpoint
app.post('/api/generate-prompt', (req, res) => {
  const { category, answers, customization } = req.body;

  // Mock prompt generation
  const prompt = `Based on your ${category} requirements and customization preferences (${customization?.tone || 'professional'} tone, ${customization?.detailLevel || 'comprehensive'} detail level), here's your generated prompt: [Generated prompt content would go here]`;

  res.json({
    prompt,
    success: true
  });
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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

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

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/health', '/api/health', '/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/teams', '/api/billing/info', '/api/suggestions/personalized', '/api/generate-prompt', '/api/prompts']
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Backend running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`👤 User Info: GET http://localhost:${PORT}/api/auth/me`);
  console.log(`👥 Teams: GET http://localhost:${PORT}/api/teams`);
  console.log(`➕ Create Team: POST http://localhost:${PORT}/api/teams`);
});