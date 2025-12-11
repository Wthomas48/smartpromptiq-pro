# Academy Stripe Payment Flow - Missing Details & Fixes

## 🔍 Flow Analysis Complete

I've analyzed your complete Academy implementation and identified the missing pieces for Stripe integration.

---

## ✅ What's Already Working

### 1. **Authentication Flow** ✅
- [AcademySignIn.tsx](client/src/pages/AcademySignIn.tsx) - Complete
- [AcademySignUp.tsx](client/src/pages/AcademySignUp.tsx) - Complete
- Navigation buttons trigger these pages correctly

### 2. **Course Management** ✅
- [academy.ts routes](backend/src/routes/academy.ts) - Complete
- Course listing, enrollment, progress tracking
- Free course enrollment works perfectly

### 3. **User Experience** ✅
- [AcademyDashboard.tsx](client/src/pages/AcademyDashboard.tsx) - Shows enrolled courses
- [AcademyCourseDetail.tsx](client/src/pages/AcademyCourseDetail.tsx) - Enrollment flow
- Access tier checking (free, academy, pro, certification)

### 4. **Database Schema** ✅
- `AcademySubscription` model exists in Prisma schema
- User subscription tier tracking
- Course access tier system

---

## ❌ What's MISSING

### 1. **Academy Subscription Endpoints** ❌ CRITICAL

The backend has general billing routes ([billing.ts](backend/src/routes/billing.ts)) but **NO Academy-specific subscription endpoints**.

**Missing Routes:**
```typescript
// ❌ These don't exist yet:
POST   /api/academy/subscribe          // Create Academy subscription
GET    /api/academy/subscription       // Get user's Academy subscription
POST   /api/academy/cancel             // Cancel Academy subscription
POST   /api/academy/upgrade            // Upgrade from Academy to Pro
GET    /api/academy/billing-portal     // Access Stripe billing portal
```

---

### 2. **Academy Pricing Page** ❌ CRITICAL

There's **NO dedicated pricing page** for Academy subscriptions.

**What exists:**
- [PricingPage.tsx](client/src/pages/PricingPage.tsx) - Shows main platform pricing (Pro, Team, Enterprise)
- Links to `/pricing?recommended=academy` exist in [AcademyCourseDetail.tsx:334](client/src/pages/AcademyCourseDetail.tsx#L334)
- But this page doesn't handle Academy-specific plans

**Need to create:**
```
client/src/pages/AcademyPricing.tsx
Route: /academy/pricing
```

---

### 3. **Stripe Checkout Integration** ❌ CRITICAL

**No Stripe Elements/Checkout implementation for Academy**

Current flow:
1. User clicks "Enroll Now" on paid course ✅
2. Should show subscription upgrade modal → ❌ **Missing**
3. Should redirect to Stripe checkout → ❌ **Missing**
4. Webhook should update `AcademySubscription` → ❌ **Missing**

**What needs to happen:**
```
User clicks "Enroll" on Academy course
   ↓
Check if user has required subscription tier
   ↓
If NO → Show upgrade modal with pricing
   ↓
Redirect to Stripe Checkout (Academy or Pro plan)
   ↓
After payment → Stripe webhook creates AcademySubscription
   ↓
User can now enroll in course
```

---

### 4. **Subscription Status Display** ❌ IMPORTANT

**Academy Dashboard doesn't show subscription status**

[AcademyDashboard.tsx](client/src/pages/AcademyDashboard.tsx) shows:
- ✅ Enrolled courses
- ✅ Certificates
- ✅ Progress stats

But **MISSING:**
- ❌ Current subscription tier (Free, Academy, Pro)
- ❌ Subscription renewal date
- ❌ Upgrade CTA for free users
- ❌ "Manage Subscription" button

---

### 5. **Access Control Enforcement** ⚠️ PARTIAL

**Course access checking exists but subscription checking is incomplete**

In [academy.ts:759-828](backend/src/routes/academy.ts#L759-L828):
```typescript
// ✅ This exists and checks user.subscriptionTier
function checkCourseAccess(userId, courseId)

// ⚠️ BUT: subscriptionTier is never SET after payment
```

**Problem:** When user pays for Academy subscription via Stripe:
1. Stripe webhook fires ✅
2. [billing.ts:244-285](backend/src/routes/billing.ts#L244-L285) handles it
3. But it updates `user.plan` NOT `user.subscriptionTier` ❌
4. Academy courses still show as locked ❌

---

### 6. **Enrollment Type Handling** ⚠️ PARTIAL

In [AcademyCourseDetail.tsx:113](client/src/pages/AcademyCourseDetail.tsx#L113):
```typescript
enrollmentType: course?.accessTier === 'free' ? 'free' : 'purchased'
```

**Issues:**
- `enrollmentType: 'purchased'` assumes direct course purchase
- Should be `'smartpromptiq_included'` or `'pro_subscription'` for subscription users
- No Stripe payment ID is passed because no payment was made

---

## 🔧 Required Fixes

### Fix #1: Create Academy Subscription Backend Routes
**File:** `backend/src/routes/academy-billing.ts` (NEW)

**Features:**
- POST /subscribe - Create Academy subscription via Stripe
- GET /subscription - Get user's Academy subscription details
- POST /cancel - Cancel subscription (at period end)
- POST /upgrade - Upgrade from Academy to Pro
- GET /portal - Get Stripe billing portal URL

---

### Fix #2: Update Stripe Webhook Handler
**File:** [backend/src/routes/billing.ts:217-242](backend/src/routes/billing.ts#L217-L242)

**Changes needed:**
```typescript
// ADD Academy subscription price IDs to the mapping
const planMapping = {
  // Existing...
  'price_1SLETWKtG2uGDhSN6iRuJ3w9': 'PRO',

  // ADD THESE:
  'price_academy_monthly_id': 'ACADEMY',
  'price_academy_yearly_id': 'ACADEMY',
  'price_team_pro_monthly_id': 'TEAM_PRO',
  'price_team_pro_yearly_id': 'TEAM_PRO',
};

// UPDATE user AND create/update AcademySubscription record
await prisma.user.update({
  where: { id: user.id },
  data: {
    plan,
    subscriptionTier: plan.toLowerCase(), // ADD THIS
    // ...
  }
});

// CREATE AcademySubscription record
await prisma.academySubscription.upsert({
  where: { userId: user.id },
  create: {
    userId: user.id,
    tier: plan.toLowerCase(),
    status: subscription.status,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    priceInCents: /* calculate */,
    billingCycle: /* monthly or yearly */,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  },
  update: {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  }
});
```

---

### Fix #3: Create Academy Pricing Page
**File:** `client/src/pages/AcademyPricing.tsx` (NEW)

**Design:**
- Hero section: "Choose Your Academy Plan"
- 3 pricing cards: Free, Academy Only, Pro (Full Platform)
- Highlight differences
- "Start Free" vs "Subscribe Now" CTAs
- Stripe Checkout integration

**Route:** Add to [App.tsx](client/src/App.tsx):
```tsx
<Route path="/academy/pricing" component={AcademyPricing} />
```

---

### Fix #4: Add Upgrade Modal to Course Detail
**File:** [AcademyCourseDetail.tsx](client/src/pages/AcademyCourseDetail.tsx)

**Add modal when user tries to enroll in paid course without subscription:**

```tsx
// Show this modal instead of enrolling
if (course.accessTier !== 'free' && !hasRequiredSubscription) {
  return <UpgradeModal
    requiredTier={course.accessTier}
    courseName={course.title}
    onUpgrade={() => redirectToStripeCheckout()}
  />;
}
```

---

### Fix #5: Update Academy Dashboard to Show Subscription
**File:** [AcademyDashboard.tsx](client/src/pages/AcademyDashboard.tsx)

**Add subscription status card:**

```tsx
// Fetch subscription
const [subscription, setSubscription] = useState(null);

useEffect(() => {
  fetchSubscription();
}, []);

// Display in dashboard
<div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
  <h3>Your Subscription</h3>
  <div className="text-3xl font-bold">
    {subscription?.tier || 'Free'}
  </div>
  {subscription?.currentPeriodEnd && (
    <p>Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
  )}
  <button>Manage Subscription</button>
</div>
```

---

### Fix #6: Add Stripe Elements for Payment
**File:** `client/src/components/academy/StripeCheckoutForm.tsx` (NEW)

**Features:**
- React Stripe Elements integration
- Payment form for Academy subscriptions
- Success/error handling
- Redirect back to course after payment

---

## 📋 Complete Implementation Checklist

### Backend (Priority Order)

- [ ] 1. **Update Stripe webhook handler** ([billing.ts:244-285](backend/src/routes/billing.ts#L244-L285))
  - Add Academy price IDs to mapping
  - Update `user.subscriptionTier` field
  - Create/update `AcademySubscription` record

- [ ] 2. **Create Academy billing routes** (`academy-billing.ts`)
  - POST /api/academy/subscribe
  - GET /api/academy/subscription
  - POST /api/academy/cancel
  - GET /api/academy/portal

- [ ] 3. **Update enrollment logic** ([academy.ts:165-288](backend/src/routes/academy.ts#L165-L288))
  - Check subscription tier before enrolling
  - Set correct `enrollmentType` based on subscription
  - Return helpful error messages

- [ ] 4. **Add subscription tier sync**
  - Ensure User.subscriptionTier matches User.plan
  - Add migration if needed

### Frontend (Priority Order)

- [ ] 1. **Create Academy Pricing page** (`AcademyPricing.tsx`)
  - Show Free, Academy, Pro plans
  - Link to Stripe Checkout
  - Add route to App.tsx

- [ ] 2. **Add Stripe Checkout integration**
  - Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
  - Create checkout session on subscribe click
  - Handle success/cancel redirects

- [ ] 3. **Update Course Detail page** ([AcademyCourseDetail.tsx](client/src/pages/AcademyCourseDetail.tsx))
  - Check user subscription tier
  - Show upgrade modal for locked courses
  - Redirect to `/academy/pricing` with course context

- [ ] 4. **Update Academy Dashboard** ([AcademyDashboard.tsx](client/src/pages/AcademyDashboard.tsx))
  - Fetch and display subscription status
  - Add "Manage Subscription" button
  - Show upgrade CTA for free users

- [ ] 5. **Add subscription status component**
  - Create `AcademySubscriptionCard.tsx`
  - Show tier, renewal date, billing cycle
  - Link to Stripe billing portal

### Configuration

- [ ] 1. **Update .env files**
  - Add Academy Stripe price IDs
  - Add Team Pro price IDs
  - Verify webhook secret

- [ ] 2. **Update pricingConfig.js**
  - Add Academy tier configuration
  - Add Team Pro tier
  - Update token allocations

- [ ] 3. **Test Stripe integration**
  - Test mode: Subscribe to Academy
  - Verify webhook creates AcademySubscription
  - Verify course access works
  - Test cancellation flow

---

## 🚀 Quick Start Implementation Order

**Phase 1: Critical (Do First)**
1. Update Stripe webhook to set subscriptionTier ✅
2. Create Academy pricing page ✅
3. Add Stripe checkout integration ✅

**Phase 2: Essential**
4. Create Academy billing routes ✅
5. Update course enrollment checks ✅
6. Add upgrade modal to course pages ✅

**Phase 3: Polish**
7. Update Academy dashboard with subscription ✅
8. Add billing portal link ✅
9. Add subscription management UI ✅

---

## 💡 Implementation Notes

### Subscription Tier Mapping
```
Stripe Price ID → User.subscriptionTier → Course Access
------------------------------------------------------
price_academy_monthly   → 'academy'  → free + academy courses
price_academy_yearly    → 'academy'  → free + academy courses
price_pro_monthly       → 'pro'      → ALL courses
price_pro_yearly        → 'pro'      → ALL courses
price_team_pro_monthly  → 'pro'      → ALL courses (team features)
price_enterprise_*      → 'enterprise' → ALL courses (enterprise features)
```

### Enrollment Type Logic
```typescript
function getEnrollmentType(user, course) {
  if (course.accessTier === 'free') return 'free';
  if (user.subscriptionTier === 'academy') return 'smartpromptiq_included';
  if (user.subscriptionTier === 'pro') return 'pro_subscription';
  if (user.subscriptionTier === 'enterprise') return 'pro_subscription';
  return 'purchased'; // For one-time certification courses
}
```

### Success URL Flow
```
Stripe Checkout Success URL:
https://smartpromptiq.com/academy/welcome?session_id={CHECKOUT_SESSION_ID}

→ Verify payment
→ Show welcome message
→ Auto-enroll in course (if from course page)
→ Redirect to dashboard
```

---

## 🧪 Testing Checklist

### Free Tier
- [ ] Can browse all courses
- [ ] Can enroll in free courses
- [ ] Cannot access academy/pro courses
- [ ] See upgrade CTA on locked courses

### Academy Subscription
- [ ] Can subscribe via Stripe
- [ ] Webhook creates AcademySubscription
- [ ] Can access academy tier courses
- [ ] Cannot access pro tier courses
- [ ] Can cancel subscription

### Pro Subscription
- [ ] Can subscribe via Stripe
- [ ] Can access ALL courses
- [ ] Gets pro tool access
- [ ] Can upgrade from Academy

### Edge Cases
- [ ] Subscription expiration handling
- [ ] Payment failure handling
- [ ] Webhook retry logic
- [ ] Concurrent enrollment attempts
- [ ] Browser back button during checkout

---

## 📞 Need Help?

I can help you implement any of these pieces. Just let me know which part you want to tackle first:

1. **Stripe webhook updates** (quickest win)
2. **Academy pricing page** (frontend)
3. **Billing API routes** (backend)
4. **Dashboard subscription display** (polish)

Let me know what you'd like to implement first! 🚀
