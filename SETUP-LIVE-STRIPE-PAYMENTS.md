# 🚀 Setup Live Stripe Payments - Real Credit Card Processing

This guide will help you switch from test mode to **LIVE MODE** so real customers can pay with real credit cards.

---

## ⚠️ IMPORTANT - Before You Start

**Live mode means:**
- ✅ Real credit cards will be charged
- ✅ Real money will be transferred to your Stripe account
- ✅ Real customers can sign up and pay
- ❌ Test cards (4242 4242...) will NOT work
- ❌ You CANNOT undo charges easily

**Make sure you're ready for production!**

---

## Step 1: Get Your Live Stripe API Keys

### 1.1 Go to Stripe Dashboard

1. Open: **https://dashboard.stripe.com**
2. Make sure you're in **LIVE MODE** (toggle in top-right should show "Live")
3. If you see "Test mode" toggle, click it to switch to "Live mode"

### 1.2 Get Secret Key

1. Click **Developers** in the left sidebar
2. Click **API keys**
3. Make sure you're viewing **"Standard keys"** tab
4. Look for **"Secret key"**
5. Click **"Reveal test key token"** → It will show `sk_live_...`
6. **Copy the entire key** (starts with `sk_live_`)

### 1.3 Get Publishable Key

1. On the same page (Developers → API keys)
2. Look for **"Publishable key"**
3. It should already be visible (starts with `pk_live_`)
4. **Copy the entire key**

### 1.4 What You Should Have

After this step, you should have:
```
Secret Key:      sk_live_51RZ3AdKtG2uGDhSN... (starts with sk_live_)
Publishable Key: pk_live_51RZ3AdKtG2uGDhSN... (starts with pk_live_)
```

---

## Step 2: Get Live Price IDs from Your Products

You already created these products in LIVE mode:
- Starter Monthly: $14.99/month → Product ID: `prod_THo2fEsnH2fQFA`
- Starter Yearly: $149.90/year → Product ID: `prod_THo3E6SH0NDNzU`
- Professional Monthly: $49.99/month → Product ID: `prod_THo5r6sik7tni0`
- Professional Yearly: $499.00/year → Product ID: `prod_THo7QwjamsWxbz`
- Enterprise Monthly: $149.99/month → Product ID: `prod_THo9fczZrnjDY1`
- Enterprise Yearly: $1,499.00/year → Product ID: `prod_THoB8LpZC8n4IR`

### 2.1 Get Price IDs

For **EACH product**, you need to get the **Price ID** (not Product ID):

1. Go to: **https://dashboard.stripe.com/products** (make sure you're in LIVE mode)
2. Click on **"Starter Monthly"** ($14.99/month)
3. Scroll down to **"Pricing"** section
4. You'll see a table with pricing details
5. Look for **"API ID"** column → Copy the ID that starts with `price_`
   - Example: `price_1ABC2DEF3GHI4JKL5MNO6PQR`
6. **Repeat for all 6 products**

### 2.2 What You Should Have

After this step, you should have **6 Price IDs**:

```
Starter Monthly Price ID:       price_________________
Starter Yearly Price ID:        price_________________
Professional Monthly Price ID:  price_________________
Professional Yearly Price ID:   price_________________
Enterprise Monthly Price ID:    price_________________
Enterprise Yearly Price ID:     price_________________
```

---

## Step 3: Provide the Information to Me

Once you have the above information, please share it with me in this format:

```
LIVE SECRET KEY: sk_live_51RZ3AdKtG2uGDhSN...

LIVE PUBLISHABLE KEY: pk_live_51RZ3AdKtG2uGDhSN...

PRICE IDS:
Starter Monthly: price_1ABC...
Starter Yearly: price_2DEF...
Professional Monthly: price_3GHI...
Professional Yearly: price_4JKL...
Enterprise Monthly: price_5MNO...
Enterprise Yearly: price_6PQR...
```

---

## Step 4: I Will Configure Everything

Once you provide the above information, I will:

1. ✅ Update `.env` file with live keys
2. ✅ Update `pricingConfig.js` with live Price IDs
3. ✅ Configure production environment variables for Railway
4. ✅ Test locally with live mode (but won't charge real cards)
5. ✅ Deploy to production: https://smartpromptiq.com
6. ✅ Set up Stripe webhook for production

---

## Step 5: Configure Webhook (After Deployment)

After deployment, you need to set up a webhook so Stripe can notify our server when payments succeed:

### 5.1 Create Webhook Endpoint

1. Go to: **https://dashboard.stripe.com/webhooks** (LIVE mode)
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://smartpromptiq.com/api/billing/webhook`
4. Click **"Select events"**
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **"Add endpoint"**

### 5.2 Get Webhook Secret

1. After creating the endpoint, click on it
2. Look for **"Signing secret"**
3. Click **"Reveal"** → Copy the secret (starts with `whsec_`)
4. Share it with me: `whsec_...`

---

## Step 6: Testing Live Payments

After everything is configured, you can test with **REAL credit cards**:

### Test with Real Card (Small Amount)

1. Go to: https://smartpromptiq.com/signin
2. Sign up with your real email
3. Go to billing page
4. Click **"Upgrade to Starter"** ($14.99/month)
5. Enter your **real credit card**
6. Complete payment
7. Verify:
   - ✅ You're charged $14.99
   - ✅ Stripe Dashboard shows payment
   - ✅ Your account upgraded to Starter tier
   - ✅ You receive confirmation email

### Cancel Test Subscription

If you just want to test, cancel immediately:

1. Stripe Dashboard → Customers
2. Find your test customer
3. Click on subscription
4. Click **"Cancel subscription"**
5. You'll be refunded (or not charged again)

---

## Security Best Practices

### DO:
- ✅ Keep live API keys secret (never commit to git)
- ✅ Use environment variables for keys
- ✅ Test thoroughly before going live
- ✅ Set up webhook signature verification
- ✅ Monitor Stripe Dashboard for issues
- ✅ Enable Stripe Radar for fraud protection

### DON'T:
- ❌ Share live API keys publicly
- ❌ Commit keys to GitHub
- ❌ Use live keys in local development (use test keys)
- ❌ Skip webhook signature verification
- ❌ Ignore failed payment notifications

---

## Environment Configuration

After you provide the keys and Price IDs, here's what I'll update:

### Production `.env` (Railway):
```env
NODE_ENV=production
ENABLE_STRIPE=true

# Live Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=https://smartpromptiq.com

# Database
DATABASE_URL=postgresql://postgres:z4PU4HU0qL8o33fv@db.ycpvdoktcoejmywqfwwy.supabase.co:5432/postgres

# JWT Secret
JWT_SECRET=980f49ec1495bfce9838d3388cfea45174340e3d0ecc76c073496389d2448872
```

### Local `.env` (stays with test keys):
```env
NODE_ENV=development
ENABLE_STRIPE=false  # Keep false for local testing

# Test Stripe Keys (for local development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## What Happens After Setup?

1. **Local Development**:
   - Uses TEST mode keys
   - ENABLE_STRIPE=false (instant upgrades, no Stripe API)
   - Test credit cards work (4242 4242...)

2. **Production (smartpromptiq.com)**:
   - Uses LIVE mode keys
   - ENABLE_STRIPE=true (real Stripe checkout)
   - Only real credit cards work
   - Real money is charged
   - Customers can sign up and pay

---

## Ready to Proceed?

Please provide:

1. ✅ **Live Secret Key** (sk_live_...)
2. ✅ **Live Publishable Key** (pk_live_...)
3. ✅ **6 Live Price IDs** (price_... for each product)

Once I have these, I'll configure everything and deploy to production!

---

## Questions?

- **Q: Will test mode still work locally?**
  - A: Yes! Local dev uses test keys, production uses live keys.

- **Q: Can I test without charging real money?**
  - A: Yes, use test mode keys locally. Or charge yourself $14.99 and cancel immediately.

- **Q: What if something goes wrong?**
  - A: You can refund charges in Stripe Dashboard, and we can quickly switch back to test mode.

- **Q: How do I know if payments are working?**
  - A: Check Stripe Dashboard → Payments to see all transactions in real-time.

---

Ready when you are! Please share the live keys and Price IDs above. 🚀
