import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../config/theme';

// ─── Period config ─────────────────────────────────────
export type PeriodKey = 'today' | '7d' | '30d';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d', label: '7 kun' },
  { key: '30d', label: '30 kun' },
];

export function periodDates(key: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  switch (key) {
    case 'today':
      return { from: to, to };
    case '7d': {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      return { from: d.toISOString().split('T')[0]!, to };
    }
    case '30d': {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      return { from: d.toISOString().split('T')[0]!, to };
    }
  }
}

// ─── Helpers ──────────────────────────────────────────
export function discrepancyColor(d: number | null): string {
  if (d === null) return Colors.textMuted;
  if (d === 0) return Colors.success;
  if (d < 0) return Colors.danger;
  return Colors.info;
}

export function discrepancyLabel(d: number | null): string {
  if (d === null) return '---';
  if (d === 0) return '0 UZS (OK)';
  const sign = d > 0 ? '+' : '';
  return `${sign}${formatCurrency(d)}`;
}
