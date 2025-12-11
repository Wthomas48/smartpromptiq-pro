# ✅ Credit Card Signup Flow - Testing Guide

## 🎯 What's Been Fixed

I've **removed the DEV mode bypass** so that when you click "Upgrade" on the billing page, you'll be redirected to the **actual Stripe Checkout page** where you can enter credit card information.

### Changes Made:

1. ✅ **Removed DEV mode bypass** in [backend/src/routes/billing.js](backend/src/routes/billing.js:402-421)
   - Previously: Instant upgrade without Stripe
   - Now: Creates Stripe Checkout Session and redirects to credit card form

2. ✅ **Verified Stripe credentials** are configured:
   - `STRIPE_SECRET_KEY`: sk_test_51RZ3AdKtG2uGDhSN...
   - `STRIPE_PUBLISHABLE_KEY`: pk_test_51RZ3AdKtG2uGDhSN...
   - `STRIPE_WEBHOOK_SECRET`: whsec_28f43ae45b05b1a26...

3. ✅ **Verified Stripe Price IDs** exist in [shared/pricing/pricingConfig.js](shared/pricing/pricingConfig.js):
   - Starter Monthly: `price_1QKrTdJNxVjDuJxhRtAMo2K7` ($14.99/month)
   - Starter Yearly: `price_1QKrTdJNxVjDuJxhRtAMo2K8` ($149.90/year)
   - Pro Monthly: `price_1QKrTdJNxVjDuJxhRtAMo2K9` ($49.99/month)
   - Pro Yearly: `price_1QKrTdJNxVjDuJxhRtAMo2L0` ($499.00/year)
   - Business Monthly: `price_1QKrTdJNxVjDuJxhRtAMo2L1` ($149.99/month)
   - Business Yearly: `price_1QKrTdJNxVjDuJxhRtAMo2L2` ($1499.00/year)

4. ✅ **Dev server restarted** with new code:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

---

## 🧪 Complete Testing Flow

### Step 1: Sign Up for New Account

1. Open: **http://localhost:5173/signin**
2. Click "Sign Up" tab (or go to `/signin?mode=signup`)
3. Enter:
   - **Email**: testuser@example.com (use a unique email each time)
   - **Password**: test123456
   - **First Name**: Test
   - **Last Name**: User
4. Click **"Sign Up"**
5. ✅ **Expected Result**: You'll be logged in automatically and redirected to `/dashboard`

---

### Step 2: Navigate to Billing Page

1. From dashboard, click **"Upgrade"** button in the navbar
2. OR manually go to: **http://localhost:5173/billing**
3. ✅ **Expected Result**: You see the billing page with:
   - Current tier: **FREE**
   - Usage: **0/5 prompts used**
   - Four pricing tiers displayed: Free, Starter, Pro, Business

---

### Step 3: Select Plan and Click Upgrade

1. Choose a plan (recommend **Starter** for testing - $14.99/month)
2. Toggle billing cycle if desired: **Monthly** ↔ **Yearly**
3. Click the **"Upgrade to Starter"** button (or whichever plan you selected)
4. ✅ **Expected Result**:
   - Backend creates Stripe Checkout Session
   - Page **redirects to Stripe's checkout page** (URL: `https://checkout.stripe.com/c/pay/cs_test_...`)
   - You see Stripe's hosted payment form

---

### Step 4: Enter Credit Card Information on Stripe Checkout

**You are now on Stripe's secure checkout page!**

The page shows:
- **Plan**: "Starter Plan - Monthly" (or your selected plan)
- **Price**: $14.99/month
- **Credit card form**

Enter **Stripe Test Card**:

```
Card Number:    4242 4242 4242 4242
Expiry Date:    12/25 (any future date)
CVC:            123 (any 3 digits)
Name on Card:   Test User
Billing ZIP:    12345 (any ZIP)
```

**Other Test Cards:**
```
✅ Success:                  4242 4242 4242 4242
❌ Card Declined:            4000 0000 0000 0002
⚠️ Requires Authentication:  4000 0025 0000 3155
💳 Insufficient Funds:       4000 0000 0000 9995
```

---

### Step 5: Complete Payment

1. After entering card info, click **"Subscribe"** button on Stripe's page
2. Stripe processes the payment (in test mode, instant success)
3. ✅ **Expected Result**:
   - Payment succeeds
   - Stripe sends webhook to backend: `POST /api/billing/webhook`
   - Backend updates database: User tier changed to STARTER
   - You're redirected back to: `http://localhost:5173/billing?success=true&session_id=cs_test_...`

---

### Step 6: Verify Upgrade Success

**After redirect back to billing page:**

1. ✅ **Success toast** appears: "Success! Your subscription has been upgraded."
2. ✅ **Current Tier** now shows: **STARTER**
3. ✅ **Usage limits** updated: **0/200 prompts used** (up from 0/5)
4. ✅ **Billing cycle** shows: **monthly** (or yearly if you selected that)
5. ✅ **Subscription status**: **active**

---

## 🔍 Backend Logs to Watch

While testing, watch the backend logs for these messages:

### When you click "Upgrade":
```
🌐 CORS REQUEST from origin: http://localhost:5173
✅ CORS: Origin in allowed list - allowed
🔐 Auth check for POST /upgrade:
   Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR...
```

### Creating Stripe Checkout Session:
```
Creating Stripe Checkout Session for user: cmh2kyqtf0000vay3go8s5h72
Stripe Session created: cs_test_a1b2c3d4e5f6g7h8i9j0...
POST /api/billing/upgrade 200 1234 ms
```

### After payment on Stripe (webhook):
```
Webhook received: checkout.session.completed
User upgraded: testuser@example.com → STARTER
Subscription status: active
```

---

## ❌ What If Something Goes Wrong?

### Problem 1: "Redirect loop" or instant upgrade without Stripe

**Cause**: DEV mode bypass still active or server not restarted

**Solution**:
1. Check backend logs for: `🧪 DEV MODE: Simulating upgrade to...`
2. If you see that, the DEV mode bypass is still active
3. Restart the server: Kill all node processes and run `npm run dev` again

---

### Problem 2: "500 Internal Server Error" when clicking upgrade

**Cause**: Stripe Price ID doesn't exist in your Stripe account

**Solution**:
1. Check backend error logs for detailed error message
2. Likely error: `No such price: 'price_1QKrTdJNxVjDuJxhRtAMo2K7'`
3. Fix: Create the Price IDs in Stripe Dashboard OR update [shared/pricing/pricingConfig.js](shared/pricing/pricingConfig.js) with your actual Price IDs

**To create Price IDs in Stripe:**
1. Go to: https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Name: "Starter Plan - Monthly"
4. Price: $14.99
5. Billing period: Monthly
6. Click "Save"
7. Copy the Price ID (starts with `price_...`)
8. Update `pricingConfig.js` with the new ID

---

### Problem 3: Redirects to Stripe but shows error

**Possible Causes**:
- **Invalid Price ID**: Price doesn't exist in Stripe account
- **Test/Live mode mismatch**: Using test keys but trying to access live Price IDs (or vice versa)
- **Missing customer**: Customer creation failed

**Solution**:
- Check Stripe Dashboard → Logs to see the actual error
- Verify Price IDs match test/live mode of your keys

---

### Problem 4: Payment succeeds but user not upgraded

**Cause**: Webhook not configured or failing

**Solution**:
1. Check backend logs for webhook receipt:
   ```
   POST /api/billing/webhook
   ```
2. If no webhook received, Stripe couldn't reach your local server
3. For local testing, you need to either:
   - **Option A**: Use Stripe CLI to forward webhooks:
     ```bash
     stripe listen --forward-to localhost:5000/api/billing/webhook
     ```
   - **Option B**: Manually simulate upgrade in database (DEV mode)

---

## 🎉 Success Criteria

You'll know the flow works correctly when:

1. ✅ Clicking "Upgrade" redirects to `https://checkout.stripe.com/...`
2. ✅ Credit card form appears on Stripe's page
3. ✅ Test card `4242 4242 4242 4242` processes successfully
4. ✅ Redirect back to `/billing?success=true`
5. ✅ Success toast appears
6. ✅ Current tier changes from FREE → STARTER (or your selected tier)
7. ✅ Usage limits update (e.g., 5 prompts → 200 prompts)
8. ✅ Backend logs show successful webhook processing

---

## 📝 Notes

### About Stripe Test Mode

- ✅ **Test mode keys** (starting with `sk_test_` and `pk_test_`) are currently configured
- ✅ **Test cards** will work (4242 4242 4242 4242)
- ✅ **No real charges** will be made
- ✅ **Price IDs** must be created in test mode

### About Webhooks in Local Development

**Webhooks may not work locally** because Stripe needs a public URL to send events to. For local testing:

1. **Option 1**: Use Stripe CLI:
   ```bash
   stripe login
   stripe listen --forward-to localhost:5000/api/billing/webhook
   ```

2. **Option 2**: Test on Railway deployment (production)

3. **Option 3**: Use a tunneling service like ngrok:
   ```bash
   ngrok http 5000
   # Use the https URL in Stripe webhook settings
   ```

### About Production Deployment

For the production site (https://smartpromptiq.com) to work:

1. ✅ Railway environment variables must be set
2. ✅ Stripe webhook endpoint configured: `https://smartpromptiq.com/api/billing/webhook`
3. ✅ Webhook secret obtained from Stripe Dashboard
4. ✅ All changes committed and pushed to GitHub
5. ✅ Railway automatically rebuilds and deploys

---

## 🚀 Next Steps

After verifying the local flow works:

1. **Commit changes**:
   ```bash
   git add backend/src/routes/billing.js
   git commit -m "Remove DEV mode bypass - enable Stripe checkout flow"
   git push
   ```

2. **Deploy to Railway**:
   - Railway auto-deploys on push
   - Wait ~2-3 minutes for build
   - Test on production: https://smartpromptiq.com

3. **Configure Stripe webhook** for production:
   - Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://smartpromptiq.com/api/billing/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret to Railway environment variables

4. **Test production flow**:
   - Sign up on https://smartpromptiq.com
   - Click upgrade
   - Should redirect to Stripe checkout
   - Enter test card
   - Complete payment
   - Verify upgrade works

---

## 📞 Support

If you encounter issues:

1. **Check backend logs** for error details
2. **Check browser console** for frontend errors
3. **Check Stripe Dashboard → Logs** for API errors
4. **Check Railway logs** for production errors

**Common issues documented above** in the "What If Something Goes Wrong?" section.

---

**The credit card signup flow is now ready to test! 🎉**

Open http://localhost:5173/signin and start testing!
