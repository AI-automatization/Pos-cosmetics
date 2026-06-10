/**
 * Adetal marketplace integration constants
 */

/** Adetal order status → RAOS OrderStatus mapping (values must match Prisma OrderStatus enum) */
export const ADETAL_ORDER_STATUS_MAP = {
  PENDING: 'PENDING',
  PAYMENT_REVIEW: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'CONFIRMED',
  DELIVERED: 'COMPLETED',
  CANCELLED: 'VOIDED',
} as const satisfies Record<string, 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'RETURNED' | 'VOIDED'>;

/** Adetal product moderation statuses */
export const ADETAL_PRODUCT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

/** Buffer before token expiry to trigger refresh (5 minutes) */
export const ADETAL_TOKEN_BUFFER_MS = 5 * 60 * 1000;

/** Default Adetal API base URL */
export const ADETAL_DEFAULT_API_URL = 'https://api.adetal.uz';

/** Integration provider name (used in IntegrationConfig) */
export const ADETAL_PROVIDER = 'ADETAL';

/** Order origin marker */
export const ADETAL_ORDER_ORIGIN = 'ADETAL';

/** Default product category when none specified */
export const ADETAL_DEFAULT_CATEGORY = 'Aksessuarlar';
