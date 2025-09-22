const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 RAILWAY EMERGENCY SERVER STARTING');
console.log('📡 PORT:', PORT);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// Immediate health check - NO DELAYS
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root health check
app.get('/', (req, res) => {
  res.status(200).send('Railway Emergency Server - OK');
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Railway Emergency Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});