'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { type Locale, DEFAULT_LOCALE, translate, formatDate, formatLocalPrice } from './index';

const LS_KEY = 'raos_locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  fmtDate: (date: Date | string) => string;
  fmtPrice: (amount: number) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  fmtDate: (d) => String(d),
  fmtPrice: (a) => String(a),
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start with DEFAULT_LOCALE on server to avoid SSR/client hydration mismatch (#418)
  // Sync from localStorage on client only after mount
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'uz' || stored === 'ru' || stored === 'en') {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LS_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  const fmtDate = useCallback(
    (date: Date | string) => formatDate(date, locale),
    [locale],
  );

  const fmtPrice = useCallback(
    (amount: number) => formatLocalPrice(amount, locale),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, fmtDate, fmtPrice }),
    [locale, setLocale, t, fmtDate, fmtPrice],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
