'use client';

import { CreditCard, Banknote, Smartphone, ArrowUpRight, Clock, Eye } from 'lucide-react';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, cn } from '@/lib/utils';
import type { Order } from '@/types/order';
import { useTranslation } from '@/i18n/i18n-context';

const METHOD_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  NAQD: Banknote,
  KARTA: CreditCard,
  NASIYA: Clock,
  ARALASH: ArrowUpRight,
  CASH: Banknote,
  CARD: CreditCard,
  TERMINAL: CreditCard,
  DEBT: Clock,
  TRANSFER: ArrowUpRight,
  CLICK: Smartphone,
  PAYME: Smartphone,
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-orange-100 text-orange-700',
  VOIDED: 'bg-gray-100 text-gray-600',
};

interface OrderWithCustomer extends Order {
  customer?: { id: string; name: string; phone: string } | null;
}

interface PaymentsTableProps {
  orders: OrderWithCustomer[];
  total: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onSelectOrder: (id: string) => void;
}

export function PaymentsTable({
  orders,
  total,
  isLoading,
  search,
  onSearchChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectOrder,
}: PaymentsTableProps) {
  const { t } = useTranslation();

  const METHOD_LABEL: Record<string, string> = {
    NAQD: t('payments.cash'),
    KARTA: t('payments.card'),
    NASIYA: t('payments.debt'),
    ARALASH: t('payments.mixed'),
    CASH: t('payments.cash'),
    CARD: t('payments.card'),
    TERMINAL: t('payments.card'),
    DEBT: t('payments.debt'),
    TRANSFER: t('payments.bankTransfer'),
    CLICK: 'Click',
    PAYME: 'Payme',
  };

  const STATUS_LABEL: Record<string, string> = {
    COMPLETED: t('orders.completed'),
    RETURNED: t('orders.returned'),
    VOIDED: t('orders.cancelled'),
  };

  const filtered = orders.filter(
    (o) =>
      !search ||
      String(o.orderNumber).includes(search) ||
      (o.paymentMethod ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollableTable
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t('payments.searchPlaceholder')}
      totalCount={total}
      isLoading={isLoading}
      pagination={
        total > pageSize
          ? {
              page,
              pageSize,
              total,
              onPageChange,
              onPageSizeChange,
            }
          : undefined
      }
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 border-b border-gray-100 bg-gray-50">
          <tr>
            {[t('common.date'), t('orders.orderNumber'), t('payments.method'), t('finance.amount'), t('common.status'), ''].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                {t('payments.noPayments')}
              </td>
            </tr>
          ) : (
            filtered.map((o) => {
              const method = o.paymentMethod ?? 'CASH';
              const Icon = METHOD_ICON[method] ?? CreditCard;
              return (
                <tr key={o.id} className="transition hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(o.createdAt).toLocaleString('uz-UZ', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">
                    #{o.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <Icon className="h-4 w-4 text-gray-400" />
                      {METHOD_LABEL[method] ?? method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPrice(Number(o.total))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectOrder(o.id)}
                      className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-blue-600 transition-all"
                      title={t('payments.detail')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
