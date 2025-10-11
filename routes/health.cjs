// routes/health.cjs
const { Router } = require('express');
const r = Router();

r.get('/health', (_req, res) => res.status(200).json({ ok: true }));

r.get('/version', (_req, res) => {
  res.json({
    sha: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
    built: process.env.BUILD_TIME || new Date().toISOString(),
    node: process.version
  });
});

module.exports = r;