'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, ChevronRight, X } from 'lucide-react';
import { useWarehouseInvoices } from '@/hooks/warehouse/useWarehouseInvoices';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function WarehouseInvoicesPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useWarehouseInvoices({ from: from || undefined, to: to || undefined, page });

  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  const filtered = search
    ? invoices.filter((inv) =>
        (inv.invoiceNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.note ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : invoices;

  const hasFilters = from || to || search;

  const reset = () => {
    setFrom('');
    setTo('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nakladnoylar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tovar qabul kirim hujjatlari</p>
        </div>
        <Link
          href="/warehouse/stock-in"
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
        >
          <Plus className="h-4 w-4" />
          Yangi nakladnoy
        </Link>
      </div>

      {/* Filterlar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Raqam yoki izoh..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
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

      {/* Jadval */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <FileText className="h-10 w-10 text-gray-300" />
            <p className="text-sm">Nakladnoylar topilmadi</p>
            <Link href="/warehouse/stock-in" className="mt-2 text-sm text-amber-600 hover:underline">
              Birinchi nakladnoyni yarating
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Raqam</th>
                  <th className="px-4 py-3 text-left">Sana</th>
                  <th className="px-4 py-3 text-left">Tovarlar</th>
                  <th className="px-4 py-3 text-left">Izoh</th>
                  <th className="px-4 py-3 text-right">Jami summa</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-amber-50/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/warehouse/invoices/${inv.id}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {inv.invoiceNumber ?? `#${inv.id.slice(0, 8)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDateTime(inv.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inv.items.length} ta tovar
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                      {inv.note ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                      {formatPrice(Number(inv.totalCost))}
                    </td>
                    <td className="px-4 py-3 text-amber-500">
                      <ChevronRight className="h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sahifalash */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>Jami: {total} ta</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span className="tabular-nums">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
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
