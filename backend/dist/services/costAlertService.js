"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - COST ALERT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Service for sending email alerts when cost thresholds are reached.
 * Integrates with the cost tracking system to notify administrators.
 *
 * Alert Levels:
 * - WARNING: Approaching limit (70% of threshold)
 * - CRITICAL: Near limit (90% of threshold)
 * - SHUTDOWN: Limit reached, features disabled
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCostAlert = sendCostAlert;
exports.checkAndSendCostAlerts = checkAndSendCostAlerts;
exports.sendUserHighUsageAlert = sendUserHighUsageAlert;
const emailService_1 = __importDefault(require("./emailService"));
const client_1 = require("@prisma/client");
const costs_1 = require("../config/costs");
const prisma = new client_1.PrismaClient();
// Track sent alerts to prevent spam
const alertsSent = new Map();
const ALERT_COOLDOWN_HOURS = 4; // Don't resend same alert within 4 hours
/**
 * Check if an alert should be sent (not within cooldown period)
 */
function shouldSendAlert(alertKey) {
    const lastSent = alertsSent.get(alertKey);
    if (!lastSent)
        return true;
    const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSent >= ALERT_COOLDOWN_HOURS;
}
/**
 * Mark alert as sent
 */
function markAlertSent(alertKey) {
    alertsSent.set(alertKey, new Date());
}
/**
 * Get admin email addresses
 */
async function getAdminEmails() {
    try {
        const admins = await prisma.user.findMany({
            where: { isAdmin: true },
            select: { email: true },
        });
        // Add default admin email if configured
        const emails = admins.map(a => a.email);
        if (process.env.ADMIN_EMAIL) {
            emails.push(process.env.ADMIN_EMAIL);
        }
        return [...new Set(emails)]; // Remove duplicates
    }
    catch (error) {
        console.error('Failed to get admin emails:', error);
        return process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : [];
    }
}
/**
 * Build HTML email template for cost alerts
 */
function buildAlertEmailHtml(data) {
    const levelColors = {
        warning: '#f59e0b',
        critical: '#ef4444',
        shutdown: '#7f1d1d',
    };
    const levelEmojis = {
        warning: '⚠️',
        critical: '🚨',
        shutdown: '🛑',
    };
    const levelTitles = {
        warning: 'Cost Warning',
        critical: 'CRITICAL: Cost Alert',
        shutdown: 'EMERGENCY: Cost Shutdown',
    };
    const color = levelColors[data.level];
    const emoji = levelEmojis[data.level];
    const title = levelTitles[data.level];
    let topSpendersHtml = '';
    if (data.topSpenders && data.topSpenders.length > 0) {
        topSpendersHtml = `
      <h3 style="margin-top: 20px; color: #374151;">Top Spenders:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Email</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Cost</th>
          </tr>
        </thead>
        <tbody>
          ${data.topSpenders.map(s => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${s.email}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">$${s.cost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    }
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: ${color}; padding: 30px; text-align: center;">
            <div style="font-size: 48px;">${emoji}</div>
            <h1 style="color: white; margin: 10px 0 0 0; font-size: 24px;">${title}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">SmartPromptIQ Cost Management</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <div style="background: #fef3c7; border-left: 4px solid ${color}; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
              <strong style="color: ${color};">Alert Level: ${data.level.toUpperCase()}</strong>
              <p style="margin: 5px 0 0 0; color: #92400e;">
                ${data.period.charAt(0).toUpperCase() + data.period.slice(1)} cost threshold reached at ${data.percentUsed.toFixed(1)}%
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: #111827;">$${data.currentCost.toFixed(2)}</div>
                <div style="color: #6b7280; font-size: 14px;">Current Cost</div>
              </div>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: #111827;">$${data.threshold.toFixed(2)}</div>
                <div style="color: #6b7280; font-size: 14px;">Threshold</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 14px; color: #6b7280;">${data.period.charAt(0).toUpperCase() + data.period.slice(1)} Cost Progress</span>
                <span style="font-size: 14px; font-weight: bold; color: ${color};">${data.percentUsed.toFixed(1)}%</span>
              </div>
              <div style="height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.min(data.percentUsed, 100)}%; background: ${color}; border-radius: 6px;"></div>
              </div>
            </div>

            ${topSpendersHtml}

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Recommended Actions:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                ${data.level === 'warning' ? `
                  <li>Review high-spending users for potential abuse</li>
                  <li>Consider enabling cost throttling</li>
                  <li>Monitor API usage patterns</li>
                ` : ''}
                ${data.level === 'critical' ? `
                  <li>Enable cost throttling immediately</li>
                  <li>Disable expensive features (GPT-4, DALL-E 3)</li>
                  <li>Investigate unusual spending patterns</li>
                  <li>Consider rate limiting high spenders</li>
                ` : ''}
                ${data.level === 'shutdown' ? `
                  <li><strong>EMERGENCY:</strong> Premium features have been disabled</li>
                  <li>Review all API usage immediately</li>
                  <li>Contact high-spending users</li>
                  <li>Restore features only after investigation</li>
                ` : ''}
              </ul>
            </div>

            <div style="margin-top: 25px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://smartpromptiq.com'}/admin"
                 style="display: inline-block; background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Admin Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              SmartPromptIQ Cost Management System<br>
              This is an automated alert. Do not reply to this email.
            </p>
            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
              Alert generated at ${data.timestamp.toISOString()}
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
/**
 * Send cost alert email to all admins
 */
async function sendCostAlert(data) {
    const alertKey = `${data.level}-${data.period}`;
    // Check cooldown
    if (!shouldSendAlert(alertKey)) {
        console.log(`📧 Cost alert ${alertKey} skipped (within cooldown period)`);
        return false;
    }
    try {
        const adminEmails = await getAdminEmails();
        if (adminEmails.length === 0) {
            console.warn('📧 No admin emails configured for cost alerts');
            return false;
        }
        const html = buildAlertEmailHtml(data);
        const subject = data.level === 'shutdown'
            ? `🛑 EMERGENCY: SmartPromptIQ Cost Shutdown - ${data.period}`
            : data.level === 'critical'
                ? `🚨 CRITICAL: SmartPromptIQ Cost Alert - ${data.percentUsed.toFixed(0)}% of ${data.period} limit`
                : `⚠️ Warning: SmartPromptIQ Cost Alert - ${data.percentUsed.toFixed(0)}% of ${data.period} limit`;
        // Send to all admins
        for (const email of adminEmails) {
            await emailService_1.default.sendEmail({
                to: email,
                subject,
                html,
                text: `${subject}\n\nCurrent Cost: $${data.currentCost.toFixed(2)}\nThreshold: $${data.threshold.toFixed(2)}\nPercent Used: ${data.percentUsed.toFixed(1)}%\n\nPlease check the admin dashboard immediately.`,
            });
        }
        markAlertSent(alertKey);
        console.log(`📧 Cost alert sent: ${alertKey} to ${adminEmails.length} admin(s)`);
        return true;
    }
    catch (error) {
        console.error('Failed to send cost alert:', error);
        return false;
    }
}
/**
 * Check current costs and send alerts if thresholds are reached
 */
async function checkAndSendCostAlerts() {
    if (!costs_1.COST_CONTROL_FLAGS.alertOnHighCost) {
        return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    try {
        // Get current costs
        const [dailyCosts, monthlyCosts] = await Promise.all([
            prisma.usageLog.aggregate({
                where: { createdAt: { gte: today } },
                _sum: { cost: true },
            }),
            prisma.usageLog.aggregate({
                where: { createdAt: { gte: monthStart } },
                _sum: { cost: true },
            }),
        ]);
        const dailyCost = dailyCosts._sum.cost || 0;
        const monthlyCost = monthlyCosts._sum.cost || 0;
        // Get top spenders
        const topSpenders = await prisma.usageLog.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: today } },
            _sum: { cost: true },
            orderBy: { _sum: { cost: 'desc' } },
            take: 5,
        });
        const userIds = topSpenders.map(s => s.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true },
        });
        const userMap = new Map(users.map(u => [u.id, u.email]));
        const topSpendersList = topSpenders.map(s => ({
            userId: s.userId,
            email: userMap.get(s.userId) || 'unknown',
            cost: s._sum.cost || 0,
        }));
        // Check daily thresholds
        if (dailyCost >= costs_1.COST_ALERTS.daily.shutdown) {
            await sendCostAlert({
                level: 'shutdown',
                period: 'daily',
                currentCost: dailyCost,
                threshold: costs_1.COST_ALERTS.daily.shutdown,
                percentUsed: (dailyCost / costs_1.COST_ALERTS.daily.shutdown) * 100,
                topSpenders: topSpendersList,
                timestamp: new Date(),
            });
        }
        else if (dailyCost >= costs_1.COST_ALERTS.daily.critical) {
            await sendCostAlert({
                level: 'critical',
                period: 'daily',
                currentCost: dailyCost,
                threshold: costs_1.COST_ALERTS.daily.critical,
                percentUsed: (dailyCost / costs_1.COST_ALERTS.daily.critical) * 100,
                topSpenders: topSpendersList,
                timestamp: new Date(),
            });
        }
        else if (dailyCost >= costs_1.COST_ALERTS.daily.warning) {
            await sendCostAlert({
                level: 'warning',
                period: 'daily',
                currentCost: dailyCost,
                threshold: costs_1.COST_ALERTS.daily.warning,
                percentUsed: (dailyCost / costs_1.COST_ALERTS.daily.warning) * 100,
                topSpenders: topSpendersList,
                timestamp: new Date(),
            });
        }
        // Check monthly thresholds
        if (monthlyCost >= costs_1.COST_ALERTS.monthly.shutdown) {
            await sendCostAlert({
                level: 'shutdown',
                period: 'monthly',
                currentCost: monthlyCost,
                threshold: costs_1.COST_ALERTS.monthly.shutdown,
                percentUsed: (monthlyCost / costs_1.COST_ALERTS.monthly.shutdown) * 100,
                timestamp: new Date(),
            });
        }
        else if (monthlyCost >= costs_1.COST_ALERTS.monthly.critical) {
            await sendCostAlert({
                level: 'critical',
                period: 'monthly',
                currentCost: monthlyCost,
                threshold: costs_1.COST_ALERTS.monthly.critical,
                percentUsed: (monthlyCost / costs_1.COST_ALERTS.monthly.critical) * 100,
                timestamp: new Date(),
            });
        }
        else if (monthlyCost >= costs_1.COST_ALERTS.monthly.warning) {
            await sendCostAlert({
                level: 'warning',
                period: 'monthly',
                currentCost: monthlyCost,
                threshold: costs_1.COST_ALERTS.monthly.warning,
                percentUsed: (monthlyCost / costs_1.COST_ALERTS.monthly.warning) * 100,
                timestamp: new Date(),
            });
        }
    }
    catch (error) {
        console.error('Error checking cost alerts:', error);
    }
}
/**
 * Send user-specific high usage alert
 */
async function sendUserHighUsageAlert(userId, userEmail, dailyCost) {
    const alertKey = `user-${userId}-daily`;
    if (!shouldSendAlert(alertKey)) {
        return false;
    }
    if (dailyCost < costs_1.COST_ALERTS.perUser.daily) {
        return false;
    }
    try {
        const adminEmails = await getAdminEmails();
        const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #f59e0b;">⚠️ High User Usage Alert</h2>
        <p>User <strong>${userEmail}</strong> has exceeded the daily cost threshold.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>User ID:</strong> ${userId}</p>
          <p style="margin: 5px 0 0 0;"><strong>Daily Cost:</strong> $${dailyCost.toFixed(2)}</p>
          <p style="margin: 5px 0 0 0;"><strong>Threshold:</strong> $${costs_1.COST_ALERTS.perUser.daily.toFixed(2)}</p>
        </div>
        <p>Please review this user's activity in the admin dashboard.</p>
      </body>
      </html>
    `;
        for (const email of adminEmails) {
            await emailService_1.default.sendEmail({
                to: email,
                subject: `⚠️ High Usage Alert: ${userEmail} - $${dailyCost.toFixed(2)}`,
                html,
                text: `High Usage Alert\n\nUser: ${userEmail}\nDaily Cost: $${dailyCost.toFixed(2)}\nThreshold: $${costs_1.COST_ALERTS.perUser.daily.toFixed(2)}`,
            });
        }
        markAlertSent(alertKey);
        return true;
    }
    catch (error) {
        console.error('Failed to send user high usage alert:', error);
        return false;
    }
}
exports.default = {
    sendCostAlert,
    checkAndSendCostAlerts,
    sendUserHighUsageAlert,
};
