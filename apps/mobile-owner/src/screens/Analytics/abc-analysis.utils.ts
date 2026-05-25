import { Colors } from '../../config/theme';

// ─── Constants ────────────────────────────────────────────
export const GROUP_COLORS: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  A: { bg: Colors.successLight, text: Colors.success, bar: '#22C55E', label: 'Yuqori daromad' },
  B: { bg: Colors.warningLight, text: Colors.warning, bar: '#F59E0B', label: "O'rta daromad" },
  C: { bg: Colors.bgSubtle, text: Colors.textSecondary, bar: '#94A3B8', label: 'Past daromad' },
};

export const DEFAULT_GROUP_COLORS = { bg: Colors.bgSubtle, text: Colors.textSecondary, bar: '#94A3B8', label: 'Past daromad' };

export type DayRange = 7 | 30 | 90;

export const RANGES: { key: DayRange; label: string }[] = [
  { key: 7, label: '7 kun' },
  { key: 30, label: '30 kun' },
  { key: 90, label: '90 kun' },
];

export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('ru-RU');
}

export function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
