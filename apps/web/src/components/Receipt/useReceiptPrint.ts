'use client';

import { useEffect, useState, useCallback } from 'react';

const AUTO_PRINT_KEY = 'raos_receipt_auto_print';
const PRINT_DELAY_MS = 300; // brief delay so receipt renders first

export function useReceiptPrint() {
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTO_PRINT_KEY) === 'true';
  });

  const toggleAutoPrint = useCallback(() => {
    setAutoPrint((prev) => {
      const next = !prev;
      localStorage.setItem(AUTO_PRINT_KEY, String(next));
      return next;
    });
  }, []);

  const print = useCallback(() => {
    window.print();
  }, []);

  const autoPrintIfEnabled = useCallback(() => {
    if (!autoPrint) return;
    const timer = setTimeout(() => {
      window.print();
    }, PRINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoPrint]);

  return { autoPrint, toggleAutoPrint, print, autoPrintIfEnabled };
}

/** Hook: auto-trigger print on mount if autoPrint is enabled */
export function useAutoTriggerPrint(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      window.print();
    }, PRINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);
}
