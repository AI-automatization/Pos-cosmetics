import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * T-122: Email orqali bildirishnoma (Telegram fallback)
 * Gmail SMTP yoki boshqa SMTP provayderini ishlatadi.
 * Bu bepul va Telegram bog'lanmagan foydalanuvchilar uchun fallback.
 */
@Injectable()
export class EmailNotifyService {
  private readonly logger = new Logger(EmailNotifyService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<boolean>('SMTP_SECURE', false),
        auth: { user, pass },
      });
    }
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('SMTP sozlanmagan — email yuborilmadi');
      return false;
    }

    try {
      const from = this.config.get('SMTP_FROM', this.config.get('SMTP_USER'));
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email yuborildi: ${to}`);
      return true;
    } catch (err) {
      this.logger.error('Email yuborishda xato', {
        to,
        error: (err as Error).message,
      });
      return false;
    }
  }

  /** Nasiya (qarz) eslatmasi */
  async sendDebtReminder(
    email: string,
    customerName: string,
    amount: number,
    dueDate: string,
  ): Promise<boolean> {
    const formatted = new Intl.NumberFormat('uz-UZ').format(amount);
    const html = `
      <h2>RAOS — Qarz eslatmasi</h2>
      <p>Hurmatli <strong>${customerName}</strong>,</p>
      <p>${dueDate} gacha to'lanadigan qarzingiz: <strong>${formatted} so'm</strong>.</p>
      <p>Iltimos, o'z vaqtida to'lang.</p>
    `;
    return this.sendMail(email, 'Qarz eslatmasi — RAOS', html);
  }

  /** OTP */
  async sendOtp(email: string, code: string): Promise<boolean> {
    const html = `
      <h2>RAOS — Tasdiqlash kodi</h2>
      <p>Sizning kodingiz: <strong style="font-size:24px">${code}</strong></p>
      <p><em>5 daqiqa amal qiladi. Hech kimga bermang.</em></p>
    `;
    return this.sendMail(email, 'Tasdiqlash kodi — RAOS', html);
  }
}
