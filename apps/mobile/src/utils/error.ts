import { AxiosError } from 'axios';

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) return 'Internet aloqasi yo\'q';
    const message = err.response.data?.message;
    if (typeof message === 'string') return message;
    return 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato yuz berdi';
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof AxiosError && !err.response;
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 401;
}
