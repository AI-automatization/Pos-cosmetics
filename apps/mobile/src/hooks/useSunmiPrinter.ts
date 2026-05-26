import { useState, useCallback, useEffect } from 'react';
import {
  printerService,
  type PrinterStatus,
  type ReceiptData,
} from '../services/PrinterService';

// ─── Helper ──────────────────────────────────────────────────────────────────
function extractMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useSunmiPrinter() {
  const [status, setStatus] = useState<PrinterStatus>('UNAVAILABLE');
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrintTime, setLastPrintTime] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const current = await printerService.getStatus();
      setStatus(current);
    } catch (err) {
      setStatus('UNAVAILABLE');
      setError(extractMsg(err, 'Printer holati aniqlanmadi'));
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const printReceipt = useCallback(
    async (data: ReceiptData): Promise<boolean> => {
      if (isPrinting) return false;
      setIsPrinting(true);
      setError(null);
      try {
        const result = await printerService.printReceipt(data);
        if (!result.success) {
          setError(result.error ?? 'Chop etish xatosi');
        } else {
          setLastPrintTime(new Date());
        }
        return result.success;
      } catch (err) {
        setError(extractMsg(err, 'Chop etish xatosi'));
        return false;
      } finally {
        setIsPrinting(false);
      }
    },
    [isPrinting],
  );

  const testPrint = useCallback(async (): Promise<boolean> => {
    if (isPrinting) return false;
    setIsPrinting(true);
    setError(null);
    try {
      const result = await printerService.testPrint();
      if (!result.success) {
        setError(result.error ?? 'Test chop etish xatosi');
      } else {
        setLastPrintTime(new Date());
      }
      return result.success;
    } catch (err) {
      setError(extractMsg(err, 'Test chop etish xatosi'));
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [isPrinting]);

  return {
    isAvailable: printerService.isAvailable(),
    status,
    isPrinting,
    error,
    lastPrintTime,
    checkStatus,
    printReceipt,
    testPrint,
  } as const;
}
