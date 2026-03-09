import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

/**
 * T-107: Click to'lov tizimi adapteri
 * Hujjat: https://docs.click.uz/
 */
@Injectable()
export class ClickProvider {
  private readonly logger = new Logger(ClickProvider.name);
  readonly name = 'CLICK';

  constructor(private readonly config: ConfigService) {}

  private get serviceId(): string {
    return this.config.get('CLICK_SERVICE_ID', '');
  }

  private get merchantId(): string {
    return this.config.get('CLICK_MERCHANT_ID', '');
  }

  private get secretKey(): string {
    return this.config.get('CLICK_SECRET_KEY', '');
  }

  private get isConfigured(): boolean {
    return !!(this.serviceId && this.merchantId && this.secretKey);
  }

  /**
   * Click checkout URL yaratish
   * @param amount UZS so'm
   * @param orderId internal order ID
   */
  createCheckoutUrl(amount: number, orderId: string): string {
    if (!this.isConfigured) {
      this.logger.warn('CLICK_SERVICE_ID, CLICK_MERCHANT_ID yoki CLICK_SECRET_KEY sozlanmagan');
      return '';
    }

    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: String(amount),
      transaction_param: orderId,
      return_url: this.config.get('APP_URL', 'https://raos.uz'),
    });

    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

  /**
   * Click Prepare webhook tekshirish
   * Click HMAC: MD5(click_trans_id + service_id + secret_key + merchant_trans_id + amount + action + sign_time)
   */
  verifySignature(params: {
    clickTransId: string;
    merchantTransId: string;
    amount: string;
    action: string;
    signTime: string;
    signString: string;
  }): boolean {
    if (!this.isConfigured) return false;

    const raw = [
      params.clickTransId,
      this.serviceId,
      this.secretKey,
      params.merchantTransId,
      params.amount,
      params.action,
      params.signTime,
    ].join('');

    const expected = createHash('md5').update(raw).digest('hex');
    return expected === params.signString;
  }

  /**
   * Click Prepare webhook handler
   */
  handlePrepare(body: Record<string, unknown>): Record<string, unknown> {
    this.logger.log('Click Prepare', { body });
    const clickTransId = body['click_trans_id'];
    const merchantTransId = body['merchant_trans_id'];

    // TODO: Buyurtmani tekshirish, idempotency key
    return {
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_prepare_id: merchantTransId,
      error: 0,
      error_note: 'Success',
    };
  }

  /**
   * Click Complete webhook handler
   */
  handleComplete(body: Record<string, unknown>): Record<string, unknown> {
    this.logger.log('Click Complete', { body });
    const error = Number(body['error'] ?? 0);

    if (error < 0) {
      this.logger.warn('Click to\'lov bekor qilindi', { error });
      return {
        click_trans_id: body['click_trans_id'],
        merchant_trans_id: body['merchant_trans_id'],
        error: 0,
        error_note: 'Success',
      };
    }

    return {
      click_trans_id: body['click_trans_id'],
      merchant_trans_id: body['merchant_trans_id'],
      merchant_confirm_id: body['merchant_prepare_id'],
      error: 0,
      error_note: 'Success',
    };
  }
}
