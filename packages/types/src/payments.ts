// ─── PAYMENTS TYPES ───────────────────────────────────────────

export type PaymentMethod =
  | 'CASH'
  | 'TERMINAL'
  | 'CLICK'
  | 'PAYME'
  | 'TRANSFER'
  | 'DEBT';

export type PaymentIntentStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'SETTLED'
  | 'FAILED'
  | 'REVERSED';

export interface PaymentIntent {
  id: string;
  tenantId: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentIntentStatus;
  amount: number;
  provider: string | null;
  providerRef: string | null;
  commission: number | null;
  meta: unknown;
  createdAt: Date;
  updatedAt: Date;
}

// ─── REQUEST TYPES ────────────────────────────────────────────

export interface CreatePaymentIntentPayload {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  provider?: string;
  providerRef?: string;
}

export interface SplitPaymentPayload {
  payments: CreatePaymentIntentPayload[];
}
