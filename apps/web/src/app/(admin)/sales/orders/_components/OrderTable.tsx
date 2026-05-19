'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Receipt, ShoppingCart, Eye, Banknote, CreditCard, Clock } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, formatDateTime, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { StatusBadge } from './StatusBadge';
import type { OrderStatus } from '@/types/order';

const PAYMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Banknote,
  NAQD: Banknote,
  CARD: CreditCard,
  KARTA: CreditCard,
  TERMINAL: CreditCard,
  NASIYA: Clock,
  DEBT: Clock,
  ARALASH: Banknote,
};

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  cashierName?: string | null;
  paymentMethod?: string | null;
  status: OrderStatus;
  total: number;
}

interface OrderTableProps {
  orders: OrderItem[];
  total: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onViewOrder: (id: string) => void;
}

export function OrderTable({
  orders,
  total,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewOrder,
}: OrderTableProps) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const PAYMENT_LABELS: Record<string, string> = {
    CASH: t('payments.cash'),
    NAQD: t('payments.cash'),
    CARD: t('payments.card'),
    KARTA: t('payments.card'),
    TERMINAL: t('payments.card'),
    NASIYA: t('payments.debt'),
    DEBT: t('payments.debt'),
    ARALASH: t('payments.mixed'),
  };

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedOrders = useMemo(() => {
    if (!sortField) return orders;
    return [...orders].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === 'string'
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) > (bVal as number)
          ? 1
          : (aVal as number) < (bVal as number)
          ? -1
          : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [orders, sortField, sortDir]);

  function SortHeader({ field, label }: { field: string; label: string }) {
    const active = sortField === field;
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 hover:text-gray-900 group"
      >
        {label}
        <span className={cn('transition-colors', active ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500')}>
          {active && sortDir === 'desc' ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </span>
      </button>
    );
  }

  if (orders.length === 0 && !isLoading) {
    return <EmptyState icon={ShoppingCart} title={t('orders.noOrders')} />;
  }

  return (
    <ScrollableTable
      totalCount={total}
      isLoading={isLoading}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange: (s) => { onPageSizeChange(s); onPageChange(1); },
      }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <span className="flex items-center gap-1">
                <Receipt className="h-3.5 w-3.5" />
                {t('orders.orderNumber')}
              </span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <SortHeader field="createdAt" label={t('common.date')} />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('reports.cashier')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('payments.method')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('common.status')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              <SortHeader field="total" label={t('common.total')} />
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedOrders.map((o) => (
            <tr key={o.id} className="transition hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
              <td className="px-4 py-3 text-gray-500">{formatDateTime(o.createdAt)}</td>
              <td className="px-4 py-3 text-gray-700">{o.cashierName ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">
                {o.paymentMethod ? (
                  <span className="inline-flex items-center gap-1">
                    {(() => {
                      const Icon = PAYMENT_ICONS[o.paymentMethod] ?? Banknote;
                      return <Icon className="h-3.5 w-3.5 text-blue-500" />;
                    })()}
                    {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                  </span>
                ) : '—'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={o.status} />
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(o.total)}</td>
              <td className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onViewOrder(o.id)}
                  title={t('common.show')}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
