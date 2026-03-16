import { AxiosError } from 'axios';
import i18n from '../i18n';

export function extractErrorMessage(err: unknown): string {
  const t = i18n.t.bind(i18n);

  if (err instanceof AxiosError) {
    if (!err.response) return t('common.noInternet');
    const message = (err.response.data as { message?: string })?.message;
    if (message) return message;
    if (err.response.status >= 500) return t('common.serverError');
    return t('common.unknownError');
  }

  if (err instanceof Error) return err.message;

  return t('common.unknownError');
}
