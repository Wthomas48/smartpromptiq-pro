# SmartPromptIQ Email Flow - Visual Guide

## Complete Email System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SmartPromptIQ Email System                       │
│                                                                     │
│  Email Provider: SendGrid                                          │
│  Sender: noreply@smartpromptiq.com                                │
│  Status: ✅ Active & Configured                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Email Trigger Flow

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   User Action    │────────▶│  Backend Route   │────────▶│  Email Service   │
└──────────────────┘         └──────────────────┘         └──────────────────┘
                                                                    │
                                                                    ▼
                                                           ┌──────────────────┐
                                                           │     SendGrid     │
                                                           │   API Gateway    │
                                                           └──────────────────┘
                                                                    │
                                                                    ▼
                                                           ┌──────────────────┐
                                                           │   User's Inbox   │
                                                           │  📧 Email Received│
                                                           └──────────────────┘
```

---

## 7 Email Types with Trigger Points

### 1️⃣ Welcome Email 🚀

```
User fills signup form
        │
        ▼
POST /api/auth/signup
        │
        ▼
[backend/src/routes/auth.ts:157]
emailService.sendWelcomeEmail()
        │
        ▼
Template: welcome
        │
        ├─ Subject: "Welcome to SmartPromptIQ Pro! 🚀"
        ├─ Content: Feature highlights + CTA button
        ├─ Variables: {{name}}, {{email}}, {{dashboardUrl}}
        └─ Sent to: User's email address
```

**Template Location**: `backend/src/services/emailService.ts:52-153`

---

### 2️⃣ Email Verification 📬

```
After user signup
        │
        ▼
[backend/src/routes/auth.ts:161]
emailService.sendEmail() with verification link
        │
        ▼
Custom HTML Template
        │
        ├─ Subject: "Verify your SmartPromptIQ account"
        ├─ Content: Verification button + security notice
        ├─ Variables: {{name}}, {{verificationLink}}
        └─ Sent to: User's email address
```

**Template Location**: `backend/src/routes/auth.ts:161-181`

---

### 3️⃣ Password Reset Email 🔐

```
User clicks "Forgot Password"
        │
        ▼
POST /api/auth/forgot-password
        │
        ▼
[backend/src/routes/auth.ts:397]
emailService.sendPasswordResetEmail()
        │
        ▼
Template: passwordReset
        │
        ├─ Subject: "Reset Your SmartPromptIQ Pro Password 🔐"
        ├─ Content: Reset button + security warning
        ├─ Variables: {{name}}, {{resetUrl}}, {{expiryTime}}
        ├─ Expiry: 24 hours
        └─ Sent to: User's email address
```

**Template Location**: `backend/src/services/emailService.ts:155-225`

---

### 4️⃣ Subscription Upgrade Email 🚀

```
User completes Stripe payment
        │
        ▼
Stripe webhook triggers
        │
        ▼
[backend/src/routes/billing.ts]
emailService.sendSubscriptionUpgradeEmail()
        │
        ▼
Template: subscriptionUpgrade
        │
        ├─ Subject: "🚀 Welcome to {{planName}} - Your Upgrade is Active!"
        ├─ Content: Plan features + billing details
        ├─ Variables: {{planName}}, {{generationsLimit}}, {{amount}}
        └─ Sent to: User's email address
```

**Template Location**: `backend/src/services/emailService.ts:334-427`

---

### 5️⃣ Prompt Generated Email 🎉

```
AI finishes generating prompt
        │
        ▼
[backend/src/routes/generate.ts]
emailService.sendPromptGeneratedEmail()
        │
        ▼
Template: promptGenerated
        │
        ├─ Subject: "🎉 Your AI Prompt is Ready!"
        ├─ Content: Prompt preview + stats + view button
        ├─ Variables: {{category}}, {{promptTitle}}, {{promptPreview}}
        └─ Sent to: User's email address
```

**Template Location**: `backend/src/services/emailService.ts:227-332`

---

### 6️⃣ Usage Alert Email ⚠️

```
User reaches 80% of monthly limit
        │
        ▼
[backend/src/utils/costProtection.js]
emailService.sendUsageAlert()
        │
        ▼
Custom HTML Template
        │
        ├─ Subject: "SmartPromptIQ Usage Alert"
        ├─ Content: Usage stats + upgrade CTA
        ├─ Variables: {{usagePercentage}}, {{used}}, {{total}}
        └─ Sent to: User's email address
```

**Template Location**: `backend/src/utils/emailService.js:50-65`

---

### 7️⃣ Demo Results Email 🎮

```
User tries demo (no account)
        │
        ▼
POST /api/demo/generate
        │
        ▼
[backend/src/utils/emailService.js:67]
emailService.sendDemoResults()
        │
        ▼
Custom HTML Template
        │
        ├─ Subject: "Your SmartPromptIQ Demo Results 🎮"
        ├─ Content: Generated prompt + signup CTA
        ├─ Variables: {{templateName}}, {{generatedPrompt}}
        └─ Sent to: Demo user's email
```

**Template Location**: `backend/src/utils/emailService.js:67-86`

---

## Email Service Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     Email Service Layers                      │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Main Email Service (TypeScript)                       │
│ File: backend/src/services/emailService.ts                     │
│                                                                 │
│ • SendGrid Integration                                         │
│ • Template System (4 built-in templates)                      │
│ • Variable Replacement Engine                                  │
│ • Error Handling & Logging                                     │
│ • Development Mock Mode                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Compatibility Wrapper (JavaScript)                    │
│ File: backend/src/utils/emailService.js                        │
│                                                                 │
│ • Backward compatibility with old code                         │
│ • Convenience methods (sendWelcomeEmail, etc.)                 │
│ • Legacy API support                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Route Handlers                                        │
│                                                                 │
│ • auth.ts - Signup/verification emails                         │
│ • billing.ts - Subscription emails                             │
│ • generate.ts - Prompt notification emails                     │
│ • Other routes using email service                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## SendGrid Configuration Flow

```
┌──────────────────┐
│  .env File       │
│                  │
│ SENDGRID_API_KEY │──┐
│ FROM_EMAIL       │  │
└──────────────────┘  │
                      │
                      ▼
         ┌─────────────────────────┐
         │ emailService.ts:27-40   │
         │ initialize()            │
         │                         │
         │ if (API_KEY exists)     │
         │   ✅ Configure SendGrid │
         │ else                    │
         │   📧 Mock Mode          │
         └─────────────────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │   SendGrid Client       │
         │   Ready to Send         │
         └─────────────────────────┘
```

---

## Email Template Variable Replacement

```
Template with Variables              Variable Data                  Final Email
────────────────────────────────────────────────────────────────────────────────

Welcome to {{name}}!            +    { name: "John" }       =    Welcome to John!

Dashboard: {{dashboardUrl}}     +    { dashboardUrl:        =    Dashboard:
                                       "https://..."  }            https://...

Your plan: {{planName}}         +    { planName: "Pro" }    =    Your plan: Pro
```

**Replacement Engine**: `emailService.ts:42-49` - `replaceTemplateVariables()`

---

## Email Delivery Status Check

### How to Check if Email Was Sent

```
┌─────────────────────────────┐
│ Option 1: Console Logs      │
│                             │
│ Terminal Output:            │
│ 📧 Email sent successfully  │
│    to user@example.com      │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Option 2: SendGrid Dashboard│
│                             │
│ 1. Login: app.sendgrid.com  │
│ 2. Click: Activity          │
│ 3. Filter: user@example.com │
│ 4. View: Delivery status    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Option 3: User's Inbox      │
│                             │
│ Check email client:         │
│ - Inbox                     │
│ - Spam/Junk folder          │
│ - Promotions tab (Gmail)    │
└─────────────────────────────┘
```

---

## Development vs Production Email Behavior

### Development Mode (EMAIL_ENABLED=false)
```
User Action
    │
    ▼
Email Service Called
    │
    ▼
Check: isConfigured = false
    │
    ▼
📧 Console Log:
   "Email would be sent to user@example.com"
   "Content preview: <!DOCTYPE html>..."
    │
    ▼
✅ Return success (no actual email sent)
```

### Production Mode (EMAIL_ENABLED=true + API Key)
```
User Action
    │
    ▼
Email Service Called
    │
    ▼
Check: isConfigured = true
    │
    ▼
Send to SendGrid API
    │
    ▼
SendGrid processes and delivers
    │
    ▼
📧 Email delivered to user's inbox
    │
    ▼
📊 Track in SendGrid Activity
```

---

## Email Service Methods

```javascript
// Main Email Service Class
class EmailService {

  // Core Methods
  sendEmail(options)                    // Send any email with custom content
  sendTemplateEmail(to, template, data) // Send using built-in template

  // Convenience Methods (High-level)
  sendWelcomeEmail(to, name)                          // 1️⃣ Welcome email
  sendPasswordResetEmail(to, name, token)             // 2️⃣ Password reset
  sendPromptGeneratedEmail(to, name, promptData)      // 3️⃣ Prompt ready
  sendSubscriptionUpgradeEmail(to, name, subData)     // 4️⃣ Upgrade confirmation

  // Utility Methods
  sendTestEmail(to)                     // Test email delivery
  getStatus()                           // Check if SendGrid is configured
}
```

---

## Quick Reference: Where Everything Is

| What | File Location | Line |
|------|--------------|------|
| **SendGrid API Key** | `.env` | 93 |
| **Email Service Class** | `backend/src/services/emailService.ts` | 1-590 |
| **Welcome Template** | `backend/src/services/emailService.ts` | 52-153 |
| **Password Reset Template** | `backend/src/services/emailService.ts` | 155-225 |
| **Prompt Ready Template** | `backend/src/services/emailService.ts` | 227-332 |
| **Upgrade Template** | `backend/src/services/emailService.ts` | 334-427 |
| **Signup Email Trigger** | `backend/src/routes/auth.ts` | 157 |
| **Reset Email Trigger** | `backend/src/routes/auth.ts` | 397 |
| **Legacy Wrapper** | `backend/src/utils/emailService.js` | 1-111 |

---

## Testing Checklist

```
✅ Test Welcome Email
   └─ Sign up new account → Check inbox

✅ Test Verification Email
   └─ Sign up new account → Check for verification link

✅ Test Password Reset
   └─ Click "Forgot Password" → Enter email → Check inbox

✅ Test Subscription Upgrade
   └─ Upgrade to paid plan → Check inbox

✅ Test SendGrid Configuration
   └─ Run: emailService.getStatus()
   └─ Should return: { configured: true, provider: 'SendGrid' }

✅ View Email Activity
   └─ Login to SendGrid Dashboard
   └─ Navigate to Activity tab
   └─ Filter by recipient email
```

---

## Common Email Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Emails not sending** | Check `SENDGRID_API_KEY` in `.env` |
| **Emails in spam** | Verify domain in SendGrid + add SPF/DKIM |
| **"Mock Mode" in logs** | Set `EMAIL_ENABLED=true` in `.env` |
| **Wrong sender email** | Update `FROM_EMAIL` in `.env` |
| **Template not found** | Check template name matches key in `getEmailTemplate()` |

---

## Where to Get Your Emails

### For Testing/Development:
1. **Use your personal email** when signing up
2. **Check console logs** for email content preview
3. **Use Mailtrap.io** for email testing inbox

### For Production:
1. **SendGrid Dashboard**: https://app.sendgrid.com/ → Activity
2. **User's actual inbox**: Gmail, Outlook, etc.
3. **SendGrid Email Activity API**: For programmatic access

---

## Summary Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                  SmartPromptIQ Email System                    │
│                                                                │
│  Provider: SendGrid ✅                                        │
│  API Key: Configured ✅                                       │
│  Templates: 4 Built-in ✅                                     │
│  Sender: noreply@smartpromptiq.com                           │
│                                                                │
│  Emails Sent:                                                  │
│  1. Welcome Email 🚀 (on signup)                              │
│  2. Email Verification 📬 (on signup)                         │
│  3. Password Reset 🔐 (on request)                            │
│  4. Upgrade Confirmation 🚀 (on payment)                      │
│  5. Prompt Ready 🎉 (on generation)                           │
│  6. Usage Alert ⚠️ (at 80% limit)                            │
│  7. Demo Results 🎮 (on demo use)                             │
│                                                                │
│  View Emails: SendGrid Dashboard → Activity                   │
│  Test Emails: emailService.sendTestEmail('your@email.com')   │
│  Status Check: emailService.getStatus()                       │
└────────────────────────────────────────────────────────────────┘
```

**All email documentation**: [EMAIL-SETUP-GUIDE.md](EMAIL-SETUP-GUIDE.md)
