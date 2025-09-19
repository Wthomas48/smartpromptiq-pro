# 🚀 SmartPromptIQ Pro - Railway Deployment Guide

This guide will help you deploy your complete SmartPromptIQ Pro application to Railway with full Stripe integration.

## 📋 Pre-Deployment Checklist

### 1. Railway Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (or create new)
railway link
```

### 2. Environment Variables Setup

Configure these environment variables in your Railway dashboard:

#### 🔧 **Required Variables**
```env
# Application
NODE_ENV=production
PORT=8080

# Database (Railway will provide this)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=24h

# Stripe Integration
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_stripe

# Admin
ADMIN_EMAIL=admin@yourdomain.com
```

#### 🔧 **Optional Variables**
```env
# AI APIs (for enhanced features)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Deployment Steps

### Method 1: Automated Deployment Script
```bash
# Run the deployment script
node railway-deploy.js
```

### Method 2: Manual Deployment
```bash
# 1. Build frontend
cd client
npm ci
npm run build
cd ..

# 2. Install backend dependencies
cd backend
npm ci --only=production
npx prisma generate
cd ..

# 3. Deploy to Railway
railway up
```

## 🗄️ Database Setup

After deployment, set up your database:

```bash
# Run migrations
railway run npx prisma migrate deploy

# Seed the database with initial data
railway run npx prisma db seed

# Verify database connection
railway run npx prisma db push
```

## 💳 Stripe Configuration

### 1. Webhook Setup
1. Go to your Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.railway.app/api/billing/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. Product & Price Setup
Your pricing tiers are already configured:
- **Free**: `price_free` (no Stripe needed)
- **Starter**: Monthly `price_1QKrTdJNxVjDuJxhRtAMo2K7`, Yearly `price_1QKrTdJNxVjDuJxhRtAMo2K8`
- **Pro**: Monthly `price_1QKrTdJNxVjDuJxhRtAMo2K9`, Yearly `price_1QKrTdJNxVjDuJxhRtAMo2L0`
- **Business**: Monthly `price_1QKrTdJNxVjDuJxhRtAMo2L1`, Yearly `price_1QKrTdJNxVjDuJxhRtAMo2L2`

## 🔍 Post-Deployment Verification

### 1. Health Checks
```bash
# Check application status
curl https://your-app.railway.app/health

# Check API health
curl https://your-app.railway.app/api/health
```

### 2. Feature Testing
- ✅ User registration/login
- ✅ Enhanced Teams functionality
- ✅ Billing/subscription flow
- ✅ Database connectivity
- ✅ Stripe integration

### 3. Admin Setup
1. Access your app: `https://your-app.railway.app`
2. Register admin account or use seeded admin:
   - Email: `admin@example.com`
   - Password: `Admin123!`

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear Railway build cache
railway run --detach npm run build

# Check build logs
railway logs
```

#### 2. Database Connection Issues
```bash
# Check database URL
railway variables

# Test database connection
railway run npx prisma db push
```

#### 3. Stripe Webhook Issues
- Verify webhook URL: `https://your-app.railway.app/api/billing/webhook`
- Check webhook secret in environment variables
- Test webhook with Stripe CLI: `stripe listen --forward-to localhost:8080/api/billing/webhook`

## 📊 Monitoring

### Railway Dashboard
- Monitor deployments
- View logs: `railway logs`
- Check metrics and usage

### Application Logs
```bash
# View real-time logs
railway logs --tail

# View specific service logs
railway logs --service backend
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit real keys to version control
2. **HTTPS**: Railway provides HTTPS by default
3. **Database**: Use Railway's built-in PostgreSQL with connection pooling
4. **Stripe**: Always use live keys in production
5. **JWT Secret**: Use a strong, unique secret for production

## 🎯 Performance Optimization

1. **Frontend**: Already optimized with Vite build
2. **Backend**: Uses production-only dependencies
3. **Database**: Enable connection pooling
4. **Caching**: Consider Redis for session storage (optional)

## 📝 Deployment Commands Reference

```bash
# Railway CLI Commands
railway login                  # Login to Railway
railway link                   # Link to project
railway up                     # Deploy application
railway run [command]          # Run command in Railway environment
railway logs                   # View application logs
railway variables              # Manage environment variables
railway status                 # Check deployment status

# Database Commands
railway run npx prisma migrate deploy    # Run migrations
railway run npx prisma db seed          # Seed database
railway run npx prisma studio           # Open Prisma Studio
```

## 🎉 Success!

Your SmartPromptIQ Pro application with enhanced Teams features and complete Stripe integration is now live on Railway!

**What's Included:**
- ✅ Complete SaaS application
- ✅ Enhanced Teams page with 7 advanced tabs
- ✅ Video calling system
- ✅ Real-time messaging
- ✅ Beautiful analytics dashboard
- ✅ File management system
- ✅ Full Stripe billing integration
- ✅ User authentication & authorization
- ✅ Admin dashboard
- ✅ Responsive design

**Next Steps:**
1. Configure your custom domain
2. Set up monitoring and alerts
3. Test all features thoroughly
4. Launch your SaaS! 🚀