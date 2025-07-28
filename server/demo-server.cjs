const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'SmartPromptIQ Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Registration successful (demo mode)',
    user: { 
      id: '1', 
      firstName: req.body.firstName || 'Demo',
      lastName: req.body.lastName || 'User',
      email: req.body.email,
      subscriptionTier: 'free',
      tokenBalance: 10
    },
    token: 'demo-jwt-token-' + Date.now()
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({
    token: 'demo-jwt-token-' + Date.now(),
    user: { 
      id: '1', 
      firstName: 'Demo',
      lastName: 'User',
      email: req.body.email || 'demo@smartpromptiq.com',
      subscriptionTier: 'free',
      tokenBalance: 10
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: '1',
    email: 'demo@smartpromptiq.com',
    firstName: 'Demo',
    lastName: 'User',
    subscriptionTier: 'free',
    tokenBalance: 10
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
