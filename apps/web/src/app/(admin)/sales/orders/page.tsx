'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorState } from '@/components/common/ErrorState';
import { useOrders } from '@/hooks/sales/useOrders';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { OrderTable } from './_components/OrderTable';
import { OrderDetailModal } from './_components/OrderDetailModal';
import type { OrderStatus } from '@/types/order';

export default function OrdersPage() {
  const { t } = useTranslation();

  const STATUS_FILTERS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: t('common.all') },
    { value: 'COMPLETED', label: t('orders.completed') },
    { value: 'RETURNED', label: t('orders.returned') },
    { value: 'VOIDED', label: t('orders.cancelled') },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    limit: pageSize,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <>
      <PageLayout>
        {/* Status filter tabs */}
        <div className="mb-4 flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => { setStatusFilter(f.value as OrderStatus | 'ALL'); setPage(1); }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isError && <ErrorState compact onRetry={refetch} />}

        {!isError && (
          <OrderTable
            orders={orders}
            total={total}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            onViewOrder={setSelectedOrderId}
          />
        )}
      </PageLayout>

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}
