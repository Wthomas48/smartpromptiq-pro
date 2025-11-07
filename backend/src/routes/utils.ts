import { Router } from "express";
import { sendEmail } from "../lib/mailer";

export const utilsRouter = Router();

/**
 * POST /api/utils/test-email
 * Test endpoint to verify email configuration
 * Body: { to: "email@example.com" }
 */
utilsRouter.post("/test-email", async (req, res) => {
  try {
    const { to } = req.body as { to: string };

    if (!to) {
      return res.status(400).json({ error: "Missing 'to' email address" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const result = await sendEmail({
      to,
      subject: `Test Email from ${process.env.APP_NAME || "SmartPromptIQ"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">✅ Email Test Successful!</h1>
          <p>This is a test email from <strong>${process.env.APP_NAME || "SmartPromptIQ"}</strong>.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || "development"}</p>
          <p><strong>Provider:</strong> SMTP (${process.env.SMTP_HOST || "Not configured"})</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">If you received this email, your SMTP configuration is working correctly!</p>
        </div>
      `,
      text: `✅ Email Test Successful!\n\nThis is a test email from ${process.env.APP_NAME || "SmartPromptIQ"}.\n\nTimestamp: ${new Date().toISOString()}\nEnvironment: ${process.env.NODE_ENV || "development"}\nProvider: SMTP (${process.env.SMTP_HOST || "Not configured"})\n\nIf you received this email, your SMTP configuration is working correctly!`,
    });

    res.json({
      ok: true,
      message: "Test email sent successfully",
      result
    });
  } catch (err: any) {
    console.error("Test email failed:", err);
    res.status(500).json({
      ok: false,
      error: err.message || "Failed to send test email"
    });
  }
});

/**
 * GET /api/utils/email-status
 * Check email service configuration status
 */
utilsRouter.get("/email-status", (req, res) => {
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  res.json({
    configured: isConfigured,
    provider: process.env.MAIL_PROVIDER || "smtp",
    host: process.env.SMTP_HOST || "Not configured",
    port: process.env.SMTP_PORT || "Not configured",
    secure: process.env.MAIL_SECURE === "true",
    from: process.env.FROM_EMAIL || "Not configured",
  });
});

export default utilsRouter;
