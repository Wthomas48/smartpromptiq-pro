# Zoho Email Setup Guide for SmartPromptIQ

This guide will walk you through setting up Zoho SMTP for sending emails in SmartPromptIQ Pro.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Zoho Configuration](#zoho-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing Email Configuration](#testing-email-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Alternative Providers](#alternative-providers)

---

## Prerequisites

- A Zoho Mail account (free or paid)
- Domain configured with Zoho Mail (e.g., `smartpromptiq.com`)
- Access to your `.env` file

---

## Quick Setup

### Step 1: Generate Zoho App Password

1. Log in to [Zoho Mail](https://mail.zoho.com/)
2. Go to **Settings** → **Security** → **App-Specific Passwords**
3. Click **Generate New Password**
4. Give it a name (e.g., "SmartPromptIQ SMTP")
5. Copy the generated password (you won't see it again!)

### Step 2: Update Your `.env` File

Add these variables to your `.env` file:

```env
# =======================
# EMAIL CONFIGURATION
# =======================
# Email provider toggle: sendgrid or smtp
EMAIL_ENABLED=true
MAIL_PROVIDER=smtp

# --- SMTP Configuration (Zoho)
# Zoho SMTP (US datacenter)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
MAIL_SECURE=true

# --- Auth (use your Zoho App Password)
SMTP_USER=noreply@smartpromptiq.com
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD_HERE

# --- From / branding
FROM_EMAIL=noreply@smartpromptiq.com
FROM_NAME=SmartPromptIQ
REPLY_TO=support@smartpromptiq.com
APP_NAME=SmartPromptIQ

# --- Optional TLS settings
SMTP_TLS_REJECT_UNAUTHORIZED=true
```

### Step 3: Test Your Configuration

Start your server and test the email:

```bash
# Start the backend server
cd backend
npm run dev
```

Use curl or Postman to test:

```bash
curl -X POST http://localhost:5000/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

Or check the status:

```bash
curl http://localhost:5000/api/utils/email-status
```

---

## Zoho Configuration

### Zoho SMTP Settings

| Setting | Value |
|---------|-------|
| **Host** | `smtp.zoho.com` |
| **Port (SSL)** | `465` |
| **Port (TLS)** | `587` |
| **Secure** | `true` for 465, `false` for 587 |
| **Authentication** | Required |

### Zoho Data Centers

If you're not in the US, you may need to use a different SMTP server:

| Region | SMTP Host |
|--------|-----------|
| US | `smtp.zoho.com` |
| Europe | `smtp.zoho.eu` |
| India | `smtp.zoho.in` |
| Australia | `smtp.zoho.com.au` |
| China | `smtp.zoho.com.cn` |
| Japan | `smtp.zoho.jp` |

### Creating App-Specific Password

1. **Log in to Zoho Mail**: https://mail.zoho.com/
2. **Navigate to Security Settings**:
   - Click your profile picture (top right)
   - Select **My Account**
   - Go to **Security** tab
   - Find **App-Specific Passwords**
3. **Generate Password**:
   - Click **Generate New Password**
   - Name it: `SmartPromptIQ SMTP`
   - Copy the password immediately
4. **Use in `.env`**:
   - Replace `YOUR_ZOHO_APP_PASSWORD_HERE` with the generated password

> ⚠️ **Important**: Never use your main Zoho account password for SMTP. Always use an app-specific password for security.

---

## Environment Variables

### Required Variables

```env
EMAIL_ENABLED=true              # Enable email service
MAIL_PROVIDER=smtp              # Use SMTP (not SendGrid)
SMTP_HOST=smtp.zoho.com         # Zoho SMTP server
SMTP_PORT=465                   # Port 465 for SSL
MAIL_SECURE=true                # Use SSL/TLS
SMTP_USER=noreply@smartpromptiq.com  # Your Zoho email
SMTP_PASS=YOUR_APP_PASSWORD     # Zoho app-specific password
FROM_EMAIL=noreply@smartpromptiq.com # Sender email
```

### Optional Variables

```env
FROM_NAME=SmartPromptIQ         # Sender name
REPLY_TO=support@smartpromptiq.com  # Reply-to address
APP_NAME=SmartPromptIQ          # App name in emails
SMTP_TLS_REJECT_UNAUTHORIZED=true  # Strict TLS validation
```

### Port Configuration

**Using Port 465 (SSL - Recommended)**:
```env
SMTP_PORT=465
MAIL_SECURE=true
```

**Using Port 587 (STARTTLS)**:
```env
SMTP_PORT=587
MAIL_SECURE=false
```

> 💡 **Note**: If your hosting provider blocks port 465, use port 587 instead.

---

## Testing Email Configuration

### Method 1: Using the API Endpoint

Start your server and test with curl:

```bash
# Test sending an email
curl -X POST http://localhost:5000/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'

# Check email configuration status
curl http://localhost:5000/api/utils/email-status
```

### Method 2: Using the Email Service Directly

Create a test file `test-zoho-email.js` in your backend directory:

```javascript
require('dotenv').config();
const emailService = require('./src/services/emailService').default;

async function testEmail() {
  console.log('Testing Zoho email configuration...');
  console.log('Status:', emailService.getStatus());

  // Test welcome email
  const result = await emailService.sendWelcomeEmail(
    'your-email@example.com',
    'Test User'
  );

  console.log('Email sent:', result);
}

testEmail();
```

Run the test:

```bash
node test-zoho-email.js
```

### Method 3: Using the Standalone Mailer

Create a test file `test-mailer.js`:

```javascript
require('dotenv').config();
const { sendEmail } = require('./src/lib/mailer');

async function test() {
  const result = await sendEmail({
    to: 'your-email@example.com',
    subject: 'Test from SmartPromptIQ',
    html: '<h1>Test Email</h1><p>Zoho SMTP is working!</p>',
    text: 'Test Email - Zoho SMTP is working!'
  });

  console.log('Result:', result);
}

test().catch(console.error);
```

Run the test:

```bash
node test-mailer.js
```

### Expected Output

**Success:**
```
📧 Email service configured with SMTP (smtp.zoho.com:465)
📧 Email sent via SMTP to your-email@example.com: Test Email
📧 Message ID: <message-id@zoho.com>
```

**Error (Missing Configuration):**
```
⚠️ SMTP configuration incomplete - emails will be logged only
Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
📧 [Mock] Email would be sent to your-email@example.com: Test Email
```

---

## Troubleshooting

### Common Issues

#### 1. Authentication Failed

**Error**: `Invalid login` or `Authentication failed`

**Solutions**:
- Make sure you're using an **App-Specific Password**, not your main Zoho password
- Verify the email address matches your Zoho account
- Check that the password is copied correctly (no extra spaces)

#### 2. Connection Timeout

**Error**: `Connection timeout` or `ETIMEDOUT`

**Solutions**:
- Check if your hosting provider blocks port 465
- Try using port 587 with `MAIL_SECURE=false`
- Verify your firewall settings
- Test your network connection to smtp.zoho.com

#### 3. TLS/SSL Errors

**Error**: `self signed certificate` or `unable to verify the first certificate`

**Solutions**:
- For development only, set `SMTP_TLS_REJECT_UNAUTHORIZED=false`
- For production, keep it `true` and fix the TLS certificate chain
- Update your Node.js version to the latest LTS

#### 4. Wrong Data Center

**Error**: `Cannot connect to smtp.zoho.com`

**Solutions**:
- Check if you're using the correct Zoho data center
- If you're in Europe, use `smtp.zoho.eu`
- If you're in India, use `smtp.zoho.in`
- See [Zoho Data Centers](#zoho-data-centers) section

#### 5. Emails Going to Spam

**Solutions**:
- Add SPF record to your domain DNS:
  ```
  v=spf1 include:zoho.com ~all
  ```
- Add DKIM records (provided by Zoho in Settings → Domains → DKIM)
- Add DMARC record to your domain:
  ```
  v=DMARC1; p=quarantine; rua=mailto:admin@smartpromptiq.com
  ```
- Ensure FROM_EMAIL matches your domain

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

Then check your console for detailed SMTP connection logs.

---

## Alternative Providers

The email service also supports other providers. Simply change the SMTP settings:

### Gmail

```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
MAIL_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

> 📌 **Note**: Enable 2FA and generate an [App Password](https://myaccount.google.com/apppasswords) for Gmail.

### Outlook/Office 365

```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
MAIL_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
FROM_EMAIL=your-email@outlook.com
```

### SendGrid (Previous Setup)

```env
MAIL_PROVIDER=sendgrid
EMAIL_ENABLED=true
SENDGRID_API_KEY=SG.your-api-key
FROM_EMAIL=noreply@smartpromptiq.com
FROM_NAME=SmartPromptIQ
```

---

## Production Deployment

### Railway / Heroku / Vercel

Add these environment variables in your hosting platform:

1. Go to your project settings
2. Add environment variables:
   - `EMAIL_ENABLED=true`
   - `MAIL_PROVIDER=smtp`
   - `SMTP_HOST=smtp.zoho.com`
   - `SMTP_PORT=465`
   - `MAIL_SECURE=true`
   - `SMTP_USER=noreply@smartpromptiq.com`
   - `SMTP_PASS=your-app-password`
   - `FROM_EMAIL=noreply@smartpromptiq.com`
   - `FROM_NAME=SmartPromptIQ`
   - `REPLY_TO=support@smartpromptiq.com`

3. Redeploy your application

### Verify Production Emails

Test production deployment:

```bash
curl -X POST https://your-app.railway.app/api/utils/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## Email Templates

The email service includes professional templates for:

1. **Welcome Email** - Sent when users sign up
2. **Password Reset** - Sent when users request password reset
3. **Prompt Generated** - Sent when AI prompt is ready
4. **Subscription Upgrade** - Sent when users upgrade their plan

All templates are located in: [`backend/src/services/emailService.ts`](backend/src/services/emailService.ts)

---

## Security Best Practices

1. ✅ **Always use App-Specific Passwords** - Never use your main account password
2. ✅ **Keep TLS validation enabled** in production (`SMTP_TLS_REJECT_UNAUTHORIZED=true`)
3. ✅ **Use environment variables** - Never commit passwords to git
4. ✅ **Add SPF/DKIM/DMARC** records to your domain
5. ✅ **Monitor bounce rates** - Remove invalid email addresses
6. ✅ **Rate limit email sending** - Avoid being flagged as spam
7. ✅ **Use a dedicated email** for sending (e.g., `noreply@`)

---

## Support

### Zoho Support

- **Help Center**: https://help.zoho.com/portal/en/kb/mail
- **SMTP Documentation**: https://www.zoho.com/mail/help/zoho-smtp.html
- **Contact Support**: https://help.zoho.com/portal/en/newticket

### SmartPromptIQ Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your `.env` configuration
3. Test with the `/api/utils/test-email` endpoint
4. Review this documentation
5. Check the [Troubleshooting](#troubleshooting) section

---

## Summary

You now have Zoho SMTP configured for SmartPromptIQ! Here's what you set up:

- ✅ Zoho SMTP connection with app-specific password
- ✅ Email service supporting both SendGrid and SMTP
- ✅ Professional email templates
- ✅ Test endpoints for verification
- ✅ Production-ready configuration

**Next Steps**:
1. Generate your Zoho App Password
2. Update your `.env` file
3. Test the email configuration
4. Deploy to production
5. Monitor email deliverability

🎉 **You're all set!**
