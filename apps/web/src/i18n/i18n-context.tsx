'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { type Locale, DEFAULT_LOCALE, translate, formatDate, formatLocalPrice } from './index';

const LS_KEY = 'raos_locale';

function loadLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = localStorage.getItem(LS_KEY);
  if (stored === 'uz' || stored === 'ru' || stored === 'en') return stored;
  return DEFAULT_LOCALE;
}

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
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

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
