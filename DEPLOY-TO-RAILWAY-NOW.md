# Deploy Latest Code to Railway

## The Problem
✅ Your production database has all 57 courses
❌ Your deployed code on Railway is OLD and doesn't have `/api/academy` routes

**You need to deploy the latest code!**

---

## Solution: Deploy to Railway

### Method 1: Git Push (Recommended if using Git)

```bash
# 1. Stage all changes
git add .

# 2. Commit with message
git commit -m "Add Academy courses and routes"

# 3. Push to main branch (Railway auto-deploys)
git push origin main
```

Railway will automatically detect the push and deploy!

---

### Method 2: Railway CLI Deploy

```bash
# Deploy current directory to Railway
railway up
```

---

### Method 3: Manual Deploy via Dashboard

1. Go to https://railway.app/dashboard
2. Click your SmartPromptIQ project
3. Click your app service
4. Click **"Deployments"** tab
5. Click **"Deploy"** button
6. Wait for deployment to complete (~2-3 minutes)

---

## After Deploying

### 1. Check Deployment Logs
```bash
railway logs
```

Look for:
- ✅ `Server running on port 8080`
- ✅ `Database connected`
- ✅ Academy routes registered

### 2. Test Academy API
Visit (replace with your Railway URL):
```
https://your-app.railway.app/api/academy/courses
```

You should see JSON with 57 courses!

### 3. Test Frontend
Visit:
```
https://your-app.railway.app/academy/courses
```

You should see the course catalog!

---

## What Gets Deployed

When you deploy, Railway will:
1. ✅ Pull latest code from Git (or upload from CLI)
2. ✅ Run `npm install` in both root and backend
3. ✅ Build frontend (`npm run build:client`)
4. ✅ Start server with latest code
5. ✅ Connect to your PostgreSQL database (with seeded courses)

---

## Verify Deployment Succeeded

### Check 1: Railway Logs
```bash
railway logs --tail 100
```

Look for these SUCCESS messages:
```
✅ Server running on port 8080
✅ Database connected
📦 Backend API ready
```

### Check 2: API Health
Visit: `https://your-app.railway.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "success": true
}
```

### Check 3: Academy Endpoint
Visit: `https://your-app.railway.app/api/academy/courses`

Should return JSON array with 57 course objects!

---

## Common Issues

### Issue: "Build failed"
**Cause**: Missing dependencies or build errors
**Solution**: Check logs with `railway logs`, fix errors, deploy again

### Issue: "Courses still not showing"
**Cause**: Old deployment still running
**Solution**:
1. Force redeploy: `railway up --detach`
2. Or restart service in Railway dashboard

### Issue: "404 on /api/academy/courses"
**Cause**: Backend routes not loaded
**Solution**: Check that `academyRoutes` is imported in `server.ts` (line 29, 306)

---

## Quick Deploy Checklist

- [ ] All changes committed to Git
- [ ] Pushed to main branch OR ran `railway up`
- [ ] Deployment shows "Success" in Railway dashboard
- [ ] Checked `railway logs` for errors
- [ ] Tested `/api/academy/courses` endpoint
- [ ] Verified courses show on `/academy/courses` page

---

## Your Production is Ready When:

✅ `/api/academy/courses` returns JSON with 57 courses
✅ `/academy/courses` shows course catalog on frontend
✅ Users can browse and enroll in courses
✅ Free, Academy, and Pro tier access works

**After deploying, all 57 courses will be live!** 🚀
