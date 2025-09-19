// Import the TypeScript email service
const emailService = require('../services/emailService').default;

// Export methods that match the existing interface for backward compatibility
module.exports = {
  // Main send method
  sendEmail: (options) => emailService.sendEmail(options),

  // Template method
  sendTemplateEmail: (to, templateName, data) => emailService.sendTemplateEmail(to, templateName, data),

  // Convenience methods for backward compatibility
  sendWelcomeEmail: (user) => emailService.sendWelcomeEmail(user.email, user.firstName || user.name || 'User'),

  sendEmailVerification: (user, verificationLink) => emailService.sendEmail({
    to: user.email,
    subject: 'Verify your SmartPromptIQ account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify Your Email Address</h2>
        <p>Hi ${user.firstName || user.name || 'there'},</p>
        <p>Please verify your email address to complete your SmartPromptIQ registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The SmartPromptIQ Team</p>
      </div>
    `
  }),

  sendPasswordReset: (user, resetLink) => emailService.sendPasswordResetEmail(
    user.email,
    user.firstName || user.name || 'User',
    resetLink.split('token=')[1] || resetLink
  ),

  sendSubscriptionConfirmation: (user, subscriptionData) => emailService.sendSubscriptionUpgradeEmail(
    user.email,
    user.firstName || user.name || 'User',
    {
      planName: subscriptionData.planName || 'Pro',
      generationsLimit: subscriptionData.monthlyPrompts || 1000,
      amount: subscriptionData.amount || '29.99',
      billingCycle: 'Monthly',
      nextBillingDate: subscriptionData.nextBilling || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }
  ),

  sendUsageAlert: (user, usageData) => emailService.sendEmail({
    to: user.email,
    subject: 'SmartPromptIQ Usage Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Usage Alert</h2>
        <p>Hi ${user.firstName || user.name || 'there'},</p>
        <p>You've used ${usageData.usagePercentage}% of your monthly prompt limit (${usageData.used}/${usageData.total}).</p>
        <p>Consider upgrading your plan to avoid any interruption in service.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Upgrade Plan</a>
        </div>
        <p>Best regards,<br>The SmartPromptIQ Team</p>
      </div>
    `
  }),

  sendDemoResults: (email, demoData) => emailService.sendEmail({
    to: email,
    subject: 'Your SmartPromptIQ Demo Results 🎮',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Your Demo Results 🎮</h2>
        <p>Hi there,</p>
        <p>Thanks for trying SmartPromptIQ! Here are your demo results:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${demoData.templateName}</h3>
          <pre style="background: white; padding: 15px; border-radius: 6px; overflow-x: auto;">${demoData.generatedPrompt}</pre>
        </div>
        <p>Ready to create more amazing prompts?</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/register" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Sign Up Free</a>
        </div>
        <p>Best regards,<br>The SmartPromptIQ Team</p>
      </div>
    `
  }),

  sendContactFormNotification: (contactData) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartpromptiq.com';
    return emailService.sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${contactData.name} (${contactData.email})</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Message:</h3>
            <p>${contactData.message}</p>
          </div>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });
  },

  // Additional methods
  sendTestEmail: (to) => emailService.sendTestEmail(to),
  getStatus: () => emailService.getStatus()
};