'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, Search, AlertTriangle, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useProducts } from '@/hooks/catalog/useProducts';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;
type SortCol = 'name' | 'stock' | 'min';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol; sortDir: SortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="inline ml-1 h-3 w-3 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="inline ml-1 h-3 w-3 text-amber-500" />
    : <ChevronDown className="inline ml-1 h-3 w-3 text-amber-500" />;
}

export default function LowStockPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<SortCol>('stock');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data: productsData, isLoading, refetch } = useProducts({ limit: 500, isActive: true });
  const allProducts = Array.isArray(productsData) ? productsData : (productsData?.items ?? []);

  const lowStockProducts = allProducts.filter((p) => {
    const stock = p.currentStock ?? 0;
    return stock <= 0 || (p.minStockLevel > 0 && stock <= p.minStockLevel);
  });

  const searchFiltered = search
    ? lowStockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.sku ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : lowStockProducts;

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  const sorted = [...searchFiltered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortCol === 'name') return dir * a.name.localeCompare(b.name);
    if (sortCol === 'stock') return dir * ((a.currentStock ?? 0) - (b.currentStock ?? 0));
    if (sortCol === 'min') return dir * (a.minStockLevel - b.minStockLevel);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, sortCol]);

  const outCount = sorted.filter((p) => (p.currentStock ?? 0) <= 0).length;
  const lowCount = sorted.filter((p) => {
    const s = p.currentStock ?? 0;
    return s > 0 && p.minStockLevel > 0 && s <= p.minStockLevel;
  }).length;

  return (
    <div className="p-6 space-y-5">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kam qolgan tovarlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Minimal zaxiradan kam yoki tugagan mahsulotlar</p>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </button>
      </div>

      {/* Statistika */}
      {!isLoading && (
        <div className="flex gap-3 flex-wrap">
          {outCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 font-medium">{outCount} ta mahsulot tugagan</span>
            </div>
          )}
          {lowCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-orange-700 font-medium">{lowCount} ta kam qoldi</span>
            </div>
          )}
          {outCount === 0 && lowCount === 0 && !isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm">
              <span className="text-green-700 font-medium">Barcha tovarlar yetarli ✓</span>
            </div>
          )}
        </div>
      )}

      {/* Qidirish */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nomi yoki SKU..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Jadval */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <TrendingDown className="h-10 w-10 text-gray-300" />
            <p className="text-sm">
              {search ? "Qidiruv bo'yicha hech narsa topilmadi" : 'Hamma tovarlar yetarli miqdorda ✓'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Mahsulot <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} />
                    </th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Kategoriya</th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort('min')}
                    >
                      Min. zaxira <SortIcon col="min" sortCol={sortCol} sortDir={sortDir} />
                    </th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort('stock')}
                    >
                      Hozirgi miqdor <SortIcon col="stock" sortCol={sortCol} sortDir={sortDir} />
                    </th>
                    <th className="px-4 py-3 text-right">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((p) => {
                    const stock = p.currentStock ?? 0;
                    const isOut = stock <= 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-400">{p.sku ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{p.category?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {p.minStockLevel > 0 ? `${p.minStockLevel} ${p.unit?.shortName ?? 'dona'}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          <span className={cn(isOut ? 'text-red-600' : 'text-orange-600')}>
                            {Math.max(0, stock)} {p.unit?.shortName ?? 'dona'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                              isOut ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700',
                            )}
                          >
                            {isOut ? (
                              <><AlertTriangle className="h-3 w-3" /> Tugagan</>
                            ) : (
                              <><TrendingDown className="h-3 w-3" /> Kam qoldi</>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} / {sorted.length} ta</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >‹</button>
                  <span className="px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
