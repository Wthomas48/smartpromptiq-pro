# Force Railway to Rebuild and Deploy Latest Code

## The Problem

Your academy.ts routes file is committed to Git, but Railway might be:
1. Using a cached build
2. Not restarting the server properly
3. Missing the academy routes import

## Solution: Force a Complete Rebuild

### Method 1: Trigger Redeploy in Dashboard (Fastest)

1. Go to https://railway.app/dashboard
2. Click **"shimmering-achievement"** project
3. Click your **web service** (not database)
4. Click **"Deployments"** tab
5. Click the **three dots (...)** next to the latest deployment
6. Click **"Redeploy"**
7. Wait 2-3 minutes for rebuild

This forces Railway to pull fresh code and rebuild everything.

---

### Method 2: Empty Commit Push

```bash
# Create an empty commit to trigger rebuild
git commit --allow-empty -m "Force Railway rebuild - Academy routes"
git push origin main
```

Railway will detect the push and redeploy.

---

### Method 3: Add a Dummy Change

Add a console.log to server.ts to force a rebuild:

```bash
# Edit server.ts to add a log line
echo "console.log('✅ Academy routes loaded');" >> backend/src/server.ts

# Commit and push
git add backend/src/server.ts
git commit -m "Force rebuild - verify academy routes"
git push origin main
```

---

### Method 4: Clear Build Cache (Nuclear Option)

1. Go to Railway Dashboard
2. Settings → **"Danger"** section
3. Click **"Clear Build Cache"**
4. Then redeploy

---

## After Rebuilding

Wait 2-3 minutes, then test:

### Test 1: Health Check
```
https://smartpromptiq-pro-production.up.railway.app/api/health
```
Should return: `{"status":"healthy"}`

### Test 2: Academy Courses
```
https://smartpromptiq-pro-production.up.railway.app/api/academy/courses
```
Should return: JSON with 57 courses

### Test 3: Check Logs
```bash
railway logs
```

Look for:
- ✅ `📦 Backend API ready`
- ✅ `🎓 Academy routes mounted at /api/academy`
- ✅ Server running on port

---

## Debugging: Check What's Deployed

To verify the academy routes are actually deployed:

1. Go to Railway Dashboard → Your Service → **"Deployments"**
2. Click the latest deployment
3. Click **"View Logs"**
4. Search for: `academy`

You should see logs indicating academy routes are loaded.

---

## If Still Not Working

The issue might be that Railway is running an old version. Check:

1. **Railway Service Settings**:
   - Start Command: Should be `npm start` or `ts-node src/server.ts`
   - Root Directory: Should be `/` or `/backend`

2. **Check which files are deployed**:
   - In Railway logs, look for "Build succeeded"
   - Verify `backend/src/routes/academy.ts` is listed

3. **Environment Variables**:
   - Make sure `NODE_ENV=production`
   - Make sure `DATABASE_URL` is set

---

## Quick Fix Script

Run this to force a rebuild:

```bash
cd c:\SmartPromptiq-pro
git commit --allow-empty -m "Force Railway rebuild"
git push origin main
```

Then wait 3 minutes and test the API again.

---

## Expected Result

After successful rebuild, visiting:
```
https://smartpromptiq-pro-production.up.railway.app/api/academy/courses
```

Should return:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Prompt Writing 101",
      "slug": "prompt-writing-101",
      "accessTier": "free",
      ...
    },
    // ... 56 more courses
  ]
}
```
