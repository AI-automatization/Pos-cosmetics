// T-125: Bot auth — chatId orqali foydalanuvchini aniqlash
// T-131: BotSettings type

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
    settings: (user.botSettings as BotSettings | null) ?? DEFAULT_SETTINGS,
  };
}
