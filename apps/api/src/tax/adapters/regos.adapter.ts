import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UZ_VAT_RATE } from '../../common/utils/currency.util';
import type {
  FiscalAdapter,
  FiscalReceiptPayload,
  FiscalReceiptResult,
  FiscalZReportPayload,
  FiscalZReportResult,
} from './fiscal-adapter.interface';

// ─── REGOS OFD Adapter ─────────────────────────────────────────────────────
// JSON-RPC 2.0 protokoli, Base64 authentication
// Dokumentatsiya: docs.regos.uz
// ⚠️ Sale ni HECH QACHON block qilma fiscal xato bo'lsa

const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class RegosAdapter implements FiscalAdapter {
  readonly provider = 'REGOS';
  private readonly logger = new Logger(RegosAdapter.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiUrl = this.config.get<string>('OFD_API_URL', '');
    this.apiKey = this.config.get<string>('OFD_API_KEY', '');
  }

  // REGOS hujjatida auth ham headerda, ham JSON-RPC body da ko'rsatilgan
  // (docs/OFD-integration-spec.md §2.1 vs §2.2) — sandbox tasdiqlagunga qadar ikkalasini yuboramiz
  private async parseJson<T>(response: Response, context: string): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch {
      const text = await response.text().catch(() => 'unparseable');
      throw new Error(`REGOS ${context}: invalid JSON response: ${text.slice(0, 200)}`);
    }
  }

  // ─── SEND RECEIPT ──────────────────────────────────────────────────────────

  async sendReceipt(payload: FiscalReceiptPayload): Promise<FiscalReceiptResult> {
    this.logger.log(`REGOS: sending receipt order=${payload.orderId}`, {
      tenantId: payload.tenantId,
      total: payload.total,
    });

    const body = {
      jsonrpc: '2.0',
      method: 'Receipt.Send',
      auth: this.apiKey,
      id: payload.orderId,
      params: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        total: payload.total,
        taxAmount: payload.taxAmount,
        taxRate: UZ_VAT_RATE,
        items: payload.items.map((item) => ({
          name: item.name,
          ikpuCode: item.ikpuCode ?? '',
          qty: item.quantity,
          price: item.price,
          total: item.total,
          vatRate: UZ_VAT_RATE,
        })),
        cashier: payload.cashierName,
        branch: payload.branchName ?? '',
        inn: payload.inn ?? '',
        time: payload.createdAt.toISOString(),
      },
    };

    const response = await fetch(`${this.apiUrl}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.apiKey}`,
        'X-Tenant-Id': payload.tenantId,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'unknown');
      throw new Error(`REGOS receipt error ${response.status}: ${text}`);
    }

    const data = await this.parseJson<{
      result: { id: string; qr: string; terminalId?: string; fiscalSign?: string };
    }>(response, 'receipt');

    this.logger.log(`REGOS: receipt OK order=${payload.orderId} fiscal=${data.result.id}`, {
      tenantId: payload.tenantId,
    });

    return {
      fiscalId: data.result.id,
      fiscalQr: data.result.qr,
      terminalId: data.result.terminalId,
      fiscalSign: data.result.fiscalSign,
      sentAt: new Date(),
      provider: this.provider,
    };
  }

  // ─── SEND Z-REPORT ────────────────────────────────────────────────────────

  async sendZReport(payload: FiscalZReportPayload): Promise<FiscalZReportResult> {
    this.logger.log(`REGOS: sending Z-report seq=#${payload.sequenceNumber}`, {
      tenantId: payload.tenantId,
    });

    const body = {
      jsonrpc: '2.0',
      method: 'ZReport.Send',
      auth: this.apiKey,
      id: `z-${payload.sequenceNumber}`,
      params: {
        sequenceNumber: payload.sequenceNumber,
        date: payload.date.toISOString().slice(0, 10),
        totalRevenue: payload.totalRevenue,
        totalTax: payload.totalTax,
        totalOrders: payload.totalOrders,
        cashAmount: payload.cashAmount,
        terminalAmount: payload.terminalAmount,
      },
    };

    const response = await fetch(`${this.apiUrl}/z-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.apiKey}`,
        'X-Tenant-Id': payload.tenantId,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'unknown');
      throw new Error(`REGOS Z-report error ${response.status}: ${text}`);
    }

    const data = await this.parseJson<{ result: { id: string } }>(response, 'Z-report');

    this.logger.log(`REGOS: Z-report OK seq=#${payload.sequenceNumber} id=${data.result.id}`, {
      tenantId: payload.tenantId,
    });

    return {
      fiscalZId: data.result.id,
      sentAt: new Date(),
      provider: this.provider,
    };
  }

  // ─── CHECK RECEIPT ─────────────────────────────────────────────────────────

  async checkReceipt(qrCodeUrl: string): Promise<{ valid: boolean; data?: Record<string, unknown> }> {
    const body = {
      jsonrpc: '2.0',
      method: 'Receipt.CheckQRCodeUrl',
      auth: this.apiKey,
      id: `check-${Date.now()}`,
      params: { QRCodeURL: qrCodeUrl },
    };

    const response = await fetch(`${this.apiUrl}/receipts/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { valid: false };
    }

    let data: { result: Record<string, unknown> };
    try {
      data = await this.parseJson<{ result: Record<string, unknown> }>(response, 'check');
    } catch {
      return { valid: false };
    }
    return { valid: true, data: data.result };
  }
}
