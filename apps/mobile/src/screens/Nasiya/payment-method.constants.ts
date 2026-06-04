import type { RecordPaymentDto } from '@/api/nasiya.api';

/**
 * Nasiya (debt) payment-method UI labels shown in the DebtPaymentForm chips.
 * Order is preserved: index 0 is the default selection.
 */
export const NASIYA_PAYMENT_METHODS = ['Naqd', 'Karta', 'Bank transfer'] as const;

export type NasiyaPaymentLabel = (typeof NASIYA_PAYMENT_METHODS)[number];

/**
 * Maps the localized Nasiya UI label to the backend Prisma `PaymentMethod`
 * enum string the API expects (CASH | TERMINAL | TRANSFER subset).
 * The chips keep displaying the label; only the value sent to
 * `recordPayment` is mapped through here.
 */
export const NASIYA_METHOD_TO_ENUM: Record<NasiyaPaymentLabel, RecordPaymentDto['paymentMethod']> = {
  Naqd: 'CASH',
  Karta: 'TERMINAL',
  'Bank transfer': 'TRANSFER',
};
