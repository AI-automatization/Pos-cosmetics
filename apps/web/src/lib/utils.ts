import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const msg = err.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
    return 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato yuz berdi';
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "0 so'm";
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Type-safe field access for dynamic sorting.
 * Returns field value as string | number | null | undefined for comparison.
 */
export function getField<T>(obj: T, field: keyof T): string | number | null | undefined {
  const val = obj[field];
  if (val === null || val === undefined) return val as null | undefined;
  if (typeof val === 'string' || typeof val === 'number') return val;
  return String(val);
}

/**
 * Generic comparator for sorting by a dynamic field.
 * Handles nulls (pushed to end) and string/number comparison.
 */
export function compareSortValues(
  aVal: string | number | null | undefined,
  bVal: string | number | null | undefined,
  dir: 'asc' | 'desc',
): number {
  if (aVal == null) return 1;
  if (bVal == null) return -1;
  const cmp =
    typeof aVal === 'string'
      ? aVal.localeCompare(bVal as string)
      : (aVal as number) > (bVal as number)
      ? 1
      : (aVal as number) < (bVal as number)
      ? -1
      : 0;
  return dir === 'asc' ? cmp : -cmp;
}
