/**
 * Test script for Zoho SMTP email configuration
 *
 * Usage:
 *   node test-zoho-email.js your-email@example.com
 *
 * Or just run:
 *   node test-zoho-email.js
 *
 * It will prompt you for an email address.
 */

require('dotenv').config();

async function testEmailService() {
  console.log('\n🧪 Testing Zoho Email Configuration for SmartPromptIQ\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check environment variables
  console.log('📋 Checking environment variables...\n');

  const requiredVars = {
    'EMAIL_ENABLED': process.env.EMAIL_ENABLED,
    'MAIL_PROVIDER': process.env.MAIL_PROVIDER,
    'SMTP_HOST': process.env.SMTP_HOST,
    'SMTP_PORT': process.env.SMTP_PORT,
    'MAIL_SECURE': process.env.MAIL_SECURE,
    'SMTP_USER': process.env.SMTP_USER,
    'SMTP_PASS': process.env.SMTP_PASS ? '***********' : undefined,
    'FROM_EMAIL': process.env.FROM_EMAIL,
    'FROM_NAME': process.env.FROM_NAME,
    'REPLY_TO': process.env.REPLY_TO,
  };

  let allConfigured = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      console.log(`  ✅ ${key}: ${value}`);
    } else {
      console.log(`  ❌ ${key}: NOT SET`);
      allConfigured = false;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  if (!allConfigured) {
    console.log('❌ Some required environment variables are missing!');
    console.log('\n📖 Please check the ZOHO-EMAIL-SETUP-GUIDE.md for setup instructions.\n');
    process.exit(1);
  }

  // Get email address from command line or prompt
  const testEmail = process.argv[2];

  if (!testEmail) {
    console.log('❌ Please provide an email address to test:');
    console.log('   node test-zoho-email.js your-email@example.com\n');
    process.exit(1);
  }

  console.log(`📧 Testing email service by sending to: ${testEmail}\n`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Import email service
    const emailService = require('./backend/src/services/emailService').default;

    // Check status
    console.log('📊 Email Service Status:');
    const status = emailService.getStatus();
    console.log(`   Provider: ${status.provider}`);
    console.log(`   Configured: ${status.configured ? '✅ Yes' : '❌ No'}\n`);

    if (!status.configured) {
      console.log('❌ Email service is not configured!\n');
      process.exit(1);
    }

    // Test 1: Send test email
    console.log('🧪 Test 1: Sending test email...');
    const testResult = await emailService.sendTestEmail(testEmail);
    console.log(`   ${testResult ? '✅' : '❌'} Test email ${testResult ? 'sent successfully' : 'failed'}\n`);

    // Test 2: Send welcome email
    console.log('🧪 Test 2: Sending welcome email template...');
    const welcomeResult = await emailService.sendWelcomeEmail(testEmail, 'Test User');
    console.log(`   ${welcomeResult ? '✅' : '❌'} Welcome email ${welcomeResult ? 'sent successfully' : 'failed'}\n`);

    // Test 3: Send password reset email
    console.log('🧪 Test 3: Sending password reset email template...');
    const resetResult = await emailService.sendPasswordResetEmail(testEmail, 'Test User', 'test-token-123');
    console.log(`   ${resetResult ? '✅' : '❌'} Password reset email ${resetResult ? 'sent successfully' : 'failed'}\n`);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🎉 Email test completed!\n');
    console.log(`📬 Check your inbox at: ${testEmail}\n`);
    console.log('💡 Tips:');
    console.log('   - Check spam/junk folder if you don\'t see emails');
    console.log('   - Verify your Zoho App Password is correct');
    console.log('   - Check console logs for detailed error messages\n');

  } catch (error) {
    console.error('\n❌ Email test failed with error:\n');
    console.error(error);
    console.log('\n📖 Troubleshooting steps:');
    console.log('   1. Verify your Zoho App Password is correct');
    console.log('   2. Check if you\'re using the correct SMTP host for your region');
    console.log('   3. Try port 587 with MAIL_SECURE=false if port 465 is blocked');
    console.log('   4. Check the ZOHO-EMAIL-SETUP-GUIDE.md for more help\n');
    process.exit(1);
  }
}

// Run the test
testEmailService().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
