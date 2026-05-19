'use client';

import { useState, useMemo } from 'react';
import { Banknote, CreditCard, Clock } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import type { Order } from '@/types/order';
import { useTranslation } from '@/i18n/i18n-context';
import { PaymentsTable } from './_components/PaymentsTable';
import { PaymentDetailModal } from './_components/PaymentDetailModal';

interface OrderWithCustomer extends Order {
  customer?: { id: string; name: string; phone: string } | null;
}

const STAT_COLORS: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <span className={cn('p-1.5 rounded-lg', STAT_COLORS[color])}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function useOrdersQuery(page: number) {
  return useQuery({
    queryKey: ['orders', 'payments-history', page],
    queryFn: () => ordersApi.list({ page, limit: 30 }),
    staleTime: 30_000,
  });
}

export default function PaymentsHistoryPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useOrdersQuery(page);

  const orders = (data?.items ?? []) as OrderWithCustomer[];
  const total = data?.total ?? 0;

  const stats = useMemo(() => {
    if (!orders.length) return null;
    const cash = orders.filter((o) => o.paymentMethod === 'NAQD' || o.paymentMethod === 'CASH');
    const card = orders.filter(
      (o) =>
        o.paymentMethod === 'KARTA' ||
        o.paymentMethod === 'CARD' ||
        o.paymentMethod === ('TERMINAL' as Order['paymentMethod']),
    );
    const debt = orders.filter(
      (o) =>
        o.paymentMethod === 'NASIYA' ||
        o.paymentMethod === ('DEBT' as Order['paymentMethod']),
    );
    const totalSum = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    return {
      total: totalSum,
      totalCount: orders.length,
      cash: { sum: cash.reduce((s, o) => s + (Number(o.total) || 0), 0), count: cash.length },
      card: { sum: card.reduce((s, o) => s + (Number(o.total) || 0), 0), count: card.length },
      debt: { sum: debt.reduce((s, o) => s + (Number(o.total) || 0), 0), count: debt.length },
    };
  }, [orders]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label={t('payments.total')}
              value={formatPrice(stats.total)}
              sub={`${stats.totalCount} ta`}
              color="blue"
            />
            <StatCard
              label={t('payments.cash')}
              value={formatPrice(stats.cash.sum)}
              sub={`${stats.cash.count} ta`}
              color="green"
              icon={Banknote}
            />
            <StatCard
              label={t('payments.card')}
              value={formatPrice(stats.card.sum)}
              sub={`${stats.card.count} ta`}
              color="purple"
              icon={CreditCard}
            />
            <StatCard
              label={t('payments.debt')}
              value={formatPrice(stats.debt.sum)}
              sub={`${stats.debt.count} ta`}
              color="orange"
              icon={Clock}
            />
          </div>
        )}

        <PaymentsTable
          orders={orders}
          total={total}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          onSelectOrder={setSelectedOrderId}
        />
      </div>

      {selectedOrderId && (
        <PaymentDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
