'use client';

import { useState } from 'react';
import { RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useOrdersForReturns } from '@/hooks/sales/useReturns';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { ReturnModal, type BackendOrder } from './ReturnModal';

type OrderFilter = 'ALL' | 'COMPLETED' | 'RETURNED';

export function OrdersTab() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<OrderFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [returnOrder, setReturnOrder] = useState<BackendOrder | null>(null);

  const { data, isLoading } = useOrdersForReturns({ page, limit: pageSize });

  const orders = (data?.items ?? []) as BackendOrder[];
  const total = data?.total ?? 0;
  const filtered = orders
    .filter((o) => tab === 'ALL' || o.status === tab)
    .filter((o) => !search || String(o.orderNumber).includes(search));

  const ORDER_TABS: { key: OrderFilter; label: string }[] = [
    { key: 'ALL', label: t('common.all') },
    { key: 'COMPLETED', label: t('returns.returnable') },
    { key: 'RETURNED', label: t('returns.returned') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {ORDER_TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => { setTab(tabItem.key); setPage(1); }}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition',
              tab === tabItem.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <ScrollableTable
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`${t('orders.orderNumber')}...`}
        totalCount={total}
        isLoading={isLoading}
        pagination={total > pageSize ? {
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        } : undefined}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {[t('orders.orderNumber'), t('reports.cashier'), t('nav.products'), t('common.total'), t('common.date'), t('common.status'), t('common.actions')].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <RotateCcw className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  {t('returns.noOrders')}
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const cashierName = order.user
                  ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim()
                  : '—';
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{cashierName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{order.items.length} {t('common.unit')}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'RETURNED' ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" /> {t('returns.returned')}
                        </span>
                      ) : order.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          <Clock className="h-3 w-3" /> {t('orders.completedStatus')}
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => setReturnOrder(order)}
                          className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> {t('returns.returnTitle')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollableTable>

      {returnOrder && <ReturnModal order={returnOrder} onClose={() => setReturnOrder(null)} />}
    </div>
  );
}
