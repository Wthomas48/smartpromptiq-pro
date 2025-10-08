import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// ✅ AUTH PROXY: Bypass Railway middleware validation issues
// This proxies auth requests to avoid production middleware problems

// Proxy endpoint for registration - bypasses Railway middleware
router.post('/proxy/register', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔄 Proxying registration request:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      timestamp: new Date().toISOString()
    });

    // Clean and validate the data before proxying
    const userData = {
      email: req.body.email?.trim().toLowerCase(),
      password: req.body.password,
      firstName: req.body.firstName?.trim() || 'User',
      lastName: req.body.lastName?.trim() || ''
    };

    // Forward the request to our actual auth endpoint (internal)
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AuthProxy/1.0',
        'X-Forwarded-For': req.ip,
        'X-Original-Host': req.get('host') || 'localhost'
      },
      body: JSON.stringify(userData)
    });

    // Get the response
    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', responseText);
      data = { error: 'Invalid response from registration service', rawResponse: responseText };
    }

    // Log for debugging
    console.log('📥 Proxy API Response:', {
      status: response.status,
      ok: response.ok,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Return the same status and data
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration service unavailable',
      message: error.message,
      proxy: true
    });
  }
});

// Proxy for login
router.post('/proxy/login', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔄 Proxying login request:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(`${req.protocol}://${req.get('host')}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AuthProxy/1.0',
        'X-Forwarded-For': req.ip
      },
      body: JSON.stringify(req.body)
    });

    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse login response as JSON:', responseText);
      data = { error: 'Invalid response from login service', rawResponse: responseText };
    }

    console.log('📥 Proxy login response:', {
      status: response.status,
      success: data.success
    });

    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Login proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Login service unavailable',
      message: error.message,
      proxy: true
    });
  }
});

// Proxy health check
router.get('/proxy/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    service: 'AuthProxy',
    timestamp: new Date().toISOString(),
    proxy: true
  });
});

export default router;