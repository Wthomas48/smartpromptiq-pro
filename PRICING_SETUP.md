# SmartPromptIQ Pro - Comprehensive Pricing System Setup Guide

## Overview

This document provides a complete setup guide for the SmartPromptIQ Pro pricing and subscription system. The implementation includes:

- **Token-based pricing** with pay-per-use and subscription models
- **Real-time cost protection** to maintain profit margins
- **Comprehensive usage analytics** and admin monitoring
- **Stripe integration** for secure payment processing
- **Advanced rate limiting** and abuse prevention

## System Architecture

### Pricing Models

#### 1. **Free Tier**
- 5 tokens/month
- Basic templates only
- Email verification required
- Community support
- CAPTCHA protection

#### 2. **Pay-Per-Use Tokens**
- 25 tokens: $4.99 ($0.200/token)
- 100 tokens: $17.99 ($0.180/token) 
- 500 tokens: $79.99 ($0.160/token)
- 1000 tokens: $149.99 ($0.150/token)
- 90-day expiration

#### 3. **Subscription Plans**

| Plan | Price/Month | Tokens | Rollover | Team | API | Support |
|------|-------------|--------|----------|------|-----|---------|
| **Starter** | $14.99 | 100 | 50 | 1 | ❌ | Email |
| **Pro** | $49.99 | 500 | 200 | 3 | ✅ | Priority |
| **Business** | $149.99 | 2,000 | 500 | 10 | ✅ | Dedicated |
| **Enterprise** | $499+ | Unlimited | Unlimited | Unlimited | ✅ | Dedicated |

#### 4. **Token Complexity System**
- **Simple prompts**: 1 token
- **Standard prompts**: 3 tokens  
- **Complex prompts**: 7 tokens
- **Custom prompts**: 15 tokens

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (production) or SQLite (development)
- Stripe account
- OpenAI/Claude API keys

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

#### Critical Environment Variables

```bash
# Database
DATABASE_URL="file:./database.sqlite"  # Development
# DATABASE_URL="postgresql://user:pass@host:5432/db"  # Production

# JWT Authentication
JWT_SECRET="your-super-secure-32-char-secret-key"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Cost Protection
MONTHLY_COST_ALERT_THRESHOLD=0.3    # Alert at 30% of revenue
MONTHLY_COST_HARD_LIMIT=0.7         # Suspend at 70% of revenue
MINIMUM_PROFIT_MARGIN=3.0           # Require 3x profit margin

# AI APIs
OPENAI_API_KEY="sk-your_openai_key"
```

### 2. Stripe Setup

#### Create Products and Prices in Stripe Dashboard

1. **Token Packages**
   ```bash
   # Create products for token packages
   25 Tokens → price_tokens_25_id
   100 Tokens → price_tokens_100_id  
   500 Tokens → price_tokens_500_id
   1000 Tokens → price_tokens_1000_id
   ```

2. **Subscription Plans**
   ```bash
   # Monthly plans
   Starter Monthly → price_starter_monthly_id
   Pro Monthly → price_pro_monthly_id
   Business Monthly → price_business_monthly_id
   Enterprise Monthly → price_enterprise_monthly_id
   
   # Yearly plans (with 20% discount)
   Starter Yearly → price_starter_yearly_id
   Pro Yearly → price_pro_yearly_id  
   Business Yearly → price_business_yearly_id
   Enterprise Yearly → price_enterprise_yearly_id
   ```

3. **Webhook Endpoints**
   ```
   Endpoint URL: https://yourapp.com/api/billing/webhook
   Events: customer.subscription.*, payment_intent.*, invoice.*
   ```

### 3. Database Setup

#### Run Migrations

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

#### Seed Initial Data (Optional)

```bash
npx prisma db seed
```

### 4. Backend Setup

```bash
cd backend
npm install

# Development
npm run dev

# Production  
npm run build
npm start
```

#### Key Files Structure

```
backend/src/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── subscriptionAuth.js  # Enhanced auth with pricing
├── routes/
│   ├── billing.js          # Stripe integration
│   ├── subscriptions.js    # Subscription management
│   └── usage.js           # Usage tracking
├── utils/
│   ├── costCalculator.js   # Cost analysis
│   ├── costProtection.js   # Real-time protection
│   ├── rateLimiter.js     # Advanced rate limiting
│   ├── tokenManager.js    # Token operations
│   └── usageAnalytics.js  # Analytics engine
└── server.js              # Main server
```

### 5. Frontend Setup

```bash
cd client
npm install
npm run dev
```

#### Key Components

```
client/src/
├── components/
│   └── pricing/
│       ├── PricingCard.tsx      # Subscription tiers
│       ├── TokenPurchase.tsx    # Token packages
│       └── UsageTracker.tsx     # Usage display
├── pages/
│   ├── PricingPage.tsx         # Main pricing page
│   └── AdminCostDashboard.tsx  # Admin monitoring
└── hooks/
    └── usePricing.tsx          # Pricing logic
```

## API Endpoints

### Authentication & Users
- `POST /api/auth/login` - User login with rate limiting
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user with subscription

### Billing & Payments
- `POST /api/billing/purchase-tokens` - Buy token packages
- `POST /api/billing/create-subscription` - Create subscription
- `GET /api/billing/info` - Get billing information
- `POST /api/billing/webhook` - Stripe webhook handler

### Subscriptions  
- `GET /api/subscriptions/tiers` - Get available tiers
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/create` - Create new subscription
- `PUT /api/subscriptions/change` - Change subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Usage & Analytics
- `GET /api/usage/current` - Current usage stats
- `GET /api/usage/history` - Usage history
- `POST /api/usage/track-prompt` - Track prompt generation
- `GET /api/usage/analytics` - Detailed analytics

### Admin (Requires Admin Role)
- `GET /api/admin/cost-dashboard` - Cost monitoring dashboard
- `POST /api/admin/cost-audit` - Run system cost audit
- `POST /api/admin/override-cost-protection` - Override user limits

## Cost Protection System

### Real-time Monitoring

The system continuously monitors:
- **User cost ratios** (costs vs. revenue)
- **Profit margins** per user and tier
- **Usage anomalies** and abuse patterns
- **System-wide profitability**

### Automatic Actions

1. **30% Threshold**: Send warning to user
2. **70% Threshold**: Suspend user account
3. **Margin < 3x**: Suggest tier upgrade
4. **System alerts**: Notify admins of issues

### Admin Controls

```javascript
// Override cost protection for specific user
POST /api/admin/override-cost-protection
{
  "userId": "user_id",
  "reason": "Reviewed account manually", 
  "temporaryLimit": 10000,  // $100 limit
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting

### Tier-based Limits

| Tier | Hourly | Daily | API/min |
|------|--------|-------|---------|
| **Free** | 1 | 2 | 0 |
| **Starter** | 5 | 10 | 0 |
| **Pro** | 20 | 50 | 30 |
| **Business** | 50 | 200 | 60 |
| **Enterprise** | Unlimited | Unlimited | 120 |

### Implementation

```javascript
// Middleware usage
app.post('/api/prompts/generate', 
  ...createPromptMiddleware('standard', 'gpt3_5_turbo'),
  async (req, res) => {
    // Your prompt generation logic
  }
);
```

## Usage Analytics

### Real-time Tracking

- **Token consumption** by complexity and category
- **API usage** with response times and success rates
- **Cost tracking** with real-time margin calculation
- **User behavior** patterns and anomalies

### Reports Available

1. **User Usage Summary**
   - Token consumption over time
   - Category breakdowns
   - Cost analysis

2. **System Analytics**
   - Revenue vs. costs by tier
   - User retention and churn
   - Profit margin trends

3. **Admin Cost Dashboard**
   - Risk user identification
   - Tier profitability analysis
   - System health monitoring

## Security Features

### Authentication
- JWT-based authentication
- Email verification for free users
- Rate limiting on auth endpoints

### Payment Security
- Stripe handles all payment data
- PCI compliance through Stripe
- Webhook signature verification

### Cost Protection
- Real-time cost monitoring
- Automatic user suspension
- Admin override capabilities

### Rate Limiting
- IP-based global limits
- User-tier specific limits
- CAPTCHA for free users

## Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

### Stripe Test Mode
Use test cards for development:
- **Successful payment**: `4242424242424242`
- **Failed payment**: `4000000000000002`
- **3D Secure**: `4000002760003184`

## Deployment

### Production Environment

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Process Management**
   ```bash
   pm2 start server.js --name "smartpromptiq-api"
   ```

### Monitoring

1. **Health Checks**
   - `/health` - Basic health check
   - `/api/admin/cost-dashboard` - System status

2. **Logging**
   - Structured JSON logging
   - Cost protection alerts
   - Usage anomaly detection

3. **Metrics**
   - Response times
   - Error rates  
   - Cost ratios
   - Profit margins

## Troubleshooting

### Common Issues

1. **High Cost Ratios**
   ```bash
   # Check user costs
   GET /api/admin/cost-dashboard
   
   # Override if needed
   POST /api/admin/override-cost-protection
   ```

2. **Rate Limit Issues**
   ```bash
   # Check rate limit status
   GET /api/usage/current
   
   # Adjust in pricingConfig.js
   ```

3. **Stripe Webhook Failures**
   ```bash
   # Verify webhook signature
   # Check Stripe dashboard for delivery attempts
   # Ensure endpoint is accessible
   ```

### Logs to Monitor

- Cost protection alerts
- Rate limit violations  
- Payment failures
- Usage anomalies
- System performance

## Business Intelligence

### Key Metrics to Track

1. **Revenue Metrics**
   - Monthly Recurring Revenue (MRR)
   - Average Revenue Per User (ARPU)
   - Customer Lifetime Value (CLV)

2. **Cost Metrics**
   - Cost Per User (CPU)
   - Gross margin per tier
   - API cost trends

3. **Usage Metrics**
   - Token consumption patterns
   - Feature adoption rates
   - User engagement scores

### Reporting Queries

The system provides comprehensive analytics through:
- Admin dashboard API endpoints
- Database queries for custom reports
- Export capabilities for external analysis

## Support & Maintenance

### Regular Tasks

1. **Weekly**
   - Review cost protection alerts
   - Monitor tier profitability
   - Check for usage anomalies

2. **Monthly**
   - Analyze churn and retention
   - Review pricing effectiveness
   - Update cost projections

3. **Quarterly**
   - Evaluate tier pricing
   - Review profit margin targets
   - Plan capacity scaling

This comprehensive pricing system provides robust cost protection, detailed analytics, and scalable architecture for sustainable growth.