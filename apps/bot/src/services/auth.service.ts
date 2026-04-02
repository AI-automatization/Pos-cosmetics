// T-125: Bot auth — chatId orqali foydalanuvchini aniqlash
// T-131: BotSettings type

import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { config } from '../config';
import prisma from '../prisma';

// ─── Bot sozlamalari ──────────────────────────────────────────

export interface BotSettings {
  lowStock: boolean;         // Kam qoldiq alertlari
  expiry: boolean;           // Muddati yaqin alertlari
  dailyReport: boolean;      // Kunlik hisobot (20:00)
  suspiciousRefund: boolean; // Katta qaytarish alertlari
  expiryDays: 30 | 60 | 90; // Muddati ogohlantirish kunlari
}

export const DEFAULT_SETTINGS: BotSettings = {
  lowStock: true,
  expiry: true,
  dailyReport: true,
  suspiciousRefund: true,
  expiryDays: 30,
};

// ─── Bot foydalanuvchisi ──────────────────────────────────────

export interface BotUser {
  id: string;
  tenantId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  settings: BotSettings;
}

// Bot orqali kirish ruxsati bor rollar
const ALLOWED_ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'];

export function isBotAllowed(role: string): boolean {
  return ALLOWED_ROLES.includes(role);
}

export function isOwnerOrAdmin(role: string): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

// ─── ChatId orqali foydalanuvchini topish ─────────────────────

export async function getUserByChatId(chatId: string): Promise<BotUser | null> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId: chatId, isActive: true },
    select: {
      id: true,
      tenantId: true,
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      botSettings: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    tenantId: user.tenantId,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    settings: (user.botSettings as BotSettings | null) ?? DEFAULT_SETTINGS,
  };
}

// ─── OTP storage (in-memory, 5 daqiqa TTL) ───────────────────

interface OtpEntry {
  code: string;
  userId: string;
  tenantId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  botSettings: BotSettings;
  expiresAt: Date;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Muddati o'tgan OTP larni tozalash (har 10 daqiqada)
setInterval(() => {
  const now = new Date();
  for (const [chatId, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) otpStore.delete(chatId);
  }
}, 10 * 60 * 1000);

// ─── Email transporter ────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

async function sendOtpEmail(toEmail: string, firstName: string, code: string): Promise<void> {
  const transport = getTransporter();

  await transport.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: `RAOS Bot — Kirish kodi: ${code}`,
    text: [
      `Salom, ${firstName}!`,
      '',
      `RAOS Telegram bot uchun kirish kodingiz: ${code}`,
      '',
      'Kod 5 daqiqa davomida amal qiladi.',
      '',
      'Agar siz bu so\'rovni yubormagan bo\'lsangiz, ushbu xabarni e\'tiborsiz qoldiring.',
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#7c3aed">RAOS Bot — Kirish kodi</h2>
        <p>Salom, <strong>${firstName}</strong>!</p>
        <p>Telegram bot uchun kirish kodingiz:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#7c3aed;
                    background:#f5f3ff;border-radius:8px;padding:16px;text-align:center">
          ${code}
        </div>
        <p style="color:#6b7280;margin-top:16px">
          Kod <strong>5 daqiqa</strong> davomida amal qiladi.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">
          Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.
        </p>
      </div>
    `,
  });
}

// ─── 1-qadam: Email + parol tekshirish, OTP yuborish ──────────

export type VerifyCredentialsResult =
  | 'not_found'
  | 'wrong_password'
  | 'no_role'
  | 'email_sent'
  | 'email_error';

export async function verifyCredentialsAndSendOtp(
  email: string,
  password: string,
  chatId: string,
): Promise<VerifyCredentialsResult> {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim(), isActive: true },
    select: {
      id: true,
      tenantId: true,
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      botSettings: true,
      passwordHash: true,
    },
  });

  if (!user) return 'not_found';

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return 'wrong_password';

  if (!isBotAllowed(user.role)) return 'no_role';

  // OTP yaratish va emailga yuborish
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

  otpStore.set(chatId, {
    code,
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    botSettings: (user.botSettings as BotSettings | null) ?? DEFAULT_SETTINGS,
    expiresAt,
    attempts: 0,
  });

  try {
    await sendOtpEmail(user.email, user.firstName, code);
    return 'email_sent';
  } catch (err) {
    console.error('[Bot OTP email error]', err);
    otpStore.delete(chatId);
    return 'email_error';
  }
}

// ─── 2-qadam: OTP kodni tekshirish va chatId saqlash ──────────

export type VerifyOtpResult =
  | BotUser
  | 'invalid_code'
  | 'expired'
  | 'too_many_attempts';

export async function verifyOtpAndLogin(
  code: string,
  chatId: string,
): Promise<VerifyOtpResult> {
  const entry = otpStore.get(chatId);

  if (!entry) return 'expired';
  if (entry.expiresAt < new Date()) {
    otpStore.delete(chatId);
    return 'expired';
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(chatId);
    return 'too_many_attempts';
  }

  if (entry.code !== code.trim()) return 'invalid_code';

  // Kod to'g'ri — chatId ni DBga saqlash
  await prisma.user.update({
    where: { id: entry.userId },
    data: { telegramChatId: chatId },
  });

  otpStore.delete(chatId);

  return {
    id: entry.userId,
    tenantId: entry.tenantId,
    role: entry.role,
    firstName: entry.firstName,
    lastName: entry.lastName,
    email: entry.email,
    settings: entry.botSettings,
  };
}

// ─── OTP yuborilganmi tekshirish ──────────────────────────────

export function hasOtpPending(chatId: string): boolean {
  const entry = otpStore.get(chatId);
  return !!entry && entry.expiresAt > new Date();
}

// ─── Logout — chatId ni DBdan o'chirish ───────────────────────

export async function logoutUser(chatId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { telegramChatId: chatId },
    select: { id: true },
  });

  if (!user) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: null },
  });

  return true;
}
