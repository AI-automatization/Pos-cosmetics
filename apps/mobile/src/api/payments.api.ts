import api from './client';

// ─── Types ──────────────────────────────────────────────

export type PaymentIntentStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'SETTLED'
  | 'FAILED'
  | 'REVERSED';

export interface PaymentIntentResponse {
  readonly id: string;
  readonly orderId: string;
  readonly method: string;
  readonly amount: number;
  readonly status: PaymentIntentStatus;
  readonly provider: string | null;
  readonly providerRef: string | null;
  readonly qrCodeUrl: string | null;
  readonly deeplink: string | null;
  readonly checkoutUrl: string | null;
  readonly expiresAt: string | null;
}

export interface CreateIntentPayload {
  readonly orderId: string;
  readonly method: string;
  readonly amount: number;
}

// ─── API ────────────────────────────────────────────────

export const paymentsApi = {
  /** Create a payment intent for an order */
  createIntent: async (
    payload: CreateIntentPayload,
  ): Promise<PaymentIntentResponse> => {
    const { data } = await api.post<PaymentIntentResponse>(
      '/payments/intent',
      payload,
    );
    return data;
  },

  /** Poll payment intent status */
  getIntentStatus: async (
    intentId: string,
  ): Promise<PaymentIntentResponse> => {
    const { data } = await api.get<PaymentIntentResponse>(
      `/payments/intent/${intentId}`,
    );
    return data;
  },

  /** Cancel a payment intent */
  cancelIntent: async (intentId: string): Promise<void> => {
    await api.post(`/payments/intent/${intentId}/cancel`);
  },
};
