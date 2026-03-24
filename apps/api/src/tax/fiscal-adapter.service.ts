import { Injectable, Logger } from '@nestjs/common';

// ─── REGOS/OFD Fiscal Adapter (Provider-agnostic) ─────────────────────────────
// Phase 1: Stub fallback (REGOS_API_URL not set → simulatsiya)
// Phase 2: Real REGOS API (env: REGOS_API_URL + REGOS_API_KEY)
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
  inn?: string;
  createdAt: Date;
}

export interface FiscalReceiptResult {
  fiscalId: string;
  fiscalQr: string;
  sentAt: Date;
  provider: 'REGOS' | 'STUB';
}

export interface FiscalZReportPayload {
  tenantId: string;
  sequenceNumber: number;
  date: Date;
  totalRevenue: number;
  totalTax: number;
  totalOrders: number;
  cashAmount: number;
  terminalAmount: number;
}

export interface FiscalZReportResult {
  fiscalZId: string;
  sentAt: Date;
  provider: 'REGOS' | 'STUB';
}

@Injectable()
export class FiscalAdapterService {
  private readonly logger = new Logger(FiscalAdapterService.name);
  private readonly apiUrl = process.env['REGOS_API_URL'];
  private readonly apiKey = process.env['REGOS_API_KEY'];

  private get isReal(): boolean {
    return Boolean(this.apiUrl && this.apiKey);
  }

  // ─── SEND RECEIPT ────────────────────────────────────────────────────────────

  async sendReceipt(payload: FiscalReceiptPayload): Promise<FiscalReceiptResult> {
    this.logger.log(`Fiscal: sending receipt for order ${payload.orderId}`, {
      tenantId: payload.tenantId,
      total: payload.total,
      provider: this.isReal ? 'REGOS' : 'STUB',
    });

    if (this.isReal) {
      return this.sendReceiptToRegos(payload);
    }

    return this.stubReceipt(payload.orderId);
  }

  // ─── SEND Z-REPORT ───────────────────────────────────────────────────────────

  async sendZReport(payload: FiscalZReportPayload): Promise<FiscalZReportResult> {
    this.logger.log(`Fiscal: sending Z-report seq #${payload.sequenceNumber}`, {
      tenantId: payload.tenantId,
      date: payload.date.toISOString().slice(0, 10),
      provider: this.isReal ? 'REGOS' : 'STUB',
    });

    if (this.isReal) {
      return this.sendZReportToRegos(payload);
    }

    return this.stubZReport(payload.sequenceNumber);
  }

  // ─── REGOS: Real API calls ───────────────────────────────────────────────────

  private async sendReceiptToRegos(payload: FiscalReceiptPayload): Promise<FiscalReceiptResult> {
    const body = {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      total: payload.total,
      taxAmount: payload.taxAmount,
      taxRate: 0.12,
      items: payload.items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        total: item.total,
        vatRate: 0.12,
      })),
      cashier: payload.cashierName,
      branch: payload.branchName ?? '',
      inn: payload.inn ?? '',
      time: payload.createdAt.toISOString(),
    };

    const response = await fetch(`${this.apiUrl}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Tenant-Id': payload.tenantId,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'unknown');
      throw new Error(`REGOS API error ${response.status}: ${text}`);
    }

    const data = await response.json() as { id: string; qr: string };
    this.logger.log(`Fiscal REGOS: receipt sent OK order=${payload.orderId} fiscal=${data.id}`, {
      tenantId: payload.tenantId,
    });

    return {
      fiscalId: data.id,
      fiscalQr: data.qr,
      sentAt: new Date(),
      provider: 'REGOS',
    };
  }

  private async sendZReportToRegos(payload: FiscalZReportPayload): Promise<FiscalZReportResult> {
    const body = {
      sequenceNumber: payload.sequenceNumber,
      date: payload.date.toISOString().slice(0, 10),
      totalRevenue: payload.totalRevenue,
      totalTax: payload.totalTax,
      totalOrders: payload.totalOrders,
      cashAmount: payload.cashAmount,
      terminalAmount: payload.terminalAmount,
    };

    const response = await fetch(`${this.apiUrl}/z-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Tenant-Id': payload.tenantId,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'unknown');
      throw new Error(`REGOS Z-Report API error ${response.status}: ${text}`);
    }

    const data = await response.json() as { id: string };
    this.logger.log(`Fiscal REGOS: Z-report sent OK seq=#${payload.sequenceNumber} id=${data.id}`, {
      tenantId: payload.tenantId,
    });

    return { fiscalZId: data.id, sentAt: new Date(), provider: 'REGOS' };
  }

  // ─── STUB (dev/test) ─────────────────────────────────────────────────────────

  private async stubReceipt(orderId: string): Promise<FiscalReceiptResult> {
    if (process.env['NODE_ENV'] === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const fiscalId = `STUB-${orderId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    return {
      fiscalId,
      fiscalQr: `https://ofd.soliq.uz/check?id=${fiscalId}&t=${Date.now()}`,
      sentAt: new Date(),
      provider: 'STUB',
    };
  }

  private stubZReport(seq: number): FiscalZReportResult {
    return {
      fiscalZId: `STUB-Z-${seq}-${Date.now()}`,
      sentAt: new Date(),
      provider: 'STUB',
    };
  }
}
