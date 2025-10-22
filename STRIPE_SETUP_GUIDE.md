# 🎯 Stripe Integration Setup Guide

## ✅ What's Already Done

Your SmartPromptIQ app now has **complete Stripe integration** built in! Here's what's ready:

### Backend Features:
- ✅ Stripe SDK initialized
- ✅ Checkout session creation for subscriptions
- ✅ Webhook handler for payment confirmation
- ✅ Automatic database updates after successful payment
- ✅ Support for all subscription tiers (Starter, Pro, Enterprise)
- ✅ Monthly and yearly billing cycles
- ✅ Demo mode when Stripe not configured

---

## 🚀 How to Enable Real Stripe Payments

### Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### Step 2: Create Your Products and Prices in Stripe

1. In Stripe Dashboard, go to **Products**
2. Click **+ Add Product**
3. Create each subscription tier:

#### Starter Plan:
- **Name**: Starter
- **Description**: 200 AI prompts per month
- **Pricing**:
  - Monthly: $14.99/month (recurring)
  - Yearly: $149.90/year (recurring)
- Copy the **Price ID** for each (e.g., `price_1234abcd`)

#### Pro Plan:
- **Name**: Pro
- **Description**: 1,000 AI prompts per month
- **Pricing**:
  - Monthly: $39.99/month (recurring)
  - Yearly: $399.90/year (recurring)

#### Enterprise Plan:
- **Name**: Enterprise
- **Description**: Unlimited AI prompts
- **Pricing**:
  - Monthly: $99.99/month (recurring)
  - Yearly: $999.90/year (recurring)

### Step 3: Update Your .env File

Open `C:\SmartPromptiq-pro\.env` and replace these values:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_STARTER_MONTHLY=price_YOUR_STARTER_MONTHLY_ID
STRIPE_PRICE_STARTER_YEARLY=price_YOUR_STARTER_YEARLY_ID
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRO_MONTHLY_ID
STRIPE_PRICE_PRO_YEARLY=price_YOUR_PRO_YEARLY_ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_YOUR_ENTERPRISE_MONTHLY_ID
STRIPE_PRICE_ENTERPRISE_YEARLY=price_YOUR_ENTERPRISE_YEARLY_ID
```

### Step 4: Set Up Stripe Webhooks (Important!)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
   - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

### Step 5: Test with Stripe CLI (Local Development)

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# This will give you a webhook secret - add it to .env
```

### Step 6: Restart Your Server

```bash
cd C:\SmartPromptiq-pro
PORT=5000 node server.cjs
```

You should see:
```
✅ Stripe initialized
✅ Connected to SQLite database
```

---

## 🧪 Testing the Integration

### Test Mode (Stripe Test Keys):

1. Go to your billing page: `http://localhost:5173/billing`
2. Click **Upgrade** on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete the payment
5. You'll be redirected back with success
6. Check admin dashboard - subscription should be updated!

### Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`

---

## 📊 What Happens After Payment

1. **User clicks "Upgrade"**
   - Creates Stripe Checkout Session
   - Redirects to Stripe payment page

2. **User completes payment**
   - Stripe sends webhook to `/api/webhooks/stripe`
   - Server updates user in database:
     - `subscriptionTier` → "starter", "pro", or "enterprise"
     - `subscriptionStatus` → "active"
     - `stripeCustomerId` → customer ID
     - `stripeSubscriptionId` → subscription ID

3. **User is redirected back**
   - Success page shows confirmation
   - Admin dashboard shows updated subscription
   - User sees new limits immediately

---

## 🔒 Production Deployment

When going live:

1. **Switch to Live Keys**:
   - In Stripe Dashboard, toggle to "Live mode"
   - Get live API keys (`sk_live_...` and `pk_live_...`)
   - Update `.env` with live keys

2. **Update Webhook Endpoint**:
   - Add production webhook: `https://smartpromptiq.com/api/webhooks/stripe`
   - Use live webhook secret

3. **Environment Variables**:
   - Make sure all Stripe keys are in production environment
   - Set `NODE_ENV=production`

---

## 🎉 You're All Set!

Your Stripe integration is **production-ready**! Here's what you have:

✅ Subscription checkout with Stripe
✅ Automatic database updates after payment
✅ Webhook handling for subscription changes
✅ Support for monthly and yearly billing
✅ Test mode for development
✅ Live mode ready for production

**Next Steps**:
1. Add your Stripe keys to `.env`
2. Create products in Stripe Dashboard
3. Test with Stripe test cards
4. Deploy and start accepting payments! 💰

---

## 📞 Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
