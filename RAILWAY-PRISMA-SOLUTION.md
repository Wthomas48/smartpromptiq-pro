# 🔧 Railway Prisma Issue - Solution

## Problem
The Academy routes can't find Prisma Client because:
1. Prisma Client is generated in `backend/node_modules`
2. `railway-server-minimal.cjs` runs from root and looks in root `node_modules`
3. Copying doesn't work reliably in Railway's build environment

## Solution Options

### Option 1: Set Environment Variable in Railway (EASIEST)
In Railway Dashboard, add this environment variable:
```
PRISMA_SCHEMA_PATH=/app/backend/prisma/schema.prisma
```

Then update `railway.json`:
```json
{
  "build": {
    "buildCommand": "npm run railway:build && npm install @prisma/client && npx prisma generate --schema=./backend/prisma/schema.prisma"
  }
}
```

###Option 2: Use Symlink (RECOMMENDED)
Update railway.json:
```json
{
  "build": {
    "buildCommand": "npm run railway:build && cd backend && npm install && npx prisma generate && cd .. && ln -sf backend/node_modules/.prisma node_modules/.prisma && ln -sf backend/node_modules/@prisma node_modules/@prisma"
  }
}
```

### Option 3: Generate at Root Level
Move or symlink the Prisma schema to root, then generate there.

## Current Status
- ✅ Server starts (health checks pass)
- ✅ Academy routes are loaded
- ✅ API returns JSON (not HTML)
- ❌ Prisma Client not initialized

## Next Step
**YOU NEED TO:**
1. Go to Railway Dashboard
2. Find "SmartPromptiq-pro" service
3. Go to "Variables" tab
4. Add: `PRISMA_SCHEMA_PATH=/app/backend/prisma/schema.prisma`
5. OR try the symlink approach in railway.json

Then redeploy!
