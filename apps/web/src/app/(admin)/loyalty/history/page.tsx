'use client';

import { useState } from 'react';
import { ArrowLeft, History, Download, X } from 'lucide-react';
import Link from 'next/link';
import { useLoyaltyTransactions } from '@/hooks/loyalty/useLoyalty';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';
import type { LoyaltyTxType } from '@/types/loyalty';

const TX_TYPES: { value: string; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'EARN', label: 'Earn' },
  { value: 'REDEEM', label: 'Redeem' },
  { value: 'ADJUST', label: 'Adjust' },
  { value: 'EXPIRE', label: 'Expire' },
];

const TX_BADGE: Record<LoyaltyTxType, { label: string; color: string }> = {
  EARN: { label: 'Earn', color: 'bg-green-100 text-green-700' },
  REDEEM: { label: 'Redeem', color: 'bg-blue-100 text-blue-700' },
  ADJUST: { label: 'Adjust', color: 'bg-orange-100 text-orange-700' },
  EXPIRE: { label: 'Expire', color: 'bg-gray-100 text-gray-600' },
};

function TxTypeBadge({ type }: { type: LoyaltyTxType }) {
  const cfg = TX_BADGE[type] ?? TX_BADGE.ADJUST;
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', cfg.color)}>
      {cfg.label}
    </span>
  );
}

function exportToCsv(rows: {
  date: string;
  customer: string;
  type: string;
  points: number;
  orderId?: string | null;
}[]) {
  const header = 'Date,Customer,Type,Points,Order #';
  const lines = rows.map(
    (r) =>
      [
        `"${new Date(r.date).toLocaleDateString('uz-UZ')}"`,
        `"${r.customer}"`,
        r.type,
        r.points,
        r.orderId ?? '',
      ].join(','),
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loyalty-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LoyaltyHistoryPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState('');
  const [customerId, setCustomerId] = useState('');

  const { data, isLoading } = useLoyaltyTransactions(
    page,
    pageSize,
    typeFilter || undefined,
    customerId || undefined,
  );

  const handleExport = () => {
    if (!data?.items?.length) return;
    exportToCsv(
      data.items.map((tx) => ({
        date: tx.createdAt,
        customer: tx.customer?.name ?? tx.customerId,
        type: tx.type,
        points: tx.points,
        orderId: tx.orderId,
      })),
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/loyalty"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <History className="h-5 w-5 text-purple-600" />
            {t('loyalty.history') || 'Transaction History'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {data ? `${data.total} ${t('common.unit') || 'records'}` : t('common.loading') || 'Loading...'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!data?.items?.length}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          {t('common.exportCsv') || 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        {/* Type filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">
            {t('common.type') || 'Type'}:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            {TX_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer ID filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">
            {t('loyalty.customerId') || 'Customer ID'}:
          </label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value.trim()); setPage(1); }}
            placeholder={t('loyalty.customerIdPlaceholder') || 'Filter by customer...'}
            className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          {customerId && (
            <button
              type="button"
              onClick={() => { setCustomerId(''); setPage(1); }}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {(typeFilter || customerId) && (
          <button
            type="button"
            onClick={() => { setTypeFilter(''); setCustomerId(''); setPage(1); }}
            className="ml-auto text-xs text-gray-400 hover:text-red-500 transition"
          >
            {t('common.clearFilters') || 'Clear all'}
          </button>
        )}
      </div>

      {/* Table */}
      <ScrollableTable
        totalCount={data?.total}
        isLoading={isLoading}
        pagination={
          data
            ? {
                page,
                pageSize,
                total: data.total,
                onPageChange: setPage,
                onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
              }
            : undefined
        }
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('common.date') || 'Date'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('customers.title') || 'Customer'}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('common.type') || 'Type'}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('loyalty.points') || 'Points'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('loyalty.orderNo') || 'Order #'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('loyalty.note') || 'Note'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!data?.items?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <History className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  {t('loyalty.noTransactions') || 'No transactions found'}
                </td>
              </tr>
            ) : (
              data.items.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString('uz-UZ')}{' '}
                    <span className="text-gray-400">
                      {new Date(tx.createdAt).toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {tx.customer?.name ?? tx.customerId}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <TxTypeBadge type={tx.type} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    <span
                      className={cn(
                        tx.points > 0 ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">
                    {tx.orderId ? tx.orderId.slice(0, 8) + '...' : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">
                    {tx.description ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}
