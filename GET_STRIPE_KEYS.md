# 🔑 How to Get Your Stripe Keys

Since you mentioned Stripe is already installed and you have keys, here's exactly where to find them:

## Step 1: Get Your API Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:

### Secret Key (sk_test_...)
- Click **"Reveal test key"** button
- Copy the entire key (starts with `sk_test_`)
- This goes in `.env` as: `STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE`

### Publishable Key (pk_test_...)
- This is already visible
- Copy the entire key (starts with `pk_test_`)
- This goes in `.env` as: `STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE`

---

## Step 2: Create Products and Get Price IDs

### Option A: Create New Products (Recommended)

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**

#### Create 3 Products:

**Product 1: Starter Plan**
```
Name: Starter
Description: 200 AI prompts per month
Pricing Model: Recurring
```

Add 2 prices:
- **Monthly**: $14.99/month → Copy the Price ID (starts with `price_`)
- **Yearly**: $149.90/year → Copy the Price ID

**Product 2: Pro Plan**
```
Name: Pro
Description: 1,000 AI prompts per month
Pricing Model: Recurring
```

Add 2 prices:
- **Monthly**: $39.99/month → Copy the Price ID
- **Yearly**: $399.90/year → Copy the Price ID

**Product 3: Enterprise Plan**
```
Name: Enterprise
Description: Unlimited AI prompts
Pricing Model: Recurring
```

Add 2 prices:
- **Monthly**: $99.99/month → Copy the Price ID
- **Yearly**: $999.90/year → Copy the Price ID

### Option B: Use Existing Products

If you already have products in Stripe:

1. Go to: https://dashboard.stripe.com/test/products
2. Click on each product
3. Find the **Price ID** for each pricing option
4. Copy them (they start with `price_`)

---

## Step 3: Update Your .env File

Open `C:\SmartPromptiq-pro\.env` and replace these lines:

```env
# Replace these with your actual keys:
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE

# Replace these with your actual Price IDs:
STRIPE_PRICE_STARTER_MONTHLY=price_1234abcd...  # Your actual Price ID
STRIPE_PRICE_STARTER_YEARLY=price_5678efgh...   # Your actual Price ID
STRIPE_PRICE_PRO_MONTHLY=price_9012ijkl...      # Your actual Price ID
STRIPE_PRICE_PRO_YEARLY=price_3456mnop...       # Your actual Price ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_7890qrst... # Your actual Price ID
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1234uvwx...  # Your actual Price ID
```

---

## Step 4: Restart Your Server

After updating the `.env` file:

```bash
# Kill the current server (Ctrl+C in the terminal)
# Then restart:
cd C:\SmartPromptiq-pro
PORT=5000 node server.cjs
```

You should now see:
```
✅ Stripe initialized
```

Instead of:
```
⚠️ Stripe not configured - using demo mode
```

---

## 🧪 Quick Test

Once configured, test it works:

```bash
curl -X POST "http://localhost:5000/api/billing/upgrade" \
  -H "Content-Type: application/json" \
  -d '{"planId":"starter","billingCycle":"monthly"}'
```

You should get back a real Stripe checkout URL!

---

## Need Help?

If you need me to update the `.env` file for you, just provide:
1. Your Stripe Secret Key
2. Your Stripe Publishable Key
3. Your 6 Price IDs (or let me know if you need help creating products)

I'll update the file automatically! 🚀
