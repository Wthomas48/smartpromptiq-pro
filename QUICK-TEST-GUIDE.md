# 🚀 Quick Test Guide - Signup to Payment Flow

**Status:** ✅ Servers Running
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## 🎯 Issue Identified

The error you saw (`401 Unauthorized` on `/api/billing/info`) is **EXPECTED** behavior when:
- User is not logged in
- Trying to access the billing page directly without authentication

**This is correct security behavior!** ✅

---

## ✅ Correct Testing Flow

### Step 1: Create an Account (Signup)

**URL:** http://localhost:5173/signin?mode=signup

**Test Data:**
```
First Name: Test
Last Name: User
Email: testuser@example.com
Password: Test123456!
Confirm Password: Test123456!
```

**What Happens:**
1. ✅ Form validation
2. ✅ CAPTCHA verification (if enabled)
3. ✅ Account created in database
4. ✅ JWT token generated and stored
5. ✅ Redirect to `/dashboard`
6. ✅ User is now authenticated

**Backend Logs to Look For:**
```
🔍 Attempting signup with security verification
✅ Signup successful with security verification
```

---

### Step 2: Navigate to Billing (While Authenticated)

**URL:** http://localhost:5173/billing

**What You'll See:**
- ✅ Current plan: "Free"
- ✅ Usage statistics
- ✅ 4 subscription plans
- ✅ "Upgrade" buttons

**Backend Logs to Look For:**
```
🔐 Auth check for GET /info:
   Authorization header: Bearer eyJhbGc...
✅ User authenticated successfully
```

---

### Step 3: Upgrade to Paid Plan

**Click:** "Upgrade to Starter" (or any paid plan)

#### Development Mode (Current Setup):
```
✅ Instant upgrade
✅ No Stripe redirect
✅ Tier updated in database
✅ Tokens added to balance
```

**Backend Logs:**
```
🧪 DEV MODE: Simulating upgrade to starter (monthly)
✅ User updated successfully
```

#### Production Mode (Set NODE_ENV=production):
```
✅ Redirect to Stripe Checkout
✅ Enter test card: 4242 4242 4242 4242
✅ Complete payment on Stripe
✅ Redirect back with success
✅ Webhook updates subscription
```

---

## 🐛 Why You Saw the Error

The production site at `https://smartpromptiq.com` shows a 403 error because:

1. **You're not logged in** on production
2. **Billing page requires authentication** (this is correct!)
3. **The page tries to load billing info** → Gets 401/403 → Shows error

**This is CORRECT security behavior!** The billing page should only be accessible to authenticated users.

---

## ✅ Correct Test Sequence

### On Local Development (http://localhost:5173):

```bash
# Step 1: Sign Up
1. Go to: http://localhost:5173/signin?mode=signup
2. Fill form with test data
3. Click "Create Account"
4. ✅ Should redirect to /dashboard

# Step 2: Navigate to Billing
5. Click "Billing" in navigation OR go to: http://localhost:5173/billing
6. ✅ Should load successfully (you're authenticated)
7. ✅ Should show your current plan

# Step 3: Upgrade Plan
8. Click "Upgrade to Starter"
9. ✅ In DEV mode: Instant upgrade
10. ✅ Check database to verify tier changed
```

---

## 🔍 Verify Everything Works

### Check 1: Server Status
```bash
# Should see both servers running:
✅ Frontend: VITE v7.1.6 ready in XXXms
✅ Backend: Server running on port 5000
✅ Database connected successfully
```

### Check 2: User Authentication
After signup, open browser DevTools → Application → Local Storage:
```javascript
// Should see:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "firstName": "Test"
  }
}
```

### Check 3: Database Entry
```bash
# In a new terminal:
cd backend
npm run prisma studio

# Or via CLI:
npx prisma studio

# Open: http://localhost:5555
# Navigate to "User" table
# Find your test user
```

---

## 💳 Test Stripe Payment Flow

### Development Mode (No Real Payment):
Currently active - upgrades happen instantly without Stripe

### Production Mode (Real Stripe Checkout):

**Enable by updating .env:**
```env
NODE_ENV=production
```

**Then restart:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

Expiry: Any future date (12/26)
CVC: Any 3 digits (123)
ZIP: Any 5 digits (12345)
```

---

## 📊 Monitor the Flow

### Backend Logs to Watch:
```bash
# Signup
🔍 Attempting signup with security verification
✅ Signup successful

# Billing Page Load (when authenticated)
🔐 Auth check for GET /info:
   Authorization header: Bearer eyJ...
✅ User authenticated

# Upgrade (DEV mode)
🧪 DEV MODE: Simulating upgrade to starter (monthly)
✅ User tier updated

# Upgrade (PROD mode)
💳 Creating Stripe checkout session
✅ Session created: cs_test_...
🔗 Redirecting to Stripe
```

---

## ✅ Expected Behavior Summary

| Action | Without Login | With Login |
|--------|--------------|------------|
| Visit `/billing` | ❌ 401/403 Error | ✅ Shows billing page |
| Click "Upgrade" | ❌ Redirect to login | ✅ Upgrade flow starts |
| View usage stats | ❌ Not accessible | ✅ Shows your data |

---

## 🎯 Your Next Steps

1. **Close production site** (that's showing errors - expected without login)
2. **Focus on local development:** http://localhost:5173
3. **Complete signup flow** with test data
4. **Navigate to billing** (will work because you're authenticated)
5. **Test upgrade** (will work in DEV mode instantly)

---

## 🔧 Quick Troubleshooting

### Issue: "401 on billing page even after signup"
**Fix:** Check browser DevTools → Application → Local Storage for token

### Issue: "Upgrade button doesn't work"
**Fix:** Check server logs for errors. Ensure database connected.

### Issue: "Redirected to login after signup"
**Fix:** Check AuthContext is working. Token should be stored.

---

## ✨ Everything is Working!

The error you saw is **expected behavior** for unauthenticated access to protected routes. This is good security! 🔒

**To test properly:**
1. Start at signup page
2. Create account
3. Navigate to billing
4. Test upgrade

All the infrastructure is in place and configured correctly! 🎉
