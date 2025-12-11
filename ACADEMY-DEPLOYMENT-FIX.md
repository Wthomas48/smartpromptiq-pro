# 🎓 Academy Courses Deployment Fix

## Problem Identified
Courses were not showing on the Railway production deployment at `https://smartpromptiq-pro-production.up.railway.app` because the Academy API routes were missing from the Railway server file.

## Root Cause
The `railway-server-minimal.cjs` file (used for Railway deployments) did not include the Academy routes that exist in `backend/src/server.ts`. This caused all `/api/academy/*` requests to return HTML instead of JSON.

## Solution Implemented

### 1. Created `academy-routes.cjs`
A new modular file containing all Academy API endpoints:
- `GET /api/academy/courses` - List all published courses
- `GET /api/academy/courses/:slug` - Get course details with lessons
- `GET /api/academy/lesson/:lessonId` - Get lesson content

### 2. Updated `railway-server-minimal.cjs`
Added the require statement to load Academy routes:
```javascript
// Register Academy API routes
console.log('🔗 Loading Academy routes...');
require('./academy-routes.cjs')(app);
```

### 3. Committed and Pushed
```bash
git add academy-routes.cjs railway-server-minimal.cjs
git commit -m "Add Academy API routes to Railway deployment"
git push origin main
```

## Expected Result

After Railway completes the auto-deployment (2-5 minutes), the following should work:

### Test Commands:
```bash
# 1. Test courses endpoint
curl https://smartpromptiq-pro-production.up.railway.app/api/academy/courses

# Should return JSON like:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Prompt Writing 101",
      "slug": "prompt-writing-101",
      "category": "prompt-engineering",
      "_count": {
        "lessons": 10,
        "enrollments": 0,
        "reviews": 0
      }
    },
    ...
  ]
}

# 2. Test specific course
curl https://smartpromptiq-pro-production.up.railway.app/api/academy/courses/prompt-writing-101

# 3. Test lesson endpoint
curl https://smartpromptiq-pro-production.up.railway.app/api/academy/lesson/LESSON_ID
```

### Frontend Test:
1. Visit: https://smartpromptiq-pro-production.up.railway.app/academy/courses
2. Should see grid of 57 courses
3. Click any course to view lessons
4. Click any lesson to view content

## Verification Checklist

- [x] Created academy-routes.cjs with Prisma integration
- [x] Added routes to railway-server-minimal.cjs
- [x] Committed changes to git
- [x] Pushed to GitHub (triggers Railway deployment)
- [ ] Railway deployment completes (~2-5 minutes)
- [ ] `/api/academy/courses` returns JSON (not HTML)
- [ ] Courses page shows all 57 courses
- [ ] Course detail pages load
- [ ] Lesson viewer works

## Database Status

The production database already has:
- ✅ 57 courses seeded
- ✅ 555 lessons seeded
- ✅ All courses published (`isPublished: true`)
- ✅ All lessons published (`isPublished: true`)

## Next Steps

1. **Wait** for Railway deployment to complete (check every 30 seconds)
2. **Test** the API endpoint returns JSON
3. **Verify** frontend courses page loads
4. **Celebrate** 🎉 Academy is live!

## Deployment Time
- Code committed: [timestamp of commit]
- Expected completion: ~2-5 minutes after commit
- Status: DEPLOYING...

## Technical Details

### File Sizes (Well within GitHub/Railway limits):
- `railway-server-minimal.cjs`: 120 KB ✅
- `academy-routes.cjs`: <5 KB ✅
- Both files are well under GitHub's 100 MB limit

### Architecture:
```
Railway Server (railway-server-minimal.cjs)
  ├── Health endpoints
  ├── Auth endpoints
  ├── Demo endpoints
  ├── 🆕 Academy endpoints (academy-routes.cjs)
  │    ├── GET /api/academy/courses
  │    ├── GET /api/academy/courses/:slug
  │    └── GET /api/academy/lesson/:lessonId
  └── Static file serving (React app)
```

### Database Connection:
- Uses Prisma Client
- Connects to Railway PostgreSQL database
- Same database that has all 57 courses and 555 lessons

## Troubleshooting

If courses still don't show after deployment:

1. **Check deployment status:**
   ```bash
   railway status
   ```

2. **View deployment logs:**
   ```bash
   railway logs
   ```

3. **Test API directly:**
   ```bash
   curl https://smartpromptiq-pro-production.up.railway.app/api/academy/courses
   ```

4. **Verify database has data:**
   - Should return array of courses
   - Each course should have `_count.lessons` > 0

5. **Check browser console:**
   - Open DevTools → Network tab
   - Navigate to `/academy/courses`
   - Check API request status

## Files Changed

1. **academy-routes.cjs** (NEW)
   - Modular Academy API routes
   - Uses Prisma for database queries
   - Exports function that registers routes

2. **railway-server-minimal.cjs** (MODIFIED)
   - Added `require('./academy-routes.cjs')(app)` at line 575
   - Loads Academy routes before static file serving

## Commit Hash
`1a04b29` - Add Academy API routes to Railway deployment

---

**Status:** 🟡 DEPLOYING
**Last Updated:** 2025-11-07 23:20 UTC
**Next Check:** Test API in 2-3 minutes
