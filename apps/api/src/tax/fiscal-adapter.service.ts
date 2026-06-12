import { Inject, Injectable } from '@nestjs/common';
import {
  FISCAL_ADAPTER,
  type FiscalAdapter,
  type FiscalReceiptPayload,
  type FiscalReceiptResult,
  type FiscalZReportPayload,
  type FiscalZReportResult,
} from './adapters/fiscal-adapter.interface';

// Re-export for backward compatibility
export type { FiscalReceiptPayload, FiscalReceiptResult, FiscalZReportPayload, FiscalZReportResult };

// ─── Fiscal Adapter Service (Provider-agnostic) ─────────────────────────────
// Adapter tanlovi tax.module.ts dagi FISCAL_ADAPTER useFactory da:
//   OFD_PROVIDER=REGOS (+ OFD_API_URL/KEY) → real REGOS OFD API
//   aks holda → STUB simulatsiya (dev/test, default)
//
// ⚠️ Sale ni HECH QACHON block qilma fiscal xato bo'lsa
//    Fail → PENDING, queue orqali retry (3x, exponential)

@Injectable()
export class FiscalAdapterService {
  constructor(@Inject(FISCAL_ADAPTER) private readonly adapter: FiscalAdapter) {}

  get provider(): string {
    return this.adapter.provider;
  }

  async sendReceipt(payload: FiscalReceiptPayload): Promise<FiscalReceiptResult> {
    return this.adapter.sendReceipt(payload);
  }

  async sendZReport(payload: FiscalZReportPayload): Promise<FiscalZReportResult> {
    return this.adapter.sendZReport(payload);
  }

  async checkReceipt(qrCodeUrl: string): Promise<{ valid: boolean; data?: Record<string, unknown> }> {
    return this.adapter.checkReceipt(qrCodeUrl);
  }
}
