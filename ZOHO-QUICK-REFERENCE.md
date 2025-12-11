# Zoho Email Quick Reference Card

Quick commands and settings for SmartPromptIQ Zoho email configuration.

---

## 🔑 Quick Links

| Resource | Link |
|----------|------|
| **Zoho Mail Login** | https://mail.zoho.com/ |
| **Generate App Password** | Settings → Security → App-Specific Passwords |
| **Zoho SMTP Docs** | https://www.zoho.com/mail/help/zoho-smtp.html |
| **Railway Dashboard** | https://railway.app/ |

---

## ⚙️ SMTP Settings

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465 (SSL) or 587 (TLS)
MAIL_SECURE=true (for 465) or false (for 587)
SMTP_USER=noreply@smartpromptiq.com
SMTP_PASS=your-app-specific-password
```

---

## 📋 Environment Variables Checklist

```env
✅ EMAIL_ENABLED=true
✅ MAIL_PROVIDER=smtp
✅ SMTP_HOST=smtp.zoho.com
✅ SMTP_PORT=465
✅ MAIL_SECURE=true
✅ SMTP_USER=noreply@smartpromptiq.com
✅ SMTP_PASS=your-password
✅ FROM_EMAIL=noreply@smartpromptiq.com
✅ FROM_NAME=SmartPromptIQ
✅ REPLY_TO=support@smartpromptiq.com
✅ APP_NAME=SmartPromptIQ
✅ SMTP_TLS_REJECT_UNAUTHORIZED=true
```

---

## 🧪 Test Commands

### Local Testing
```bash
# Method 1: Test script
node test-zoho-email.js your@email.com

# Method 2: API endpoint
curl -X POST http://localhost:5000/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com"}'

# Method 3: Check status
curl http://localhost:5000/api/utils/email-status
```

### Production Testing
```bash
curl -X POST https://your-app.railway.app/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com"}'
```

---

## 🚀 Railway Commands

### Set Single Variable
```powershell
railway variables --service "SmartPromptiq-pro" --set SMTP_PASS=your-password
```

### Set All Variables (PowerShell)
```powershell
.\set-railway-email-vars.ps1
```

### View Variables
```bash
railway variables --service "SmartPromptiq-pro"
```

### Deploy
```bash
railway up --service "SmartPromptiq-pro"
```

---

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| **Authentication Failed** | Use App-Specific Password, not regular password |
| **Connection Timeout** | Try port 587 with MAIL_SECURE=false |
| **Mock Mode Active** | Check all env vars are set, restart server |
| **Emails in Spam** | Add SPF: `v=spf1 include:zoho.com ~all` |
| **Service Not Found** | Use `"SmartPromptiq-pro"` (with quotes) |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/.env` | Local environment variables |
| `/backend/.env` | Backend environment variables |
| `/test-zoho-email.js` | Test script |
| `/set-railway-email-vars.ps1` | Railway setup script |
| `/ZOHO-EMAIL-SETUP-GUIDE.md` | Full setup guide |
| `/SETUP-ZOHO-PASSWORD.md` | Quick start guide |

---

## 🔄 Switch Between Providers

### Use Zoho SMTP
```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.zoho.com
```

### Use SendGrid
```env
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx
```

### Use Gmail
```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
MAIL_SECURE=false
```

---

## 📧 Email Templates Available

| Template | Trigger |
|----------|---------|
| **Welcome** | User signs up |
| **Password Reset** | User requests reset |
| **Prompt Generated** | AI prompt complete |
| **Subscription Upgrade** | User upgrades plan |

---

## 🔍 Check Email Service Status

### In Code
```typescript
const emailService = require('./backend/src/services/emailService').default;
console.log(emailService.getStatus());
```

### Via API
```bash
curl http://localhost:5000/api/utils/email-status
```

### Expected Output
```json
{
  "configured": true,
  "provider": "smtp",
  "host": "smtp.zoho.com",
  "port": "465",
  "secure": true,
  "from": "noreply@smartpromptiq.com"
}
```

---

## 🎯 Quick Start (5 Minutes)

1. **Get Zoho Password** (2 min)
   - Go to Zoho Mail → Settings → Security → App Passwords
   - Generate new password for "SmartPromptIQ"

2. **Update Local .env** (30 sec)
   - Replace `REPLACE_WITH_ZOHO_APP_PASSWORD` with actual password
   - Do this in both `/.env` and `/backend/.env`

3. **Test Locally** (1 min)
   ```bash
   npm run dev
   node test-zoho-email.js your@email.com
   ```

4. **Deploy to Railway** (1 min)
   ```powershell
   .\set-railway-email-vars.ps1
   ```

5. **Test Production** (30 sec)
   ```bash
   curl -X POST https://your-app.railway.app/api/utils/test-email \
     -H "Content-Type: application/json" \
     -d '{"to":"your@email.com"}'
   ```

---

## 💡 Pro Tips

- ✅ Always use **App-Specific Passwords** for security
- ✅ Test locally before deploying to production
- ✅ Monitor Zoho dashboard for bounce rates
- ✅ Add SPF/DKIM/DMARC DNS records for better deliverability
- ✅ Keep `SMTP_TLS_REJECT_UNAUTHORIZED=true` in production

---

## 📞 Get Help

- **Setup Issues**: See [SETUP-ZOHO-PASSWORD.md](SETUP-ZOHO-PASSWORD.md)
- **Detailed Guide**: See [ZOHO-EMAIL-SETUP-GUIDE.md](ZOHO-EMAIL-SETUP-GUIDE.md)
- **Implementation**: See [ZOHO-IMPLEMENTATION-SUMMARY.md](ZOHO-IMPLEMENTATION-SUMMARY.md)
- **Zoho Support**: https://help.zoho.com/portal/en/kb/mail

---

*Keep this reference handy for quick lookups!*
