import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * T-106: Eskiz.uz SMS xizmati
 * Hujjat: https://eskiz.uz/
 * API: POST https://notify.eskiz.uz/api/message/sms/send
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = 'https://notify.eskiz.uz/api';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly config: ConfigService) {}

  private isConfigured(): boolean {
    return !!(this.config.get('ESKIZ_EMAIL') && this.config.get('ESKIZ_PASSWORD'));
  }

  private async getToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;

    // Token hali valid bo'lsa, qaytaramiz
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      const res = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.config.get('ESKIZ_EMAIL'),
          password: this.config.get('ESKIZ_PASSWORD'),
        }),
      });
      const data = (await res.json()) as { data?: { token: string } };
      if (data.data?.token) {
        this.token = data.data.token;
        // Token 29 kun amal qiladi
        this.tokenExpiry = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);
        return this.token;
      }
    } catch (err) {
      this.logger.error('Eskiz.uz token olishda xato', { error: (err as Error).message });
    }
    return null;
  }

  /**
   * SMS yuborish.
   * @param phone +998XXXXXXXXX format
   * @param message O'zbek yoki lotin
   * @returns true = yuborildi, false = xato
   */
  async sendSms(phone: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn('Eskiz.uz sozlanmagan (ESKIZ_EMAIL/ESKIZ_PASSWORD yo\'q)');
      return false;
    }

    const token = await this.getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${this.apiUrl}/message/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_phone: phone.replace('+', ''),
          message,
          from: this.config.get('ESKIZ_SENDER_NAME', '4546'),
          callback_url: '',
        }),
      });

      const data = (await res.json()) as { status?: string; id?: string };
      if (data.status === 'waiting' || data.id) {
        this.logger.log(`SMS yuborildi: ${phone} → id=${data.id}`);
        return true;
      }

      this.logger.warn('SMS yuborishda xato javob', { data });
      return false;
    } catch (err) {
      this.logger.error('SMS yuborishda xato', {
        phone,
        error: (err as Error).message,
      });
      return false;
    }
  }

  /**
   * T-106: Nasiya eslatmasi SMS
   */
  async sendDebtReminder(phone: string, customerName: string, amount: number, dueDate: string): Promise<boolean> {
    const formatted = new Intl.NumberFormat('uz-UZ').format(amount);
    const message = `${customerName}, sizning ${dueDate} gacha to'lov muddati bor: ${formatted} so'm. Iltimos o'z vaqtida to'lang.`;
    return this.sendSms(phone, message);
  }

  /**
   * T-106: OTP SMS
   */
  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `RAOS: Tasdiqlash kodi: ${code}. 5 daqiqa amal qiladi.`;
    return this.sendSms(phone, message);
  }
}
