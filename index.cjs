const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root route - Fixed to show proper webpage
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>SmartPromptiq Pro</title></head>
    <body style="font-family: Arial; margin: 50px; background: #f0f2f5;">
      <h1>🚀 SmartPromptiq Pro</h1>
      <p><strong>Status:</strong> ✅ Server Running</p>
      <p><strong>Time:</strong> ${new Date()}</p>
      <h3>API Endpoints:</h3>
      <ul>
        <li><a href="/api/health">Health Check</a></li>
        <li><a href="/api/info">API Info</a></li>
      </ul>
    </body>
    </html>
  `);
});

// Health endpoint  
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'SmartPromptiq Pro',
    version: '1.0.0',
    status: 'running'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});
