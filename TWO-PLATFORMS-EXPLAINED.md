# SmartPromptIQ - Two Platforms, One Account

## 🎯 The Two Platforms

### Platform 1: **SmartPromptIQ Pro** (Main App)
**URL**: `/dashboard`, `/generate`, `/templates`, etc.
**Purpose**: AI Prompt Generation Platform
**Features**:
- Generate AI prompts from questionnaires
- Browse prompt templates
- Save and manage prompts
- Team collaboration
- Subscription plans (Free, Pro, Enterprise)

### Platform 2: **SmartPromptIQ Academy** (Learning Platform)
**URL**: `/academy`, `/academy/courses`, `/academy/dashboard`
**Purpose**: Online Learning Platform
**Features**:
- Browse 57+ courses on AI, prompt engineering, business, etc.
- Enroll in courses
- Track learning progress
- Earn certificates
- Access learning dashboard

---

## 🔑 ONE Account, TWO Platforms

### How It Works

**You sign in ONCE** and can access BOTH platforms:

```
Sign In → One Account
    ├── SmartPromptIQ Pro (Main App)
    └── SmartPromptIQ Academy (Courses)
```

### The Sign-In Flow

1. **Sign Up / Sign In** at `/signin` or `/signup`
2. Your account is created in the database
3. You receive a JWT token (stored in browser)
4. This SAME token works for BOTH platforms!

---

## 🌐 Navigation Between Platforms

### From Main App → Academy
- Click **"Academy"** in main navigation (we need to add this!)
- Or directly go to: `/academy`
- Or from user menu → "Academy"

### From Academy → Main App
- Click **"Main App"** button (already in Academy navigation)
- Or go to: `/dashboard`

---

## 🔐 Shared Authentication

Both platforms use the **SAME**:
- ✅ User database table
- ✅ JWT token
- ✅ Authentication middleware
- ✅ Sign in / Sign up system

**You DON'T need separate accounts!**

---

## 📊 Current Architecture

```
┌─────────────────────────────────────────────┐
│          SMARTPROMPTIQ ECOSYSTEM            │
├─────────────────────────────────────────────┤
│                                             │
│  ONE USER ACCOUNT (email + password)       │
│  ONE JWT TOKEN (shared authentication)     │
│                                             │
├─────────────────────┬───────────────────────┤
│                     │                       │
│  PLATFORM 1         │  PLATFORM 2          │
│  Main App           │  Academy             │
│  (/dashboard)       │  (/academy)          │
│                     │                       │
│  • Generate Prompts │  • Browse Courses    │
│  • Templates        │  • Enroll            │
│  • Team Collab      │  • Learn             │
│  • Subscriptions    │  • Certificates      │
│                     │                       │
└─────────────────────┴───────────────────────┘
```

---

## 🆕 What We Need to Add

### 1. Link to Academy from Main App

**Add to main Navigation component:**

```tsx
// In client/src/components/Navigation.tsx (or wherever main nav is)

<Link href="/academy">
  <button className="...">
    🎓 Academy
  </button>
</Link>
```

### 2. Better Platform Indication

**User should know which platform they're on:**

- **Main App**: "SmartPromptIQ Pro" logo/title
- **Academy**: "SmartPromptIQ Academy" logo/title (already done! ✅)

### 3. Unified User Menu

**Both platforms should show:**
- User's name
- "Main App" (if in Academy)
- "Academy" (if in Main App)
- "My Account"
- "Sign Out"

---

## 🎓 Academy Access Tiers

The Academy has its own access system (separate from Pro subscriptions):

### Free Courses
- **Available to ALL users** (even free SmartPromptIQ accounts)
- 3 courses: "Prompt Writing 101", "Introduction to AI", "Product Tour"

### SmartPromptIQ Included
- **Available to SmartPromptIQ Pro/Enterprise users**
- 6 courses about using SmartPromptIQ

### Pro Academy Courses
- **Requires Academy Pro subscription** (separate from SmartPromptIQ Pro)
- 42 advanced courses
- Can be purchased standalone

### Certification Programs
- **Requires Academy Pro + Certification fee**
- 6 certification programs

---

## 🤔 User Scenarios

### Scenario 1: Free User
**Status**: Free SmartPromptIQ account

**Can Access**:
- ✅ Main App (limited prompt generations)
- ✅ Academy free courses (3 courses)
- ❌ Pro Academy courses (must upgrade Academy subscription)

### Scenario 2: SmartPromptIQ Pro User
**Status**: Paid SmartPromptIQ Pro subscription

**Can Access**:
- ✅ Main App (unlimited prompts, all features)
- ✅ Academy free courses (3 courses)
- ✅ SmartPromptIQ Included courses (6 courses)
- ❌ Pro Academy courses (must upgrade Academy subscription)

### Scenario 3: Academy Pro User
**Status**: Paid Academy Pro subscription (but free SmartPromptIQ)

**Can Access**:
- ✅ Main App (limited prompt generations)
- ✅ All Academy courses (57 courses)
- ✅ Certificates

### Scenario 4: Full Access User
**Status**: Both SmartPromptIQ Pro + Academy Pro subscriptions

**Can Access**:
- ✅ Everything in Main App
- ✅ All Academy courses
- ✅ All features

---

## 🔄 How Authentication Currently Works

### When You Sign In:

1. **Enter credentials** at `/signin`
2. **Backend validates** (checks User table)
3. **JWT token generated** with user ID, email, role
4. **Token stored** in `localStorage.getItem('token')`
5. **Token sent** with every API request:
   ```
   Authorization: Bearer eyJhbGc...
   ```

### Both Platforms Use This Token:

**Main App API calls:**
```
POST /api/generate → ✅ Uses token
GET /api/templates → ✅ Uses token
```

**Academy API calls:**
```
POST /api/academy/enroll → ✅ Uses SAME token!
GET /api/academy/my-courses → ✅ Uses SAME token!
```

---

## ❌ Current Issue: Why Enrollment Fails

You're getting "Invalid token" because:

1. ❌ Your token is **expired** (JWT tokens expire after X days)
2. You need to **sign in again** to get fresh token

**Solution**: Sign out and sign in again

---

## ✅ After Fixing Token Issue

Once you sign in again with valid credentials:

1. **Token is fresh** ✅
2. **Works for Main App** ✅
3. **Works for Academy** ✅
4. **Enrollment succeeds** ✅

---

## 🎯 User Experience Flow

### Ideal Flow:

```
1. User visits SmartPromptIQ.com
   ↓
2. Signs up for account
   ↓
3. Can immediately:
   - Generate prompts (Main App)
   - Enroll in free courses (Academy)
   ↓
4. If they upgrade to SmartPromptIQ Pro:
   - Unlimited prompts
   - SmartPromptIQ courses unlocked
   ↓
5. If they upgrade to Academy Pro:
   - All 57 courses unlocked
   - Can earn certificates
```

---

## 🔧 What We Should Add

### 1. Dashboard Switcher
In both platforms, add a dropdown:

```
┌──────────────────────┐
│  SmartPromptIQ Pro  ▼│
├──────────────────────┤
│  📊 Main Dashboard   │
│  🎓 Academy          │
│  👤 My Account       │
│  🚪 Sign Out         │
└──────────────────────┘
```

### 2. Cross-Platform CTAs

**In Main App Dashboard:**
```
📚 New Feature!
Explore 57+ courses in SmartPromptIQ Academy
[Browse Courses →]
```

**In Academy:**
```
💡 Need AI Prompts?
Generate custom prompts with SmartPromptIQ Pro
[Try Generator →]
```

### 3. Unified Settings

One place for:
- Account settings (email, password)
- SmartPromptIQ subscription
- Academy subscription
- Billing history

---

## 📝 Summary for Users

**Think of it like this:**

- **SmartPromptIQ Pro** = Your AI prompt generation tool (like Canva for prompts)
- **SmartPromptIQ Academy** = Your learning platform (like Udemy, but for AI skills)
- **One Account** = Access to both!

Similar to:
- **Adobe Creative Cloud** (tools) + **Adobe Learn** (courses)
- **Shopify** (platform) + **Shopify Learn** (academy)
- **HubSpot** (software) + **HubSpot Academy** (learning)

---

## 🚀 Next Steps

1. **Fix your current issue**: Sign in again to get fresh token
2. **Test enrollment**: Should work after sign-in!
3. **Add navigation links** between platforms
4. **Add clear branding** so users know which platform they're on

---

## TL;DR

**Two platforms, one login:**
- 🔵 **SmartPromptIQ Pro** = Generate AI prompts
- 🟣 **SmartPromptIQ Academy** = Learn AI skills
- 🔑 **Same account** works for both
- ⚡ **Sign in once**, access everything

**Your current issue:**
- Token expired → Sign in again → Enrollment will work! ✅
