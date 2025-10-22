# 🚀 Production Deployment Guide for Railway

## ⚠️ **Current Issue**

Your online site (smartpromptiq.com) is showing "something went wrong" because:

1. **SQLite doesn't work on Railway** - Railway deployments are ephemeral (files reset on redeploy)
2. **Missing database** - The production server has no database file
3. **Old code deployed** - Latest changes with database integration haven't been deployed

---

## ✅ **Solution: Deploy with PostgreSQL**

Railway provides free PostgreSQL databases. Here's how to fix it:

### Step 1: Add PostgreSQL to Your Railway Project

1. Go to: https://railway.app/dashboard
2. Open your SmartPromptIQ project
3. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Railway will create a PostgreSQL database
5. Copy the **DATABASE_URL** connection string

### Step 2: Update Environment Variables on Railway

In Railway Dashboard → Your Service → **Variables** tab, add:

```env
DATABASE_URL=postgresql://postgres:password@host:port/database
NODE_ENV=production
PORT=${{PORT}}  # Railway provides this automatically
```

### Step 3: Update Prisma Schema for Production

The schema already supports PostgreSQL! Just need to change datasource in `backend/prisma/schema.prisma`:

**For Production (PostgreSQL)**:
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

**Keep SQLite for Local Development**:
Create `.env.local` for local:
```env
DATABASE_URL="file:./dev.db"
```

### Step 4: Update server.cjs for Production Database

The current `server.cjs` uses SQLite. For production, we need to:

1. Check if PostgreSQL is available
2. Fall back to SQLite for local development

I'll update this for you automatically.

### Step 5: Deploy to Railway

```bash
# Commit latest changes
git add .
git commit -m "Add production database support with PostgreSQL"
git push

# Railway auto-deploys from git pushes
```

---

## 🔧 **Quick Fix for Right Now**

Since the issue is the database not existing, the **fastest fix** is:

1. **Push the latest code** to Railway (triggers rebuild)
2. **Add environment variables** in Railway dashboard
3. **Database will be created** on first startup

Want me to help you push the code to Railway right now?

---

## 📊 **What Needs to Happen**

### Local Development (Keep SQLite):
```
DATABASE_URL="file:./backend/prisma/dev.db"
```

### Production (Use PostgreSQL):
```
DATABASE_URL="postgresql://user:pass@railway.host:5432/db"
```

---

## 🎯 **Action Items**

1. **Add PostgreSQL database** in Railway dashboard
2. **Update environment variables** in Railway
3. **Push latest code** to trigger deployment
4. **Run database migration** on Railway (automatic on first deploy)

Would you like me to:
1. Update the code to support both SQLite (local) and PostgreSQL (production)?
2. Help you push the code to Railway?
3. Create the Railway deployment configuration?

Let me know and I'll fix the production site immediately! 🚀
