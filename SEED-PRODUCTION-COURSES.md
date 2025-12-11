# How to Seed Production Courses on Railway

## Problem
**Your courses show locally but NOT online because the production database is empty.**

The production database on Railway doesn't have any courses seeded. You need to run the seed script once after deployment.

---

## Solution: Seed Production Database

### Option 1: Using Railway CLI (Recommended)

1. **Login to Railway**:
```bash
railway login
```

2. **Link to your project**:
```bash
railway link
```

3. **Run the seed script on Railway**:
```bash
railway run node seed-production.cjs
```

This will seed:
- ✅ Admin users (admin@smartpromptiq.net)
- ✅ 57 Academy courses
- ✅ 555+ lessons with full content
- ✅ Test data

---

### Option 2: Using Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Make sure `DATABASE_URL` is set
5. Go to **"Deployments"** tab
6. Click **"Deploy"**
7. After deployment, go to **"Settings"** → **"Service"**
8. Under **"Deploy Command"**, temporarily change it to:
   ```
   npm start && node seed-production.cjs
   ```
9. Redeploy

⚠️ **Important**: After seeding, change the deploy command back to just `npm start`

---

### Option 3: Manual Prisma Seed

1. SSH into Railway container or use Railway CLI:
```bash
railway run bash
```

2. Run the seed command:
```bash
cd backend
npm run seed
```

---

## Verify Courses Are Seeded

After running the seed, check if courses appear:

1. **Via API**:
   Visit: `https://your-app.railway.app/api/academy/courses`

2. **Via Frontend**:
   Visit: `https://your-app.railway.app/academy/courses`

You should see **57 courses** including:
- 3 Free courses
- 6 SmartPromptIQ platform courses
- 40+ Pro tier courses
- 6 Certification programs
- 4 Bonus resources

---

## Why Courses Show Locally But Not Online

**Local Environment:**
- ✅ Local SQLite database at `backend/prisma/dev.db`
- ✅ You ran `npm run seed` locally
- ✅ Courses are in local database

**Production Environment (Railway):**
- ❌ Production PostgreSQL database is EMPTY
- ❌ Seed script was NEVER run on Railway
- ❌ No courses exist in production

**The Fix:**
Run `railway run node seed-production.cjs` to seed production database with all 57 courses.

---

## Common Issues

### Issue 1: "DATABASE_URL not set"
**Solution**: Make sure you're running the command on Railway with `railway run`

### Issue 2: "Permission denied"
**Solution**: Check that your database user has CREATE/INSERT permissions

### Issue 3: "Connection refused"
**Solution**: Verify DATABASE_URL points to the correct database

### Issue 4: Courses still not showing
**Solution**:
1. Check API endpoint: `/api/academy/courses`
2. Check backend logs on Railway
3. Verify database connection in Railway logs

---

## After Seeding

Once seeded, you'll see:
- **57 courses** in Academy
- **3 free courses** for all users
- **Academy tier courses** for $29/mo subscribers
- **Pro tier courses** for $49/mo+ subscribers
- **Certification programs** for purchase

All courses will have:
- ✅ Full descriptions
- ✅ Lesson structure
- ✅ Ratings and enrollments
- ✅ Proper access tiers

---

## Need Help?

If courses still don't show after seeding:
1. Check Railway logs: `railway logs`
2. Test API directly: `curl https://your-app.railway.app/api/academy/courses`
3. Verify database: `railway connect` then query courses table
