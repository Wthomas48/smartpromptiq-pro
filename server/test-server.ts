import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;
  
  // Demo login
  if (email && password) {
    res.json({
      token: 'demo-token-' + Date.now(),
      user: {
        id: 'demo-user-1',
        email: email,
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: 'free',
        tokenBalance: 10
      }
    });
  } else {
    res.status(400).json({ error: 'Email and password required' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Me endpoint
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 'demo-user-1',
    email: 'demo@smartpromptiq.com',
    firstName: 'Demo',
    lastName: 'User',
    subscriptionTier: 'free',
    tokenBalance: 10
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
