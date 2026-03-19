'use client';

import { useEffect, useState, useCallback } from 'react';

const SETTINGS_KEY = 'raos_printer_settings';
const PRINT_DELAY_MS = 300;

interface PrinterSettings {
  enabled: boolean;
  autoPrint: boolean;
  paperWidth: '58' | '80';
  copies: number;
  openDrawerOnCash: boolean;
}

const DEFAULTS: PrinterSettings = {
  enabled: true,
  autoPrint: false,
  paperWidth: '80',
  copies: 1,
  openDrawerOnCash: false,
};

function loadSettings(): PrinterSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function useReceiptPrint() {
  const [settings, setSettings] = useState<PrinterSettings>(loadSettings);

  // Re-read on storage change (e.g. settings page in another tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) setSettings(loadSettings());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleAutoPrint = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, autoPrint: !prev.autoPrint };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const print = useCallback(() => {
    const s = loadSettings();
    if (!s.enabled) return;
    // Set paper width CSS variable for @media print
    document.documentElement.dataset.paperWidth = s.paperWidth;
    const doPrint = () => window.print();
    for (let i = 0; i < s.copies; i++) {
      if (i === 0) doPrint();
      else setTimeout(doPrint, i * 800);
    }
  }, []);

  const autoPrintIfEnabled = useCallback(() => {
    const s = loadSettings();
    if (!s.autoPrint || !s.enabled) return;
    const timer = setTimeout(() => {
      document.documentElement.dataset.paperWidth = s.paperWidth;
      const doPrint = () => window.print();
      for (let i = 0; i < s.copies; i++) {
        if (i === 0) doPrint();
        else setTimeout(doPrint, i * 800);
      }
    }, PRINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return {
    autoPrint: settings.autoPrint,
    enabled: settings.enabled,
    paperWidth: settings.paperWidth,
    copies: settings.copies,
    openDrawerOnCash: settings.openDrawerOnCash,
    toggleAutoPrint,
    print,
    autoPrintIfEnabled,
  };
}

/** Hook: auto-trigger print on mount if autoPrint is enabled */
export function useAutoTriggerPrint(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const s = loadSettings();
    if (!s.enabled) return;
    document.documentElement.dataset.paperWidth = s.paperWidth;
    const timer = setTimeout(() => {
      const doPrint = () => window.print();
      for (let i = 0; i < s.copies; i++) {
        if (i === 0) doPrint();
        else setTimeout(doPrint, i * 800);
      }
    }, PRINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);
}
