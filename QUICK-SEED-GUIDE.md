# Quick Guide: Seed Production Database

## The Problem
Your courses show locally but not online because Railway's database is empty.

---

## Easiest Solution: Use Railway Dashboard

### Step 1: Get Your Database URL
1. Go to https://railway.app/dashboard
2. Click on your **SmartPromptIQ** project
3. Click on your **PostgreSQL database** service (the one with the elephant icon)
4. Go to **"Connect"** tab
5. Copy the **"Postgres Connection URL"** (starts with `postgresql://`)

### Step 2: Create .env File Locally
Create a file called `.env.production` in your project root:

```bash
DATABASE_URL="paste-your-postgres-url-here"
```

### Step 3: Run Seed Script Locally (Targeting Production)
```bash
# Windows PowerShell
$env:DATABASE_URL="your-postgres-url-here"; node seed-production.cjs

# OR use the .env file
npm install dotenv
node -r dotenv/config seed-production.cjs dotenv_config_path=.env.production
```

---

## Alternative: Use Railway Web Terminal

### Step 1: Open Railway Shell
1. Go to https://railway.app/dashboard
2. Click your **SmartPromptIQ** project
3. Click your **app service** (not the database)
4. Click the **"Shell"** icon (terminal icon in top right)

### Step 2: Run Commands in Shell
```bash
cd /app
npm install
cd backend
npm run seed
```

This will seed all 57 courses directly on Railway!

---

## Alternative: Add Seed to Deploy

### Step 1: Update package.json
Add this to your root `package.json` scripts:

```json
"scripts": {
  "postinstall": "cd backend && npx prisma generate",
  "railway:seed": "cd backend && npm run seed"
}
```

### Step 2: Run One-Time Deploy with Seed
On Railway dashboard:
1. Go to your service **Settings**
2. Under **Deploy**, add custom command:
   ```
   npm start
   ```
3. Then in **Shell**, run:
   ```
   npm run railway:seed
   ```

---

## Verify It Worked

Test your API endpoint:
```
https://your-app.railway.app/api/academy/courses
```

You should see JSON with 57 courses!

---

## If You Get Errors

### Error: "relation does not exist"
**Solution**: Run migrations first
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run seed
```

### Error: "Cannot connect to database"
**Solution**: Check your DATABASE_URL in Railway Variables tab

### Error: "Permission denied"
**Solution**: Your database user needs CREATE/INSERT permissions

---

## Need the DATABASE_URL?

**Find it here:**
1. Railway Dashboard → Your Project
2. Click **PostgreSQL** service
3. Go to **Variables** tab
4. Copy `DATABASE_URL` value

**Format should be:**
```
postgresql://username:password@host:port/database
```

---

## After Seeding Successfully

Your production site will have:
- ✅ 57 courses in Academy
- ✅ 555+ lessons
- ✅ Proper tier access (Free/Academy/Pro)
- ✅ All course metadata (ratings, instructors, etc.)

🎉 **Your Academy is now fully populated online!**
