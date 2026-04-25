import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * T-122: Telegram orqali bildirishnoma yuborish
 * To'lov talab qilmaydigan bepul Telegram Bot API ishlatiladi.
 * Bot token: BOT_TOKEN env variable
 */
@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);
  private readonly apiBase: string;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('BOT_TOKEN', '');
    this.apiBase = `https://api.telegram.org/bot${token}`;
  }

  private isConfigured(): boolean {
    return !!this.config.get('BOT_TOKEN');
  }

  /**
   * Telegram chatId ga xabar yuborish.
   * @returns true = yuborildi, false = yuborilmadi
   */
  async sendMessage(chatId: string, text: string): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn('BOT_TOKEN sozlanmagan — Telegram xabar yuborilmadi');
      return false;
    }

    try {
      const res = await fetch(`${this.apiBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        this.logger.warn('Telegram xabar yuborishda xato', {
          chatId,
          description: data.description,
        });
        return false;
      }

      this.logger.log(`Telegram xabar yuborildi: chatId=${chatId}`);
      return true;
    } catch (err) {
      this.logger.error('Telegram sendMessage xatosi', {
        chatId,
        error: (err as Error).message,
      });
      return false;
    }
  }

  /** Nasiya (qarz) eslatmasi */
  async sendDebtReminder(
    chatId: string,
    customerName: string,
    amount: number,
    dueDate: string,
  ): Promise<boolean> {
    const formatted = new Intl.NumberFormat('uz-UZ').format(amount);
    const text =
      `<b>RAOS — Qarz eslatmasi</b>\n\n` +
      `Hurmatli <b>${customerName}</b>,\n` +
      `${dueDate} gacha to'lanadigan qarzingiz: <b>${formatted} so'm</b>.\n\n` +
      `Iltimos, o'z vaqtida to'lang.`;
    return this.sendMessage(chatId, text);
  }

  /** OTP (bir martalik kod) */
  async sendOtp(chatId: string, code: string): Promise<boolean> {
    const text =
      `<b>RAOS — Tasdiqlash kodi</b>\n\n` +
      `Sizning kodingiz: <b>${code}</b>\n\n` +
      `<i>5 daqiqa amal qiladi. Hech kimga bermang.</i>`;
    return this.sendMessage(chatId, text);
  }

  /** Shift yopilishi hisoboti — OWNER/ADMIN ga yuboriladi */
  async sendShiftSummary(
    chatId: string,
    params: {
      cashierName: string;
      branchName: string | null;
      openedAt: Date;
      closedAt: Date;
      totalOrders: number;
      totalRevenue: number;
      totalRefunds: number;
      cash: number;
      card: number;
    },
  ): Promise<boolean> {
    const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));
    const duration = Math.round(
      (params.closedAt.getTime() - params.openedAt.getTime()) / 60000,
    );
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;

    const text =
      `<b>🔒 Smena yopildi</b>\n\n` +
      `👤 Kassir: <b>${params.cashierName}</b>\n` +
      (params.branchName ? `🏪 Filial: ${params.branchName}\n` : '') +
      `⏱ Davomiyligi: ${hours}h ${mins}m\n\n` +
      `📊 <b>Natija:</b>\n` +
      `🛒 Buyurtmalar: <b>${params.totalOrders}</b> ta\n` +
      `💰 Jami tushum: <b>${fmt(params.totalRevenue)} so'm</b>\n` +
      `↩️ Qaytarishlar: ${params.totalRefunds} ta\n\n` +
      `💳 <b>To'lov usullari:</b>\n` +
      `  Naqd: ${fmt(params.cash)} so'm\n` +
      `  Karta: ${fmt(params.card)} so'm`;

    return this.sendMessage(chatId, text);
  }
}
