const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root route - Clean version without health page reference
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SmartPromptiq Pro</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 30px; }
        .status { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 20px 0; }
        .feature { background: rgba(255,255,255,0.15); padding: 15px; margin: 10px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 SmartPromptiq Pro</h1>
        <div class="status">
          <strong>Status:</strong> ✅ Live and Running<br>
          <strong>Version:</strong> 2.0.0<br>
          <strong>Updated:</strong> ${new Date().toLocaleString()}
        </div>
        
        <h3>🎯 AI-Powered Prompt Optimization</h3>
        <div class="feature">
          <strong>✨ Smart Prompts</strong><br>
          Generate optimized prompts for better AI responses
        </div>
        <div class="feature">
          <strong>🔧 Prompt Refinement</strong><br>
          Automatically enhance your prompts for maximum effectiveness  
        </div>
        <div class="feature">
          <strong>📊 Performance Analytics</strong><br>
          Track and measure your prompt performance
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>🎉 Your SmartPromptiq Pro platform is ready!</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Keep health endpoint for Railway but don't show it on main page
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API info endpoint  
app.get('/api/info', (req, res) => {
  res.json({
    name: 'SmartPromptiq Pro API',
    version: '2.0.0',
    description: 'AI-powered prompt optimization platform',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SmartPromptiq Pro running on port ${PORT}`);
  console.log(`🌐 Version 2.0.0 deployed successfully`);
});
