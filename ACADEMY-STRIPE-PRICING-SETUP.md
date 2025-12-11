# SmartPromptIQ Academy - Stripe Pricing Setup Guide

## Overview
This document outlines the recommended pricing structure for the Academy and the Stripe products/prices you need to create.

---

## 📊 Recommended Pricing Tiers

Based on your existing platform structure and the Academy's 57 courses with 555 lessons, here are the recommended pricing tiers:

### 1. **Free Tier** (No Stripe Setup Needed)
- **Price**: $0
- **Target**: Trial users, students exploring
- **Features**:
  - 3 basic Academy courses
  - First lesson of each course (preview)
  - 5 playground tests
  - Community forum access
  - 5 AI prompts (main platform)
- **Stripe Setup**: None required

---

### 2. **Academy Only** - For Pure Learners
- **Monthly**: **$29/month**
- **Yearly**: **$240/year** (Save $108 = 2 months free + extra discount)
- **Target**: Students, educators, content creators who only want learning
- **Features**:
  - ✅ All 57 courses + 555 lessons
  - ✅ Audio learning & transcripts
  - ✅ Quizzes & interactive exercises
  - ✅ Earn completion certificates
  - ✅ 50 playground tests/month
  - ✅ Community forum access
  - ✅ Email support
  - ❌ NO Pro Tools (no AI prompt generation)
  - ❌ NO Templates
  - ❌ NO API access

**Stripe Price IDs to Create:**
```
STRIPE_PRICE_ACADEMY_MONTHLY=price_academy_monthly
STRIPE_PRICE_ACADEMY_YEARLY=price_academy_yearly
```

---

### 3. **Pro** (Full Platform Access)
- **Monthly**: **$49/month**
- **Yearly**: **$408/year** (Save $180 = ~31% discount)
- **Target**: Professionals, marketers, developers needing both learning + tools
- **Features**:
  - ✨ **Everything in Academy Only, PLUS:**
  - ✅ 200 AI prompts per month
  - ✅ 50+ professional templates
  - ✅ Advanced analytics
  - ✅ Export & integrations
  - ✅ Priority email support
  - ✅ Rollover tokens (50 max)

**Stripe Price IDs to Create:**
```
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly
```

**Note**: These already exist in your system as:
- Monthly: `price_1SLETWKtG2uGDhSN6iRuJ3w9` (was "Starter")
- Yearly: `price_1SLEVOKtG2uGDhSNw0FMcGiU`

---

### 4. **Team Pro** (Small Teams)
- **Monthly**: **$99/month**
- **Yearly**: **$828/year** (Save $360 = ~30% discount)
- **Target**: Small teams (2-5 people), agencies, startups
- **Features**:
  - ✨ **Everything in Pro, PLUS:**
  - ✅ 1,000 AI prompts/month (5x more)
  - ✅ 2-5 team member seats
  - ✅ Team collaboration workspace
  - ✅ 100 API calls/month
  - ✅ Shared templates & workspace
  - ✅ Priority chat support
  - ✅ Team analytics

**Stripe Price IDs to Create:**
```
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_team_pro_monthly
STRIPE_PRICE_TEAM_PRO_YEARLY=price_team_pro_yearly
```

---

### 5. **Enterprise** (Large Organizations)
- **Monthly**: **$299/month**
- **Yearly**: **$2,999/year** (Save $589 = ~16% discount)
- **Target**: Large companies, agencies (6+ people), white-label needs
- **Features**:
  - ✨ **Everything in Team Pro, PLUS:**
  - ✅ 5,000+ AI prompts/month
  - ✅ Unlimited team members
  - ✅ Custom branding on certificates
  - ✅ White-label options
  - ✅ 10,000 API calls/month
  - ✅ Dedicated account manager
  - ✅ SSO & advanced security
  - ✅ Custom integrations
  - ✅ SLA guarantees

**Stripe Price IDs to Create:**
```
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly
```

**Note**: These already exist in your system as:
- Monthly: `price_1SLEX6KtG2uGDhSNfdCzenXl` (was "Business")
- Yearly: `price_1SLEYiKtG2uGDhSNIsrTlBSu`

---

## 🎯 Stripe Products to Create

### In Your Stripe Dashboard (https://dashboard.stripe.com/)

#### Product 1: SmartPromptIQ Academy Only
```
Name: Academy Only
Description: Full access to all 57 courses and 555 lessons. Perfect for learners who want education only.
```

**Prices:**
1. **Academy Monthly**
   - Amount: $29.00 USD
   - Billing: Recurring - Monthly
   - Price ID: Save as `STRIPE_PRICE_ACADEMY_MONTHLY`

2. **Academy Yearly**
   - Amount: $240.00 USD ($20/month)
   - Billing: Recurring - Yearly
   - Price ID: Save as `STRIPE_PRICE_ACADEMY_YEARLY`

---

#### Product 2: SmartPromptIQ Pro (Full Platform)
```
Name: Pro
Description: Full platform access - Academy education + Pro AI tools, templates, and analytics.
```

**Prices:**
1. **Pro Monthly** ✅ ALREADY EXISTS
   - Amount: $49.00 USD
   - Billing: Recurring - Monthly
   - Existing ID: `price_1SLETWKtG2uGDhSN6iRuJ3w9`

2. **Pro Yearly** ✅ ALREADY EXISTS
   - Amount: $408.00 USD ($34/month)
   - Billing: Recurring - Yearly
   - Existing ID: `price_1SLEVOKtG2uGDhSNw0FMcGiU`

---

#### Product 3: SmartPromptIQ Team Pro
```
Name: Team Pro
Description: Full platform for small teams (2-5 members) with collaboration features.
```

**Prices:**
1. **Team Pro Monthly**
   - Amount: $99.00 USD
   - Billing: Recurring - Monthly
   - Price ID: Save as `STRIPE_PRICE_TEAM_PRO_MONTHLY`

2. **Team Pro Yearly**
   - Amount: $828.00 USD ($69/month)
   - Billing: Recurring - Yearly
   - Price ID: Save as `STRIPE_PRICE_TEAM_PRO_YEARLY`

---

#### Product 4: SmartPromptIQ Enterprise
```
Name: Enterprise
Description: Full platform for large teams with unlimited users, white-label, and dedicated support.
```

**Prices:**
1. **Enterprise Monthly** ✅ ALREADY EXISTS
   - Amount: $299.00 USD
   - Billing: Recurring - Monthly
   - Existing ID: `price_1SLEX6KtG2uGDhSNfdCzenXl`

2. **Enterprise Yearly** ✅ ALREADY EXISTS
   - Amount: $2,999.00 USD ($249.92/month)
   - Billing: Recurring - Yearly
   - Existing ID: `price_1SLEYiKtG2uGDhSNIsrTlBSu`

---

## 🔧 Environment Variables to Add

Add these to your `.env` file:

```bash
# Academy-specific pricing
STRIPE_PRICE_ACADEMY_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ACADEMY_YEARLY=price_xxxxxxxxxxxxx

# Pro pricing (rename existing)
STRIPE_PRICE_PRO_MONTHLY=price_1SLETWKtG2uGDhSN6iRuJ3w9
STRIPE_PRICE_PRO_YEARLY=price_1SLEVOKtG2uGDhSNw0FMcGiU

# Team Pro pricing (NEW)
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_TEAM_PRO_YEARLY=price_xxxxxxxxxxxxx

# Enterprise pricing (existing)
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1SLEX6KtG2uGDhSNfdCzenXl
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1SLEYiKtG2uGDhSNIsrTlBSu

# Token packages (existing - keep as-is)
STRIPE_PRICE_TOKENS_25=price_tokens_25_id
STRIPE_PRICE_TOKENS_100=price_tokens_100_id
STRIPE_PRICE_TOKENS_500=price_tokens_500_id
STRIPE_PRICE_TOKENS_1000=price_tokens_1000_id
```

---

## 📝 Step-by-Step Stripe Setup

### Step 1: Create Academy Only Product
1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add Product"**
3. Fill in:
   - **Name**: Academy Only
   - **Description**: Full access to all 57 courses and 555 lessons
4. Click **"Add pricing"**
5. Create **Monthly** price:
   - Price: $29.00
   - Billing period: Monthly
   - Save the Price ID
6. Create **Yearly** price:
   - Price: $240.00
   - Billing period: Yearly
   - Save the Price ID

### Step 2: Create Team Pro Product
1. Click **"+ Add Product"**
2. Fill in:
   - **Name**: Team Pro
   - **Description**: Full platform for small teams (2-5 members)
3. Create **Monthly** price: $99.00
4. Create **Yearly** price: $828.00
5. Save both Price IDs

### Step 3: Verify Existing Products
1. Find "Starter" product → Rename to **"Pro"**
2. Find "Business" product → Rename to **"Enterprise"**
3. Verify the price IDs match what's in your .env

### Step 4: Update Environment Variables
1. Copy all Price IDs from Stripe Dashboard
2. Update your `.env` file with the new IDs
3. Restart your backend server

---

## 💰 Pricing Strategy Breakdown

### Academy Only vs Pro Comparison
| Feature | Academy Only ($29) | Pro ($49) | Difference |
|---------|-------------------|-----------|------------|
| Courses | All 57 | All 57 | Same |
| Certificates | ✅ | ✅ | Same |
| AI Prompts | ❌ | 200/month | **+$20 value** |
| Templates | ❌ | 50+ | **+$10 value** |
| Analytics | Basic | Advanced | **+$5 value** |
| Support | Email | Priority | **+$5 value** |

**Value Proposition**: Pro tier is $20 more but adds $40+ in value = great upsell opportunity!

---

### Yearly Discount Strategy
- **Academy**: 2 months free + $3/mo extra = ~31% off
- **Pro**: 2 months free + extra savings = 31% off
- **Team Pro**: 2 months free + extra savings = 30% off
- **Enterprise**: Standard yearly discount = 16% off

**Why**: Bigger discounts for lower tiers encourage annual commitment from price-sensitive users.

---

## 🎓 Academy Subscription Tiers (Database)

Your `AcademySubscription` model supports these tiers:

```typescript
tier: "free" | "academy_basic" | "academy_pro" | "all_access"
```

### Recommended Mapping:
- `free` → Free tier (3 courses)
- `academy_basic` → **Academy Only** ($29/mo)
- `academy_pro` → Not used (deprecated)
- `all_access` → **Pro, Team Pro, Enterprise** (with main platform)

---

## 🚀 Next Steps

1. **Create the 4 new Stripe prices** (Academy Monthly/Yearly, Team Pro Monthly/Yearly)
2. **Update your .env file** with all Price IDs
3. **Update pricingConfig.js** with the new tiers
4. **Test the checkout flow** with Stripe test mode
5. **Deploy to production** and update live environment variables

---

## 📞 Questions?

If you need help with:
- Creating the Stripe products
- Updating the backend to handle new tiers
- Setting up the checkout flow
- Testing payments

Just let me know and I'll guide you through each step!
