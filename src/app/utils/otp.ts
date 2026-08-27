import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

export function generateOtp(): string {
  // 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user
    ? {
        user: env.smtp.user,
        pass: env.smtp.pass,
      }
    : undefined,
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (!env.smtp.host || !env.smtp.user) {
    // Development fallback — avoid crashing when SMTP isn't configured yet.
    // eslint-disable-next-line no-console
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Your Admin Login Verification Code',
    html: `
      <p>Your verification code is:</p>
      <h2 style="letter-spacing:4px">${otp}</h2>
      <p>This code will expire in ${env.otp.expiresInMinutes} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
}
