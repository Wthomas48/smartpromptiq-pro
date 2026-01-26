"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.isConfigured = false;
        this.provider = 'none';
        this.smtpTransporter = null;
        this.initialize();
    }
    initialize() {
        const mailProvider = (process.env.MAIL_PROVIDER || 'smtp').toLowerCase();
        if (process.env.EMAIL_ENABLED !== 'true') {
            console.log('📧 Email service disabled - emails will be logged only');
            this.isConfigured = false;
            this.provider = 'none';
            return;
        }
        // Initialize SMTP (Zoho, Gmail, etc.)
        if (mailProvider === 'smtp') {
            const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_SECURE, SMTP_TLS_REJECT_UNAUTHORIZED } = process.env;
            if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
                console.warn('⚠️ SMTP configuration incomplete - emails will be logged only');
                console.warn('Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
                this.isConfigured = false;
                this.provider = 'none';
                return;
            }
            try {
                this.smtpTransporter = nodemailer_1.default.createTransport({
                    host: SMTP_HOST,
                    port: Number(SMTP_PORT),
                    secure: MAIL_SECURE === 'true', // true for 465, false for 587
                    auth: {
                        user: SMTP_USER,
                        pass: SMTP_PASS,
                    },
                    tls: {
                        rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
                    },
                });
                this.isConfigured = true;
                this.provider = 'smtp';
                console.log(`📧 Email service configured with SMTP (${SMTP_HOST}:${SMTP_PORT})`);
            }
            catch (error) {
                console.error('📧 Failed to configure SMTP:', error);
                this.isConfigured = false;
                this.provider = 'none';
            }
        }
        else {
            console.log('📧 Email service not configured - emails will be logged only');
            this.isConfigured = false;
            this.provider = 'none';
        }
    }
    replaceTemplateVariables(template, data) {
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(placeholder, String(value));
        }
        return result;
    }
    getEmailTemplate(templateName) {
        const templates = {
            welcome: {
                subject: 'Welcome to SmartPromptIQ Pro! 🚀',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Welcome to SmartPromptIQ Pro</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .feature { display: flex; align-items: center; margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; }
              .feature-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Welcome to SmartPromptIQ Pro!</h1>
                <p>Your AI-powered prompt generation platform is ready!</p>
              </div>
              <div class="content">
                <h2>Hi {{name}},</h2>
                <p>Welcome to SmartPromptIQ Pro! We're excited to have you on board. Your account has been successfully created and you're ready to start generating amazing AI prompts.</p>

                <div class="feature">
                  <div class="feature-icon">✨</div>
                  <div>
                    <strong>Premium Templates</strong><br>
                    Access our library of professional templates designed by experts
                  </div>
                </div>

                <div class="feature">
                  <div class="feature-icon">🎯</div>
                  <div>
                    <strong>Smart Questionnaires</strong><br>
                    Answer targeted questions to get personalized prompt recommendations
                  </div>
                </div>

                <div class="feature">
                  <div class="feature-icon">🚀</div>
                  <div>
                    <strong>AI Generation</strong><br>
                    Get comprehensive, actionable strategies generated by advanced AI
                  </div>
                </div>

                <div class="feature">
                  <div class="feature-icon">🔧</div>
                  <div>
                    <strong>Refinement Tools</strong><br>
                    Fine-tune your prompts with our advanced refinement system
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="{{dashboardUrl}}" class="cta-button">Start Creating Prompts</a>
                </p>

                <p>If you have any questions, our support team is here to help. Just reply to this email!</p>

                <p>Best regards,<br>The SmartPromptIQ Pro Team</p>
              </div>
              <div class="footer">
                <p>© 2024 SmartPromptIQ Pro. All rights reserved.</p>
                <p>This email was sent to {{email}}. If you didn't sign up for this account, please ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `Welcome to SmartPromptIQ Pro!

Hi {{name}},

Welcome to SmartPromptIQ Pro! We're excited to have you on board. Your account has been successfully created and you're ready to start generating amazing AI prompts.

What you can do now:
✨ Access Premium Templates - Professional templates designed by experts
🎯 Use Smart Questionnaires - Get personalized prompt recommendations
🚀 AI Generation - Comprehensive, actionable strategies from advanced AI
🔧 Refinement Tools - Fine-tune your prompts with advanced tools

Get started: {{dashboardUrl}}

If you have any questions, our support team is here to help. Just reply to this email!

Best regards,
The SmartPromptIQ Pro Team

© 2024 SmartPromptIQ Pro. All rights reserved.
This email was sent to {{email}}. If you didn't sign up for this account, please ignore this email.`
            },
            passwordReset: {
                subject: 'Reset Your SmartPromptIQ Pro Password 🔐',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Reset Your Password</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .reset-button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .security-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi {{name}},</h2>
                <p>We received a request to reset the password for your SmartPromptIQ Pro account ({{email}}).</p>

                <p style="text-align: center;">
                  <a href="{{resetUrl}}" class="reset-button">Reset Your Password</a>
                </p>

                <div class="security-notice">
                  <strong>⚠️ Security Notice:</strong><br>
                  This password reset link will expire in {{expiryTime}} for your security. If you didn't request this reset, please ignore this email - your account remains secure.
                </div>

                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>

                <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>

                <p>Best regards,<br>The SmartPromptIQ Pro Team</p>
              </div>
              <div class="footer">
                <p>© 2024 SmartPromptIQ Pro. All rights reserved.</p>
                <p>For security reasons, this email was sent to {{email}}</p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `Password Reset Request - SmartPromptIQ Pro

Hi {{name}},

We received a request to reset the password for your SmartPromptIQ Pro account ({{email}}).

Reset your password here: {{resetUrl}}

⚠️ Security Notice:
This password reset link will expire in {{expiryTime}} for your security. If you didn't request this reset, please ignore this email - your account remains secure.

If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.

Best regards,
The SmartPromptIQ Pro Team

© 2024 SmartPromptIQ Pro. All rights reserved.
For security reasons, this email was sent to {{email}}`
            },
            promptGenerated: {
                subject: '🎉 Your AI Prompt is Ready!',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Your AI Prompt is Ready</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .prompt-preview { background-color: #f8fafc; border-left: 4px solid #4facfe; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .view-button { display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .stats { display: flex; justify-content: space-around; margin: 30px 0; }
              .stat { text-align: center; }
              .stat-number { font-size: 24px; font-weight: bold; color: #4facfe; }
              .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Your AI Prompt is Ready!</h1>
                <p>{{category}} strategy generated successfully</p>
              </div>
              <div class="content">
                <h2>Hi {{name}},</h2>
                <p>Great news! Your personalized {{category}} prompt has been generated and is ready for you to use.</p>

                <div class="prompt-preview">
                  <h3>{{promptTitle}}</h3>
                  <p>{{promptPreview}}...</p>
                </div>

                <div class="stats">
                  <div class="stat">
                    <div class="stat-number">{{wordCount}}</div>
                    <div>Words</div>
                  </div>
                  <div class="stat">
                    <div class="stat-number">{{sections}}</div>
                    <div>Sections</div>
                  </div>
                  <div class="stat">
                    <div class="stat-number">{{readTime}}</div>
                    <div>Min Read</div>
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="{{promptUrl}}" class="view-button">View Full Prompt</a>
                </p>

                <p>Your prompt includes:</p>
                <ul>
                  <li>✅ Comprehensive strategy framework</li>
                  <li>✅ Actionable implementation steps</li>
                  <li>✅ Success metrics and KPIs</li>
                  <li>✅ Professional formatting</li>
                </ul>

                <p>You can continue to refine and customize your prompt in your dashboard.</p>

                <p>Happy prompting!<br>The SmartPromptIQ Pro Team</p>
              </div>
              <div class="footer">
                <p>© 2024 SmartPromptIQ Pro. All rights reserved.</p>
                <p>This prompt was generated for {{email}}</p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `Your AI Prompt is Ready! - SmartPromptIQ Pro

Hi {{name}},

Great news! Your personalized {{category}} prompt has been generated and is ready for you to use.

{{promptTitle}}
{{promptPreview}}...

Prompt Stats:
- {{wordCount}} words
- {{sections}} sections
- {{readTime}} minute read

View your full prompt: {{promptUrl}}

Your prompt includes:
✅ Comprehensive strategy framework
✅ Actionable implementation steps
✅ Success metrics and KPIs
✅ Professional formatting

You can continue to refine and customize your prompt in your dashboard.

Happy prompting!
The SmartPromptIQ Pro Team

© 2024 SmartPromptIQ Pro. All rights reserved.
This prompt was generated for {{email}}`
            },
            subscriptionUpgrade: {
                subject: '🚀 Welcome to {{planName}} - Your Upgrade is Active!',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Subscription Upgrade Confirmation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .feature-list { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .feature-item { display: flex; align-items: center; margin: 10px 0; }
              .feature-icon { color: #10b981; margin-right: 10px; font-weight: bold; }
              .dashboard-button { display: inline-block; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Upgrade Successful!</h1>
                <p>Welcome to {{planName}}</p>
              </div>
              <div class="content">
                <h2>Hi {{name}},</h2>
                <p>Congratulations! Your account has been successfully upgraded to <strong>{{planName}}</strong>. You now have access to all the premium features.</p>

                <div class="feature-list">
                  <h3>Your New Features:</h3>
                  <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span>{{generationsLimit}} prompt generations per month</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span>Access to premium templates</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span>Advanced AI refinement tools</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span>Priority customer support</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">✓</span>
                    <span>Export and save unlimited prompts</span>
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="{{dashboardUrl}}" class="cta-button">Get Started Now</a>
                </p>

                <p>We're excited to help you create amazing AI prompts with our platform!</p>

                <p>Best regards,<br>The SmartPromptIQ Pro Team</p>
              </div>
              <div class="footer">
                <p>© 2024 SmartPromptIQ Pro. All rights reserved.</p>
                <p>Manage your subscription: <a href="{{billingUrl}}">Billing Settings</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `Upgrade Successful! - SmartPromptIQ Pro

Hi {{name}},

Congratulations! Your account has been successfully upgraded to {{planName}}. You now have access to all the premium features.

Your New Features:
✓ {{generationsLimit}} prompt generations per month
✓ Access to premium templates
✓ Advanced AI refinement tools
✓ Priority customer support
✓ Export and save unlimited prompts

Get started now: {{dashboardUrl}}

We're excited to help you create amazing AI prompts with our platform!

Best regards,
The SmartPromptIQ Pro Team

© 2024 SmartPromptIQ Pro. All rights reserved.
Manage your subscription: {{billingUrl}}`
            },
            academyEnrollment: {
                subject: '🎓 Welcome to {{courseTitle}} - SmartPromptIQ Academy',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Academy Enrollment Confirmation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .course-info { background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }
              .course-stat { display: flex; align-items: center; margin: 10px 0; }
              .stat-icon { background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .next-steps { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .next-steps li { margin: 10px 0; }
              .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Enrollment Successful!</h1>
                <p>Welcome to SmartPromptIQ Academy</p>
              </div>
              <div class="content">
                <h2>Hi {{name}},</h2>
                <p>Congratulations! You've successfully enrolled in <strong>{{courseTitle}}</strong>. Get ready to level up your skills!</p>

                <div class="course-info">
                  <h3 style="margin-top: 0; color: #6b21a8;">Course Overview</h3>
                  <div class="course-stat">
                    <div class="stat-icon">📚</div>
                    <div>
                      <strong>{{lessonCount}} Lessons</strong><br>
                      Comprehensive curriculum designed by experts
                    </div>
                  </div>
                  <div class="course-stat">
                    <div class="stat-icon">⏱️</div>
                    <div>
                      <strong>{{duration}} minutes</strong><br>
                      Total course duration
                    </div>
                  </div>
                  <div class="course-stat">
                    <div class="stat-icon">🎯</div>
                    <div>
                      <strong>{{difficulty}}</strong><br>
                      Difficulty level
                    </div>
                  </div>
                  {{#if instructor}}
                  <div class="course-stat">
                    <div class="stat-icon">👨‍🏫</div>
                    <div>
                      <strong>{{instructor}}</strong><br>
                      Your instructor
                    </div>
                  </div>
                  {{/if}}
                </div>

                <div class="next-steps">
                  <h3>🚀 Next Steps:</h3>
                  <ol>
                    <li><strong>Start Learning:</strong> Click the button below to access your course</li>
                    <li><strong>Track Progress:</strong> Complete lessons to earn your certificate</li>
                    <li><strong>Join Community:</strong> Connect with fellow learners</li>
                    <li><strong>Get Support:</strong> Reach out if you need help along the way</li>
                  </ol>
                </div>

                <p style="text-align: center;">
                  <a href="{{courseUrl}}" class="cta-button">Start Learning Now</a>
                </p>

                <p>Pro tip: Set aside dedicated time each week to complete lessons. Consistency is key to success!</p>

                <p>Happy learning!<br>The SmartPromptIQ Academy Team</p>
              </div>
              <div class="footer">
                <p>© 2024 SmartPromptIQ Academy. All rights reserved.</p>
                <p>View all your courses: <a href="{{dashboardUrl}}">My Learning Dashboard</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `Enrollment Successful! - SmartPromptIQ Academy

Hi {{name}},

Congratulations! You've successfully enrolled in {{courseTitle}}. Get ready to level up your skills!

Course Overview:
📚 {{lessonCount}} Lessons - Comprehensive curriculum designed by experts
⏱️ {{duration}} minutes - Total course duration
🎯 {{difficulty}} - Difficulty level
{{#if instructor}}👨‍🏫 {{instructor}} - Your instructor{{/if}}

Next Steps:
1. Start Learning: Access your course at {{courseUrl}}
2. Track Progress: Complete lessons to earn your certificate
3. Join Community: Connect with fellow learners
4. Get Support: Reach out if you need help along the way

Pro tip: Set aside dedicated time each week to complete lessons. Consistency is key to success!

Happy learning!
The SmartPromptIQ Academy Team

© 2024 SmartPromptIQ Academy. All rights reserved.
View all your courses: {{dashboardUrl}}`
            },
            academyCertificate: {
                subject: '🏆 Congratulations! You Earned a Certificate - {{courseTitle}}',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Certificate Earned</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 50px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
              .trophy { font-size: 80px; margin: 20px 0; }
              .content { padding: 40px 30px; }
              .certificate-preview { border: 3px solid #f59e0b; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center; background: linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%); }
              .achievement-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .stat-box { background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
              .stat-number { font-size: 24px; font-weight: bold; color: #f59e0b; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="trophy">🏆</div>
                <h1>Congratulations!</h1>
                <p>You've completed the course</p>
              </div>
              <div class="content">
                <h2>Amazing Achievement, {{name}}!</h2>
                <p>You've successfully completed <strong>{{courseTitle}}</strong> and earned your certificate!</p>

                <div class="certificate-preview">
                  <h3 style="color: #92400e; margin-top: 0;">Certificate of Completion</h3>
                  <p style="font-size: 18px; margin: 20px 0;"><strong>{{name}}</strong></p>
                  <p>has successfully completed</p>
                  <p style="font-size: 20px; font-weight: bold; color: #92400e; margin: 15px 0;">{{courseTitle}}</p>
                  <p style="font-size: 14px; color: #666;">{{completionDate}}</p>
                  <p style="font-size: 14px; color: #666;">Certificate ID: {{certificateId}}</p>
                </div>

                <div class="achievement-stats">
                  <div class="stat-box">
                    <div class="stat-number">{{lessonsCompleted}}</div>
                    <div>Lessons Completed</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-number">{{timeSpent}}</div>
                    <div>Hours Invested</div>
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="{{certificateUrl}}" class="cta-button">Download Certificate</a>
                </p>

                <p><strong>Share Your Achievement:</strong></p>
                <p>Don't forget to share your certificate on LinkedIn and other professional networks. Let the world know about your accomplishment!</p>

                <p><strong>What's Next?</strong></p>
                <ul>
                  <li>Explore more courses in the Academy</li>
                  <li>Apply your new skills in real projects</li>
                  <li>Join our community of certified professionals</li>
                </ul>

                <p>Keep up the excellent work!<br>The SmartPromptIQ Academy Team</p>
              </div>
              <div class="footer">
                <p>© 2024 SmartPromptIQ Academy. All rights reserved.</p>
                <p>View your certificates: <a href="{{dashboardUrl}}">My Learning Dashboard</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `Congratulations! You Earned a Certificate - SmartPromptIQ Academy

Hi {{name}},

🏆 AMAZING ACHIEVEMENT! 🏆

You've successfully completed {{courseTitle}} and earned your certificate!

Certificate Details:
- Course: {{courseTitle}}
- Completion Date: {{completionDate}}
- Certificate ID: {{certificateId}}
- Lessons Completed: {{lessonsCompleted}}
- Time Invested: {{timeSpent}} hours

Download your certificate: {{certificateUrl}}

Share Your Achievement:
Don't forget to share your certificate on LinkedIn and other professional networks. Let the world know about your accomplishment!

What's Next?
• Explore more courses in the Academy
• Apply your new skills in real projects
• Join our community of certified professionals

Keep up the excellent work!
The SmartPromptIQ Academy Team

© 2024 SmartPromptIQ Academy. All rights reserved.
View your certificates: {{dashboardUrl}}`
            }
        };
        return templates[templateName] || templates.welcome;
    }
    async sendEmail(options) {
        try {
            const fromEmail = process.env.FROM_EMAIL || 'noreply@smartpromptiq.com';
            const fromName = process.env.FROM_NAME || 'SmartPromptIQ';
            const replyTo = process.env.REPLY_TO || fromEmail;
            if (!this.isConfigured) {
                console.log(`📧 [Mock] Email would be sent to ${options.to}: ${options.subject}`);
                console.log(`📧 Content preview: ${options.html.substring(0, 200)}...`);
                return true; // Return true for development purposes
            }
            // SMTP provider (Zoho, Gmail, etc.)
            if (this.provider === 'smtp' && this.smtpTransporter) {
                const mailOptions = {
                    from: `"${fromName}" <${fromEmail}>`,
                    to: options.to,
                    replyTo: replyTo,
                    subject: options.subject,
                    text: options.text || options.html.replace(/<[^>]*>/g, ''),
                    html: options.html
                };
                const info = await this.smtpTransporter.sendMail(mailOptions);
                console.log(`📧 Email sent via SMTP to ${options.to}: ${options.subject}`);
                console.log(`📧 Message ID: ${info.messageId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('📧 Failed to send email:', error);
            return false;
        }
    }
    async sendTemplateEmail(to, templateName, templateData) {
        try {
            const template = this.getEmailTemplate(templateName);
            const processedSubject = this.replaceTemplateVariables(template.subject, templateData);
            const processedHtml = this.replaceTemplateVariables(template.html, templateData);
            const processedText = this.replaceTemplateVariables(template.text, templateData);
            return await this.sendEmail({
                to,
                subject: processedSubject,
                html: processedHtml,
                text: processedText,
                templateData
            });
        }
        catch (error) {
            console.error(`📧 Failed to send template email (${templateName}):`, error);
            return false;
        }
    }
    // Convenience methods for common email types
    async sendWelcomeEmail(to, name) {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
        return this.sendTemplateEmail(to, 'welcome', {
            name,
            email: to,
            dashboardUrl
        });
    }
    async sendPasswordResetEmail(to, name, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        return this.sendTemplateEmail(to, 'passwordReset', {
            name,
            email: to,
            resetUrl,
            expiryTime: '24 hours'
        });
    }
    async sendPromptGeneratedEmail(to, name, promptData) {
        const promptUrl = `${process.env.FRONTEND_URL}/dashboard?prompt=${promptData.promptId}`;
        return this.sendTemplateEmail(to, 'promptGenerated', {
            name,
            email: to,
            category: promptData.category,
            promptTitle: promptData.title,
            promptPreview: promptData.preview,
            wordCount: promptData.wordCount,
            sections: promptData.sections,
            readTime: promptData.readTime,
            promptUrl
        });
    }
    async sendSubscriptionUpgradeEmail(to, name, subscriptionData) {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
        const billingUrl = `${process.env.FRONTEND_URL}/billing`;
        return this.sendTemplateEmail(to, 'subscriptionUpgrade', {
            name,
            email: to,
            planName: subscriptionData.planName,
            generationsLimit: subscriptionData.generationsLimit,
            amount: subscriptionData.amount,
            billingCycle: subscriptionData.billingCycle,
            nextBillingDate: subscriptionData.nextBillingDate,
            dashboardUrl,
            billingUrl
        });
    }
    async sendAcademyEnrollmentEmail(to, name, courseData) {
        const courseUrl = `${process.env.FRONTEND_URL}/academy/course/${courseData.slug}`;
        const dashboardUrl = `${process.env.FRONTEND_URL}/academy/dashboard`;
        return this.sendTemplateEmail(to, 'academyEnrollment', {
            name,
            email: to,
            courseTitle: courseData.title,
            lessonCount: courseData.lessonCount,
            duration: courseData.duration,
            difficulty: courseData.difficulty.charAt(0).toUpperCase() + courseData.difficulty.slice(1),
            instructor: courseData.instructor || null,
            courseUrl,
            dashboardUrl
        });
    }
    async sendAcademyCertificateEmail(to, name, certificateData) {
        const certificateUrl = `${process.env.FRONTEND_URL}/academy/certificate/${certificateData.certificateId}`;
        const dashboardUrl = `${process.env.FRONTEND_URL}/academy/dashboard`;
        return this.sendTemplateEmail(to, 'academyCertificate', {
            name,
            email: to,
            courseTitle: certificateData.courseTitle,
            certificateId: certificateData.certificateId,
            completionDate: certificateData.completionDate,
            lessonsCompleted: certificateData.lessonsCompleted,
            timeSpent: certificateData.timeSpent,
            certificateUrl,
            dashboardUrl
        });
    }
    // Test email functionality
    async sendTestEmail(to) {
        return this.sendEmail({
            to,
            subject: '🧪 SmartPromptIQ Pro - Email Test',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">📧 Email Test Successful!</h1>
          <p>This is a test email from SmartPromptIQ Pro to verify that the email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
          <p><strong>Service Status:</strong> ${this.isConfigured ? 'SendGrid Configured' : 'Mock Mode'}</p>
          <hr>
          <p style="color: #666; font-size: 14px;">© 2024 SmartPromptIQ Pro. All rights reserved.</p>
        </div>
      `
        });
    }
    getStatus() {
        return {
            configured: this.isConfigured,
            provider: this.provider === 'smtp' ? 'SMTP (Zoho)' : 'Mock'
        };
    }
}
exports.default = new EmailService();
