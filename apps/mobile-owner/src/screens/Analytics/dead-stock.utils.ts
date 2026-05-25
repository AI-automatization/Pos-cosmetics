import { Colors } from '../../config/theme';

// ─── Types ───────────────────────────────────────────────
export type DaysThreshold = 30 | 60 | 90 | 180;
export type SortKey = 'carryingCost' | 'daysIdle' | 'totalStock';

// ─── Constants ───────────────────────────────────────────
export const THRESHOLDS: readonly { readonly key: DaysThreshold; readonly label: string }[] = [
  { key: 30, label: '30+ kun' },
  { key: 60, label: '60+ kun' },
  { key: 90, label: '90+ kun' },
  { key: 180, label: '180+ kun' },
];

export const SORT_OPTIONS: readonly { readonly key: SortKey; readonly label: string }[] = [
  { key: 'carryingCost', label: 'Zarar' },
  { key: 'daysIdle', label: 'Kunlar' },
  { key: 'totalStock', label: 'Zaxira' },
];

// ─── Helpers ─────────────────────────────────────────────
export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru-RU');
}

export function idleColor(days: number): { bg: string; text: string } {
  if (days >= 90) return { bg: Colors.dangerLight, text: Colors.danger };
  if (days >= 60) return { bg: Colors.warningLight, text: Colors.warning };
  return { bg: Colors.bgSubtle, text: Colors.textMuted };
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'Hech qachon';
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
