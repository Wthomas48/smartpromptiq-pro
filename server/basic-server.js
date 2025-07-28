import express from 'express';
import cors from 'cors';

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
    user: { id: '1', name: req.body.name, email: req.body.email },
    token: 'demo-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login successful (demo mode)',
    user: { id: '1', name: 'Demo User', email: req.body.email },
    token: 'demo-jwt-token'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SmartPromptIQ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
