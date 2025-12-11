# 🚀 Deploy Academy Routes to Railway NOW

## Current Status
✅ Code is ready and committed (commit `1a04b29`)
✅ Academy routes added to `academy-routes.cjs`
✅ Railway server updated to load Academy routes
❌ **Railway is NOT auto-deploying** - manual deployment needed

## Problem
Railway CLI shows `Service: None` which means the project isn't linked to the Railway service that's actually running your app.

## Solution: Manual Deployment

### Option 1: Trigger Rebuild via Railway Dashboard (EASIEST)
1. Go to Railway Dashboard: https://railway.app/dashboard
2. Find your project: "SmartPromptIQ Pro" or "shimmering-achievement"
3. Click on the service that's running
4. Click "Deployments" tab
5. Click "Deploy" or "Redeploy" button
6. Wait 2-3 minutes for build to complete

### Option 2: Use Railway CLI (If properly linked)
```bash
# Link to the correct service first
railway link

# Then deploy
railway up

# Or force a new deployment
railway redeploy
```

### Option 3: Empty Commit to Trigger GitHub Integration
If Railway is watching your GitHub repo:
```bash
git commit --allow-empty -m "Trigger Railway rebuild for Academy routes"
git push origin main
```

## What the Deployment Will Do

When Railway rebuilds, it will:
1. Pull latest code from GitHub (includes `academy-routes.cjs`)
2. Install dependencies
3. Build the application
4. Start the server with `railway-server-minimal.cjs`
5. Load Academy routes via `require('./academy-routes.cjs')(app)`

## Verification Steps

After deployment completes (2-5 minutes):

### 1. Test Health Endpoint
```bash
curl https://smartpromptiq-pro-production.up.railway.app/api/health
```
Should return:
```json
{"status":"healthy","timestamp":"..."}
```

### 2. Test Courses API (THE IMPORTANT ONE!)
```bash
curl https://smartpromptiq-pro-production.up.railway.app/api/academy/courses
```

**Before (current):** Returns HTML
**After (fixed):** Returns JSON with courses array:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Prompt Writing 101",
      "slug": "prompt-writing-101",
      ...
    }
  ]
}
```

### 3. Test Frontend
Visit: https://smartpromptiq-pro-production.up.railway.app/academy/courses

Should see:
- Grid of 57 courses
- Course thumbnails
- Categories and filters working
- Click a course → see lessons
- Click a lesson → see content

## Quick Test Script

Save this as `test-academy-api.sh` and run it:
```bash
#!/bin/bash
echo "Testing Academy API on Railway..."
echo ""
echo "1. Health Check:"
curl -s https://smartpromptiq-pro-production.up.railway.app/api/health | jq
echo ""
echo ""
echo "2. Courses API (should return JSON, not HTML):"
curl -s https://smartpromptiq-pro-production.up.railway.app/api/academy/courses | head -50
echo ""
echo ""
echo "If you see JSON with 'success: true' and a 'data' array, IT WORKS! 🎉"
echo "If you see HTML, the deployment hasn't happened yet. Wait and try again."
```

## Expected Timeline

- **Now:** Code is committed and pushed ✅
- **+2-5 min:** Railway deployment completes
- **+5-10 min:** CDN/cache updates (if applicable)
- **Result:** Academy courses live! 🎓

## Troubleshooting

### If API still returns HTML after 10 minutes:

1. **Check Railway logs:**
   ```bash
   railway logs
   ```
   Look for:
   - "🔗 Loading Academy routes..."
   - "📚 Registering Academy API routes..."

2. **Verify file exists on Railway:**
   The `academy-routes.cjs` file must be in the root directory

3. **Check for deployment errors:**
   - Module not found errors
   - Syntax errors
   - Prisma client issues

4. **Force a hard rebuild:**
   In Railway dashboard, delete the current deployment and create a new one

## What We Changed

### Files Added/Modified:
1. **academy-routes.cjs** (NEW)
   - Contains all Academy API routes
   - Uses Prisma to query database
   - Exports function that registers routes

2. **railway-server-minimal.cjs** (MODIFIED)
   - Line 575: Added `require('./academy-routes.cjs')(app)`
   - Loads Academy routes before static file serving

### Routes Now Available:
- `GET /api/academy/courses` - List all courses
- `GET /api/academy/courses/:slug` - Get course details
- `GET /api/academy/lesson/:lessonId` - Get lesson content

## Database Confirmation

Your production database ALREADY HAS:
- ✅ 57 courses (all published)
- ✅ 555 lessons (all published)
- ✅ Full course content
- ✅ Lesson metadata, quizzes, exercises

The ONLY thing missing was the API routes to ACCESS this data!

## Success Criteria

You'll know it worked when:
1. API returns JSON (not HTML) ✅
2. JSON has `"success": true` ✅
3. JSON has `"data"` array with 57 courses ✅
4. Frontend course catalog loads ✅
5. You can click through courses and lessons ✅

---

## 🎯 ACTION REQUIRED

**YOU NEED TO:**
1. Go to Railway Dashboard
2. Find your SmartPromptIQ Pro service
3. Click "Deploy" or "Redeploy"
4. Wait 3-5 minutes
5. Test the API endpoint

**OR simply run:**
```bash
git commit --allow-empty -m "Trigger Railway rebuild"
git push origin main
```

Then wait 3-5 minutes and test!

---

**Status:** 🟡 WAITING FOR DEPLOYMENT
**Next Step:** Trigger Railway rebuild
**ETA:** 3-5 minutes after rebuild starts
