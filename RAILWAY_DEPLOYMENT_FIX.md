# 🚨 Railway Deployment Fix Guide

## Critical Issue Found

**Error**: `ERROR: invalid key-value pair "= production=5000": empty key`

## Root Cause
- Invalid environment variable in Railway dashboard with empty key
- Railway build configuration issue

## STEP 1: Fix Railway Environment Variables

### Go to Railway Dashboard → Your Project → Variables

**Look for and DELETE any variable with:**
- **Key**: (empty/blank)
- **Value**: `production=5000` or similar

### Set These Required Variables:
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
JWT_SECRET=your_32_character_secret_key_here
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_railway_webhook_secret
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### For Supabase Connection:
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[SUPABASE-HOST]:5432/postgres
```

## STEP 2: Verify Railway Build Configuration

The `railway.toml` has been updated to use the correct start command:
```toml
[deploy]
startCommand = "cd backend && node simple-server.js"
```

## STEP 3: Re-deploy

1. **Push the updated railway.toml to GitHub**:
   ```bash
   git add railway.toml
   git commit -m "Fix Railway deployment configuration"
   git push
   ```

2. **Trigger new deployment in Railway**:
   - Railway should auto-deploy from GitHub
   - Or manually trigger redeploy in Railway dashboard

## STEP 4: Verify Deployment

After successful deployment, test:
- **Health Check**: `https://your-app.railway.app/health`
- **API Health**: `https://your-app.railway.app/api/health`
- **User Registration/Login**
- **Basic app functionality**

## STEP 5: Supabase Database Setup

Once Railway deployment works:
```bash
# In Railway console or locally:
npx prisma migrate deploy
npx prisma db seed
```

## Common Railway Environment Variable Formats

✅ **CORRECT**:
```
NODE_ENV=production
PORT=5000
```

❌ **INCORRECT**:
```
=production=5000  (empty key)
NODE_ENV =production  (space before =)
```

## Troubleshooting

**If deployment still fails:**
1. Check Railway logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure no duplicate or malformed variables
4. Test locally: `cd backend && node simple-server.js`

**Repository**: https://github.com/Wthomas48/smartpromptiq-pro
**Status**: Railway configuration fixed, ready for deployment