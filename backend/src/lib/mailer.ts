// /backend/src/lib/mailer.ts
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  MAIL_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  REPLY_TO,
  SMTP_TLS_REJECT_UNAUTHORIZED,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
  console.warn("⚠️ Zoho SMTP env vars missing. Email service will be in mock mode.");
}

export const transporter = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: MAIL_SECURE === "true", // true -> 465, false -> 587
      auth: {
        user: SMTP_USER!,
        pass: SMTP_PASS!,
      },
      tls: {
        // For local dev behind intercepting proxies you can relax this, but keep true in prod
        rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
      },
    })
  : null;

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string; // optional override
  replyTo?: string; // optional override
}) {
  if (!transporter) {
    console.log(`📧 [Mock] Email would be sent to ${opts.to}: ${opts.subject}`);
    return {
      messageId: "mock-message-id",
      accepted: Array.isArray(opts.to) ? opts.to : [opts.to],
      rejected: [],
      response: "Mock email - no transporter configured",
    };
  }

  const info = await transporter.sendMail({
    from: opts.from || FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo || REPLY_TO,
  });

  console.log(`📧 Email sent successfully to ${opts.to}: ${opts.subject}`);

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  };
}
