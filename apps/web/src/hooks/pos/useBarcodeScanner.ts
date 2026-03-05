'use client';

import { useEffect, useRef } from 'react';

const BARCODE_MIN_LENGTH = 4;
const BARCODE_MAX_DELAY_MS = 80; // barcode scanner types < 80ms per char

/**
 * Detects keyboard-wedge barcode scanner input.
 * Scanners type characters very rapidly (< 80ms apart) and end with Enter.
 * Regular keyboard typing is slower → treated as manual input.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input (except the barcode field itself)
      const target = e.target as HTMLElement;
      const isInInput =
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        !target.hasAttribute('data-barcode');

      if (isInInput) return;

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (timerRef.current) clearTimeout(timerRef.current);
        const barcode = bufferRef.current.trim();
        if (barcode.length >= BARCODE_MIN_LENGTH) {
          onScan(barcode);
        }
        bufferRef.current = '';
        return;
      }

      // Reset buffer if typing too slow (manual input)
      if (timeSinceLast > BARCODE_MAX_DELAY_MS && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;

        // Auto-flush after short timeout (in case scanner doesn't send Enter)
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          const barcode = bufferRef.current.trim();
          if (barcode.length >= BARCODE_MIN_LENGTH) {
            onScan(barcode);
          }
          bufferRef.current = '';
        }, 150);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onScan]);
}
