# 🚀 SmartPromptIQ Pro - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Stripe Integration (COMPLETED)
- [x] Complete billing system with token packages & subscriptions
- [x] Webhook handlers for payment events
- [x] Cost protection and profit margin safeguards
- [x] Customer and invoice management

### ⚠️ CRITICAL FIXES NEEDED

#### 1. Fix TypeScript Build Errors
```bash
# Install missing type definitions
cd client
npm install --save-dev @types/node @types/lru-cache

# Fix tsconfig.json
```

#### 2. Environment Configuration

**Backend (.env):**
```env
# Production Database (Use PostgreSQL for production)
DATABASE_URL="postgresql://user:pass@your-db-host/smartpromptiq"

# JWT Security
JWT_SECRET="your-super-secure-32-char-jwt-secret"

# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY="sk_live_your_actual_stripe_secret"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# AI API Keys (REQUIRED)
OPENAI_API_KEY="sk-your_openai_api_key"

# Email (Optional but recommended)
SENDGRID_API_KEY="SG.your-sendgrid-key"
FROM_EMAIL="noreply@yourdomain.com"
```

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable"
VITE_API_URL="https://your-backend-domain.com"
```

## 🌐 Deployment Platforms

### 1. **Supabase + Railway** (Recommended)

#### Supabase Setup (Database & Auth)
1. **Create Project:** https://supabase.com/dashboard
2. **Get Database URL:** Settings → Database → Connection String
3. **Enable RLS:** Authentication → Policies
4. **Schema Migration:**
   ```bash
   npx prisma migrate deploy
   ```

#### Railway Setup (Backend Hosting)
1. **Connect GitHub:** https://railway.app/
2. **Deploy from repo:** Select your GitHub repository
3. **Environment Variables:** Add all production variables
4. **Custom Domain:** Add your domain in Railway settings

### 2. **Vercel + PlanetScale** (Alternative)

#### PlanetScale (Database)
1. **Create Database:** https://planetscale.com/
2. **Get Connection String**
3. **Deploy Schema:**
   ```bash
   npx prisma db push
   ```

#### Vercel (Full-Stack)
1. **Connect Repository:** https://vercel.com/
2. **Framework Preset:** Next.js/Vite
3. **Environment Variables:** Add in Vercel dashboard
4. **Deploy:** Automatic on git push

## 🔧 Production Optimizations

### Database Migration (SQLite → PostgreSQL)
```bash
# 1. Export current data
npx prisma db seed

# 2. Update schema for PostgreSQL
# 3. Deploy to production database
npx prisma migrate deploy
```

### Performance Optimizations
- **Enable compression:** Gzip/Brotli
- **CDN setup:** Cloudflare/AWS CloudFront
- **Image optimization:** WebP format
- **API caching:** Redis integration

### Security Checklist
- [x] HTTPS enforcement
- [x] CORS configuration
- [x] Rate limiting
- [x] Environment secrets
- [x] Webhook signature verification
- [x] SQL injection protection (Prisma ORM)
- [x] XSS protection (Helmet.js)

## 🚀 Quick Deploy Commands

### 1. Fix Build Issues
```bash
# Fix TypeScript errors
cd client
npm install --save-dev @types/node @types/lru-cache
npm run build

# Test backend
cd ../backend
npm run build
```

### 2. Environment Setup
```bash
# Copy and configure environment files
cp .env.example .env
# Edit .env with production values
```

### 3. Database Setup
```bash
# For PostgreSQL production database
npx prisma migrate deploy
npx prisma generate
```

### 4. Deploy to Railway
```bash
# Connect to Railway CLI
railway login
railway link
railway up
```

## 📊 Monitoring & Analytics

### Essential Monitoring
- **Error Tracking:** Sentry integration
- **Performance:** New Relic/DataDog
- **Uptime:** Pingdom/UptimeRobot
- **Analytics:** Google Analytics

### Cost Monitoring
- **Stripe Dashboard:** Revenue tracking
- **API Usage:** OpenAI usage monitoring
- **Database:** Query performance
- **Server:** CPU/Memory usage

## 🔐 Stripe Production Setup

### Required Stripe Configuration
1. **Activate Live Mode:** Complete Stripe onboarding
2. **Create Products:** Token packages & subscription tiers
3. **Webhook Endpoints:** Add production webhook URL
4. **Test Payments:** Use Stripe test cards
5. **Tax Configuration:** Set up tax calculations

### Price IDs Setup
```javascript
// Update pricing configuration with live Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY: "price_live_123..."
STRIPE_PRICE_TOKENS_100: "price_live_456..."
```

## 🛠️ Troubleshooting

### Common Issues
1. **Build Failures:** TypeScript errors
2. **Database Connections:** Wrong connection string
3. **API Errors:** Missing environment variables
4. **Stripe Webhooks:** Incorrect webhook URL
5. **CORS Issues:** Frontend/backend domain mismatch

### Debug Commands
```bash
# Check logs
railway logs
vercel logs

# Test database connection
npx prisma studio

# Validate environment
node -e "console.log(process.env.DATABASE_URL)"
```

## 📞 Production Checklist

- [ ] Fix all TypeScript build errors
- [ ] Configure production database (PostgreSQL)
- [ ] Set up Stripe live mode with real products
- [ ] Add all environment variables
- [ ] Test payment flows end-to-end
- [ ] Set up monitoring and error tracking
- [ ] Configure custom domain
- [ ] Test production deployment
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline

---

**Estimated Deployment Time:** 2-4 hours (after fixing build issues)
**Monthly Costs:** $20-50 for small/medium traffic
**Scalability:** Handles 10K+ users with current architecture