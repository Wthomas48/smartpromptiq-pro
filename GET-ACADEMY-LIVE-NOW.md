# 🎯 GET ACADEMY LIVE - FINAL SOLUTION

## Current Status
- ✅ Server is running on Railway
- ✅ Academy routes code is deployed (PostgreSQL version)
- ✅ API endpoints are registered
- ❌ No database connection (DATABASE_URL is empty or invalid)
- ❌ No course data

## THE QUICKEST PATH TO GET COURSES LIVE (5 Minutes)

### Option 1: Add Postgres Database in Railway Dashboard ⭐ FASTEST

1. **Go to Railway Dashboard**
   - Open your project "shimmering-achievement"
   - Find the "SmartPromptiq-pro" service

2. **Add PostgreSQL Database**
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will automatically:
     - Create a Postgres database
     - Set DATABASE_URL environment variable
     - Redeploy your service

3. **Create Tables**
   Once deployed, run this command locally:
   ```bash
   railway run --service SmartPromptiq-pro "npx prisma db push --schema=./backend/prisma/schema.prisma --accept-data-loss"
   ```

4. **Seed the Database**
   You have 57 courses in your local SQLite database. We need to export and import them:

   Create a seed script or manually run:
   ```bash
   railway run --service SmartPromptiq-pro "cd backend && npx prisma db seed"
   ```

5. **Test**
   ```bash
   curl https://smartpromptiq-pro-production.up.railway.app/api/academy/courses
   ```
   Should return 57 courses!

### Option 2: Use Mock Data (2 Minutes) ⚡ INSTANT

Add static course data to `academy-routes.cjs`:

```javascript
// At the top of academy-routes.cjs
const MOCK_COURSES = [
  {
    id: "1",
    title: "Prompt Writing 101",
    slug: "prompt-writing-101",
    description: "Learn the fundamentals of prompt engineering",
    category: "prompt-engineering",
    difficulty: "beginner",
    duration: 120,
    accessTier: "free",
    _count: { lessons: 10, enrollments: 0, reviews: 0 }
  },
  // ... add your 57 courses here
];

// In the /courses endpoint:
app.get('/api/academy/courses', async (req, res) => {
  res.json({ success: true, data: MOCK_COURSES });
});
```

Then deploy - Academy works instantly!

## Why Is This Happening?

The Railway PostgreSQL database either:
1. Doesn't exist
2. Isn't linked to your service
3. Has no tables/data

## What You Need

**IN RAILWAY DASHBOARD:**
1. A PostgreSQL database (plugin/service)
2. DATABASE_URL environment variable pointing to it
3. Tables created (via `prisma db push`)
4. Data seeded (your 57 courses)

## Quick Check

Run this:
```bash
railway service Postgres
railway variables
```

If you see a REAL DATABASE_URL (starts with `postgresql://postgres:PASSWORD@...`), then:
1. Tables need to be created
2. Data needs to be seeded

If DATABASE_URL is empty/invalid:
1. Postgres database needs to be added to Railway project

## My Recommendation

**FASTEST:** Add Postgres database in Railway Dashboard (literally click "+ New" → "Database" → "PostgreSQL")

**EASIEST:** Use mock data approach for now, fix database later

Choose one and let me know! I can help with either path.

---

**Bottom line:** We're 99% there. Just need a database with tables and data. Choose your path:
- 🏃 Fast: Add Postgres in Dashboard (5 mins)
- ⚡ Instant: Mock data (2 mins)
