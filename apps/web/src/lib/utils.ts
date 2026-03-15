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
