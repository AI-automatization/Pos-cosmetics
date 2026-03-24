import { Injectable, Logger } from '@nestjs/common';

// ─── REGOS/OFD Fiscal Adapter (Provider-agnostic) ─────────────────────────────
// Phase 1: Stub (PENDING → SENT simulatsiya)
// Phase 2: Real REGOS API (https://ofd.soliq.uz) integratsiya
//
// ⚠️ Sale ni HECH QACHON block qilma fiscal xato bo'lsa
//    Fail → PENDING, queue orqali retry (3x, exponential)

export interface FiscalReceiptPayload {
  tenantId: string;
  orderId: string;
  orderNumber: number;
  total: number;
  taxAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  cashierName: string;
  branchName?: string;
  createdAt: Date;
}

export interface FiscalReceiptResult {
  fiscalId: string;
  fiscalQr: string;
  sentAt: Date;
}

@Injectable()
export class FiscalAdapterService {
  private readonly logger = new Logger(FiscalAdapterService.name);

  /**
   * Fiskal chek yuborish.
   * Phase 1: simulatsiya (stub)
   * Phase 2: real REGOS/OFD API
   *
   * ⚠️ Exception tashlasa — caller ushlab oladi, sale block QILINMAYDI
   */
  async sendReceipt(payload: FiscalReceiptPayload): Promise<FiscalReceiptResult> {
    this.logger.log(`Fiscal: sending receipt for order ${payload.orderId}`, {
      tenantId: payload.tenantId,
      total: payload.total,
    });

    // ── Phase 1: Stub ────────────────────────────────────────────────────────
    // Real REGOS API qo'shilganda shu blok o'zgaradi, interface saqlanadi

    // Simulate network delay (dev only)
    if (process.env.NODE_ENV === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Stub: UUID-like fiscal ID + placeholder QR
    const fiscalId = `RAOS-${payload.orderId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const fiscalQr = `https://ofd.soliq.uz/check?id=${fiscalId}&time=${Date.now()}`;

    this.logger.log(`Fiscal: receipt sent OK for order ${payload.orderId}`, {
      fiscalId,
      tenantId: payload.tenantId,
    });

    return {
      fiscalId,
      fiscalQr,
      sentAt: new Date(),
    };

    // ── Phase 2 (TODO): Real REGOS API ───────────────────────────────────────
    // const response = await this.httpService.post(
    //   process.env.REGOS_API_URL + '/receipt',
    //   { ...payload },
    //   { headers: { Authorization: `Bearer ${process.env.REGOS_API_KEY}` } }
    // ).toPromise();
    // return { fiscalId: response.data.id, fiscalQr: response.data.qr, sentAt: new Date() };
  }
}
