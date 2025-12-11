# 🧪 Test Upgrade Flow - Complete Instructions

## ✅ Status Update

**GOOD NEWS:**
- ✅ Billing page loads correctly
- ✅ Stripe Price IDs are configured
- ✅ Stripe keys are configured
- ❌ Production upgrade returns 500 error

## 🎯 The Issue

The 500 error on production upgrade suggests:
1. **Test/Live Mode Mismatch**: Price IDs are in test mode, but production uses live keys
2. **Stripe API Error**: Something wrong with the Stripe request
3. **Environment Variable Missing**: `FRONTEND_URL` or other variable not set

## 🔧 Solution: Test Locally First

Let's verify the upgrade works on local before troubleshooting production.

### Step 1: Test on Local (Should Work - DEV Mode)

**In your browser:**
1. Open: http://localhost:5173/billing
2. Login with: verys@gmail.com (or your test account)
3. Click: "Upgrade to Starter"
4. **Expected Result:**
   - ✅ Instant upgrade
   - ✅ Success message
   - ✅ Tier updated to "STARTER"
   - ✅ No errors

**Why it works:**
```javascript
// Local uses NODE_ENV=development
// Skips Stripe, updates database directly
if (process.env.NODE_ENV === 'development') {
  // Instant upgrade - no Stripe API call
  return { success: true, devMode: true }
}
```

### Step 2: Check Railway Environment

**Go to Railway Dashboard:**
https://railway.app/project/shimmering-achievement

**Settings → Variables → Check these:**
```
✅ STRIPE_SECRET_KEY=sk_test_... (should start with sk_test)
✅ STRIPE_PUBLISHABLE_KEY=pk_test_... (should start with pk_test)
✅ FRONTEND_URL=https://smartpromptiq.com
✅ NODE_ENV=production
```

**IMPORTANT:**
- If using `sk_test_` keys → Price IDs MUST be from test mode
- If using `sk_live_` keys → Price IDs MUST be from live mode
- **They must match!**

### Step 3: Verify Stripe Price IDs Exist

**Go to Stripe Dashboard:**
https://dashboard.stripe.com/test/products

**Check if these Price IDs exist:**
```
price_1QKrTdJNxVjDuJxhRtAMo2K7 (Starter Monthly)
price_1QKrTdJNxVjDuJxhRtAMo2K8 (Starter Yearly)
price_1QKrTdJNxVjDuJxhRtAMo2K9 (Pro Monthly)
price_1QKrTdJNxVjDuJxhRtAMo2L0 (Pro Yearly)
price_1QKrTdJNxVjDuJxhRtAMo2L1 (Business Monthly)
price_1QKrTdJNxVjDuJxhRtAMo2L2 (Business Yearly)
```

**How to check:**
1. Go to Products
2. Click each product
3. View Pricing
4. Copy the Price ID
5. Compare with above

### Step 4: Quick Fix - Enable DEV Mode on Production

If you want to test the upgrade flow WITHOUT Stripe:

**Railway Dashboard → Variables:**
```
Change: NODE_ENV=production
To: NODE_ENV=development
```

**Then redeploy:**
1. Railway → Deployments → Redeploy
2. Wait 3-5 minutes
3. Test upgrade
4. Should work instantly like local

**Remember:** This skips payments! Use only for testing.

## 🚀 Test the Upgrade Now

### On Local (http://localhost:5173):

**Test Plan ID Mapping:**
```
Frontend sends:  "starter"
Backend maps to: "starter"
Stripe Price:    price_1QKrTdJNxVjDuJxhRtAMo2K7

Frontend sends:  "pro"
Backend maps to: "pro"
Stripe Price:    price_1QKrTdJNxVjDuJxhRtAMo2K9

Frontend sends:  "enterprise"
Backend maps to: "business" ← NOTE THE MAPPING!
Stripe Price:    price_1QKrTdJNxVjDuJxhRtAMo2L1
```

### Current Behavior:

**Local (DEV mode):**
```
Click Upgrade → Instant success ✅
No Stripe API call
Database updated immediately
```

**Production (PROD mode):**
```
Click Upgrade → 500 error ❌
Tries to call Stripe API
Fails somewhere in the process
```

## 📊 Debugging Steps

### Option 1: Check Railway Logs

```bash
# In Railway Dashboard:
# Click service → Deployments → Click latest → View Logs
```

**Look for:**
```
❌ Upgrade error: [error message here]
Error details: { message: "...", type: "...", code: "..." }
```

### Option 2: Test with Curl

```bash
# Test the endpoint directly
curl -X POST https://smartpromptiq.com/api/billing/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"planId":"starter","billingCycle":"monthly"}'
```

**Expected Response (if working):**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

**Error Response (current):**
```json
{
  "success": false,
  "error": "..."
}
```

### Option 3: Enable More Logging

The latest code already has detailed logging. Check Railway logs for:
```
❌ Upgrade error: [Shows the actual Stripe error]
Error details: [Shows error type, code, etc.]
```

## ✅ Expected Working Flow

### Development Mode (Local):
```
1. User clicks "Upgrade to Starter"
2. POST /api/billing/upgrade { planId: "starter" }
3. Backend checks: NODE_ENV === 'development' ✓
4. Skip Stripe
5. Update database: user.subscriptionTier = 'STARTER'
6. Return: { success: true, devMode: true }
7. Frontend shows success message
```

### Production Mode (With Stripe):
```
1. User clicks "Upgrade to Starter"
2. POST /api/billing/upgrade { planId: "starter" }
3. Backend checks: NODE_ENV === 'production' ✓
4. Get/Create Stripe customer
5. Create Stripe Checkout Session
   - price: 'price_1QKrTdJNxVjDuJxhRtAMo2K7'
   - mode: 'subscription'
   - success_url: '/billing?success=true'
6. Return: { checkoutUrl: "https://checkout.stripe.com/..." }
7. Frontend redirects to Stripe
8. User enters credit card
9. Payment processed
10. Redirect back to /billing?success=true
11. Webhook updates database
```

## 🎯 Most Likely Issues

### Issue 1: Test/Live Mode Mismatch
```
Problem: Price IDs are test mode, but using live keys
Solution: Use test keys (sk_test) with test price IDs
```

### Issue 2: Price ID Doesn't Exist
```
Problem: Price ID not found in Stripe
Solution: Verify Price IDs in Stripe Dashboard match code
```

### Issue 3: Missing FRONTEND_URL
```
Problem: Stripe can't create session without success_url
Solution: Set FRONTEND_URL=https://smartpromptiq.com in Railway
```

### Issue 4: Invalid Stripe Key
```
Problem: Stripe key is wrong or expired
Solution: Get fresh key from Stripe Dashboard
```

## 🚀 Quick Action Plan

**RIGHT NOW:**

1. **Test Local First:**
   ```
   - Go to http://localhost:5173/billing
   - Login
   - Click "Upgrade to Starter"
   - Should work instantly ✅
   ```

2. **Check Railway Logs:**
   ```
   - Go to Railway Dashboard
   - View latest deployment logs
   - Find the actual error message
   ```

3. **Verify Stripe Dashboard:**
   ```
   - Check Price IDs exist
   - Verify using test mode
   - Confirm keys match
   ```

4. **Quick Fix (Testing):**
   ```
   - Set NODE_ENV=development on Railway
   - Redeploy
   - Test upgrade (will work instantly)
   ```

5. **Proper Fix (Production):**
   ```
   - Fix Stripe configuration issue
   - Set NODE_ENV=production
   - Test with real Stripe checkout
   ```

## 📝 Summary

**What's Working:**
- ✅ Billing page loads
- ✅ Authentication
- ✅ UI displays correctly
- ✅ Local upgrades work (DEV mode)

**What's Not Working:**
- ❌ Production upgrades (500 error)
- ❌ Stripe API call failing

**Next Steps:**
1. Test local upgrade (should work)
2. Check Railway logs for exact error
3. Verify Stripe Price IDs exist
4. Either fix Stripe config OR enable DEV mode for testing

**Let me know the error from Railway logs and we can fix it!**
