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
  getStatus: () => emailService.getStatus(),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BILLING EMAIL METHODS - For webhook handlers
  // ═══════════════════════════════════════════════════════════════════════════════

  // Subscription confirmation (accepts email string directly from webhooks)
  sendSubscriptionConfirmation: (emailOrUser, data) => {
    const email = typeof emailOrUser === 'string' ? emailOrUser : emailOrUser.email;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return emailService.sendEmail({
      to: email,
      subject: `Welcome to SmartPromptIQ ${data.plan || 'Pro'}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to ${data.plan || 'Pro'}! 🚀</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Your subscription is now active!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <p><strong>Plan:</strong> ${data.plan || 'Pro'}</p>
              <p><strong>Billing Cycle:</strong> ${data.billingCycle || 'Monthly'}</p>
              <p><strong>Next Billing Date:</strong> ${data.nextBillingDate ? new Date(data.nextBillingDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <p style="color: #6b7280;">You now have full access to all ${data.plan || 'Pro'} features. Start creating amazing content!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard" style="background: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
            </div>
            <p style="color: #9ca3af; font-size: 14px;">Questions? Reply to this email or visit our <a href="${baseUrl}/support" style="color: #4F46E5;">support page</a>.</p>
          </div>
        </div>
      `
    });
  },

  sendSubscriptionCancellation: (email, data) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return emailService.sendEmail({
      to: email,
      subject: 'Your SmartPromptIQ Subscription Has Been Canceled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #374151; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Subscription Canceled</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">We're sorry to see you go!</p>
            <p style="color: #6b7280;">Your subscription has been canceled${data.effectiveDate ? ' as of ' + new Date(data.effectiveDate).toLocaleDateString() : ''}.</p>
            <p style="color: #6b7280;">Your account has been downgraded to the Free plan. You can still access basic features.</p>
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; color: #92400E;"><strong>Changed your mind?</strong> You can resubscribe anytime to get back all your premium features.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/pricing" style="background: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Plans</a>
            </div>
            <p style="color: #9ca3af; font-size: 14px;">We'd love to hear your feedback! Reply to this email to let us know how we can improve.</p>
          </div>
        </div>
      `
    });
  },

  sendPaymentReceipt: (email, data) => {
    return emailService.sendEmail({
      to: email,
      subject: 'SmartPromptIQ Payment Receipt - $' + (data.amount ? data.amount.toFixed(2) : '0.00'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #10B981; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Successful ✓</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Thank you for your payment!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> $${data.amount ? data.amount.toFixed(2) : '0.00'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Invoice ID:</strong> ${data.invoiceId || 'N/A'}</p>
              <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${data.invoiceUrl ? '<div style="text-align: center; margin: 20px 0;"><a href="' + data.invoiceUrl + '" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Invoice</a></div>' : ''}
            <p style="color: #9ca3af; font-size: 14px;">This receipt was sent to ${email}. Keep it for your records.</p>
          </div>
        </div>
      `
    });
  },

  sendPaymentFailed: (email, data) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return emailService.sendEmail({
      to: email,
      subject: '⚠️ SmartPromptIQ Payment Failed - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #EF4444; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Failed</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">We couldn't process your subscription payment.</p>
            <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <p style="margin: 0; color: #991B1B;"><strong>Attempt ${data.attemptCount || 1}</strong> - We'll retry automatically${data.nextRetryDate ? ' on ' + new Date(data.nextRetryDate).toLocaleDateString() : ' soon'}.</p>
            </div>
            <p style="color: #6b7280;">To avoid service interruption, please update your payment method:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.updatePaymentUrl || baseUrl + '/billing'}" style="background: #EF4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Update Payment Method</a>
            </div>
            <p style="color: #9ca3af; font-size: 14px;">If you've already updated your payment method, you can ignore this email.</p>
          </div>
        </div>
      `
    });
  },

  sendPaymentActionRequired: (email, data) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return emailService.sendEmail({
      to: email,
      subject: '🔐 SmartPromptIQ Payment Requires Your Action',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #F59E0B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Action Required</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Your bank requires additional verification to complete this payment.</p>
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; color: #92400E;">This is a security measure (3D Secure) required by your bank. Please complete the verification to continue your subscription.</p>
            </div>
            ${data.dueDate ? '<p style="color: #6b7280;">Please complete by: <strong>' + new Date(data.dueDate).toLocaleDateString() + '</strong></p>' : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.invoiceUrl || baseUrl + '/billing'}" style="background: #F59E0B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Complete Verification</a>
            </div>
            <p style="color: #9ca3af; font-size: 14px;">Need help? Contact us at support@smartpromptiq.com</p>
          </div>
        </div>
      `
    });
  },

  sendTokenPurchaseConfirmation: (email, data) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return emailService.sendEmail({
      to: email,
      subject: '🎉 ' + data.tokenCount + ' Tokens Added to Your Account!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Tokens Added! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Your token purchase was successful!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 36px; font-weight: bold; color: #10B981; margin: 0;">+${data.tokenCount}</p>
              <p style="color: #6b7280; margin: 10px 0 0 0;">tokens added</p>
            </div>
            <div style="background: #ECFDF5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #047857;"><strong>New Balance:</strong> ${data.newBalance} tokens</p>
            </div>
            <p style="color: #6b7280;">Your tokens are ready to use. They're valid for 90 days.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard" style="background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Creating</a>
            </div>
          </div>
        </div>
      `
    });
  }
};