// ─── Receipt Text Builder ─────────────────────────────────────────────────────
// Builds a compact plain-text receipt from ReceiptData for SMS messages.

import type { ReceiptData, ReceiptItem } from './printer.types';

const SEP = '──────────────';
const MAX_NAME_LEN = 20;

function fmtPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '\u2026';
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderItem(item: ReceiptItem): string {
  return `${truncate(item.name, MAX_NAME_LEN)} x${item.qty} = ${fmtPrice(item.total)}`;
}

export function buildReceiptText(data: ReceiptData): string {
  const lines: string[] = [];

  lines.push(data.companyName);
  if (data.branchName) lines.push(data.branchName);
  lines.push(`Chek #${data.orderNumber}`);
  lines.push(formatDate(data.date));
  lines.push(SEP);

  for (const item of data.items) {
    lines.push(renderItem(item));
  }

  lines.push(SEP);
  if (data.discount) {
    lines.push(`Chegirma: -${fmtPrice(data.discount)}`);
  }
  if (data.tax) {
    lines.push(`Soliq: ${fmtPrice(data.tax)}`);
  }

  lines.push(`Jami: ${fmtPrice(data.total)} so'm`);
  lines.push(`${data.paymentMethod}: ${fmtPrice(data.receivedAmount ?? data.total)}`);
  if (data.change != null && data.change > 0) {
    lines.push(`Qaytim: ${fmtPrice(data.change)}`);
  }

  if (data.loyaltyPoints) {
    const lp = data.loyaltyPoints;
    if (lp.earned != null) lines.push(`Ball: +${lp.earned}`);
    if (lp.redeemed != null) lines.push(`Ishlatildi: -${lp.redeemed}`);
    if (lp.balance != null) lines.push(`Balans: ${lp.balance}`);
  }

  if (data.fiscalId) {
    lines.push(SEP);
    lines.push(`Fiscal: ${data.fiscalId}`);
  }

  lines.push(SEP);
  if (data.cashierName) lines.push(`Kassir: ${data.cashierName}`);
  lines.push('Rahmat!');

  return lines.join('\n');
}
