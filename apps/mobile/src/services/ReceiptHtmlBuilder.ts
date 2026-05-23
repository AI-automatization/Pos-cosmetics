// ─── Receipt HTML Builder ────────────────────────────────────────────────────
// Builds a thermal-receipt-style HTML document from ReceiptData for PDF rendering.

import type { ReceiptData, ReceiptItem } from './printer.types';

const RECEIPT_WIDTH = '280px';
const FONT_FAMILY = "'Courier New', monospace";
const THANK_YOU_TEXT = 'Xaridingiz uchun rahmat!';
const POWERED_BY = 'RAOS POS';

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + " so'm";
}

function separator(): string {
  return '<div style="border-top:1px dashed #999;margin:8px 0"></div>';
}

function renderItem(item: ReceiptItem): string {
  return `
    <div style="margin-bottom:4px">
      <div style="font-size:12px">${item.name}</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;padding-left:8px">
        <span>${item.qty} &times; ${formatPrice(item.unitPrice)}</span>
        <span>${formatPrice(item.total)}</span>
      </div>
    </div>`;
}

function totalRow(label: string, value: string, style = ''): string {
  return `<div style="display:flex;justify-content:space-between;font-size:12px;${style}">
    <span>${label}</span><span>${value}</span>
  </div>`;
}

export function buildReceiptHtml(data: ReceiptData): string {
  const items = data.items.map(renderItem).join('');

  const discountRow = data.discount
    ? totalRow('Chegirma', `- ${formatPrice(data.discount)}`, 'color:red')
    : '';
  const taxRow = data.tax
    ? totalRow('Soliq', formatPrice(data.tax))
    : '';

  const changeSection = data.receivedAmount != null
    ? `${totalRow('Qabul qilindi', formatPrice(data.receivedAmount))}
       ${data.change != null ? totalRow('Qaytim', formatPrice(data.change)) : ''}`
    : '';

  const loyaltySection = data.loyaltyPoints
    ? `${separator()}
       <div style="font-size:11px;text-align:center;color:#555">
         ${data.loyaltyPoints.earned != null ? `<div>Ball qo'shildi: +${data.loyaltyPoints.earned}</div>` : ''}
         ${data.loyaltyPoints.redeemed != null ? `<div>Ball ishlatildi: -${data.loyaltyPoints.redeemed}</div>` : ''}
         ${data.loyaltyPoints.balance != null ? `<div>Balans: ${data.loyaltyPoints.balance}</div>` : ''}
       </div>`
    : '';

  const fiscalLine = data.fiscalId
    ? `<div style="font-size:10px;text-align:center;color:#666">Fiscal ID: ${data.fiscalId}</div>`
    : '';

  const qrLine = data.qrData
    ? `<div style="font-size:9px;text-align:center;color:#888;word-break:break-all;margin:4px 0">QR: ${data.qrData}</div>`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @media print { @page { margin:0 } body { margin:0 } }
  body { margin:0; padding:16px; background:#fff; font-family:${FONT_FAMILY}; }
  .receipt { width:${RECEIPT_WIDTH}; margin:0 auto; border:1px dashed #ddd; padding:12px; background:#fff; }
</style></head>
<body><div class="receipt">
  <div style="text-align:center;font-size:16px;font-weight:bold">${data.companyName}</div>
  ${data.branchName ? `<div style="text-align:center;font-size:11px;color:#555">${data.branchName}</div>` : ''}
  ${separator()}
  <div style="font-size:11px">
    <div>${formatDate(data.date)}</div>
    <div>Chek #${data.orderNumber}</div>
    ${data.cashierName ? `<div>Kassir: ${data.cashierName}</div>` : ''}
  </div>
  ${separator()}
  ${items}
  ${separator()}
  ${totalRow('Oraliq jami', formatPrice(data.subtotal))}
  ${discountRow}
  ${taxRow}
  ${totalRow('JAMI', formatPrice(data.total), 'font-size:14px;font-weight:bold;margin-top:4px')}
  ${separator()}
  <div style="font-size:11px">
    ${totalRow("To'lov", data.paymentMethod)}
    ${changeSection}
  </div>
  ${loyaltySection}
  ${separator()}
  ${fiscalLine}
  ${qrLine}
  <div style="text-align:center;font-size:12px;margin-top:8px">${THANK_YOU_TEXT}</div>
  <div style="text-align:center;font-size:9px;color:#aaa;margin-top:4px">${POWERED_BY}</div>
</div></body></html>`;
}
