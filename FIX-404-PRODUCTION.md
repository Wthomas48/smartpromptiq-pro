# 🚨 FIX: 404 Error on Production Billing Endpoint

## The Error:

```
POST https://smartpromptiq.com/api/billing/upgrade 404 (Not Found)
```

**This means:** The `/api/billing/upgrade` endpoint doesn't exist on production, even though it exists in the code.

---

## 🔍 Possible Causes:

1. **Railway deployment failed** - The backend didn't deploy properly
2. **Wrong start command** - Railway is serving the frontend but not the backend API
3. **Build error** - The production build failed
4. **Route not registered** - The billing routes aren't being loaded

---

## ✅ Diagnostic Steps:

### Step 1: Check if Backend API is Running

**Test the health endpoint:**

Open this URL in your browser:
```
https://smartpromptiq.com/api/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"..."}
```

**If you get 404:** The backend API isn't running at all.

**If you get JSON response:** The backend is running, but the billing route isn't registered.

---

### Step 2: Check Railway Deployment Logs

1. Go to: **https://railway.app/dashboard**
2. Click your project → Service → **"Deployments"**
3. Click on the **latest deployment**
4. Click **"View Logs"**
5. Look for:
   - ✅ "Server running on port..." - Backend started
   - ❌ Any error messages
   - ❌ "Build failed"
   - ❌ "Command not found"

**Share any errors you see in the logs!**

---

### Step 3: Verify Railway Start Command

The issue might be that Railway is only serving the frontend, not the backend API.

**Check Railway settings:**

1. Railway Dashboard → Service → **"Settings"** tab
2. Scroll to **"Deploy"** section
3. Look for **"Start Command"**

**Should be:**
```
node railway-server-minimal.cjs
```

OR:
```
node server.js
```

**Should NOT be:**
```
npm start
vite
serve dist
```

If it's wrong:
1. Click **"Edit"** next to Start Command
2. Change to: `node railway-server-minimal.cjs`
3. Click **"Save"**
4. Wait for redeploy

---

### Step 4: Check if Railway is Building Backend

**Check package.json scripts:**

Railway should be running the `railway:build` script which builds both frontend and backend.

**Verify in Railway logs** that you see:
```
Building frontend...
Building backend...
```

If you only see frontend build, the backend isn't being included.

---

## 🛠️ Quick Fixes:

### Fix 1: Update Railway Start Command

If Railway Settings → Start Command is wrong:

1. Go to Railway Dashboard → Service → Settings
2. Find **"Deploy"** section
3. **Start Command**: `node railway-server-minimal.cjs`
4. Click **"Redeploy"**

### Fix 2: Force Rebuild

Sometimes Railway cache causes issues:

1. Railway Dashboard → Service → Settings
2. Scroll down to **"Danger Zone"**
3. Click **"Clear Build Cache"**
4. Then click **"Trigger Deploy"**

### Fix 3: Check railway.json Configuration

The `railway.json` file should have:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run railway:build"
  },
  "deploy": {
    "startCommand": "node railway-server-minimal.cjs",
    "restartPolicyType": "always",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

If this file is missing or different, that could be the issue.

---

## 🎯 Most Likely Solution:

Based on the 404 error, Railway is probably serving the **frontend only** (not the backend API).

**Quick test:** Try these URLs:

1. `https://smartpromptiq.com/` - Frontend (should load)
2. `https://smartpromptiq.com/api/health` - Backend health (should return JSON)
3. `https://smartpromptiq.com/api/billing/upgrade` - Billing endpoint (404 error)

If URL #2 returns 404, the backend isn't running.

---

## 📋 Action Plan:

**Please do this now:**

1. **Test health endpoint**: Open `https://smartpromptiq.com/api/health` in browser
2. **Share the result**: Does it return JSON or 404?
3. **Check Railway logs**: Railway Dashboard → Deployments → Latest → View Logs
4. **Share any errors**: Copy/paste any error messages from logs

This will help me diagnose exactly what's wrong!

---

## 💡 Expected Railway Logs (Should Look Like):

```
📦 Building application...
✓ Frontend built successfully
✓ Backend compiled
🚀 Starting server...
✓ Server running on port 8080
✓ Database connected
✓ Health check: /health
✓ API routes loaded: /api/billing/*
✓ Deployment successful
```

**If you see errors in logs, share them with me!**

---

## 🆘 Emergency Fix:

If nothing works, we can temporarily **disable Stripe on production** to keep the site working:

**In Railway Variables:**
```
ENABLE_STRIPE = false
```

This will make upgrades work instantly (like local dev) without going through Stripe, until we fix the 404 error.

**But we should fix the root cause first!**

---

**Please check `https://smartpromptiq.com/api/health` and share what you see!** 🔍
