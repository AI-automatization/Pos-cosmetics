import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { TelegramNotifyService } from './telegram-notify.service';
import { EmailNotifyService } from './email-notify.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * T-122: Unified bildirishnoma xizmati
 * Telegram birinchi → yo'q bo'lsa Email fallback
 *
 * SMS xizmatini to'liq almashtiradi.
 */
@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);

  constructor(
    private readonly telegram: TelegramNotifyService,
    private readonly email: EmailNotifyService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── OTP ──────────────────────────────────────────────────────

  /**
   * Xodimga OTP yuborish: Telegram → Email fallback
   * @param userId User.id
   * @param code   OTP kodi
   */
  async sendOtpToUser(userId: string, code: string): Promise<'telegram' | 'email' | 'none'> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, email: true },
    });

    if (!user) return 'none';

    if (user.telegramChatId) {
      const ok = await this.telegram.sendOtp(user.telegramChatId, code);
      if (ok) return 'telegram';
    }

    if (user.email) {
      const ok = await this.email.sendOtp(user.email, code);
      if (ok) return 'email';
    }

    this.logger.warn(`OTP yuborilmadi: userId=${userId} — na Telegram, na email`);
    return 'none';
  }

  // ─── DEBT REMINDER ─────────────────────────────────────────────

  /**
   * Mijozga nasiya eslatmasi: Telegram → Email fallback
   */
  async sendDebtReminderToCustomer(params: {
    customerId: string;
    amount: number;
    dueDate: string;
  }): Promise<'telegram' | 'email' | 'none'> {
    const { customerId, amount, dueDate } = params;

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { telegramChatId: true, name: true },
    });

    if (!customer) return 'none';

    if (customer.telegramChatId) {
      const ok = await this.telegram.sendDebtReminder(
        customer.telegramChatId,
        customer.name,
        amount,
        dueDate,
      );
      if (ok) return 'telegram';
    }

    this.logger.warn(`Nasiya eslatmasi yuborilmadi: customerId=${customerId}`);
    return 'none';
  }

  // ─── TELEGRAM LINK TOKEN ───────────────────────────────────────

  /**
   * Xodim uchun Telegram bog'lash tokeni yaratish.
   * Frontend bu tokenni QR yoki link sifatida ko'rsatadi.
   * Token = t.me/BotName?start=TOKEN formatda ishlatiladi.
   */
  async createLinkTokenForUser(userId: string, tenantId: string): Promise<string> {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 daqiqa

    await this.prisma.telegramLinkToken.create({
      data: { token, userId, tenantId, expiresAt },
    });

    return token;
  }

  /**
   * T-329: HR invite token — 7 kun TTL.
   * POST /employees da avtomatik chaqiriladi.
   * Qaytarilgan link: t.me/{BOT_USERNAME}?start=TOKEN
   */
  async createInviteTokenForUser(userId: string, tenantId: string): Promise<{ token: string; inviteLink: string }> {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 kun

    await this.prisma.telegramLinkToken.create({
      data: { token, userId, tenantId, expiresAt },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'raos_bot';
    return { token, inviteLink: `https://t.me/${botUsername}?start=${token}` };
  }

  /**
   * Mijoz uchun Telegram bog'lash tokeni yaratish.
   */
  async createLinkTokenForCustomer(customerId: string, tenantId: string): Promise<string> {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 daqiqa

    await this.prisma.telegramLinkToken.create({
      data: { token, customerId, tenantId, expiresAt },
    });

    return token;
  }

  /**
   * Bot /start <token> qabul qilganda chatId ni DB ga yozish.
   * Bot app dan chaqiriladi (yoki API orqali).
   */
  async verifyLinkToken(token: string, chatId: string): Promise<{
    success: boolean;
    type?: 'user' | 'customer';
    id?: string;
  }> {
    const record = await this.prisma.telegramLinkToken.findUnique({
      where: { token },
    });

    if (!record) return { success: false };
    if (record.usedAt) return { success: false };
    if (record.expiresAt < new Date()) return { success: false };

    await this.prisma.telegramLinkToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    if (record.userId) {
      await this.prisma.user.update({
        where: { id: record.userId },
        data: { telegramChatId: chatId },
      });
      return { success: true, type: 'user', id: record.userId };
    }

    if (record.customerId) {
      await this.prisma.customer.update({
        where: { id: record.customerId },
        data: { telegramChatId: chatId },
      });
      return { success: true, type: 'customer', id: record.customerId };
    }

    return { success: false };
  }
}
