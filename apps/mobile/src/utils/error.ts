import { AxiosError } from 'axios';

/**
 * Backend endpoint hali yo'q (404/501) bo'lsa, fallback data qaytaradi.
 * Real xatolar (500, network) esa throw qilinadi.
 */
export function safeQueryFn<T>(fn: () => Promise<T>, fallback: T): () => Promise<T> {
  return async () => {
    try {
      return await fn();
    } catch (err: unknown) {
      if (err instanceof AxiosError && (err.response?.status === 404 || err.response?.status === 501)) {
        return fallback;
      }
      throw err;
    }
  };
}

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
