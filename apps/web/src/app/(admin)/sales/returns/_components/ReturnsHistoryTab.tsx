'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useListReturns, useApproveReturn } from '@/hooks/sales/useReturns';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { REFUND_METHOD_KEYS, type RefundMethod, type Return } from '@/types/returns';
import { StatusBadge } from './StatusBadge';

type HistoryFilter = 'ALL' | 'PENDING' | 'APPROVED';

export function ReturnsHistoryTab() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { mutate: approveReturn, isPending: isApproving } = useApproveReturn();

  const status = filter === 'ALL' ? undefined : filter;
  const { data, isLoading } = useListReturns({ page, limit: pageSize, status });

  const returns = (data?.items ?? []) as Return[];
  const total = data?.total ?? 0;

  const FILTER_TABS: { key: HistoryFilter; label: string }[] = [
    { key: 'ALL', label: t('common.all') },
    { key: 'PENDING', label: t('common.pending') },
    { key: 'APPROVED', label: t('common.approved') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setFilter(tab.key); setPage(1); }}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition',
              filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ScrollableTable
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
              {['#', t('nav.orders'), t('reports.cashier'), t('nav.products'), t('common.total'), t('returns.method'), t('common.status'), t('common.date'), t('common.actions')].map((h) => (
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
            {returns.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400">
                  <RotateCcw className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  {t('returns.noReturns')}
                </td>
              </tr>
            ) : (
              returns.map((ret) => {
                const cashier = ret.user
                  ? `${ret.user.firstName ?? ''} ${ret.user.lastName ?? ''}`.trim() || '—'
                  : '—';
                const productNames = ret.items
                  .map((i) => i.product?.name ?? `#${i.productId.slice(0, 6)}`)
                  .join(', ');
                const displayProducts =
                  productNames.length > 40 ? productNames.slice(0, 40) + '...' : productNames;

                return (
                  <tr key={ret.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {ret.id.slice(0, 6)}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">
                      #{ret.order?.orderNumber ?? ret.orderId.slice(0, 6)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cashier}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      <span title={productNames}>{displayProducts || `${ret.items.length} ${t('common.unit')}`}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-orange-700 tabular-nums">
                      {formatPrice(Number(ret.total))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ret.refundMethod
                        ? t(REFUND_METHOD_KEYS[ret.refundMethod as RefundMethod])
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ret.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(ret.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3">
                      {ret.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => approveReturn(ret.id)}
                          disabled={isApproving}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {t('common.confirm')}
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
    </div>
  );
}
