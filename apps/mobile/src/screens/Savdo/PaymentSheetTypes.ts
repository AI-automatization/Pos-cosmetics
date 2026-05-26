import type { Product } from './ProductCard';

// ─── Payment types ─────────────────────────────────────
export type PaymentMethod = 'NAQD' | 'KARTA' | 'NASIYA' | 'PAYME' | 'CLICK' | 'UZUM';

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
  readonly isOnline?: boolean;
}

export const METHODS: readonly MethodConfig[] = [
  { key: 'NAQD',   label: 'Naqd',   icon: 'cash-multiple',     color: '#10B981' },
  { key: 'KARTA',  label: 'Karta',  icon: 'credit-card',       color: '#3B82F6' },
  { key: 'NASIYA', label: 'Nasiya', icon: 'receipt',           color: '#F59E0B' },
  { key: 'PAYME',  label: 'Payme',  icon: 'cellphone-nfc',     color: '#00CCCC', isOnline: true },
  { key: 'CLICK',  label: 'Click',  icon: 'lightning-bolt',    color: '#00AA00', isOnline: true },
  { key: 'UZUM',   label: 'Uzum',   icon: 'storefront-outline', color: '#7B2FBE', isOnline: true },
] as const;

// ─── Online payment helpers ──────────────────────────
export const ONLINE_METHODS: PaymentMethod[] = ['PAYME', 'CLICK', 'UZUM'];

export function isOnlineMethod(m: PaymentMethod): boolean {
  return ONLINE_METHODS.includes(m);
}
