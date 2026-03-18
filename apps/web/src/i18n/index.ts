import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

export type Locale = 'uz' | 'ru' | 'en';

export const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

export const DEFAULT_LOCALE: Locale = 'uz';

const messages: Record<Locale, Record<string, Record<string, string>>> = { uz, ru, en };

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages.uz;
}

/**
 * Get a nested translation by dot-path key.
 * Supports {count} interpolation: t('time.daysAgo', { count: 3 })
 */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split('.');
  const section = parts[0];
  const field = parts.slice(1).join('.');

  const dict = messages[locale] ?? messages.uz;
  const value = dict[section]?.[field];
  if (!value) return key;

  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{${k}}`, String(v)),
    value,
  );
}

/** Date format per locale */
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<Locale, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
  return d.toLocaleDateString(localeMap[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Price format per locale */
export function formatLocalPrice(amount: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(
    locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'uz-UZ',
  ).format(Math.round(amount));

  const suffix = locale === 'en' ? ' UZS' : " so'm";
  return formatted + suffix;
}
