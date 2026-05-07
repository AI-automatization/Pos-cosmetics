'use client';

// Pure receipt template — rendered inside #receipt-print-area
// Styled for both screen preview and @media print (80mm thermal)

import type { Order } from '@/types/sales';
import { useTranslation } from '@/i18n/i18n-context';

// Shop config — will come from tenant settings (T-059 later)
const SHOP_CONFIG = {
  name: 'KOSMETIKA DO\'KONI',
  address: 'Toshkent sh., Chilonzor t.',
  phone: '+998 90 000 00 00',
  inn: '000000000',
} as const;

function fmt(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + ' so\'m';
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

interface ReceiptTemplateProps {
  order: Order;
  change?: number;
}

export function ReceiptTemplate({ order, change = 0 }: ReceiptTemplateProps) {
  const { t } = useTranslation();
  const orderNum = order.orderNumber ?? `#${(order.id ?? '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="receipt-body">
      {/* Shop header */}
      <div className="receipt-center">
        <div className="receipt-bold receipt-large">{SHOP_CONFIG.name}</div>
        <div className="receipt-small">{SHOP_CONFIG.address}</div>
        <div className="receipt-small">Tel: {SHOP_CONFIG.phone}</div>
        <div className="receipt-small">INN: {SHOP_CONFIG.inn}</div>
      </div>

      <div className="receipt-divider" />

      {/* Order info */}
      <div className="receipt-small">
        <div className="receipt-row">
          <span>{t('receipt.orderNumber')}:</span>
          <span className="receipt-bold receipt-row-right">{orderNum}</span>
        </div>
        <div className="receipt-row">
          <span>{t('receipt.date')}:</span>
          <span className="receipt-row-right">{fmtDate(order.createdAt)}</span>
        </div>
      </div>

      <div className="receipt-divider" />

      {/* Items */}
      <div>
        {(order.items ?? []).map((item, idx) => {
          const lineTotal = item.sellPrice * item.quantity * (1 - item.lineDiscount / 100);
          return (
            <div key={item.id ?? idx} style={{ marginBottom: '3mm' }}>
              <div className="receipt-item-name">{item.productName}</div>
              <div className="receipt-row receipt-small">
                <span>
                  {item.quantity} x {fmt(item.sellPrice)}
                  {item.lineDiscount > 0 && ` (-${item.lineDiscount}%)`}
                </span>
                <span className="receipt-row-right receipt-bold">{fmt(lineTotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="receipt-divider" />

      {/* Totals */}
      <div className="receipt-small">
        <div className="receipt-row">
          <span>{t('receipt.subtotal')}:</span>
          <span className="receipt-row-right">{fmt(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="receipt-row">
            <span>{t('receipt.discount')}:</span>
            <span className="receipt-row-right">- {fmt(order.discountAmount)}</span>
          </div>
        )}
        {/* Tax placeholder — T-078 NDS impl after */}
        <div className="receipt-row">
          <span>{t('receipt.vat')} (12%):</span>
          <span className="receipt-row-right">{fmt(order.total * 0.12 / 1.12)}</span>
        </div>
      </div>

      <div className="receipt-total-row">
        <span>{t('receipt.total')}:</span>
        <span>{fmt(order.total)}</span>
      </div>

      <div className="receipt-divider" />

      {/* Payments */}
      <div className="receipt-small">
        {(order.payments ?? []).map((p, i) => (
          <div key={i} className="receipt-row">
            <span>{p.method === 'CASH' ? t('receipt.cash') : t('receipt.card')}:</span>
            <span className="receipt-row-right">{fmt(p.amount)}</span>
          </div>
        ))}
        {change > 0 && (
          <div className="receipt-row receipt-bold">
            <span>{t('receipt.change')}:</span>
            <span className="receipt-row-right">{fmt(change)}</span>
          </div>
        )}
      </div>

      <div className="receipt-divider" />

      {/* Fiscal status — placeholder until T-081 REGOS */}
      <div className="receipt-fiscal">
        <div className="receipt-bold">{t('receipt.fiscalStatus')}</div>
        <div>⏳ {t('receipt.fiscalPending')}</div>
        <div className="receipt-small" style={{ marginTop: '1mm' }}>
          {t('receipt.fiscalNote')}
        </div>
      </div>

      <div className="receipt-divider" />

      {/* Footer */}
      <div className="receipt-center receipt-small">
        <div className="receipt-bold">{t('receipt.thankYou')}</div>
        <div>{t('receipt.visitAgain')}</div>
        <div style={{ marginTop: '2mm' }}>RAOS · raos.uz</div>
      </div>
    </div>
  );
}
