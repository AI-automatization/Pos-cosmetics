import type { ShiftDetail } from '../../api/sales.api';

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

export type PeriodKey = 'today' | '7d' | '30d' | 'all';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun'  },
  { key: '7d',    label: '7 kun'  },
  { key: '30d',   label: '30 kun' },
  { key: 'all',   label: 'Barchasi' },
];

export function periodStart(key: PeriodKey): Date | null {
  const now = new Date();
  switch (key) {
    case 'today': { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    case '7d':    { const d = new Date(now); d.setDate(now.getDate() - 6); d.setHours(0,0,0,0); return d; }
    case '30d':   { const d = new Date(now); d.setDate(now.getDate() - 29); d.setHours(0,0,0,0); return d; }
    default:      return null;
  }
}

export function fmt(n: number | undefined): string {
  if (!n) return '—';
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

export function fmtShort(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function duration(openedAt: Date | string, closedAt: Date | string | null): string {
  if (!closedAt) return '';
  const open  = typeof openedAt  === 'string' ? new Date(openedAt)  : openedAt;
  const close = typeof closedAt  === 'string' ? new Date(closedAt)  : closedAt;
  const mins  = Math.round((close.getTime() - open.getTime()) / 60_000);
  const h     = Math.floor(mins / 60);
  const m     = mins % 60;
  return h > 0 ? `${h}s ${m}d` : `${m}d`;
}

export function cashierName(shift: ShiftDetail): string {
  if (shift.user) return `${shift.user.firstName} ${shift.user.lastName}`.trim();
  const cn = (shift as unknown as { cashierName?: string }).cashierName;
  if (cn && cn.trim()) return cn.trim();
  return 'Kassir';
}
