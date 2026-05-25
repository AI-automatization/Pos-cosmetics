import { Colors } from '../../config/theme';

// ─── Types ───────────────────────────────────────────────────
export type PeriodKey = '7d' | '30d' | '90d' | '365d';

export const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d', label: '7 kun', days: 7 },
  { key: '30d', label: '30 kun', days: 30 },
  { key: '90d', label: '90 kun', days: 90 },
  { key: '365d', label: '1 yil', days: 365 },
];

// ─── Expense helpers ─────────────────────────────────────────
const EXPENSE_COLORS: Record<string, string> = {
  RENT: '#7C3AED',
  SALARY: '#2563EB',
  DELIVERY: '#EA580C',
  UTILITIES: '#0891B2',
  OTHER: '#64748B',
};

export function getExpenseColor(category: string): string {
  return EXPENSE_COLORS[category.toUpperCase()] ?? Colors.textSecondary;
}

export function getExpenseLabel(category: string): string {
  const labels: Record<string, string> = {
    RENT: 'Ijara',
    SALARY: 'Maosh',
    DELIVERY: 'Yetkazish',
    UTILITIES: 'Kommunal',
    OTHER: 'Boshqa',
  };
  return labels[category.toUpperCase()] ?? category;
}

// ─── Formatting ──────────────────────────────────────────────
export function formatAmount(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString('uz-UZ');
}

export function formatFullAmount(amount: number): string {
  return `${amount.toLocaleString('uz-UZ')} UZS`;
}

// ─── Date helpers ────────────────────────────────────────────
export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0] ?? '',
    to: to.toISOString().split('T')[0] ?? '',
  };
}
