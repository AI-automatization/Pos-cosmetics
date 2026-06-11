import type { DebtStatus } from '../../api/nasiya.api';

// ─── Status color maps ─────────────────────────────────
export const STATUS_COLORS: Record<DebtStatus, { bg: string; text: string }> = {
  ACTIVE:    { bg: '#EFF6FF', text: '#2563EB' },
  PARTIAL:   { bg: '#FFFBEB', text: '#D97706' },
  PAID:      { bg: '#F0FDF4', text: '#16A34A' },
  OVERDUE:   { bg: '#FEF2F2', text: '#DC2626' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
};

export const PROGRESS_COLOR: Record<DebtStatus, string> = {
  ACTIVE:    '#2563EB',
  PARTIAL:   '#D97706',
  PAID:      '#16A34A',
  OVERDUE:   '#DC2626',
  CANCELLED: '#9CA3AF',
};

const STATUS_LABEL: Record<DebtStatus, string> = {
  ACTIVE:    'Faol',
  PARTIAL:   'Qisman',
  PAID:      "To'langan",
  OVERDUE:   "Muddati o'tgan",
  CANCELLED: 'Bekor qilindi',
};

// ─── Helper functions ──────────────────────────────────
export function statusLabel(status: DebtStatus): string {
  return STATUS_LABEL[status];
}

// Parse a backend due-date string; returns null for null/empty OR an
// unparseable (invalid) date, so all callers share one DRY validity guard.
function parseDate(dueDate: string | null): Date | null {
  if (!dueDate) return null;
  const parsed = new Date(dueDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function overdueDays(dueDate: string | null): number {
  const due = parseDate(dueDate);
  if (!due) return 0;
  const diff = Date.now() - due.getTime();
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0;
}

export function formatDueDate(dueDate: string | null): string {
  const due = parseDate(dueDate);
  if (!due) return 'Muddat belgilanmagan';
  return due.toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export interface AgeBucket {
  label: string;
  bg: string;
  text: string;
}

export function ageBucket(dueDate: string | null): AgeBucket {
  if (!dueDate) return { label: 'Joriy', bg: '#F0FDF4', text: '#16A34A' };
  const due = parseDate(dueDate);
  if (!due) return { label: 'Muddat belgilanmagan', bg: '#F3F4F6', text: '#6B7280' };
  const days = Math.floor((Date.now() - due.getTime()) / 86_400_000);
  if (days <= 0) return { label: 'Joriy', bg: '#F0FDF4', text: '#16A34A' };
  if (days <= 30) return { label: `${days} kun`, bg: '#FFFBEB', text: '#D97706' };
  if (days <= 60) return { label: `${days} kun`, bg: '#FEF3C7', text: '#B45309' };
  if (days <= 90) return { label: `${days} kun`, bg: '#FFEDD5', text: '#EA580C' };
  return { label: `${days} kun`, bg: '#FEF2F2', text: '#DC2626' };
}
