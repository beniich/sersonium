/**
 * Sensorium Enterprise — Email Service
 * Supports SMTP (Nodemailer) transport.
 * Configure via environment variables in .env
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  generateEnterpriseActivationEmail,
  type EnterpriseActivationEmailData,
} from '../templates/enterpriseActivationEmail.js';

// ─── Transport Singleton ─────────────────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Postmark / Resend / Amazon SES direct presets via SMTP relay
  if (provider === 'postmark') {
    const postmarkApiKey = process.env.POSTMARK_SERVER_TOKEN || pass;
    if (postmarkApiKey) {
      _transporter = nodemailer.createTransport({
        host: 'smtp.postmarkapp.com',
        port: 587,
        auth: { user: postmarkApiKey, pass: postmarkApiKey },
      });
      return _transporter;
    }
  } else if (provider === 'resend') {
    const resendApiKey = process.env.RESEND_API_KEY || pass;
    if (resendApiKey) {
      _transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: { user: 'resend', pass: resendApiKey },
      });
      return _transporter;
    }
  }

  if (!host || !user || !pass) {
    // Development fallback: Ethereal / Stream
    console.warn(
      '[EmailService] No SMTP credentials found — running in mock transport mode. Emails will be logged locally.'
    );
    _transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    return _transporter;
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 5,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return _transporter;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  emailData: EnterpriseActivationEmailData;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

// ─── Core Send Function ───────────────────────────────────────────────────────

async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { to, emailData } = options;
    const from = process.env.EMAIL_FROM || '"Sensorium Enterprise" <noreply@sensorium.io>';
    const { subject, html, text } = generateEnterpriseActivationEmail(emailData);

    const transport = getTransporter();

    const info = await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
      headers: {
        'X-Mailer': 'Sensorium Enterprise v2.0',
        'X-Priority': '1',
        'Importance': 'high',
      },
    });

    const previewUrl =
      typeof nodemailer.getTestMessageUrl === 'function'
        ? (nodemailer.getTestMessageUrl(info) as string | false) || undefined
        : undefined;

    console.info(`[EmailService] ✅ Email sent to ${to} — MessageID: ${info.messageId}`);
    if (previewUrl) {
      console.info(`[EmailService] 📧 Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[EmailService] ❌ Failed to send email to ${options.to}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send the Enterprise AI Sovereignty activation email.
 * Called when a user's subscription is upgraded to Enterprise tier.
 */
export async function sendEnterpriseActivationEmail(
  to: string,
  clientName: string,
  activationKey: string,
  locale: 'fr' | 'en' = 'fr',
  options?: {
    terminalModel?: string;
    supportEmail?: string;
  }
): Promise<SendEmailResult> {
  const emailData: EnterpriseActivationEmailData = {
    clientName,
    activationKey,
    locale,
    terminalModel: options?.terminalModel || 'Silicium X1 NPU',
    supportEmail: options?.supportEmail || 'support.enterprise@sensorium.io',
  };

  return sendEmail({ to, emailData });
}

/**
 * Generate a unique Sensorium Enterprise activation key.
 * Format: SNSR-LLM-XXXX-XXXX
 */
export function generateActivationKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Unambiguous chars
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SNSR-LLM-${segment(4)}-${segment(4)}`;
}
