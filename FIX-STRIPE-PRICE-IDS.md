# 🚨 CRITICAL: Fix Your Stripe Price IDs

## ❌ Issues Found in Your .env File

I found **critical errors** in your Stripe configuration:

### 1. **Wrong ID Type** - Product IDs vs Price IDs
```bash
❌ WRONG: prod_TR4tElOocrioTg  (This is a PRODUCT ID)
✅ RIGHT: price_1ABC123xyz     (This is a PRICE ID)
```

**You were using Product IDs instead of Price IDs!**

### 2. **Invalid Variable Names**
```bash
❌ WRONG: STRIPE_PRICE_Academy only=prod_TR4tElOocrioTg
          ^ spaces not allowed, wrong casing

✅ RIGHT: STRIPE_PRICE_ACADEMY_MONTHLY=price_1ABC123xyz
          ^ uppercase, underscores, proper suffix
```

### 3. **Duplicate Entries**
```bash
❌ You had two "Academy only" entries (both wrong)
✅ Should be: ACADEMY_MONTHLY and ACADEMY_YEARLY (two separate entries)
```

---

## ✅ I've Fixed Your .env File

Your `.env` now has the **correct format** with placeholders:

```bash
# Academy Only
STRIPE_PRICE_ACADEMY_MONTHLY=price_academy_monthly_REPLACE_ME
STRIPE_PRICE_ACADEMY_YEARLY=price_academy_yearly_REPLACE_ME

# Pro Plan
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_REPLACE_ME
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly_REPLACE_ME

# Team Pro
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_team_pro_monthly_REPLACE_ME
STRIPE_PRICE_TEAM_PRO_YEARLY=price_team_pro_yearly_REPLACE_ME

# Enterprise
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly_REPLACE_ME
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly_REPLACE_ME
```

**Now you need to replace the placeholders with real Price IDs from Stripe!**

---

## 🎯 How to Get the CORRECT Price IDs

### Step 1: Go to Your Stripe Products
https://dashboard.stripe.com/test/products

### Step 2: Find Your "Academy only" Product
You already created it! Click on it.

### Step 3: Get the PRICE IDs (Not Product ID!)

**IMPORTANT:** Each product has:
- 1 **Product ID** (starts with `prod_`) ❌ DON'T USE THIS
- Multiple **Price IDs** (start with `price_`) ✅ USE THESE

**Example Screenshot Guide:**
```
Product: Academy Only (prod_TR4tElOocrioTg) ← DON'T USE THIS
  ├─ Price: $29.00/month (price_1ABC123xyz) ← USE THIS ONE
  └─ Price: $240.00/year (price_1DEF456xyz)  ← USE THIS ONE
```

### Step 4: Click on Each Price to Copy ID

1. Click on the **$29.00/month** price
2. You'll see: `Price ID: price_1ABC123xyz`
3. Click the copy icon
4. Paste into .env: `STRIPE_PRICE_ACADEMY_MONTHLY=price_1ABC123xyz`

5. Click on the **$240.00/year** price
6. Copy its Price ID
7. Paste into .env: `STRIPE_PRICE_ACADEMY_YEARLY=price_1DEF456xyz`

**Repeat for all products!**

---

## 📋 Correct Price ID Format

### What Price IDs Look Like:
```bash
✅ price_1ABC123xyz4567890  (starts with price_1)
✅ price_1QKrTdJNxVjDuJxhRtAMo2K7
✅ price_1SLETWKtG2uGDhSN6iRuJ3w9

❌ prod_TR4tElOocrioTg  (Product ID - WRONG!)
❌ STRIPE_PRICE_Academy only  (Invalid variable name - WRONG!)
```

---

## 🔍 Quick Check: Are Your IDs Correct?

Run this test:
```bash
# Good Price ID examples:
price_1ABC...  ✅ Starts with "price_1"
price_1XYZ...  ✅ Long alphanumeric string
price_1QKr...  ✅ Usually 24+ characters

# Bad examples:
prod_TR4t...   ❌ Starts with "prod_" (Product ID!)
price_acad...  ❌ Too short
Academy_only   ❌ Not a Stripe ID at all
```

---

## 🛠️ Complete Fix Process

### 1. Open Stripe Dashboard
https://dashboard.stripe.com/test/products

### 2. Check Your Existing Products

You mentioned you have:
- ✅ "Academy only" product (prod_TR4tElOocrioTg)
- ✅ "Enterprise" product (prod_THo9fczZrnjDY1)

**Good! But you need the PRICE IDs, not product IDs.**

### 3. For EACH Product, Get Both Price IDs

**Academy Only:**
```
Product Page → Shows 2 prices:
  Price 1: $29/month  → Click → Copy "price_1ABC..."
  Price 2: $240/year  → Click → Copy "price_1DEF..."
```

**Enterprise:**
```
Product Page → Shows 2 prices:
  Price 1: $299/month → Click → Copy "price_1GHI..."
  Price 2: $2999/year → Click → Copy "price_1JKL..."
```

### 4. Update .env File

Replace the `_REPLACE_ME` placeholders:

```bash
# Before:
STRIPE_PRICE_ACADEMY_MONTHLY=price_academy_monthly_REPLACE_ME

# After (with real ID from Stripe):
STRIPE_PRICE_ACADEMY_MONTHLY=price_1ABC123xyz4567890
```

---

## 📸 Visual Guide

### Where to Find Price IDs:

```
Stripe Dashboard
  └─ Products
      └─ Click "Academy Only"
          └─ You'll see:

              Product: Academy Only
              Product ID: prod_TR4tElOocrioTg  ← DON'T USE

              Prices:
              ┌─────────────────────────────────┐
              │ $29.00 / month                  │
              │ Price ID: price_1ABC123...      │ ← COPY THIS
              │ [Copy ID] [Edit] [Archive]      │
              └─────────────────────────────────┘

              ┌─────────────────────────────────┐
              │ $240.00 / year                  │
              │ Price ID: price_1DEF456...      │ ← COPY THIS
              │ [Copy ID] [Edit] [Archive]      │
              └─────────────────────────────────┘
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Using Product ID
```bash
❌ STRIPE_PRICE_ACADEMY_MONTHLY=prod_TR4tElOocrioTg
✅ STRIPE_PRICE_ACADEMY_MONTHLY=price_1ABC123xyz
```

### Mistake 2: Variable Name with Spaces
```bash
❌ STRIPE_PRICE_Academy only=price_123
✅ STRIPE_PRICE_ACADEMY_MONTHLY=price_123
```

### Mistake 3: Same ID for Monthly and Yearly
```bash
❌ STRIPE_PRICE_ACADEMY_MONTHLY=price_123
   STRIPE_PRICE_ACADEMY_YEARLY=price_123  (same ID!)

✅ STRIPE_PRICE_ACADEMY_MONTHLY=price_123  (monthly price)
   STRIPE_PRICE_ACADEMY_YEARLY=price_456   (yearly price - different!)
```

### Mistake 4: Not Creating Yearly Prices
```bash
If you only created monthly prices in Stripe:
- You need to create yearly prices too!
- Each product needs 2 prices (monthly + yearly)
```

---

## 🎯 Products You Need to Create/Check

Based on your implementation, you need these products in Stripe:

### 1. Academy Only ✅ (You have this!)
- [ ] Monthly price ($29) → Get Price ID
- [ ] Yearly price ($240) → Get Price ID

### 2. Pro (Full Platform) ⚠️ (Need to create)
- [ ] Monthly price ($49) → Create & get Price ID
- [ ] Yearly price ($408) → Create & get Price ID

### 3. Team Pro ⚠️ (Need to create)
- [ ] Monthly price ($99) → Create & get Price ID
- [ ] Yearly price ($828) → Create & get Price ID

### 4. Enterprise ✅ (You might have this!)
- [ ] Monthly price ($299) → Get Price ID
- [ ] Yearly price ($2,999) → Get Price ID

---

## 🚀 Quick Action Plan

### Right Now (5 minutes):
1. ✅ Go to https://dashboard.stripe.com/test/products
2. ✅ Click on "Academy Only" product
3. ✅ Click on the $29/month price
4. ✅ Copy the Price ID (starts with `price_1`)
5. ✅ Paste into .env replacing `price_academy_monthly_REPLACE_ME`
6. ✅ Repeat for $240/year price

### Then (10 minutes):
7. Create missing products (Pro, Team Pro) if needed
8. For each product, create 2 prices (monthly + yearly)
9. Copy all Price IDs to .env
10. Restart backend server

---

## ✅ Verification Checklist

After updating .env, verify:

- [ ] All Price IDs start with `price_1`
- [ ] All Price IDs are 20+ characters long
- [ ] Variable names are UPPERCASE with UNDERSCORES
- [ ] Each tier has 2 IDs (MONTHLY and YEARLY)
- [ ] No duplicate IDs
- [ ] No `prod_` Product IDs
- [ ] No `_REPLACE_ME` placeholders left

---

## 💡 Pro Tip: Quick Test

After updating .env, test if IDs are valid:

```bash
# In your backend console when server starts:
# You should see webhook handler loading with your Price IDs

# Look for this in logs:
"✅ Loaded Price ID: price_1ABC... for ACADEMY_MONTHLY"
```

---

## 📞 Still Having Issues?

### Can't find Price IDs?
1. Go to specific product page
2. Look for section labeled "Prices"
3. Click on a price amount ($29.00, etc.)
4. Price ID will be at the top of the page

### Don't see prices on product?
1. You need to add prices to the product
2. Click "Add another price"
3. Enter amount and billing period
4. Save and copy the new Price ID

### Confused about Product vs Price?
- **Product** = The thing you're selling (e.g., "Academy Only")
- **Price** = How much it costs (e.g., "$29/month")
- One product can have multiple prices!

---

## 🎉 Expected Result

After fixing, your .env should look like:

```bash
# Academy Only Subscription
STRIPE_PRICE_ACADEMY_MONTHLY=price_1QKrTdJNxVjDuJxhRtAMo2K7
STRIPE_PRICE_ACADEMY_YEARLY=price_1QKrTdJNxVjDuJxhRtAMo2K8

# Pro Plan
STRIPE_PRICE_PRO_MONTHLY=price_1SLETWKtG2uGDhSN6iRuJ3w9
STRIPE_PRICE_PRO_YEARLY=price_1SLEVOKtG2uGDhSNw0FMcGiU

# Team Pro Plan
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_1XYZ123abc456def789
STRIPE_PRICE_TEAM_PRO_YEARLY=price_1XYZ789def123abc456

# Enterprise Plan
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1SLEX6KtG2uGDhSNfdCzenXl
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1SLEYiKtG2uGDhSNIsrTlBSu
```

**All starting with `price_1` and all unique!** ✅

---

**Action Required:** Go get those Price IDs from Stripe Dashboard now! 🚀
