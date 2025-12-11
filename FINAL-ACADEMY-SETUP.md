# 🎯 FINAL STEPS - Academy Goes Live (2 Minutes)

## Current Status
✅ Server is running on Railway
✅ Academy routes are loaded and working
✅ PostgreSQL database is deployed
❌ DATABASE_URL isn't connecting properly

## THE PROBLEM
The DATABASE_URL environment variable isn't being set correctly via CLI. Need to set it in Railway Dashboard.

## THE SOLUTION (Do this in Railway Dashboard)

### Step 1: Go to Railway Dashboard
1. Open https://railway.app/dashboard
2. Find project "shimmering-achievement"
3. Click on "SmartPromptiq-pro" service

### Step 2: Set DATABASE_URL
1. Click "Variables" tab
2. Find or add `DATABASE_URL`
3. Set it to:
   ```
   postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway
   ```
4. Click "Add" or "Update"
5. Railway will automatically redeploy

### Step 3: Wait 2 Minutes
Railway will redeploy with the correct database connection.

### Step 4: Create Tables
Once redeployed, run this locally:
```bash
railway service SmartPromptiq-pro
railway run "npx prisma db push --schema=./backend/prisma/schema.prisma --accept-data-loss --skip-generate"
```

This creates all the Academy tables in the PostgreSQL database.

### Step 5: Test API
```bash
curl https://smartpromptiq-pro-production.up.railway.app/api/academy/courses
```

Should return:
```json
{"success":true,"data":[]}
```

Empty array because no courses are seeded yet!

### Step 6: Seed Courses
You have 2 options:

**Option A: Quick Mock Data (Fastest)**
I can create a JSON file with your 57 courses and deploy it.

**Option B: Real Database Seed**
Create a seed script that runs on Railway to populate courses.

## What's Next?

Once DATABASE_URL is set in dashboard and tables are created:
1. API will work (returns empty array)
2. We seed the 57 courses
3. Academy is LIVE! 🎉

## Quick Check

The error you're seeing:
```
connect ENETUNREACH 2600:1f16:... - Local (:::0)
```

Means the code is trying to connect but DATABASE_URL is empty/invalid.

Once you set it in the dashboard, you'll see:
```
✅ PostgreSQL connection pool created for Academy routes
```

in the logs, and the API will work!

---

**ACTION REQUIRED:** Set DATABASE_URL in Railway Dashboard Variables tab, then wait 2 minutes for redeploy.
