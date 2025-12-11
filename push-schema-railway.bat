@echo off
echo Pushing Prisma schema to Railway PostgreSQL...
cd backend
set DATABASE_URL=postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway
npx prisma db push --skip-generate
cd ..
echo Done!
pause
