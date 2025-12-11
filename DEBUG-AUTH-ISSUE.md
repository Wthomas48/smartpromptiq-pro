# Debug Authentication Issue - Step by Step

## Quick Debug Steps

### Step 1: Check if you're signed in

Open browser console (F12) and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

**Expected Result:**
- Token should be a long JWT string starting with "eyJ..."
- User should be a JSON string with your user data

**If null or undefined:** You're NOT signed in! Go to step 2.

### Step 2: Sign In

1. Navigate to: `http://localhost:5173/signin`
2. Enter your credentials
3. If you don't have an account, click "Sign Up" and create one
4. After signing in, check Step 1 again - token should now exist

### Step 3: Restart Backend Server

**IMPORTANT**: The backend needs to be restarted to pick up the middleware changes!

```bash
# Stop backend (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### Step 4: Test Enrollment Again

1. Go to: `http://localhost:5173/academy/courses`
2. Click any course (e.g., "Prompt Writing 101")
3. Click "Enroll Now"
4. Should work now! ✅

---

## Still Not Working? Advanced Debug

### Check 1: Verify Auth Token in Request

Open DevTools → Network tab → Try enrolling → Look for the `enroll` request

**Check Headers:**
```
Authorization: Bearer eyJhbGc...
```

If `Authorization` header is missing → Token not being sent!

### Check 2: Verify Backend Middleware

Check backend console logs when you try to enroll:

**Should see:**
```
POST /api/academy/enroll
```

**Should NOT see:**
```
❌ No token provided
❌ Invalid token
```

### Check 3: Test Auth Endpoint

Open browser console and run:
```javascript
fetch('http://localhost:5000/api/academy/enroll', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    courseId: 'test',
    enrollmentType: 'free'
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Course not found"
}
```
(This means auth worked! Just need valid courseId)

**If you get 401:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```
Token is invalid or expired.

---

## Common Fixes

### Fix 1: Sign Out and Sign Back In
```javascript
// In browser console:
localStorage.clear();
// Then sign in again at /signin
```

### Fix 2: Check Backend is Running
```bash
# Should see:
📡 Server running on http://localhost:5000
✅ Database connected
```

### Fix 3: Check Frontend is Sending Token

File: `client/src/config/api.ts` (around line 130-136)

Should have:
```typescript
const token = localStorage.getItem('token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

---

## If Still Failing - Manual Test

### Test 1: Create Admin User (Has Full Access)
```bash
cd backend
npm run create-admin
```

Sign in with admin credentials and try enrolling.

### Test 2: Check Database
```bash
cd backend
npx prisma studio
```

Go to `User` table → Find your user → Check if user exists

### Test 3: Backend Logs
When you click "Enroll Now", backend should log:
```
POST /api/academy/enroll
Checking authentication...
User authenticated: {userId}
```

If you see "No token provided" → Frontend not sending token
If you see "Invalid token" → Token expired or corrupted

---

## Most Likely Causes

1. **Not signed in** (90% of cases)
   - Solution: Sign in at `/signin`

2. **Backend not restarted** (80% of cases after code changes)
   - Solution: Restart backend server

3. **Token expired** (10% of cases)
   - Solution: Sign out and sign back in

4. **CORS issue** (5% of cases)
   - Check backend logs for CORS errors
   - Solution: Already configured, shouldn't be an issue

---

## Quick Fix Script

Run this in browser console to diagnose:

```javascript
// Diagnosis Script
console.log('=== AUTH DIAGNOSIS ===');
console.log('1. Signed in?', !!localStorage.getItem('token'));
console.log('2. Token value:', localStorage.getItem('token')?.substring(0, 50) + '...');
console.log('3. User data:', localStorage.getItem('user'));

// Test API with token
fetch('http://localhost:5000/api/academy/enroll', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({ courseId: 'test', enrollmentType: 'free' })
})
.then(r => {
  console.log('4. Response status:', r.status);
  return r.json();
})
.then(d => console.log('5. Response data:', d))
.catch(e => console.log('6. Error:', e));
```

**Expected output if auth is working:**
```
=== AUTH DIAGNOSIS ===
1. Signed in? true
2. Token value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. User data: {"id":"...","email":"..."}
4. Response status: 404 or 400 (means auth worked!)
5. Response data: {success: false, message: "Course not found"}
```

**If auth is NOT working:**
```
1. Signed in? false
4. Response status: 401
5. Response data: {success: false, message: "Authentication required"}
```

---

## TL;DR - Most Likely Solution

**You're probably not signed in!**

1. Go to `http://localhost:5173/signin`
2. Sign in or create account
3. **RESTART BACKEND** (Ctrl+C, then `npm run dev`)
4. Try enrolling again

**That should fix it!** ✅
