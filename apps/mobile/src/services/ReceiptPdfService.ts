// ─── Receipt PDF Service ─────────────────────────────────────────────────────
// Generates PDF receipts via expo-print and shares them via system share sheet.
// Safe dynamic import — works even when expo-print is not installed.

import { Platform, Share } from 'react-native';
import { buildReceiptHtml } from './ReceiptHtmlBuilder';
import type { PrintResult, ReceiptData } from './printer.types';

// ─── expo-print dynamic import ───────────────────────────────────────────────
let expoPrint: {
  printAsync: (opts: { html: string }) => Promise<void>;
  printToFileAsync: (opts: { html: string; base64?: boolean }) => Promise<{ uri: string }>;
} | null = null;

try {
  expoPrint = require('expo-print');
} catch {
  // Not available
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const receiptPdfService = {
  /** Check if PDF generation is available */
  isAvailable(): boolean {
    return expoPrint !== null;
  },

  /** Generate PDF and open system print dialog */
  async printReceipt(data: ReceiptData): Promise<PrintResult> {
    if (!expoPrint) return { success: false, error: 'expo-print mavjud emas' };
    try {
      const html = buildReceiptHtml(data);
      await expoPrint.printAsync({ html });
      return { success: true };
    } catch (err) {
      return { success: false, error: extractMsg(err, 'PDF chop etishda xatolik') };
    }
  },

  /** Generate PDF file and open share sheet */
  async shareReceipt(data: ReceiptData): Promise<PrintResult> {
    if (!expoPrint) return { success: false, error: 'expo-print mavjud emas' };
    try {
      const html = buildReceiptHtml(data);
      const { uri } = await expoPrint.printToFileAsync({ html });
      const shareContent = Platform.OS === 'ios'
        ? { url: uri }
        : { message: `Chek #${data.orderNumber}`, url: uri };
      await Share.share(shareContent);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractMsg(err, 'PDF ulashishda xatolik') };
    }
  },

  /** Generate PDF and return file URI (for other uses) */
  async generatePdf(data: ReceiptData): Promise<{ uri: string } | null> {
    if (!expoPrint) return null;
    try {
      const html = buildReceiptHtml(data);
      return await expoPrint.printToFileAsync({ html });
    } catch {
      return null;
    }
  },
};
