'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Download, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { ErrorState } from '@/components/common/ErrorState';
import { useExpiringProducts, useExpiredProducts } from '@/hooks/inventory/useExpiry';

function ExpiryBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) {
    return (
      <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">
        Muddati o&apos;tgan ({Math.abs(daysLeft)} kun)
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        {daysLeft} kun
      </span>
    );
  }
  if (daysLeft <= 15) {
    return (
      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
        {daysLeft} kun
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      {daysLeft} kun
    </span>
  );
}

type TabKey = 'expiring' | 'expired';

const DAYS_OPTIONS = [
  { value: '7', label: '7 kun ichida' },
  { value: '15', label: '15 kun ichida' },
  { value: '30', label: '30 kun ichida' },
  { value: '60', label: '60 kun ichida' },
  { value: '90', label: '90 kun ichida' },
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = String(row[h] ?? '');
      return val.includes(',') ? `"${val}"` : val;
    }).join(','),
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExpiryPage() {
  const [tab, setTab] = useState<TabKey>('expiring');
  const [daysFilter, setDaysFilter] = useState(30);

  const { data: expiringItems, isLoading: loadingExpiring, isError: errorExpiring, refetch: refetchExpiring } =
    useExpiringProducts(daysFilter);
  const { data: expiredItems, isLoading: loadingExpired, isError: errorExpired, refetch: refetchExpired } =
    useExpiredProducts();

  const expiring = useMemo(
    () => (expiringItems ?? []).sort((a, b) => a.daysLeft - b.daysLeft),
    [expiringItems],
  );
  const expired = useMemo(
    () => (expiredItems ?? []).map((item) => ({
      ...item,
      daysLeft: Math.round((new Date(item.expiryDate).getTime() - Date.now()) / 86400000),
      warehouseName: '',
    })),
    [expiredItems],
  );

  const isLoading = tab === 'expiring' ? loadingExpiring : loadingExpired;
  const isError = tab === 'expiring' ? errorExpiring : errorExpired;
  const items = tab === 'expired' ? expired : expiring;

  // Stats
  const totalExpiring30 = expiringItems?.length ?? 0;
  const totalExpired = expiredItems?.length ?? 0;
  const avgDaysLeft =
    expiring.length > 0
      ? Math.round(expiring.reduce((sum, i) => sum + i.daysLeft, 0) / expiring.length)
      : 0;

  const handleExport = () => {
    const rows = items.map((item) => ({
      Mahsulot: item.productName,
      Partiya: item.batchNumber ?? '',
      Ombor: 'warehouseName' in item ? item.warehouseName : '',
      Muddati: formatDate(typeof item.expiryDate === 'string' ? item.expiryDate : String(item.expiryDate)),
      'Qolgan kun': item.daysLeft,
      Miqdor: item.qty,
    }));
    downloadCsv(rows, `expiry-${tab}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Yaroqlilik muddati</h1>
          <p className="mt-0.5 text-sm text-gray-500">Kosmetika mahsulotlari muddati nazorati</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={items.length === 0}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Eksport
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-yellow-600">Muddati yaqin (30 kun)</p>
          <p className="mt-1 text-2xl font-bold text-yellow-800">{totalExpiring30}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-600">Muddati o&apos;tgan</p>
          <p className="mt-1 text-2xl font-bold text-red-800">{totalExpired}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">O&apos;rtacha qolgan kun</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{avgDaysLeft}</p>
        </div>
      </div>

      {/* Alert banners */}
      {totalExpired > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">
            <strong>{totalExpired} ta mahsulot</strong> muddati o&apos;tgan — darhol olib tashlang!
          </p>
        </div>
      )}

      {/* Tabs + filter */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {([['expiring', 'Muddati yaqin'], ['expired', "Muddati o'tgan"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {label}
              {key === 'expired' && totalExpired > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                  {totalExpired}
                </span>
              )}
            </button>
          ))}
        </div>
        {tab === 'expiring' && (
          <SearchableDropdown
            options={DAYS_OPTIONS}
            value={String(daysFilter)}
            onChange={(val) => setDaysFilter(Number(val) || 30)}
            searchable={false}
            clearable={false}
            className="min-w-[160px]"
          />
        )}
      </div>

      {/* Error state */}
      {isError && (
        <ErrorState
          title="Ma'lumot yuklanmadi"
          description="Server bilan bog'lanishda xatolik"
          onRetry={tab === 'expiring' ? refetchExpiring : refetchExpired}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <ScrollableTable totalCount={items.length}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Mahsulot', 'Partiya', tab === 'expiring' ? 'Ombor' : '', 'Muddati', 'Miqdori', 'Holat']
                  .filter(Boolean)
                  .map((h) => (
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={tab === 'expiring' ? 6 : 5} className="py-12 text-center text-gray-400">
                    <Package className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                    {tab === 'expired'
                      ? "Muddati o'tgan mahsulot yo'q"
                      : "Bu muddat oralig'ida mahsulot yo'q"}
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr
                    key={`${item.productId ?? item.productName}-${item.batchNumber ?? ''}-${idx}`}
                    className={cn('hover:bg-gray-50', item.daysLeft < 0 && 'bg-red-50/30')}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {item.batchNumber ?? '—'}
                    </td>
                    {tab === 'expiring' && (
                      <td className="px-4 py-3 text-gray-600">
                        {'warehouseName' in item ? item.warehouseName : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(typeof item.expiryDate === 'string' ? item.expiryDate : String(item.expiryDate))}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.qty}</td>
                    <td className="px-4 py-3">
                      <ExpiryBadge daysLeft={item.daysLeft} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollableTable>
      )}
    </div>
  );
}
