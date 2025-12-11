# How to Find Your Railway Production URL

## Method 1: Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**:
   ```
   https://railway.app/dashboard
   ```

2. **Click Your Project**:
   - Look for "SmartPromptIQ" or "smartpromptiq-pro"
   - Click on it

3. **Click Your App Service**:
   - You'll see 2 services: PostgreSQL (database) and your app
   - Click the **app service** (NOT the database)

4. **Find the URL**:
   - Look for **"Domains"** section at the top
   - You'll see something like:
     ```
     smartpromptiq-production.up.railway.app
     ```
   - **This is your production URL!**

---

## Method 2: Railway CLI

```bash
railway status
```

This will show you the service URL.

---

## Method 3: Check Environment Variables

Your Railway URL should be in one of these formats:
- `https://[project-name].up.railway.app`
- `https://[project-name]-production.up.railway.app`
- `https://web-[random-id].up.railway.app`

---

## Common Railway URL Patterns

Examples of what your URL might look like:
- `https://smartpromptiq.up.railway.app`
- `https://smartpromptiq-production.up.railway.app`
- `https://smartpromptiq-pro.up.railway.app`
- `https://web-production-1234.up.railway.app`

---

## What NOT to Use

❌ `https://your-app.railway.app` - This is a placeholder, NOT real
❌ `localhost:5173` - This is local development only
❌ Any URL without `.up.railway.app` at the end

---

## Once You Find Your URL

Replace `your-app.railway.app` with your ACTUAL URL in these tests:

### Test 1: Health Check
```
https://YOUR-ACTUAL-URL.up.railway.app/api/health
```

### Test 2: Academy Courses
```
https://YOUR-ACTUAL-URL.up.railway.app/api/academy/courses
```

### Test 3: Frontend
```
https://YOUR-ACTUAL-URL.up.railway.app/academy/courses
```

---

## Still Can't Find It?

Run this command:
```bash
railway whoami
railway status
```

Or check your Railway project settings in the dashboard.

---

## After You Find Your URL

Tell me what it is, and I'll help you test if the deployment worked!
