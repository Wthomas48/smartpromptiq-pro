"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailService_1 = __importDefault(require("../services/emailService"));
const router = (0, express_1.Router)();
/**
 * POST /api/contact
 * Submit contact form - sends email to support team
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, category, message } = req.body;
        // Validate required fields
        if (!name || !email || !subject || !category || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address',
            });
        }
        // Category labels for email
        const categoryLabels = {
            general: 'General Inquiry',
            support: 'Technical Support',
            billing: 'Billing & Payments',
            academy: 'Academy Questions',
            feedback: 'Feedback & Suggestions',
            partnership: 'Partnership Opportunities',
            bug: 'Bug Report',
            other: 'Other',
        };
        const categoryLabel = categoryLabels[category] || category;
        // Prepare email content
        const emailSubject = `[${categoryLabel}] ${subject}`;
        const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              Contact Information
            </h2>

            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong style="color: #4b5563;">Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong style="color: #4b5563;">Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
              <p style="margin: 10px 0;"><strong style="color: #4b5563;">Category:</strong> <span style="background: #e0e7ff; padding: 4px 12px; border-radius: 20px; color: #667eea; font-weight: bold;">${categoryLabel}</span></p>
              <p style="margin: 10px 0;"><strong style="color: #4b5563;">Subject:</strong> ${subject}</p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3 style="color: #667eea; margin-top: 0;">Message:</h3>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
                <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>

            <div style="margin-top: 25px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚡ Action Required:</strong> Please respond to this inquiry within 24-48 hours.
              </p>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This message was sent from the SmartPromptIQ contact form</p>
            <p>Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</p>
          </div>
        </div>
      </div>
    `;
        // Send email to support team
        await emailService_1.default.sendEmail({
            to: 'support@smartpromptiq.com',
            subject: emailSubject,
            html: emailBody,
        });
        // Send confirmation email to user
        const confirmationSubject = `We received your message - SmartPromptIQ Support`;
        const confirmationBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi ${name},</p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              We've received your message and our team will get back to you within <strong>24-48 hours</strong>.
            </p>

            <div style="background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #4c1d95; font-size: 14px;">
                <strong>📋 Your Submission Details:</strong><br><br>
                <strong>Category:</strong> ${categoryLabel}<br>
                <strong>Subject:</strong> ${subject}
              </p>
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              In the meantime, you might find these resources helpful:
            </p>

            <div style="margin: 20px 0;">
              <a href="https://smartpromptiq.com/academy/faq" style="display: inline-block; margin: 5px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">📚 FAQ</a>
              <a href="https://smartpromptiq.com/academy/documentation" style="display: inline-block; margin: 5px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">📖 Documentation</a>
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Best regards,<br>
              <strong style="color: #667eea;">The SmartPromptIQ Team</strong>
            </p>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; padding: 15px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;">
              <a href="https://smartpromptiq.com" style="color: #667eea; text-decoration: none;">SmartPromptIQ.com</a> |
              <a href="mailto:support@smartpromptiq.com" style="color: #667eea; text-decoration: none;">support@smartpromptiq.com</a>
            </p>
            <p style="margin: 5px 0; color: #9ca3af;">
              © ${new Date().getFullYear()} SmartPromptIQ. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;
        await emailService_1.default.sendEmail({
            to: email,
            subject: confirmationSubject,
            html: confirmationBody,
        });
        // Log the contact submission (optional - add to database if needed)
        console.log(`📧 Contact form submission from ${name} (${email}) - Category: ${categoryLabel}`);
        res.json({
            success: true,
            message: 'Message sent successfully! We will get back to you within 24-48 hours.',
        });
    }
    catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try emailing us directly at support@smartpromptiq.com',
            error: error.message,
        });
    }
});
exports.default = router;
