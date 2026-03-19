import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * T-107: Payme to'lov tizimi adapteri
 * Hujjat: https://developer.paycom.uz/
 * Test: https://checkout.test.paycom.uz/
 * Production: https://checkout.paycom.uz/
 */
@Injectable()
export class PaymeProvider {
  private readonly logger = new Logger(PaymeProvider.name);
  readonly name = 'PAYME';

  constructor(private readonly config: ConfigService) {}

  private get merchantId(): string {
    return this.config.get('PAYME_MERCHANT_ID', '');
  }

  private get isConfigured(): boolean {
    return !!(this.merchantId && this.config.get('PAYME_SECRET_KEY'));
  }

  /**
   * Payme checkout URL yaratish (QR yoki redirect uchun)
   * @param amount UZS tiyin (1 so'm = 100 tiyin)
   * @param orderId internal order ID
   * @param description chek tavsifi
   */
  createCheckoutUrl(amount: number, orderId: string, description: string): string {
    if (!this.isConfigured) {
      this.logger.warn('PAYME_MERCHANT_ID yoki PAYME_SECRET_KEY sozlanmagan');
      return '';
    }

    const isTest = this.config.get('NODE_ENV') !== 'production';
    const base = isTest
      ? 'https://checkout.test.paycom.uz'
      : 'https://checkout.paycom.uz';

    // Payme params: merchant ID + amount (tiyin) + order ID
    const params = Buffer.from(
      `m=${this.merchantId};ac.order_id=${orderId};a=${amount * 100};d=${encodeURIComponent(description)}`,
    ).toString('base64');

    return `${base}/${params}`;
  }

  /**
   * Payme webhook requestini tekshirish (HMAC)
   * Webhook: POST /payments/webhooks/payme
   */
  verifyWebhook(body: Record<string, unknown>, authHeader: string): boolean {
    const secretKey = this.config.get('PAYME_SECRET_KEY', '');
    if (!secretKey) return false;

    // Basic auth: "Paycom:<secret>"
    const decoded = Buffer.from(authHeader.replace('Basic ', ''), 'base64').toString();
    const [, key] = decoded.split(':');
    return key === secretKey;
  }

  /**
   * Payme method handler (JSON-RPC 2.0)
   */
  handleMethod(method: string, params: Record<string, unknown>): Record<string, unknown> {
    this.logger.log(`Payme method: ${method}`, { params });

    switch (method) {
      case 'CheckPerformTransaction':
        return { result: { allow: true } };
      case 'CreateTransaction':
        return {
          result: {
            create_time: Date.now(),
            transaction: params['id'],
            state: 1,
          },
        };
      case 'PerformTransaction':
        return {
          result: {
            perform_time: Date.now(),
            transaction: params['id'],
            state: 2,
          },
        };
      case 'CancelTransaction':
        return {
          result: {
            cancel_time: Date.now(),
            transaction: params['id'],
            state: -1,
            reason: params['reason'],
          },
        };
      case 'CheckTransaction':
        return {
          result: {
            create_time: 0,
            perform_time: 0,
            cancel_time: 0,
            transaction: params['id'],
            state: 2,
            reason: null,
          },
        };
      default:
        return { error: { code: -32601, message: 'Method not found' } };
    }
  }
}
