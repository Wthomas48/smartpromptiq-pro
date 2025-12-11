# ✅ Live Stripe Credentials Checklist

## What You've Found So Far:

✅ **Enterprise Yearly**:
- Product ID: `prod_THoB8LpZC8n4IR`
- Price ID: `price_1SLEYiKtG2uGDhSNIsrTlBSu` ✅ GOT THIS!
- Price: $1,499.00/year

---

## What I Still Need:

### 1. LIVE API Keys

Go to: https://dashboard.stripe.com/apikeys (make sure in LIVE mode)

- [ ] **Secret Key** (starts with `sk_live_...`):
  ```
  sk_live_______________________________
  ```

- [ ] **Publishable Key** (starts with `pk_live_...`):
  ```
  pk_live_______________________________
  ```

---

### 2. Remaining 5 Price IDs

For each product below, click on it in https://dashboard.stripe.com/products and copy the **Price ID** (like you did for Enterprise Yearly):

#### Starter Plan

- [ ] **Starter Monthly** ($14.99/month)
  - Product ID: `prod_THo2fEsnH2fQFA`
  - Price ID: `price_______________________________`

- [ ] **Starter Yearly** ($149.90/year)
  - Product ID: `prod_THo3E6SH0NDNzU`
  - Price ID: `price_______________________________`

#### Professional Plan

- [ ] **Professional Monthly** ($49.99/month)
  - Product ID: `prod_THo5r6sik7tni0`
  - Price ID: `price_______________________________`

- [ ] **Professional Yearly** ($499.00/year)
  - Product ID: `prod_THo7QwjamsWxbz`
  - Price ID: `price_______________________________`

#### Enterprise Plan

- [x] **Enterprise Yearly** ($1,499.00/year) ✅ DONE
  - Product ID: `prod_THoB8LpZC8n4IR`
  - Price ID: `price_1SLEYiKtG2uGDhSNIsrTlBSu` ✅

- [ ] **Enterprise Monthly** ($149.99/month)
  - Product ID: `prod_THo9fczZrnjDY1`
  - Price ID: `price_______________________________`

---

## How to Find Price ID (What You Just Did):

1. Go to: https://dashboard.stripe.com/products (in LIVE mode)
2. Click on product (e.g., "Enterprise Monthly")
3. Look in the events/logs section OR in the pricing details
4. Find the **Price ID** that starts with `price_1SLE...` (similar format to Enterprise Yearly)
5. Copy the entire ID

OR:

1. Click on the product
2. Scroll to "Pricing" section
3. Look for **"API ID"** column
4. Copy the `price_...` ID

---

## Quick Copy Format (Fill This Out):

Once you have everything, copy and paste this filled-out template:

```
LIVE SECRET KEY: sk_live_

LIVE PUBLISHABLE KEY: pk_live_

LIVE PRICE IDS:
Enterprise Yearly: price_1SLEYiKtG2uGDhSNIsrTlBSu
Enterprise Monthly: price_
Professional Yearly: price_
Professional Monthly: price_
Starter Yearly: price_
Starter Monthly: price_
```

---

## Next Steps After You Share:

Once you provide the above information, I will:

1. ✅ Update local `.env` to keep TEST keys for development
2. ✅ Create Railway environment variables with LIVE keys
3. ✅ Update `pricingConfig.js` with LIVE Price IDs
4. ✅ Commit and push changes to GitHub
5. ✅ Railway auto-deploys to production
6. ✅ Configure Stripe webhook for https://smartpromptiq.com
7. ✅ Test live payment flow

Then: **Real customers can sign up and pay with real credit cards!** 💳🚀

---

## Need Help?

If you're having trouble finding the Price IDs, you can also:

**Option 1: Check Stripe Events/Logs**
- Dashboard → Events
- Find the "price.created" events
- Each one shows the Price ID

**Option 2: Use Stripe CLI**
- I can run: `stripe prices list --product prod_THo2fEsnH2fQFA` for each product
- But you need to authenticate with: `stripe login --live`

**Option 3: API Keys**
- You can share your LIVE secret key first
- Then I can fetch all Price IDs automatically using Stripe API

---

Please share the information when ready! 🎯
