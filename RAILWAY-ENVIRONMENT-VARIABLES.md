# Railway Environment Variables Setup

## Required Variables for Production

Here are ALL the environment variables you need to set in Railway:

---

## 1. Database Variables (AUTO-SET by Railway)
These are automatically created when you add a PostgreSQL database:

```bash
DATABASE_URL=postgresql://user:pass@host:port/dbname
PGHOST=your-postgres-host.railway.app
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-password
PGDATABASE=railway
```

✅ **You don't need to set these manually** - Railway creates them automatically when you provision a PostgreSQL database.

---

## 2. JWT & Session Variables (REQUIRED)

```bash
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
SESSION_SECRET=another-super-secret-session-key-minimum-32-chars
```

**How to generate secure secrets:**
```bash
# In your terminal, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your secret.

---

## 3. Stripe Variables (REQUIRED for Payments)

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Product Price IDs (from your Stripe Dashboard)
STRIPE_PRICE_FREE=price_xxxxxxxxxxxxx
STRIPE_PRICE_ACADEMY_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ACADEMY_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_TEAM_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_TEAM_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

**Where to find these:**
1. Go to https://dashboard.stripe.com
2. **API Keys**: Developers → API keys
3. **Product IDs**: Products → Click a product → Copy price ID

---

## 4. OpenAI API Key (REQUIRED for AI Features)

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Where to get this:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and save it (you can't see it again!)

---

## 5. Email Service Variables (REQUIRED for Emails)

### Option A: Using Zoho Mail
```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=noreply@smartpromptiq.com
EMAIL_PASSWORD=your-zoho-app-password
EMAIL_FROM=noreply@smartpromptiq.com
```

### Option B: Using SendGrid
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@smartpromptiq.com
```

### Option C: Using Gmail (Development Only)
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-gmail@gmail.com
```

---

## 6. App Configuration Variables

```bash
# Environment
NODE_ENV=production

# App URLs
FRONTEND_URL=https://your-app.railway.app
BACKEND_URL=https://your-app.railway.app

# Port (Railway sets this automatically, but you can override)
PORT=8080

# CORS Origins (if needed)
CORS_ORIGIN=https://your-app.railway.app,https://smartpromptiq.com
```

---

## 7. Optional: Redis for Caching (if you have Redis)

```bash
REDIS_URL=redis://default:password@host:port
```

---

## How to Set These in Railway

### Method 1: Railway Dashboard (Easiest)
1. Go to https://railway.app/dashboard
2. Click your **SmartPromptIQ** project
3. Click your **app service**
4. Click **"Variables"** tab
5. Click **"+ New Variable"**
6. Add each variable with its value
7. Click **"Deploy"** when done

### Method 2: Railway CLI
```bash
railway variables set JWT_SECRET=your-secret-here
railway variables set STRIPE_SECRET_KEY=sk_live_xxx
railway variables set OPENAI_API_KEY=sk-proj-xxx
# etc...
```

### Method 3: Bulk Upload (Create .env file and upload)
```bash
railway variables set < .env.production
```

---

## Check Your Variables

After setting variables, verify they're loaded:

```bash
railway variables list
```

Or in Railway Dashboard:
1. Go to your service
2. Click **"Variables"** tab
3. Verify all required variables are listed

---

## After Setting Variables

Your app will automatically redeploy. Check logs:
```bash
railway logs
```

Look for:
- ✅ `📧 Email service configured with SMTP`
- ✅ `🤖 AI Service: Using OpenAI GPT`
- ✅ `💳 Stripe configured in production mode`
- ✅ `✅ Database connected successfully`

---

## Common Issues

### Issue: "JWT_SECRET is required"
**Solution**: Add `JWT_SECRET` variable in Railway

### Issue: "Stripe not configured"
**Solution**: Add all `STRIPE_*` variables

### Issue: "Cannot connect to database"
**Solution**: Railway should auto-create `DATABASE_URL`. If missing, check PostgreSQL service is running.

### Issue: "Email sending failed"
**Solution**: Verify `EMAIL_*` variables are correct

---

## Production Checklist

Before going live, verify you have:

- [ ] `DATABASE_URL` (auto-created by Railway PostgreSQL)
- [ ] `JWT_SECRET` (generate with crypto)
- [ ] `SESSION_SECRET` (generate with crypto)
- [ ] `STRIPE_SECRET_KEY` (from Stripe dashboard)
- [ ] `STRIPE_PUBLISHABLE_KEY` (from Stripe dashboard)
- [ ] All `STRIPE_PRICE_*` IDs (from your Stripe products)
- [ ] `OPENAI_API_KEY` (from OpenAI platform)
- [ ] `EMAIL_*` variables (Zoho/SendGrid/Gmail)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` and `BACKEND_URL` set to your Railway URL

---

## Need Help?

If you're missing variables or getting errors:
1. Check Railway logs: `railway logs`
2. Check backend startup logs for missing variables
3. Verify each variable is actually set in Railway Dashboard

**Most Important Variables:**
1. `DATABASE_URL` - Without this, nothing works
2. `JWT_SECRET` - Without this, auth fails
3. `STRIPE_SECRET_KEY` - Without this, payments fail
4. `OPENAI_API_KEY` - Without this, AI features fail
