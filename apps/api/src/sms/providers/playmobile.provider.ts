import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type {
  SmsGateway,
  SmsSendResult,
  SmsBalanceResult,
  SmsDeliveryResult,
} from '../interfaces/sms-gateway.interface';

const PLAYMOBILE_API = 'https://send.smsxabar.uz/broker-api/send';

interface PlayMobileResponse {
  status?: string;
  message_id?: string;
  error?: string;
}

@Injectable()
export class PlayMobileProvider implements SmsGateway {
  readonly name = 'playmobile';
  private readonly logger = new Logger(PlayMobileProvider.name);
  private readonly login: string;
  private readonly password: string;
  private readonly originator: string;

  constructor(private readonly config: ConfigService) {
    this.login = this.config.get<string>('PLAYMOBILE_LOGIN', '');
    this.password = this.config.get<string>('PLAYMOBILE_PASSWORD', '');
    this.originator = this.config.get<string>('PLAYMOBILE_ORIGINATOR', 'RAOS');
  }

  async send(phone: string, text: string): Promise<SmsSendResult> {
    if (!this.login || !this.password) {
      this.logger.warn('PlayMobile credentials not configured');
      return { success: false, errorMessage: 'SMS provider not configured' };
    }

    try {
      const body = {
        messages: [
          {
            recipient: this.normalizePhone(phone),
            'message-id': `raos-${randomUUID()}`,
            sms: {
              originator: this.originator,
              content: { text },
            },
          },
        ],
      };

      const res = await fetch(PLAYMOBILE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.login}:${this.password}`).toString('base64')}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`PlayMobile send failed: ${res.status} ${errText}`);
        return { success: false, errorMessage: `HTTP ${res.status}` };
      }

      const data = (await res.json()) as PlayMobileResponse;
      return {
        success: true,
        providerMessageId: data.message_id ?? body.messages[0]['message-id'],
        costInTiyin: 10000, // ~100 so'm default estimate
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`PlayMobile send error: ${msg}`);
      return { success: false, errorMessage: msg };
    }
  }

  async sendBulk(messages: Array<{ phone: string; text: string }>): Promise<SmsSendResult[]> {
    const results: SmsSendResult[] = [];
    for (const msg of messages) {
      results.push(await this.send(msg.phone, msg.text));
    }
    return results;
  }

  async getBalance(): Promise<SmsBalanceResult> {
    // PlayMobile balance API — depends on contract
    return { balance: 0, currency: 'UZS' };
  }

  async getDeliveryStatus(providerMessageId: string): Promise<SmsDeliveryResult> {
    // PlayMobile DLR callback — depends on contract
    return { providerMessageId, status: 'pending' };
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('998') && digits.length === 12) return digits;
    if (digits.startsWith('9') && digits.length === 9) return `998${digits}`;
    return digits;
  }
}
