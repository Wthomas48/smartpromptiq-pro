# 🔗 Get Your Backend URL - Quick Guide

## ✅ Your Setup is PERFECT!

You have:
- ✅ CLI smartpromptiq.com (your backend - NO PORT variable needed!)
- ✅ Postgres smartpromptiq (PORT=5432 is correct!)

**No changes needed! Railway is auto-assigning the port correctly!**

---

## 🎯 Get Your Backend URL (2 Steps):

### **Method 1: Railway Dashboard (Easiest)**

1. **Go to:** https://railway.app/project/shimmering-achievement

2. **Click on "CLI smartpromptiq.com"** (this is your backend)

3. **Click "Settings" tab** (on the left sidebar)

4. **Scroll down to "Networking" or "Domains" section**

5. **You should see a URL like:**
   ```
   https://smartpromptiq-production.up.railway.app
   ```
   OR
   ```
   https://cli-smartpromptiq-com-production.up.railway.app
   ```
   OR
   ```
   https://shimmering-achievement-production.up.railway.app
   ```

6. **If you DON'T see a domain:**
   - Click "Generate Domain" button
   - Railway will create one instantly
   - Copy the URL

7. **Copy this URL!** You'll need it for testing.

---

### **Method 2: Check in Deployments**

1. In Railway Dashboard → **"CLI smartpromptiq.com"** service
2. Click **"Deployments"** tab
3. Click on the latest deployment (should say "Success" or "Active")
4. Look for the deployment URL in the deployment details

---

## 🧪 Test Your Backend Immediately:

Once you have your Railway URL, test it:

### **Test 1: Health Check**
```bash
# Replace YOUR_RAILWAY_URL with the actual URL from above
curl https://YOUR_RAILWAY_URL/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-10-22T20:10:14.998Z",
  "environment": "production",
  "version": "1.0.3",
  "checks": {
    "database": "connected"
  }
}
```

**If you get this, YOUR BACKEND IS WORKING! 🎉**

---

### **Test 2: Subscription Tiers**
```bash
curl https://YOUR_RAILWAY_URL/api/subscriptions/tiers
```

**Should return your pricing tiers in JSON format.**

---

### **Test 3: User Registration (Optional)**
```bash
curl -X POST https://YOUR_RAILWAY_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "firstName": "Test"
  }'
```

**Should create a test user successfully.**

---

## 📊 What Your Services Do:

```
┌─────────────────────────────────────┐
│  CLI smartpromptiq.com              │
│  (Your Backend Application)         │
│                                     │
│  • Express.js API                   │
│  • User Authentication              │
│  • Stripe Payments                  │
│  • Email Service                    │
│  • Rate Limiting                    │
│                                     │
│  PORT: Auto-assigned by Railway ✅  │
│  URL: https://your-url.railway.app  │
└─────────────────────────────────────┘
              ↓
         Connects to
              ↓
┌─────────────────────────────────────┐
│  Postgres smartpromptiq             │
│  (PostgreSQL Database)              │
│                                     │
│  • Stores Users                     │
│  • Stores Subscriptions             │
│  • Stores Transactions              │
│                                     │
│  PORT: 5432 (Internal) ✅           │
└─────────────────────────────────────┘
```

---

## ✅ Checklist:

- [x] Backend deployed (CLI smartpromptiq.com)
- [x] Database running (Postgres smartpromptiq)
- [x] PORT configuration correct (no manual PORT on backend)
- [ ] Get backend URL from Railway dashboard
- [ ] Test health endpoint
- [ ] Deploy frontend to smartpromptiq.com

---

## 🎯 After You Get the URL:

**Share it with me and I'll help you:**
1. Test all endpoints
2. Deploy the frontend
3. Configure Stripe webhooks
4. Test the complete signup → payment flow

---

## 🚀 Next Actions:

1. **Get your Railway URL** (from dashboard - see Method 1 above)
2. **Test it:** `curl https://YOUR_URL/health`
3. **Deploy frontend** to smartpromptiq.com (instructions ready!)

---

**Your backend is LIVE and ready! Just need to grab the URL and test it!** 🎊
