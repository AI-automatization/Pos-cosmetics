import type { Product } from './ProductCard';

// ─── Payment types ─────────────────────────────────────
export type PaymentMethod = 'NAQD' | 'KARTA' | 'NASIYA';

export interface CartItem {
  product: Product;
  qty: number;
}

// ─── Utils ─────────────────────────────────────────────
export function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

// ─── Methods config ────────────────────────────────────
export interface MethodConfig {
  readonly key: PaymentMethod;
  readonly label: string;
  readonly icon: string;
  readonly color: string;
}

export const METHODS: readonly MethodConfig[] = [
  { key: 'NAQD',   label: 'Naqd',   icon: 'cash-multiple', color: '#10B981' },
  { key: 'KARTA',  label: 'Karta',  icon: 'credit-card',   color: '#3B82F6' },
  { key: 'NASIYA', label: 'Nasiya', icon: 'receipt',       color: '#F59E0B' },
] as const;
