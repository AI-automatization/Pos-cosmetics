import { Colors } from '../../config/theme';

// ─── Period config ─────────────────────────────────────
export type PeriodKey = 'today' | 'week' | 'month' | 'year';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: 'week', label: 'Hafta' },
  { key: 'month', label: 'Oy' },
  { key: 'year', label: 'Yil' },
];

// ─── Rank badge colors ────────────────────────────────
export const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEF3C7', text: '#D97706' },
  2: { bg: '#E5E7EB', text: '#6B7280' },
  3: { bg: '#FFEDD5', text: '#EA580C' },
};

export const DEFAULT_RANK = { bg: Colors.bgSubtle, text: Colors.textMuted };
