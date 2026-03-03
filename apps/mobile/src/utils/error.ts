import { AxiosError } from 'axios';

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) return 'Internet aloqasi yo\'q';
    const msg = err.response.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg[0] as string;
    return 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato';
}
