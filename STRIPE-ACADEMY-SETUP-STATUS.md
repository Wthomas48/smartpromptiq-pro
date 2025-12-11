# Stripe Academy Setup - Current Status

## ✅ What You've Created

### Academy Only Product ✅
- **Product ID**: `prod_TR4wB22RiDWvMN`
- **Monthly Price**: `price_1SUCmKKtG2uGDhSNGAFa0mHD` ✅
- **Price**: $29.00/month (assumed based on your setup)
- **Status**: ✅ Added to .env file

### Product Details:
```
Description: Monthly Prompts 0 prompts/month
All 57 courses + 555 lessons
Audio learning & quizzes
Earn certificates
50 playground tests/month
Community forum access
Email support
• Up to 1 team members
```

---

## ⚠️ What's Still Missing

### 1. Academy Yearly Price (IMPORTANT!)
You only created the **monthly** price. You also need a **yearly** price for the same product.

**How to Add:**
1. Go to https://dashboard.stripe.com/test/products
2. Click on "Academy Only" product (prod_TR4wB22RiDWvMN)
3. Click **"Add another price"**
4. Set:
   - **Amount**: `$240.00`
   - **Billing period**: `Yearly`
   - **Description**: "Academy Only - Annual"
5. Click **"Save price"**
6. **Copy the new Price ID** (will be like `price_1SUC...xyz`)
7. Update .env: `STRIPE_PRICE_ACADEMY_YEARLY=price_1SUC...xyz`

---

### 2. Pro Plan Product (Full Platform)
You need to create a **Pro** plan for users who want Academy + AI Tools.

**Create New Product:**
1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. **Name**: `Pro`
4. **Description**: `Full platform access: All Academy courses + 200 AI prompts/month + Templates + Priority support`
5. Add **Monthly Price**: `$49.00/month`
6. Add **Yearly Price**: `$408.00/year` (saves ~31%)
7. Copy both Price IDs to .env

---

### 3. Team Pro Product (For Teams)
For users who need team collaboration (2-5 members).

**Create New Product:**
1. **Name**: `Team Pro`
2. **Description**: `Everything in Pro + Team collaboration for 2-5 members + 1,000 AI prompts/month`
3. Add **Monthly Price**: `$99.00/month`
4. Add **Yearly Price**: `$828.00/year`
5. Copy both Price IDs to .env

---

### 4. Enterprise Product
For large organizations.

**Create New Product:**
1. **Name**: `Enterprise`
2. **Description**: `Full platform for unlimited team members + 5,000 AI prompts/month + White-label + Dedicated support`
3. Add **Monthly Price**: `$299.00/month`
4. Add **Yearly Price**: `$2,999.00/year`
5. Copy both Price IDs to .env

---

## 📋 Current .env Status

### ✅ Completed:
```bash
STRIPE_PRICE_ACADEMY_MONTHLY=price_1SUCmKKtG2uGDhSNGAFa0mHD ✅
```

### ⏳ Still Need:
```bash
STRIPE_PRICE_ACADEMY_YEARLY=price_academy_yearly_REPLACE_ME ⏳
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_REPLACE_ME ⏳
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly_REPLACE_ME ⏳
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_team_pro_monthly_REPLACE_ME ⏳
STRIPE_PRICE_TEAM_PRO_YEARLY=price_team_pro_yearly_REPLACE_ME ⏳
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly_REPLACE_ME ⏳
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly_REPLACE_ME ⏳
```

---

## 🎯 Quick Action Plan

### Priority 1: Add Academy Yearly Price (5 minutes)
1. Go to your "Academy Only" product
2. Add yearly price ($240)
3. Copy Price ID
4. Update .env

### Priority 2: Create Pro Product (5 minutes)
1. Create new "Pro" product
2. Add monthly ($49) and yearly ($408) prices
3. Copy both Price IDs
4. Update .env

### Priority 3: Create Team Pro Product (5 minutes)
1. Create new "Team Pro" product
2. Add monthly ($99) and yearly ($828) prices
3. Copy both Price IDs
4. Update .env

### Priority 4: Create Enterprise Product (5 minutes)
1. Create new "Enterprise" product
2. Add monthly ($299) and yearly ($2,999) prices
3. Copy both Price IDs
4. Update .env

**Total Time**: ~20 minutes

---

## 💡 Pricing Structure Reference

| Tier | Monthly | Yearly | Features |
|------|---------|--------|----------|
| **Free** | $0 | $0 | 3 courses, limited access |
| **Academy** | $29 | $240 | All 57 courses, certificates ✅ CREATED |
| **Pro** | $49 | $408 | Academy + AI tools (200/mo) ⏳ NEED |
| **Team Pro** | $99 | $828 | Pro + Team (2-5) + 1000 prompts ⏳ NEED |
| **Enterprise** | $299 | $2,999 | Unlimited team + 5000 prompts ⏳ NEED |

---

## 🧪 Testing Checklist

After adding all Price IDs:

- [ ] Academy Monthly works
- [ ] Academy Yearly works
- [ ] Pro Monthly works
- [ ] Pro Yearly works
- [ ] Team Pro Monthly works
- [ ] Team Pro Yearly works
- [ ] Enterprise Monthly works
- [ ] Enterprise Yearly works

---

## 🔍 How to Verify Price IDs

### In Stripe Dashboard:
1. Go to product
2. Click on a price
3. Look for **"Price ID"** at the top
4. Should start with `price_1` ✅
5. Should be 25+ characters long ✅

### In Your .env:
```bash
# Good ✅
STRIPE_PRICE_ACADEMY_MONTHLY=price_1SUCmKKtG2uGDhSNGAFa0mHD

# Bad ❌
STRIPE_PRICE_Academy_only=prod_TR4wB22RiDWvMN  (Product ID!)
```

---

## 🚀 After Completing Setup

Once all Price IDs are in .env:

1. **Restart Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Subscription Flow:**
   - Go to `/academy/pricing` (once implemented)
   - Click "Subscribe to Academy"
   - Should redirect to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Webhook should fire
   - User should get access to courses

3. **Verify Webhook:**
   - Check backend console logs
   - Should see: "✅ Created/updated AcademySubscription..."

---

## 📞 Next Steps

**Right Now:**
1. ✅ Academy Monthly price added to .env
2. ⏳ Add Academy Yearly price (next!)
3. ⏳ Create Pro, Team Pro, Enterprise products
4. ⏳ Update all Price IDs in .env
5. ✅ Backend code is ready and waiting!

**Your backend implementation is complete!** Once you add all the Price IDs, the subscription system will work perfectly. 🎉

---

## 💰 Revenue Calculator (For Reference)

If you get:
- 10 Academy users: $290/month ($3,480/year)
- 5 Pro users: $245/month ($2,940/year)
- 2 Team Pro users: $198/month ($2,376/year)
- 1 Enterprise: $299/month ($3,588/year)

**Total**: ~$1,032/month or ~$12,384/year 💰

That's the power of recurring revenue! 🚀

---

**Status**: 1 out of 8 Price IDs added (12.5% complete)
**Next**: Add Academy Yearly price!
