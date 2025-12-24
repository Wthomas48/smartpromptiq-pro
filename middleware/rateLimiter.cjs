// middleware/rateLimiter.cjs
const rateLimit = require('express-rate-limit');
const { MemoryStore } = require('express-rate-limit');

// Initialize Redis connection if available
let redis;
let useRedis = false;

try {
  if (process.env.REDIS_HOST || process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');

      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // Test Redis connection
      redis.ping().then(() => {
        console.log('✅ Redis connection established for rate limiting');
        useRedis = true;
      }).catch((err) => {
        console.log('⚠️ Redis not available, using memory store for rate limiting:', err.message);
        useRedis = false;
      });
    } catch (redisError) {
      console.log('⚠️ Redis package not available, using memory store for rate limiting');
      useRedis = false;
    }
  } else {
    console.log('📝 No Redis configuration found, using memory store for rate limiting');
    useRedis = false;
  }
} catch (error) {
  console.log('📝 Initializing memory store for rate limiting:', error.message);
  useRedis = false;
}

// Helper function to create store for each limiter
const createStore = (prefix = '') => {
  if (useRedis && redis) {
    try {
      const RedisStore = require('rate-limit-redis').default;
      return new RedisStore({
        client: redis,
        prefix: `rate_limit:${prefix}:`
      });
    } catch (error) {
      console.log('⚠️ Redis store creation failed, using memory store');
      return new MemoryStore();
    }
  }
  return new MemoryStore();
};

// Tiered rate limiting configurations
const RATE_LIMIT_CONFIGS = {
  free: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: 'Free tier limit: 20 requests per 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  },
  premium: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Premium tier limit: 100 requests per 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  },
  enterprise: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Enterprise tier limit: 1000 requests per 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  },
  demo: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Increased from 10 to 50
    message: 'Demo limit: 50 requests per 5 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  },
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000,
    message: 'Admin tier limit: 10000 requests per 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Create rate limiter for specific tier - using default keyGenerator (safe)
const createRateLimiter = (tier = 'free', customConfig = {}) => {
  const config = { ...RATE_LIMIT_CONFIGS[tier], ...customConfig };

  if (!config) {
    throw new Error(`Invalid rate limit tier: ${tier}`);
  }

  return rateLimit({
    store: createStore(tier),
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    // Use default keyGenerator - express-rate-limit handles IP safely
    handler: (req, res) => {
      const retryAfter = Math.ceil(config.windowMs / 1000);
      const now = new Date();
      const resetTime = new Date(now.getTime() + config.windowMs);

      console.log(`🚫 Rate limit exceeded on tier ${tier}`);

      res.status(429).json({
        error: config.message,
        retryAfter,
        tier,
        resetTime: resetTime.toISOString(),
        remaining: 0,
        limit: config.max
      });
    },
    skip: (req) => {
      // Skip rate limiting for admin users
      if (req.user?.role === 'admin') {
        return true;
      }

      // Skip for health checks and options requests
      if (req.path === '/health' || req.path === '/api/health' || req.method === 'OPTIONS') {
        return true;
      }

      return false;
    }
  });
};

// Specific rate limiters for common use cases
const demoRateLimiter = createRateLimiter('demo');
const freeRateLimiter = createRateLimiter('free');
const premiumRateLimiter = createRateLimiter('premium');
const enterpriseRateLimiter = createRateLimiter('enterprise');

// Dynamic rate limiter that chooses tier based on user
const dynamicRateLimiter = (req, res, next) => {
  const userTier = req.user?.subscriptionTier || 'free';
  const limiter = createRateLimiter(userTier);
  return limiter(req, res, next);
};

// IP-based rate limiter for aggressive protection - using default keyGenerator
const ipRateLimiter = rateLimit({
  store: createStore('ip'),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator - express-rate-limit handles IP safely
  handler: (req, res) => {
    console.log(`🚫 IP rate limit exceeded`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
      retryAfter: 60
    });
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health' || req.method === 'OPTIONS';
  }
});

// Burst protection for API endpoints - using default keyGenerator
const burstProtection = rateLimit({
  store: createStore('burst'),
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // Fixed max instead of function for simplicity
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator - express-rate-limit handles IP safely
  handler: (req, res) => {
    console.log(`🚫 Burst protection triggered`);
    res.status(429).json({
      error: 'Too many requests too quickly, please slow down',
      retryAfter: 10
    });
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health' || req.method === 'OPTIONS';
  }
});

// Cleanup function for graceful shutdown
const cleanup = () => {
  if (redis) {
    redis.disconnect();
    console.log('🔌 Redis connection closed');
  }
};

// Handle process termination
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// General rate limiter - using default keyGenerator
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 200);

const generalLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator - express-rate-limit handles IP safely
  requestWasSuccessful: (_req, res) => res.statusCode < 400
});

module.exports = {
  createRateLimiter,
  demoRateLimiter,
  freeRateLimiter,
  premiumRateLimiter,
  enterpriseRateLimiter,
  dynamicRateLimiter,
  ipRateLimiter,
  burstProtection,
  generalLimiter,
  cleanup,
  redis
};
