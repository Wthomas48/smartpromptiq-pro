# Railway Deployment - Admin Setup Guide

## ✅ Admin Setup for Production (Railway/PostgreSQL)

This guide shows how to deploy your admin users to Railway or any PostgreSQL production database.

---

## Quick Deploy

### Option 1: Via Railway CLI (Recommended)
```bash
# Make sure you're logged in to Railway
railway login

# Link to your project (if not already linked)
railway link

# Run the admin setup script
railway run node setup-production-admin.cjs
```

### Option 2: Via npm script
```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Run the production admin setup
npm run admin:create:prod
```

### Option 3: Add to Railway Build Process
In Railway dashboard → Settings → Build Command:
```bash
npm run build && npm run railway:admin
```

---

## What Gets Created

The script creates **3 admin accounts** for redundancy:

1. **admin@admin.com** - Primary admin
2. **admin@smartpromptiq.net** - Production admin
3. **admin@smartpromptiq.com** - Backup admin

**All use the same password**: `Admin123!`

⚠️ **IMPORTANT**: Change this password after deployment!

---

## Step-by-Step Railway Deployment

### Step 1: Verify Railway Connection
```bash
railway status
```

Should show your project and environment.

### Step 2: Run Admin Setup
```bash
railway run node setup-production-admin.cjs
```

Expected output:
```
🚀 Setting up production admin users...
📍 Database: your-db-host
✅ Connected to production database
🔐 Password hashed
✅ Created admin: admin@admin.com (ID: xxx)
✅ Created admin: admin@smartpromptiq.net (ID: xxx)
✅ Created admin: admin@smartpromptiq.com (ID: xxx)

✅ All admin users configured successfully!
```

### Step 3: Verify Admin Created
```bash
railway run node -e "const{Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});c.connect().then(()=>c.query('SELECT email,role FROM users WHERE role=$1',['ADMIN'])).then(r=>{console.log('Admins:',r.rows);c.end()});"
```

---

## Railway Environment Variables

Railway automatically provides:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NODE_ENV` - Set to 'production'

No additional configuration needed!

---

## Production Database Seed

### Using Prisma Seed (Alternative Method)

If you want to use the Prisma seed script on production:

```bash
# In Railway
railway run npm run db:seed
```

This will:
- Create admin@admin.com
- Create admin@smartpromptiq.net
- Create test@smartpromptiq.com

---

## Accessing Admin Panel

Once deployed, access your admin panel at:

```
https://smartpromptiq.com/admin/login
```

Or your Railway URL:
```
https://your-app.up.railway.app/admin/login
```

**Login with any of these**:
- admin@admin.com
- admin@smartpromptiq.net
- admin@smartpromptiq.com

**Password**: `Admin123!`

---

## Troubleshooting

### Error: "Cannot connect to database"

**Check DATABASE_URL**:
```bash
railway variables
```

Should show `DATABASE_URL` with PostgreSQL connection string.

**Fix**: Make sure your database service is running in Railway.

---

### Error: "Module not found: better-sqlite3"

**This is fixed!** We moved `better-sqlite3` to devDependencies since production uses PostgreSQL, not SQLite.

The error occurs because Railway was trying to install SQLite bindings which aren't needed for PostgreSQL.

---

### Error: "Admin user not found after creation"

**Verify database connection**:
```bash
railway run psql $DATABASE_URL -c "SELECT email, role FROM users WHERE role='ADMIN';"
```

**Re-run setup if needed**:
```bash
railway run npm run railway:admin
```

---

### How to Change Admin Password

#### Method 1: Edit Script and Re-run
1. Edit `setup-production-admin.cjs` line 32:
   ```javascript
   const hashedPassword = await bcrypt.hash('YourNewPassword!', 12);
   ```

2. Re-run on Railway:
   ```bash
   railway run npm run railway:admin
   ```

#### Method 2: Direct Database Update
```bash
# Generate new password hash
node -e "const bcrypt=require('bcrypt');bcrypt.hash('NewPassword!',12).then(h=>console.log(h));"

# Copy the hash, then update in Railway
railway run psql $DATABASE_URL -c "UPDATE users SET password='<paste-hash>' WHERE email='admin@admin.com';"
```

---

## Production Security Checklist

- [ ] Change default admin password
- [ ] Verify admin emails are correct
- [ ] Test admin login on production
- [ ] Set up 2FA (if available)
- [ ] Monitor admin activity logs
- [ ] Restrict admin IP addresses (optional)
- [ ] Use strong, unique passwords
- [ ] Rotate passwords every 90 days

---

## Deployment Workflow

### Initial Deploy
```bash
# 1. Deploy your app
railway up

# 2. Run migrations
railway run npx prisma migrate deploy

# 3. Create admin users
railway run npm run railway:admin

# 4. Verify
railway run node -e "console.log('Testing...')"
```

### Subsequent Deploys
```bash
# Admin users persist, no need to recreate
railway up
```

### Reset Admin (if needed)
```bash
# Re-run admin setup (safe to run multiple times)
railway run npm run railway:admin
```

---

## Files Involved

| File | Purpose |
|------|---------|
| `setup-production-admin.cjs` | Creates admins in PostgreSQL |
| `backend/prisma/seed.ts` | Alternative seed method |
| `package.json` | npm scripts |

---

## Quick Commands

```bash
# RAILWAY ADMIN SETUP
railway run npm run railway:admin

# VERIFY ADMIN
railway run npm run admin:verify

# CHECK DATABASE
railway run psql $DATABASE_URL -c "SELECT * FROM users WHERE role='ADMIN';"

# RUN SEED
railway run npm run db:seed
```

---

## Summary

✅ **Fixed**: Moved `better-sqlite3` to devDependencies
✅ **Production**: Uses PostgreSQL via `setup-production-admin.cjs`
✅ **Local**: Uses SQLite via `create-admin-sqlite.cjs`
✅ **Railway**: One command deployment: `railway run npm run railway:admin`

**Status**: Ready to deploy! 🚀
