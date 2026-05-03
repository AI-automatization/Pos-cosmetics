'use client';

import { useEffect, useRef } from 'react';

export interface POSKeyboardHandlers {
  onF1?: () => void;       // Search focus
  onF4?: () => void;       // Return/Refund
  onF5?: () => void;       // Cash payment
  onF6?: () => void;       // Card payment
  onF7?: () => void;       // Split payment
  onF8?: () => void;       // Nasiya payment
  onF9?: () => void;       // Bonus payment
  onF10?: () => void;      // Complete sale
  onEsc?: () => void;      // Cancel
  onNewCart?: () => void;  // Ctrl+T — new cart
  onNextCart?: () => void; // Ctrl+Tab — switch to next cart
}

export function usePOSKeyboard(handlers: POSKeyboardHandlers) {
  // Ref keeps handlers fresh without being a dep — prevents effect re-running every render.
  // Previously [handlers] dep caused cleanup+setup on every render, contributing to #185.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+T — new cart
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        handlersRef.current.onNewCart?.();
        return;
      }
      // Ctrl+Tab — next cart
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        handlersRef.current.onNextCart?.();
        return;
      }
      const isFKey = e.key.startsWith('F') && !isNaN(Number(e.key.slice(1)));
      if (!isFKey && e.key !== 'Escape') return;
      switch (e.key) {
        case 'F1':  e.preventDefault(); handlersRef.current.onF1?.(); break;
        case 'F4':  e.preventDefault(); handlersRef.current.onF4?.(); break;
        case 'F5':  e.preventDefault(); handlersRef.current.onF5?.(); break;
        case 'F6':  e.preventDefault(); handlersRef.current.onF6?.(); break;
        case 'F7':  e.preventDefault(); handlersRef.current.onF7?.(); break;
        case 'F8':  e.preventDefault(); handlersRef.current.onF8?.(); break;
        case 'F9':  e.preventDefault(); handlersRef.current.onF9?.(); break;
        case 'F10': e.preventDefault(); handlersRef.current.onF10?.(); break;
        case 'Escape': handlersRef.current.onEsc?.(); break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty: listener registered once, ref keeps it fresh
}
