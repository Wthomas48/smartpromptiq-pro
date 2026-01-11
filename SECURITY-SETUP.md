# SmartPromptIQ Security Setup Guide

## Critical Security Actions Required

Your secrets were exposed in the `.env` file. Follow these steps immediately:

---

## Step 1: Rotate All Exposed Secrets

### 1.1 Stripe Secret Key (CRITICAL)

1. Go to [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
2. Click **"Roll key"** next to your Secret key
3. Copy the new key (starts with `sk_live_` or `sk_test_`)
4. Update in Railway environment variables AND `backend/.env.local`

### 1.2 Stripe Webhook Secret

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Delete the existing webhook endpoint
3. Create a new endpoint with your production URL
4. Copy the new signing secret (starts with `whsec_`)
5. Update in Railway AND `backend/.env.local`

### 1.3 JWT Secret

Generate a new secret:
```bash
openssl rand -hex 32
```
Update in Railway AND `backend/.env.local`

### 1.4 Supabase JWT Secret

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project > Settings > API
3. Scroll to "JWT Settings" > Copy the JWT Secret
4. Update in Railway AND `backend/.env.local`

---

## Step 2: Configure Local Development

1. Your real secrets go in `backend/.env.local` (gitignored)
2. Copy the template:
   ```bash
   cp backend/.env.local backend/.env.local.backup
   ```
3. Fill in your real secrets in `backend/.env.local`

---

## Step 3: Configure Production (Railway)

Add these environment variables in Railway Dashboard:

| Variable | Where to Get It |
|----------|-----------------|
| `DATABASE_URL` | Supabase > Settings > Database > Connection String |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` |
| `SUPABASE_JWT_SECRET` | Supabase > Settings > API > JWT Secret |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks > Signing Secret |
| `SUPABASE_ANON_KEY` | Supabase > Settings > API > anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role key |

---

## Security Architecture

```
backend/.env           <- Placeholders only (safe to commit)
backend/.env.local     <- Real secrets (NEVER commit - in .gitignore)
Railway ENV VARS       <- Production secrets (encrypted by Railway)
```

The server loads secrets in this priority:
1. `.env.local` (local development secrets)
2. `.env` (defaults/placeholders)
3. Railway/System environment variables (production)

---

## Verification

After configuring secrets, restart the server:
```bash
cd backend && npm run dev
```

You should see:
```
Loading secrets from .env.local
Security configuration validated
```

If you see security warnings, your secrets are not properly configured.

---

## What NOT to Do

- NEVER commit real secrets to git
- NEVER share `.env.local` files
- NEVER put secrets in frontend `.env` files
- NEVER use the same secret for multiple purposes
- NEVER skip secret rotation after exposure

---

## Files Changed in This Security Update

1. `backend/.env` - Now contains placeholders only
2. `backend/.env.local` - Template for your real secrets
3. `backend/src/server.ts` - Added secure env loading + validation
4. `backend/src/middleware/auth.ts` - Added security hardening
