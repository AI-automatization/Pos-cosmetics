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

  /** Owner yaratilganda kirish ma'lumotlarini yuborish */
  async sendOwnerWelcome(opts: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    slug: string;
    tenantName: string;
    loginUrl: string;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">RAOS</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Retail & Asset Operating System</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 40px 0;">
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">
            Добро пожаловать, ${opts.firstName} ${opts.lastName}!
          </h2>
          <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
            Ваш магазин <strong style="color:#111827;">${opts.tenantName}</strong> успешно создан в системе RAOS.
            Ниже ваши данные для входа — сохраните их в надёжном месте.
          </p>
        </td></tr>

        <!-- Credentials -->
        <tr><td style="padding:24px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr style="background:#f1f5f9;">
              <td colspan="2" style="padding:12px 20px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">
                Данные для входа
              </td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:14px 20px;font-size:13px;color:#6b7280;width:40%;">URL входа</td>
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#4f46e5;">
                <a href="${opts.loginUrl}" style="color:#4f46e5;text-decoration:none;">${opts.loginUrl}</a>
              </td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:14px 20px;font-size:13px;color:#6b7280;">Email (логин)</td>
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#111827;font-family:monospace;">${opts.email}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:14px 20px;font-size:13px;color:#6b7280;">Пароль</td>
              <td style="padding:14px 20px;font-size:15px;font-weight:700;color:#111827;font-family:monospace;letter-spacing:1px;">${opts.password}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:14px 20px;font-size:13px;color:#6b7280;">Slug (ID магазина)</td>
              <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#111827;font-family:monospace;">${opts.slug}</td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="${opts.loginUrl}"
            style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
            Войти в систему →
          </a>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
            Рекомендуем сменить пароль после первого входа.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            © ${new Date().getFullYear()} RAOS · Если это письмо пришло по ошибке — проигнорируйте его.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim();

    return this.sendMail(opts.email, `RAOS — Данные для входа: ${opts.tenantName}`, html);
  }
}
