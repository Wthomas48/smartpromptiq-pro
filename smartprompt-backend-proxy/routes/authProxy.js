const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// Target backend URL
const TARGET_BACKEND = process.env.TARGET_BACKEND || 'https://smartpromptiq.up.railway.app';

// Generate device fingerprint helper
const generateDeviceFingerprint = (req) => {
  const fingerprint = {
    userAgent: req.get('User-Agent') || 'SmartPromptIQ-Proxy/1.0',
    ip: req.ip,
    timestamp: Date.now(),
    proxy: true
  };
  return Buffer.from(JSON.stringify(fingerprint)).toString('base64').slice(0, 32);
};

// Proxy endpoint for registration - bypasses Railway middleware
router.post('/auth/register', async (req, res) => {
  try {
    console.log('🔄 [PROXY] Registration request received:', {
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

    // Validate required fields
    if (!userData.email || !userData.password) {
      console.error('❌ [PROXY] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        proxy: true
      });
    }

    // Generate device fingerprint for the request
    const deviceFingerprint = generateDeviceFingerprint(req);

    // Prepare headers for the target backend
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SmartPromptIQ-Proxy/1.0',
      'X-Forwarded-For': req.ip,
      'X-Original-Host': req.get('host') || 'proxy.smartpromptiq.com',
      'X-Device-Fingerprint': deviceFingerprint,
      'X-Client-Version': '1.0.0',
      'Origin': req.get('origin') || 'https://smartpromptiq.com'
    };

    // Forward the request to the target backend
    const targetUrl = `${TARGET_BACKEND}/api/auth/register`;
    console.log(`📡 [PROXY] Forwarding to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(userData)
    });

    // Get the response
    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [PROXY] Failed to parse response as JSON:', responseText);
      data = {
        success: false,
        error: 'Invalid response from registration service',
        rawResponse: responseText.slice(0, 200),
        proxy: true
      };
    }

    // Log the response for debugging
    console.log('📥 [PROXY] Backend Response:', {
      status: response.status,
      ok: response.ok,
      success: data.success,
      hasData: !!data,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Return the same status and data with proxy indicator
    if (data && typeof data === 'object') {
      data.proxy = true;
    }

    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ [PROXY] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration service unavailable',
      message: error.message,
      proxy: true
    });
  }
});

// Proxy endpoint for login
router.post('/auth/login', async (req, res) => {
  try {
    console.log('🔄 [PROXY] Login request received:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!req.body.email || !req.body.password) {
      console.error('❌ [PROXY] Missing login credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        proxy: true
      });
    }

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(req);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SmartPromptIQ-Proxy/1.0',
      'X-Forwarded-For': req.ip,
      'X-Original-Host': req.get('host') || 'proxy.smartpromptiq.com',
      'X-Device-Fingerprint': deviceFingerprint,
      'X-Client-Version': '1.0.0',
      'Origin': req.get('origin') || 'https://smartpromptiq.com'
    };

    const targetUrl = `${TARGET_BACKEND}/api/auth/login`;
    console.log(`📡 [PROXY] Forwarding login to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body)
    });

    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [PROXY] Failed to parse login response as JSON:', responseText);
      data = {
        success: false,
        error: 'Invalid response from login service',
        rawResponse: responseText.slice(0, 200),
        proxy: true
      };
    }

    console.log('📥 [PROXY] Login response:', {
      status: response.status,
      success: data.success,
      hasToken: !!(data.token || data.user)
    });

    // Add proxy indicator
    if (data && typeof data === 'object') {
      data.proxy = true;
    }

    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ [PROXY] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login service unavailable',
      message: error.message,
      proxy: true
    });
  }
});

// Proxy health check for auth services
router.get('/auth/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AuthProxy',
    timestamp: new Date().toISOString(),
    targetBackend: TARGET_BACKEND,
    proxy: true
  });
});

// Generic auth proxy for other auth endpoints
router.all('/auth/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/auth', '');
    const targetUrl = `${TARGET_BACKEND}/api/auth${endpoint}`;

    console.log(`🔄 [PROXY] Generic auth request: ${req.method} ${targetUrl}`);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SmartPromptIQ-Proxy/1.0',
      'X-Forwarded-For': req.ip,
      'Authorization': req.get('Authorization'),
      'X-Device-Fingerprint': generateDeviceFingerprint(req)
    };

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
      if (data && typeof data === 'object') {
        data.proxy = true;
      }
    } catch (parseError) {
      data = {
        error: 'Invalid response from auth service',
        rawResponse: responseText.slice(0, 200),
        proxy: true
      };
    }

    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ [PROXY] Generic auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Auth service unavailable',
      message: error.message,
      proxy: true
    });
  }
});

module.exports = router;