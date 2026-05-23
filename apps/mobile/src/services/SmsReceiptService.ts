// ─── SMS Receipt Service ─────────────────────────────────────────────────────
// Builds a plain-text receipt and opens the native SMS composer via expo-sms.
// Falls back to system share sheet when expo-sms is unavailable or no phone provided.

import { Share, Platform } from 'react-native';
import type { ReceiptData, ReceiptItem, PrintResult } from './printer.types';

// ─── expo-sms dynamic import ────────────────────────────────────────────────
let expoSms: {
  isAvailableAsync: () => Promise<boolean>;
  sendSMSAsync: (
    addresses: string[],
    message: string,
  ) => Promise<{ result: string }>;
} | null = null;

try {
  expoSms = require('expo-sms');
} catch {
  // Not installed
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + " so'm";
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderItemLine(item: ReceiptItem): string {
  return `${item.name}\n  ${item.qty} x ${formatPrice(item.unitPrice)} = ${formatPrice(item.total)}`;
}

function buildReceiptText(data: ReceiptData): string {
  const sep = '─'.repeat(28);
  const lines: string[] = [
    data.companyName,
    data.branchName ?? '',
    sep,
    `Sana: ${formatDate(data.date)}`,
    `Chek #${data.orderNumber}`,
    data.cashierName ? `Kassir: ${data.cashierName}` : '',
    sep,
    ...data.items.map(renderItemLine),
    sep,
    `Jami: ${formatPrice(data.total)}`,
    `To'lov: ${data.paymentMethod}`,
  ];

  if (data.receivedAmount != null) {
    lines.push(`Qabul qilindi: ${formatPrice(data.receivedAmount)}`);
    if (data.change != null && data.change > 0) {
      lines.push(`Qaytim: ${formatPrice(data.change)}`);
    }
  }

  lines.push(sep, 'Xaridingiz uchun rahmat!', 'RAOS POS');

  return lines.filter(Boolean).join('\n');
}

function extractMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const smsReceiptService = {
  /** Send receipt via SMS to a specific phone number */
  async sendReceipt(data: ReceiptData, phone: string): Promise<PrintResult> {
    const message = buildReceiptText(data);

    if (expoSms) {
      try {
        const available = await expoSms.isAvailableAsync();
        if (available) {
          await expoSms.sendSMSAsync([phone], message);
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: extractMsg(err, 'SMS yuborishda xatolik') };
      }
    }

    // Fallback: share sheet with message pre-filled
    return this.shareViaSystem(message);
  },

  /** Open share sheet (no phone number — user picks contact) */
  async sendReceiptNoNumber(data: ReceiptData): Promise<PrintResult> {
    const message = buildReceiptText(data);
    return this.shareViaSystem(message);
  },

  /** Internal: system share sheet fallback */
  async shareViaSystem(message: string): Promise<PrintResult> {
    try {
      const content = Platform.OS === 'ios'
        ? { message }
        : { message, title: 'Chek yuborish' };
      await Share.share(content);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractMsg(err, 'Ulashishda xatolik') };
    }
  },
};
