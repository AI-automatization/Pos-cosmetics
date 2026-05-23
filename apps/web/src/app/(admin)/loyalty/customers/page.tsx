'use client';

import { useState } from 'react';
import { ArrowLeft, Users, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useLoyaltyAccounts, useAdjustPoints } from '@/hooks/loyalty/useLoyalty';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';

interface AdjustModalProps {
  customerId: string;
  customerName: string;
  currentPoints: number;
  onClose: () => void;
}

function AdjustModal({ customerId, customerName, currentPoints, onClose }: AdjustModalProps) {
  const { t } = useTranslation();
  const { mutate: adjust, isPending } = useAdjustPoints();
  const [points, setPoints] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (points === 0) {
      setError('Points cannot be 0');
      return;
    }
    adjust(
      { customerId, points, description: note || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            {t('loyalty.adjustPoints') || 'Adjust Points'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-1">
          {t('customers.title') || 'Customer'}: <span className="font-medium">{customerName}</span>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {t('loyalty.currentPoints') || 'Current points'}:{' '}
          <span className="font-bold text-purple-600">{currentPoints}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('loyalty.pointsChange') || 'Points change'}{' '}
              <span className="font-normal text-gray-400">(use negative to deduct)</span>
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => { setPoints(Number(e.target.value)); setError(''); }}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200',
                error ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
              )}
              placeholder="+100 or -50"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {points !== 0 && (
              <p className="mt-1 text-xs text-gray-400">
                New balance: <span className="font-medium">{currentPoints + points}</span> points
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('loyalty.note') || 'Note'} ({t('common.optional') || 'optional'})
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder={t('loyalty.notePlaceholder') || 'Reason for adjustment...'}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isPending || points === 0}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Adjust')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoyaltyCustomersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [minPoints, setMinPoints] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<{
    customerId: string;
    name: string;
    points: number;
  } | null>(null);

  const { data, isLoading } = useLoyaltyAccounts(page, pageSize, minPoints > 0 ? minPoints : undefined);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {adjustTarget && (
        <AdjustModal
          customerId={adjustTarget.customerId}
          customerName={adjustTarget.name}
          currentPoints={adjustTarget.points}
          onClose={() => setAdjustTarget(null)}
        />
      )}

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
            <Users className="h-5 w-5 text-green-600" />
            {t('loyalty.customers') || 'Loyalty Customers'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {data ? `${data.total} ${t('common.unit') || 'customers'}` : t('common.loading') || 'Loading...'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilter((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition',
            showFilter
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('common.filter') || 'Filter'}
        </button>
      </div>

      {/* Filter */}
      {showFilter && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <label className="text-sm font-medium text-gray-700">
            {t('loyalty.minPoints') || 'Min points'}:
          </label>
          <input
            type="number"
            min={0}
            value={minPoints}
            onChange={(e) => { setMinPoints(Number(e.target.value)); setPage(1); }}
            className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
          />
          {minPoints > 0 && (
            <button
              type="button"
              onClick={() => { setMinPoints(0); setPage(1); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
              {t('common.clear') || 'Clear'}
            </button>
          )}
        </div>
      )}

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
                {t('customers.title') || 'Customer'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('customers.phone') || 'Phone'}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('loyalty.points') || 'Points'}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('customers.lastVisit') || 'Last Activity'}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('common.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!data?.items?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  {t('loyalty.noAccounts') || 'No loyalty accounts found'}
                </td>
              </tr>
            ) : (
              data.items.map((account) => (
                <tr key={account.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <span className="text-xs font-semibold text-purple-700">
                          {(account.customer?.name ?? 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {account.customer?.name ?? account.customerId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {account.customer?.phone ? `+${account.customer.phone}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-purple-600">
                      {account.points.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs text-gray-400">pts</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-500">
                    {account.updatedAt
                      ? new Date(account.updatedAt).toLocaleDateString('uz-UZ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setAdjustTarget({
                          customerId: account.customerId,
                          name: account.customer?.name ?? account.customerId,
                          points: account.points,
                        })
                      }
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {t('loyalty.adjust') || 'Adjust'}
                    </button>
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
