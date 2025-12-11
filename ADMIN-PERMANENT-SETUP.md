# Admin User - Permanent Setup Guide

## ✅ Permanent Admin Setup Complete!

Admin users are now configured to be created automatically in both local and production environments.

---

## Admin Credentials

### Local Development
```
Email:    admin@admin.com
Password: Admin123!
URL:      http://localhost:5176/admin/login
```

### Production
```
Emails:   admin@smartpromptiq.net
          admin@smartpromptiq.com
          admin@admin.com
Password: Admin123!
URL:      https://smartpromptiq.com/admin/login
```

---

## How It Works - Automatic Setup

### 1. Database Seed Script
**File**: [backend/prisma/seed.ts](backend/prisma/seed.ts)

The seed script automatically creates admin users when you run:
```bash
npm run db:seed
```

This creates:
- ✅ `admin@admin.com` - Local admin
- ✅ `admin@smartpromptiq.net` - Production admin
- ✅ `test@smartpromptiq.com` - Test user

**When to use**: When setting up a new database or resetting data

---

### 2. NPM Scripts (Easy Access)

We've added convenient npm scripts:

```bash
# LOCAL DEVELOPMENT
npm run admin:create        # Create/update admin in local SQLite DB
npm run admin:verify        # Verify admin exists
npm run admin:check         # Check database structure
npm run db:seed            # Seed database with admin + test users

# PRODUCTION
npm run admin:create:prod   # Create/update admin in production PostgreSQL
npm run railway:admin       # Create admin on Railway deployment
```

---

### 3. Production Deployment

#### On Railway (Automatic)
When deploying to Railway, add this to your build/deploy process:

```bash
# After database migration, run:
npm run railway:admin
```

Or manually via Railway CLI:
```bash
railway run npm run admin:create:prod
```

#### Manual Production Setup
```bash
# Set your production database URL
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Run production admin setup
npm run admin:create:prod
```

This creates all 3 admin accounts in production.

---

## Scripts Created

### 1. [create-admin-sqlite.cjs](create-admin-sqlite.cjs)
**Purpose**: Create/update admin in local SQLite database
**Usage**: `npm run admin:create`
**Creates**: `admin@admin.com`

### 2. [setup-production-admin.cjs](setup-production-admin.cjs)
**Purpose**: Create/update admin in production PostgreSQL
**Usage**: `npm run admin:create:prod`
**Creates**:
- `admin@admin.com`
- `admin@smartpromptiq.net`
- `admin@smartpromptiq.com`

### 3. [verify-admin.cjs](verify-admin.cjs)
**Purpose**: Check if admin exists in database
**Usage**: `npm run admin:verify`

### 4. [check-db.cjs](check-db.cjs)
**Purpose**: Inspect database tables and users
**Usage**: `npm run admin:check`

---

## First-Time Setup

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Setup database
cd backend
npx prisma generate
npx prisma db push

# 3. Seed database (creates admin + test users)
npm run seed

# 4. Verify admin created
cd ..
npm run admin:verify
```

### Production Deployment
```bash
# Option 1: Using npm script
npm run admin:create:prod

# Option 2: Using direct script with custom DB
DATABASE_URL="your-postgres-url" node setup-production-admin.cjs

# Option 3: On Railway
railway run node setup-production-admin.cjs
```

---

## Verifying Admin Setup

### Local (SQLite)
```bash
npm run admin:verify
```

Expected output:
```json
{
  "id": "...",
  "email": "admin@admin.com",
  "role": "ADMIN",
  "firstName": "Admin",
  "lastName": "User",
  "plan": "ENTERPRISE",
  "tokenBalance": 99999,
  "generationsLimit": 99999
}
```

### Production (PostgreSQL)
```bash
# On Railway
railway run npm run admin:verify

# Or directly
DATABASE_URL="your-url" node verify-admin.cjs
```

---

## Railway Deployment Integration

### Add to Railway Build Command
In Railway dashboard → Settings → Build Command:
```bash
npm run build && npm run railway:admin
```

### Or in package.json railway scripts
```json
{
  "scripts": {
    "railway:build": "npm run build && npm run railway:admin",
    "railway:start": "npm start"
  }
}
```

### Environment Variables Needed
Railway automatically provides `DATABASE_URL`, so no additional setup needed!

---

## Admin Features Access

Once logged in as admin, you get:

### Full Admin Dashboard
- 📊 System overview & analytics
- 👥 User management (view, edit, suspend)
- 💳 Payment & subscription management
- 🎯 Token balance management
- 🔒 Security & activity monitoring
- 📧 Email campaign management
- 📈 Advanced analytics & reports

### Enterprise Plan Benefits
- ✨ Unlimited prompt generations (99,999)
- 💰 Unlimited tokens (99,999)
- 🚀 Priority support
- 🔓 Access to all features
- 🎨 Custom templates
- 📊 Advanced analytics

---

## Updating Admin Password

### Local
Edit [create-admin-sqlite.cjs](create-admin-sqlite.cjs:17):
```javascript
const hashedPassword = await bcrypt.hash('YourNewPassword!', 10);
```

Then run:
```bash
npm run admin:create
```

### Production
Edit [setup-production-admin.cjs](setup-production-admin.cjs:32):
```javascript
const hashedPassword = await bcrypt.hash('YourNewPassword!', 12);
```

Then run:
```bash
npm run admin:create:prod
```

---

## Adding More Admins

### Edit the seed script
**File**: [backend/prisma/seed.ts](backend/prisma/seed.ts:16-70)

Add another upsert block:
```typescript
const newAdmin = await prisma.user.upsert({
  where: { email: 'newemail@admin.com' },
  update: {
    password: adminPassword,
    role: 'ADMIN',
    plan: 'ENTERPRISE'
  },
  create: {
    email: 'newemail@admin.com',
    username: 'newadmin',
    password: adminPassword,
    firstName: 'New',
    lastName: 'Admin',
    role: 'ADMIN',
    plan: 'ENTERPRISE',
    subscriptionTier: 'enterprise',
    generationsLimit: 99999,
    tokenBalance: 99999
  }
});
```

Then run:
```bash
npm run db:seed
```

---

## Troubleshooting

### "User not found" error

**Solution 1** - Re-create admin:
```bash
npm run admin:create
```

**Solution 2** - Run seed script:
```bash
npm run db:seed
```

**Solution 3** - Check database:
```bash
npm run admin:check
```

### "Invalid credentials" error

**Cause**: Password mismatch

**Solution**: Re-run creation script to reset password:
```bash
npm run admin:create
```

### Production admin not working

**Solution**: Run production setup:
```bash
# Make sure DATABASE_URL is set to production database
npm run admin:create:prod
```

### Admin has wrong role

**Solution**: Update admin role directly:
```bash
node -e "const db=require('better-sqlite3')('backend/prisma/dev.db'); db.prepare('UPDATE users SET role=?, plan=? WHERE email=?').run('ADMIN', 'ENTERPRISE', 'admin@admin.com'); console.log('✅ Admin role updated'); db.close();"
```

---

## Security Notes

1. **Password Security**
   - All passwords are hashed with bcrypt (10-12 rounds)
   - Never stored in plain text
   - Change default password in production!

2. **Role-Based Access**
   - Only `ADMIN` role can access admin routes
   - Enforced in backend middleware
   - Frontend also checks role

3. **Database Access**
   - Admin users have full database privileges
   - Can modify any user data
   - Monitor admin activity logs

---

## Quick Reference

```bash
# CREATE ADMIN (LOCAL)
npm run admin:create

# CREATE ADMIN (PRODUCTION)
npm run admin:create:prod

# VERIFY ADMIN
npm run admin:verify

# CHECK DATABASE
npm run admin:check

# SEED DATABASE (INCLUDES ADMIN)
npm run db:seed

# DEPLOY WITH ADMIN (RAILWAY)
railway run npm run railway:admin
```

---

## Files Reference

| File | Purpose | Usage |
|------|---------|-------|
| [backend/prisma/seed.ts](backend/prisma/seed.ts) | Main database seed | `npm run db:seed` |
| [create-admin-sqlite.cjs](create-admin-sqlite.cjs) | Local admin setup | `npm run admin:create` |
| [setup-production-admin.cjs](setup-production-admin.cjs) | Production admin | `npm run admin:create:prod` |
| [verify-admin.cjs](verify-admin.cjs) | Verify admin exists | `npm run admin:verify` |
| [check-db.cjs](check-db.cjs) | Database inspection | `npm run admin:check` |
| [package.json](package.json) | NPM scripts | - |

---

## Summary

✅ **Local admin**: Automatically created via seed script
✅ **Production admin**: Created via production setup script
✅ **NPM scripts**: Easy access to all admin functions
✅ **Railway integration**: Admin created on deployment
✅ **Password**: Securely hashed with bcrypt
✅ **Permanent**: Admin persists across deployments

**All admin credentials use the same password**: `Admin123!`

**Remember to change the default password in production!**

---

**Status**: ✅ PERMANENT SETUP COMPLETE
**Last Updated**: 2025-01-24
