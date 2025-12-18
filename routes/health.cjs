// routes/health.cjs
const { Router } = require('express');
const r = Router();

r.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    ok: true,
    timestamp: new Date().toISOString(),
    server: 'index.cjs',
    version: '2.1.0',
    sha: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
    environment: process.env.NODE_ENV || 'development'
  });
});

r.get('/version', (_req, res) => {
  res.json({
    sha: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
    built: process.env.BUILD_TIME || new Date().toISOString(),
    node: process.version,
    server: 'index.cjs'
  });
});

module.exports = r;