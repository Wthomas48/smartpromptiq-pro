import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3001),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  SERVER_URL: z.string().url().default('http://localhost:3001'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // AI APIs
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Invalid OpenAI API key format').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'Invalid Anthropic API key format').optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Stripe publishable key format'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format').optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().startsWith('SG.', 'Invalid SendGrid API key format').optional(),
  FROM_EMAIL: z.string().email('FROM_EMAIL must be a valid email').optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Production settings
  SECURE_COOKIES: z.string().transform(Boolean).default(false),
  TRUST_PROXY: z.string().transform(Boolean).default(false),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Environment validation failed:');
      console.error(missingVars.join('\n'));
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Database configuration
export const dbConfig = {
  url: env.DATABASE_URL,
};

// Authentication configuration
export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptRounds: env.BCRYPT_ROUNDS,
  sessionSecret: env.SESSION_SECRET,
};

// AI API configuration
export const aiConfig = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
    enabled: !!env.OPENAI_API_KEY,
  },
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
    enabled: !!env.ANTHROPIC_API_KEY,
  },
};

// Stripe configuration
export const stripeConfig = {
  secretKey: env.STRIPE_SECRET_KEY,
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
};

// Email configuration
export const emailConfig = {
  sendgridApiKey: env.SENDGRID_API_KEY,
  fromEmail: env.FROM_EMAIL || 'noreply@smartpromptiq.com',
  enabled: !!env.SENDGRID_API_KEY,
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
};

// CORS configuration
export const corsConfig = {
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

console.log('🔧 Environment loaded:', {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  clientUrl: env.CLIENT_URL,
  aiProviders: {
    openai: aiConfig.openai.enabled,
    anthropic: aiConfig.anthropic.enabled,
  },
  email: emailConfig.enabled,
  stripe: !!env.STRIPE_SECRET_KEY,
});