'use client';

import { useEffect } from 'react';

export interface POSKeyboardHandlers {
  onF1?: () => void;  // Search focus
  onF5?: () => void;  // Cash payment
  onF6?: () => void;  // Card payment
  onF7?: () => void;  // Split payment
  onF8?: () => void;  // Nasiya payment
  onF9?: () => void;  // Bonus payment
  onF10?: () => void; // Complete sale
  onEsc?: () => void; // Cancel
}

export function usePOSKeyboard(handlers: POSKeyboardHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs (except F-keys)
      const isFKey = e.key.startsWith('F') && !isNaN(Number(e.key.slice(1)));
      if (!isFKey && e.key !== 'Escape') return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          handlers.onF1?.();
          break;
        case 'F5':
          e.preventDefault();
          handlers.onF5?.();
          break;
        case 'F6':
          e.preventDefault();
          handlers.onF6?.();
          break;
        case 'F7':
          e.preventDefault();
          handlers.onF7?.();
          break;
        case 'F8':
          e.preventDefault();
          handlers.onF8?.();
          break;
        case 'F9':
          e.preventDefault();
          handlers.onF9?.();
          break;
        case 'F10':
          e.preventDefault();
          handlers.onF10?.();
          break;
        case 'Escape':
          handlers.onEsc?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
