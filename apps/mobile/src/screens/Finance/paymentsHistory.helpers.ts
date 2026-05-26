import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OrderStatus } from '@raos/types';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
};

// ─── Period config ─────────────────────────────────────
export type PeriodKey = 'today' | '7d' | '30d' | '90d';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d',    label: '7 kun' },
  { key: '30d',   label: '30 kun' },
  { key: '90d',   label: '90 kun' },
];

export function getPeriodDates(key: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  switch (key) {
    case 'today': from.setHours(0, 0, 0, 0); break;
    case '7d':    from.setDate(now.getDate() - 6); break;
    case '30d':   from.setDate(now.getDate() - 29); break;
    case '90d':   from.setDate(now.getDate() - 89); break;
  }
  return { from: from.toISOString().split('T')[0]!, to };
}

// ─── Method filter ─────────────────────────────────────
export type MethodKey = 'Barchasi' | 'Naqd' | 'Karta' | 'Nasiya' | 'Click' | 'Payme';

export const METHODS: { key: MethodKey; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'Barchasi', icon: 'apps-outline' },
  { key: 'Naqd',    icon: 'cash-outline' },
  { key: 'Karta',   icon: 'card-outline' },
  { key: 'Nasiya',  icon: 'time-outline' },
  { key: 'Click',   icon: 'phone-portrait-outline' },
  { key: 'Payme',   icon: 'logo-bitcoin' },
];

// ─── Status config ─────────────────────────────────────
export const STATUS_STYLE: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: 'Bajarildi', color: C.green,   bg: '#F0FDF4' },
  RETURNED:  { label: 'Qaytarildi', color: C.orange, bg: '#FFFBEB' },
  VOIDED:    { label: 'Bekor',      color: C.red,    bg: '#FEF2F2' },
};

// ─── Helpers ───────────────────────────────────────────

/** Space-separated thousands formatter (Hermes-safe, no toLocaleString) */
export function fmt(n: number): string {
  const abs = Math.abs(n);
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '-' : '') + formatted + ' UZS';
}

/**
 * Compact number formatter for stat cards (small space).
 * < 1 000        -> "950"
 * < 1 000 000    -> "42 500" (space-separated thousands)
 * < 1 000 000 000 -> "42.5 mln"
 * >= 1 000 000 000 -> "1.2 mlrd"
 */
export function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    const rounded = Math.round(val * 10) / 10;
    return sign + rounded.toString().replace('.', ',') + ' mlrd';
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const rounded = Math.round(val * 10) / 10;
    return sign + rounded.toString().replace('.', ',') + ' mln';
  }
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + formatted;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

// ─── OrderWithMethod type ──────────────────────────────
export type OrderWithMethod = { paymentMethod?: string | null } & {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  total: number;
  createdAt: Date | string;
  customerId: string | null;
};
