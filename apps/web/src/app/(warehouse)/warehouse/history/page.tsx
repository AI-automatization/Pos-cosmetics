'use client';

import { useState, useCallback } from 'react';
import { ArrowUpDown, Download, Search, X } from 'lucide-react';
import { useWarehouseMovements } from '@/hooks/warehouse/useWarehouseInvoices';
import { cn } from '@/lib/utils';

const MOVEMENT_TYPES = ['IN', 'OUT', 'WRITE_OFF', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'] as const;

const TYPE_META: Record<string, { label: string; color: string; sign: string }> = {
  IN:           { label: 'Kirim',             color: 'text-green-600 bg-green-50',   sign: '+' },
  OUT:          { label: 'Chiqim',            color: 'text-red-600 bg-red-50',       sign: '-' },
  WRITE_OFF:    { label: 'Spisanie',          color: 'text-orange-600 bg-orange-50', sign: '-' },
  TRANSFER_IN:  { label: 'Transfer (kirim)',  color: 'text-blue-600 bg-blue-50',     sign: '+' },
  TRANSFER_OUT: { label: 'Transfer (chiqim)', color: 'text-purple-600 bg-purple-50', sign: '-' },
  ADJUSTMENT:   { label: 'Tuzatish',          color: 'text-gray-600 bg-gray-100',    sign: '±' },
};

interface Filters {
  type: string;
  from: string;
  to:   string;
  search: string;
}

const EMPTY_FILTERS: Filters = { type: '', from: '', to: '', search: '' };

function buildCsv(rows: ReturnType<typeof useWarehouseMovements>['data']): string {
  if (!rows) return '';
  const header = ['Sana', 'Mahsulot', 'SKU', 'Turi', 'Miqdor', 'Ombor', 'Kim', 'Manba/Sabab'].join(',');
  const lines = rows.movements.map((m) => {
    const meta = TYPE_META[m.type] ?? { sign: '' };
    const sign = ['IN', 'TRANSFER_IN'].includes(m.type) ? '+' : '-';
    return [
      new Date(m.createdAt).toLocaleDateString('uz-UZ'),
      `"${m.product?.name ?? '—'}"`,
      m.product?.sku ?? '',
      TYPE_META[m.type]?.label ?? m.type,
      `${sign}${Number(m.quantity)}`,
      m.warehouse?.name ?? '—',
      m.user ? `${m.user.firstName} ${m.user.lastName}` : '—',
      `"${m.note ?? m.refType ?? ''}"`,
    ].join(',');
  });
  return [header, ...lines].join('\n');
}

function downloadCsv(content: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `warehouse-movements-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WarehouseHistoryPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage]       = useState(1);

  const queryParams = {
    type:  filters.type  || undefined,
    from:  filters.from  || undefined,
    to:    filters.to    || undefined,
    page,
    limit: 50,
  };

  const { data, isLoading, isFetching } = useWarehouseMovements(queryParams);

  const reset = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const hasFilters = Object.values(filters).some(Boolean);

  // Client-side search filter by product name
  const rows = data?.movements.filter((m) =>
    !filters.search ||
    m.product?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    (m.product?.sku ?? '').toLowerCase().includes(filters.search.toLowerCase()),
  ) ?? [];

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harakatlar tarixi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Barcha kirim/chiqim harakatlar</p>
        </div>
        <button
          onClick={() => downloadCsv(buildCsv(data))}
          disabled={!data || rows.length === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
              placeholder="Mahsulot nomi / SKU..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => { setFilters((f) => ({ ...f, type: e.target.value })); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Barcha turlar</option>
            {MOVEMENT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>
            ))}
          </select>

          {/* From date */}
          <input
            type="date"
            value={filters.from}
            onChange={(e) => { setFilters((f) => ({ ...f, from: e.target.value })); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* To date */}
          <input
            type="date"
            value={filters.to}
            onChange={(e) => { setFilters((f) => ({ ...f, to: e.target.value })); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
            Filtrlarni tozalash
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <ArrowUpDown className="h-8 w-8" />
            <p className="text-sm">Harakatlar topilmadi</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Sana</th>
                    <th className="px-4 py-3 text-left">Mahsulot</th>
                    <th className="px-4 py-3 text-left">Turi</th>
                    <th className="px-4 py-3 text-right">Miqdor</th>
                    <th className="px-4 py-3 text-left">Ombor</th>
                    <th className="px-4 py-3 text-left">Kim</th>
                    <th className="px-4 py-3 text-left">Manba / Sabab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((m) => {
                    const meta = TYPE_META[m.type] ?? { label: m.type, color: 'text-gray-600 bg-gray-100', sign: '' };
                    const isPositive = ['IN', 'TRANSFER_IN'].includes(m.type);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 font-medium truncate max-w-[180px]">{m.product?.name ?? '—'}</p>
                          {m.product?.sku && <p className="text-xs text-gray-400">{m.product.sku}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', meta.color)}>
                            {meta.label}
                          </span>
                        </td>
                        <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', isPositive ? 'text-green-600' : 'text-red-500')}>
                          {isPositive ? '+' : '-'}{Number(m.quantity)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.warehouse?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.user ? `${m.user.firstName} ${m.user.lastName}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {m.note ?? m.refType ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>
                  {((page - 1) * (data?.limit ?? 50)) + 1}–{Math.min(page * (data?.limit ?? 50), data?.total ?? 0)} / {data?.total ?? 0} ta
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span className="tabular-nums">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isFetching}
                    className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
