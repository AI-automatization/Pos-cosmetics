// Promotion — backend (apps/api/src/sales/promotions) schema ga mos

export type PromotionType = 'PERCENT' | 'FIXED' | 'BUY_X_GET_Y' | 'BUNDLE';

// PERCENT:    rules = { percent: number }
// FIXED:      rules = { amount: number }
// BUY_X_GET_Y: rules = { buyQty: number; getQty: number }
// BUNDLE:     rules = { productIds: string[]; discount: number }
export type PromotionRules =
  | { percent: number }
  | { amount: number }
  | { buyQty: number; getQty: number }
  | { productIds: string[]; discount: number };

export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  type: PromotionType;
  rules: PromotionRules;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  name: string;
  type: PromotionType;
  rules: Record<string, unknown>;
  validFrom: string;
  validTo?: string;
  isActive?: boolean;
}

export type UpdatePromotionDto = Partial<Omit<CreatePromotionDto, 'type'>>;

export const PROMO_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENT: 'Foiz chegirma',
  FIXED: "Belgilangan chegirma",
  BUY_X_GET_Y: 'N ta olsang M ta bepul',
  BUNDLE: 'Paket narx',
};

export const PROMO_TYPE_COLORS: Record<PromotionType, string> = {
  PERCENT: 'bg-blue-100 text-blue-700',
  FIXED: 'bg-green-100 text-green-700',
  BUY_X_GET_Y: 'bg-purple-100 text-purple-700',
  BUNDLE: 'bg-orange-100 text-orange-700',
};

// Demo fallback — backend tayyor bo'lmagan paytda
export const DEMO_PROMOTIONS: Promotion[] = [
  {
    id: 'demo-1',
    tenantId: 'demo',
    name: "10% chegirma (bahor aksiyasi)",
    type: 'PERCENT',
    rules: { percent: 10 },
    validFrom: '2026-03-01T00:00:00.000Z',
    validTo: '2026-06-30T23:59:59.000Z',
    isActive: true,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'demo-2',
    tenantId: 'demo',
    name: '5 000 so\'m chegirma',
    type: 'FIXED',
    rules: { amount: 5000 },
    validFrom: '2026-03-01T00:00:00.000Z',
    validTo: null,
    isActive: true,
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
  },
  {
    id: 'demo-3',
    tenantId: 'demo',
    name: '2 ta olsang 1 ta bepul',
    type: 'BUY_X_GET_Y',
    rules: { buyQty: 2, getQty: 1 },
    validFrom: '2026-03-10T00:00:00.000Z',
    validTo: '2026-04-10T23:59:59.000Z',
    isActive: false,
    createdAt: '2026-03-10T00:00:00.000Z',
    updatedAt: '2026-03-10T00:00:00.000Z',
  },
  {
    id: 'demo-4',
    tenantId: 'demo',
    name: 'Paket: 3 mahsulot — 15% chegirma',
    type: 'BUNDLE',
    rules: { productIds: [], discount: 15 },
    validFrom: '2026-03-15T00:00:00.000Z',
    validTo: null,
    isActive: true,
    createdAt: '2026-03-15T00:00:00.000Z',
    updatedAt: '2026-03-15T00:00:00.000Z',
  },
];
