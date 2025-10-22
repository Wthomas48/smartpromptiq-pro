# 🚀 Railway PostgreSQL Database Setup

## ✅ What's Been Done

1. ✅ PostgreSQL support added to server.cjs
2. ✅ Code deployed to Railway
3. ✅ PostgreSQL database migration SQL created

## 🎯 **FINAL STEP: Create Database Tables**

Your Railway PostgreSQL database exists but is **empty** (no tables). You need to run the SQL migration to create tables.

---

## **Option 1: Run SQL in Railway Dashboard (Easiest)**

1. Go to https://railway.app/dashboard
2. Open your SmartPromptIQ project
3. Click on **"Postgres"** database
4. Click **"Data"** tab
5. Click **"Query"** button
6. Copy and paste the contents of `init-postgres.sql`
7. Click **"Run"** or press Ctrl+Enter

**The SQL will:**
- Create `users` table
- Create `token_transactions` table
- Create `subscriptions` table
- Create indexes
- Insert admin user (email: admin@smartpromptiq.com, password: admin123)

---

## **Option 2: Use psql Command Line**

### Get Your Database Connection String:

1. In Railway Dashboard → Postgres → **Connect**
2. Copy the **Database URL** (or **Postgres Connection URL**)
3. It looks like: `postgresql://postgres:password@containers.railway.app:7432/railway`

### Run Migration:

```bash
# Using the connection string
psql "postgresql://postgres:password@containers.railway.app:7432/railway" < init-postgres.sql

# Or if you have the connection details separately:
psql -h containers-us-west-xxx.railway.app \
     -p 7432 \
     -U postgres \
     -d railway \
     -f init-postgres.sql
```

---

## **Option 3: Use Railway CLI**

```bash
# Link to project
railway link

# Open database shell
railway run psql $DATABASE_URL

# In the psql shell, run:
\i init-postgres.sql

# Or in one command:
cat init-postgres.sql | railway run psql $DATABASE_URL
```

---

## ✅ **After Running SQL**

Your production site will have:

1. **Database tables created** ✅
2. **Admin account ready** ✅
   - Email: admin@smartpromptiq.com
   - Password: admin123
3. **User registration working** ✅
4. **All data persists** ✅

---

## 🧪 **Test It Works**

After running the SQL:

1. Wait 30 seconds for Railway to restart
2. Go to https://smartpromptiq.com
3. Try to register a new user
4. Check admin dashboard - you should see the new user!

---

## 📊 **Expected Railway Logs**

After deployment, you should see in Railway logs:

```
🐘 Connecting to PostgreSQL database...
✅ Connected to PostgreSQL database
SmartPromptiq Pro Server Started
```

If you see this, everything is working! 🎉

---

## ❓ **Troubleshooting**

### "unable to connect to database"
- Check that DATABASE_URL environment variable is set in Railway
- Verify it starts with `postgresql://`

### "relation 'users' does not exist"
- You need to run the `init-postgres.sql` file
- Follow Option 1 above

### "something went wrong" on website
- Check Railway logs for errors
- Verify database tables were created
- Try restarting the Railway service

---

## 🎯 **Next: The SQL is Ready!**

I've created `init-postgres.sql` with all the tables you need.

**Just run it in Railway using Option 1 (easiest):**
1. Railway Dashboard → Postgres → Data → Query
2. Paste contents of `init-postgres.sql`
3. Run it
4. Done! Your production site will work! 🚀
