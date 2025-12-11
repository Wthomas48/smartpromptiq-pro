# Quick Start: Set Up Zoho Email Password

This guide will help you quickly set up Zoho email for SmartPromptIQ in just a few minutes.

---

## 🎯 Step 1: Generate Zoho App Password (2 minutes)

### 1.1 Log into Zoho Mail
Go to: **https://mail.zoho.com/**

### 1.2 Navigate to Security Settings
1. Click your **profile picture** (top right corner)
2. Select **My Account**
3. Click the **Security** tab
4. Scroll down to **App-Specific Passwords**

### 1.3 Generate New Password
1. Click **Generate New Password**
2. Name it: `SmartPromptIQ SMTP`
3. Click **Generate**
4. **COPY THE PASSWORD IMMEDIATELY** - You won't see it again!
   - It will look like: `abcd1234efgh5678ijkl9012`

> ⚠️ **IMPORTANT**: This is NOT your regular Zoho password. This is a special app-specific password for SMTP.

---

## 🔧 Step 2: Update Local Configuration (30 seconds)

### Option A: Edit .env Files Manually

**File 1: `/SmartPromptiq-pro/.env`**
Find this line:
```env
SMTP_PASS=REPLACE_WITH_ZOHO_APP_PASSWORD
```

Replace with your actual password:
```env
SMTP_PASS=abcd1234efgh5678ijkl9012
```

**File 2: `/SmartPromptiq-pro/backend/.env`**
Do the same thing - replace `REPLACE_WITH_ZOHO_APP_PASSWORD` with your actual password.

### Option B: Use PowerShell Script

Open PowerShell in the project root and run:
```powershell
# The script will prompt you for the password
.\set-railway-email-vars.ps1
```

---

## ☁️ Step 3: Update Railway Production (2 minutes)

### Option A: Use the PowerShell Script (Recommended)
```powershell
.\set-railway-email-vars.ps1
```
- The script will prompt you for your Zoho password
- It will automatically set all Railway environment variables

### Option B: Set Variables Manually in Railway Dashboard

1. Go to: **https://railway.app/project/your-project**
2. Click on your **SmartPromptiq-pro** service
3. Go to **Variables** tab
4. Click **+ New Variable** and add each one:

```
EMAIL_ENABLED=true
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
MAIL_SECURE=true
SMTP_USER=noreply@smartpromptiq.com
SMTP_PASS=your-zoho-app-password-here
FROM_EMAIL=noreply@smartpromptiq.com
FROM_NAME=SmartPromptIQ
REPLY_TO=support@smartpromptiq.com
APP_NAME=SmartPromptIQ
SMTP_TLS_REJECT_UNAUTHORIZED=true
```

5. Click **Deploy** to restart with new variables

### Option C: Use Railway CLI
```powershell
railway variables --service "SmartPromptiq-pro" --set EMAIL_ENABLED=true
railway variables --service "SmartPromptiq-pro" --set MAIL_PROVIDER=smtp
railway variables --service "SmartPromptiq-pro" --set SMTP_HOST=smtp.zoho.com
railway variables --service "SmartPromptiq-pro" --set SMTP_PORT=465
railway variables --service "SmartPromptiq-pro" --set MAIL_SECURE=true
railway variables --service "SmartPromptiq-pro" --set SMTP_USER=noreply@smartpromptiq.com
railway variables --service "SmartPromptiq-pro" --set SMTP_PASS=your-password-here
railway variables --service "SmartPromptiq-pro" --set FROM_EMAIL=noreply@smartpromptiq.com
railway variables --service "SmartPromptiq-pro" --set FROM_NAME=SmartPromptIQ
railway variables --service "SmartPromptiq-pro" --set REPLY_TO=support@smartpromptiq.com
railway variables --service "SmartPromptiq-pro" --set APP_NAME=SmartPromptIQ
railway variables --service "SmartPromptiq-pro" --set SMTP_TLS_REJECT_UNAUTHORIZED=true
```

---

## ✅ Step 4: Test Email Configuration (1 minute)

### Test Locally
```bash
# Start your local server
npm run dev

# In another terminal, test the email
node test-zoho-email.js your-email@example.com
```

Or use curl:
```bash
curl -X POST http://localhost:5000/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

### Test Production
```bash
curl -X POST https://your-app.railway.app/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## 🎉 You're Done!

Your email configuration is now complete. Here's what happens now:

- ✅ Welcome emails will be sent when users sign up
- ✅ Password reset emails will work
- ✅ Prompt generated notifications will be sent
- ✅ Subscription upgrade confirmations will work

---

## 🐛 Troubleshooting

### "Authentication Failed" Error

**Problem**: Invalid credentials

**Solution**:
- Make sure you're using the **App-Specific Password**, not your regular Zoho password
- Double-check there are no extra spaces when you copied the password
- Generate a new App-Specific Password and try again

### "Connection Timeout" Error

**Problem**: Port 465 is blocked

**Solution**: Try using port 587 instead:
```env
SMTP_PORT=587
MAIL_SECURE=false
```

### Emails Going to Spam

**Solution**: Add these DNS records to your domain:

**SPF Record**:
```
v=spf1 include:zoho.com ~all
```

**DKIM Record**:
Get this from Zoho Mail → Settings → Domains → DKIM

**DMARC Record**:
```
v=DMARC1; p=quarantine; rua=mailto:admin@smartpromptiq.com
```

### Still Not Working?

1. Check console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the server after changing .env
4. Test with the test endpoint: `/api/utils/test-email`
5. Check [ZOHO-EMAIL-SETUP-GUIDE.md](ZOHO-EMAIL-SETUP-GUIDE.md) for detailed troubleshooting

---

## 📚 Additional Resources

- **Full Setup Guide**: [ZOHO-EMAIL-SETUP-GUIDE.md](ZOHO-EMAIL-SETUP-GUIDE.md)
- **Implementation Details**: [ZOHO-IMPLEMENTATION-SUMMARY.md](ZOHO-IMPLEMENTATION-SUMMARY.md)
- **Test Script**: `test-zoho-email.js`
- **Zoho SMTP Docs**: https://www.zoho.com/mail/help/zoho-smtp.html

---

## 🔒 Security Tips

1. ✅ **Never commit** your Zoho App Password to git
2. ✅ **Use environment variables** only
3. ✅ **Regenerate passwords** if exposed
4. ✅ **Keep TLS validation enabled** in production
5. ✅ **Monitor bounce rates** in Zoho dashboard

---

## 📞 Support

If you need help:
- Check the [Troubleshooting](#-troubleshooting) section above
- Review [ZOHO-EMAIL-SETUP-GUIDE.md](ZOHO-EMAIL-SETUP-GUIDE.md)
- Test with `/api/utils/test-email` endpoint
- Check Zoho Mail dashboard for blocked emails

**Zoho Support**: https://help.zoho.com/portal/en/kb/mail

---

*Setup time: ~5 minutes total*
*Last updated: 2024-01-30*
