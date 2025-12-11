# Stripe Setup Checklist - Academy Prices

## ✅ Current Status Check

I've reviewed your Stripe configuration and updated your `.env` file to include Academy price placeholders in the same format as your existing setup.

---

## 📊 Your Current Stripe Setup

### Already Configured in .env:
```bash
✅ STRIPE_SECRET_KEY=sk_test_51RZ3AdKtG2uGDhSN... (TEST MODE)
✅ STRIPE_PUBLISHABLE_KEY=pk_test_51RZ3AdKtG2uGDhSN...
✅ STRIPE_WEBHOOK_SECRET=whsec_28f43ae45b05b1a2...
✅ ENABLE_STRIPE=true
```

### Existing Price IDs (Need Real IDs):
```bash
⚠️ STRIPE_PRICE_STARTER_MONTHLY=price_starter_monthly_id (placeholder)
⚠️ STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_id (placeholder)
⚠️ STRIPE_PRICE_BUSINESS_MONTHLY=price_business_monthly_id (placeholder)
⚠️ STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly_id (placeholder)
```

### NEW Academy Prices Added to .env:
```bash
🆕 STRIPE_PRICE_ACADEMY_MONTHLY=price_academy_monthly_id (placeholder)
🆕 STRIPE_PRICE_ACADEMY_YEARLY=price_academy_yearly_id (placeholder)
🆕 STRIPE_PRICE_TEAM_PRO_MONTHLY=price_team_pro_monthly_id (placeholder)
🆕 STRIPE_PRICE_TEAM_PRO_YEARLY=price_team_pro_yearly_id (placeholder)
```

---

## 🎯 What You Need to Do in Stripe Dashboard

### Step 1: Log into Stripe Dashboard
Go to: https://dashboard.stripe.com/test/products

(You're currently in **TEST MODE** - good for development!)

---

### Step 2: Create Academy Products & Prices

#### Product 1: **Academy Only** 🎓

**Create Product:**
1. Click **"+ Add Product"**
2. **Name**: `Academy Only`
3. **Description**: `Full access to all 57 courses and 555 lessons in SmartPromptIQ Academy`
4. Click **"Add pricing"**

**Create Monthly Price:**
- **Price**: `$29.00 USD`
- **Billing period**: `Monthly`
- **Pricing model**: `Standard pricing`
- Click **"Save price"**
- **Copy the Price ID** (looks like: `price_1ABC...xyz`)
- Replace in .env: `STRIPE_PRICE_ACADEMY_MONTHLY=price_1ABC...xyz`

**Create Yearly Price:**
- Click **"Add another price"** on the same product
- **Price**: `$240.00 USD`
- **Billing period**: `Yearly`
- **Pricing model**: `Standard pricing`
- Click **"Save price"**
- **Copy the Price ID**
- Replace in .env: `STRIPE_PRICE_ACADEMY_YEARLY=price_1DEF...xyz`

---

#### Product 2: **Team Pro** 👥

**Create Product:**
1. Click **"+ Add Product"**
2. **Name**: `Team Pro`
3. **Description**: `Full platform for small teams (2-5 members) with collaboration features`
4. Click **"Add pricing"**

**Create Monthly Price:**
- **Price**: `$99.00 USD`
- **Billing period**: `Monthly`
- Click **"Save price"**
- **Copy Price ID** → `STRIPE_PRICE_TEAM_PRO_MONTHLY=price_...`

**Create Yearly Price:**
- **Price**: `$828.00 USD`
- **Billing period**: `Yearly`
- Click **"Save price"**
- **Copy Price ID** → `STRIPE_PRICE_TEAM_PRO_YEARLY=price_...`

---

#### Product 3 & 4: **Update Existing Products** (Optional)

If you already created Starter, Pro, Business, Enterprise:

**Rename them to match the new structure:**
- `Starter` → Rename to `Pro` (or create new)
- `Business` → Rename to `Enterprise` (or keep both)

**OR just create new ones:**

**Pro (Full Platform):**
- Monthly: `$49.00`
- Yearly: `$408.00`
- Copy Price IDs to `STRIPE_PRICE_PRO_MONTHLY/YEARLY`

**Enterprise:**
- Monthly: `$299.00`
- Yearly: `$2,999.00`
- Copy Price IDs to `STRIPE_PRICE_ENTERPRISE_MONTHLY/YEARLY`

---

## 📋 Quick Copy/Paste Template

After creating products, update your `.env` file:

```bash
# Replace these placeholder IDs with real ones from Stripe Dashboard:

# Academy Only
STRIPE_PRICE_ACADEMY_MONTHLY=price_1ABC123xyz  # Your actual Price ID here
STRIPE_PRICE_ACADEMY_YEARLY=price_1DEF456xyz   # Your actual Price ID here

# Team Pro
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_1GHI789xyz  # Your actual Price ID here
STRIPE_PRICE_TEAM_PRO_YEARLY=price_1JKL012xyz   # Your actual Price ID here

# Pro (if creating new)
STRIPE_PRICE_PRO_MONTHLY=price_1MNO345xyz       # Your actual Price ID here
STRIPE_PRICE_PRO_YEARLY=price_1PQR678xyz        # Your actual Price ID here

# Enterprise (if creating new)
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1STU901xyz    # Your actual Price ID here
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1VWX234xyz     # Your actual Price ID here
```

---

## 🔧 Complete Pricing Structure

| Product | Monthly | Yearly | Stripe Product Name |
|---------|---------|--------|---------------------|
| **Academy Only** | $29 | $240 (save $108) | `Academy Only` |
| **Pro** | $49 | $408 (save $180) | `Pro` or `Starter` |
| **Team Pro** | $99 | $828 (save $360) | `Team Pro` |
| **Enterprise** | $299 | $2,999 (save $589) | `Enterprise` or `Business` |

---

## ✅ Verification Checklist

After creating all products in Stripe:

- [ ] Created "Academy Only" product with 2 prices (monthly/yearly)
- [ ] Created "Team Pro" product with 2 prices (monthly/yearly)
- [ ] Copied all Price IDs from Stripe Dashboard
- [ ] Updated `.env` file with real Price IDs
- [ ] Restarted backend server
- [ ] Tested webhook is configured (optional for now)

---

## 🧪 How to Test

### Test Mode (Current Setup):

1. **Use test card numbers:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date
   - Any 3-digit CVC

2. **Create a test subscription:**
   ```bash
   # From your app, click subscribe
   # Stripe will redirect to checkout
   # Use test card 4242...
   # Complete payment
   # Check webhook logs
   ```

3. **Verify webhook received:**
   - Check backend console logs
   - Should see: "✅ Created/updated AcademySubscription..."

---

## 🚀 Moving to Production (Later)

When ready to accept real payments:

### 1. Switch to Live Mode in Stripe Dashboard
- Toggle from "Test mode" to "Live mode"

### 2. Create Production Products
- Same as above but in **Live mode**
- Copy **Live Price IDs**

### 3. Update Production .env
```bash
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_...  # Live key (starts with sk_live_)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # New webhook secret for production

# Production Price IDs (will be different from test)
STRIPE_PRICE_ACADEMY_MONTHLY=price_live_...
STRIPE_PRICE_ACADEMY_YEARLY=price_live_...
# ... etc
```

### 4. Configure Production Webhook
- URL: `https://smartpromptiq.com/api/billing/webhook`
- Events: `customer.subscription.*`, `payment_intent.*`
- Copy new webhook secret to production .env

---

## 💡 Pro Tips

### Price ID Format:
- **Test Mode**: `price_1ABC123test...`
- **Live Mode**: `price_1ABC123live...`

### Finding Price IDs:
1. Go to: https://dashboard.stripe.com/test/products
2. Click on a product
3. Click on a price
4. Price ID is shown at the top (starts with `price_`)
5. Click to copy

### Webhook Testing:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/billing/webhook

# Trigger test event
stripe trigger customer.subscription.created
```

---

## 📞 Current Status Summary

**Your Stripe Setup:**
✅ Test mode configured
✅ API keys set
✅ Webhook secret set
✅ .env file updated with Academy price placeholders
⏳ Need to create products in Stripe Dashboard
⏳ Need to replace placeholder Price IDs

**Next Step:** Go to Stripe Dashboard and create the 4 products above (Academy, Team Pro, Pro, Enterprise)

**Time Required:** ~10 minutes

---

## 🎯 Quick Start Command

After updating .env with real Price IDs:

```bash
# Restart backend to load new env variables
cd backend
npm run dev
```

Then test the subscription flow! 🚀

---

**Questions?** Your Stripe account is already set up correctly. You just need to create the products and copy the Price IDs!
