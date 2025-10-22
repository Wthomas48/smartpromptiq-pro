-- SmartPromptIQ PostgreSQL Schema
-- Run this in Railway PostgreSQL database to create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255),
  "lastName" VARCHAR(255),
  avatar VARCHAR(255),
  role VARCHAR(50) DEFAULT 'USER',

  -- Subscription and billing
  "subscriptionTier" VARCHAR(50) DEFAULT 'free',
  "subscriptionStatus" VARCHAR(50) DEFAULT 'active',
  "subscriptionEndDate" BIGINT,
  "billingCycle" VARCHAR(50) DEFAULT 'monthly',

  -- Stripe integration
  "stripeCustomerId" VARCHAR(255) UNIQUE,
  "stripeSubscriptionId" VARCHAR(255) UNIQUE,

  -- Token management
  "tokenBalance" INTEGER DEFAULT 5,
  "tokensPurchased" INTEGER DEFAULT 0,
  "tokensUsed" INTEGER DEFAULT 0,

  -- Legacy fields
  plan VARCHAR(50) DEFAULT 'FREE',
  "generationsUsed" INTEGER DEFAULT 0,
  "generationsLimit" INTEGER DEFAULT 10,

  -- Usage tracking
  "monthlyTokensUsed" INTEGER DEFAULT 0,
  "monthlyResetDate" BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  "lastTokenPurchase" BIGINT,

  -- Account status
  "emailVerified" BOOLEAN DEFAULT FALSE,
  "isActive" BOOLEAN DEFAULT TRUE,
  "suspensionReason" VARCHAR(255),

  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL,
  "lastLogin" BIGINT
);

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,

  -- Transaction details
  type VARCHAR(50) NOT NULL,
  tokens INTEGER NOT NULL,
  "balanceBefore" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,

  -- Cost tracking
  "costInCents" INTEGER,

  -- Purchase information
  "packageType" VARCHAR(100),
  "stripePaymentIntentId" VARCHAR(255),

  -- Usage information
  "promptComplexity" VARCHAR(50),
  model VARCHAR(100),
  category VARCHAR(100),

  -- Token expiration
  "expiresAt" BIGINT,
  "isExpired" BOOLEAN DEFAULT FALSE,

  -- Metadata
  description TEXT,
  metadata TEXT,

  "createdAt" BIGINT NOT NULL,

  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,

  -- Subscription details
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  "billingCycle" VARCHAR(50) NOT NULL,

  -- Pricing information
  "priceInCents" INTEGER NOT NULL,
  "tokensPerMonth" INTEGER NOT NULL,
  "maxTokenRollover" INTEGER NOT NULL,

  -- Stripe integration
  "stripeSubscriptionId" VARCHAR(255) UNIQUE,
  "stripePriceId" VARCHAR(255),

  -- Billing dates
  "currentPeriodStart" BIGINT NOT NULL,
  "currentPeriodEnd" BIGINT NOT NULL,
  "cancelAtPeriodEnd" BOOLEAN DEFAULT FALSE,
  "canceledAt" BIGINT,

  -- Trial information
  "trialStart" BIGINT,
  "trialEnd" BIGINT,

  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL,

  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users("stripeCustomerId");
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions("userId");
CREATE INDEX IF NOT EXISTS idx_token_transactions_created ON token_transactions("createdAt");
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions("stripeSubscriptionId");

-- Insert admin user (password: admin123 hashed with SHA256)
INSERT INTO users (
  id, email, password, "firstName", "lastName", role,
  "subscriptionTier", "subscriptionStatus", "tokenBalance",
  "isActive", "emailVerified", "createdAt", "updatedAt"
) VALUES (
  'admin-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'admin@smartpromptiq.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- admin123
  'Admin',
  'User',
  'ADMIN',
  'enterprise',
  'active',
  1000,
  TRUE,
  TRUE,
  EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
) ON CONFLICT (email) DO NOTHING;

COMMIT;
