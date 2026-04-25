'use client';

import { useState, useMemo } from 'react';
import { Plus, Tag, TrendingDown, BarChart3, Pencil, Trash2, Percent } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { CreateDiscountModal } from './CreateDiscountModal';

/* ─── Demo Data ─── */

const DEMO_PRODUCTS = [
  { id: '1', name: 'Nivea Krem 100ml', category: 'Kremlar', price: 45000 },
  { id: '2', name: "Loreal Shampun 400ml", category: 'Soch parvarishi', price: 89000 },
  { id: '3', name: "Garnier Yuz niqobi", category: 'Yuz parvarishi', price: 32000 },
  { id: '4', name: "Dove Dush jeli 250ml", category: 'Gigiena', price: 28000 },
  { id: '5', name: "Pantene Pro-V Kondisioner", category: 'Soch parvarishi', price: 67000 },
  { id: '6', name: "Olay Namlovchi krem", category: 'Kremlar', price: 125000 },
  { id: '7', name: "Head&Shoulders Shampun", category: 'Soch parvarishi', price: 54000 },
  { id: '8', name: "Neutrogena Toner", category: 'Yuz parvarishi', price: 98000 },
  { id: '9', name: "Colgate Tish pastasi", category: 'Gigiena', price: 18000 },
  { id: '10', name: "Rexona Dezodorant", category: 'Gigiena', price: 35000 },
];

const DISCOUNT_STATUSES = ['active', 'completed', 'pending'] as const;
type DiscountStatus = (typeof DISCOUNT_STATUSES)[number];

interface Discount {
  id: string;
  product: (typeof DEMO_PRODUCTS)[number];
  type: 'percent' | 'fixed';
  amount: number;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
  usedCount: number;
}

const DEMO_DISCOUNTS: Discount[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  product: DEMO_PRODUCTS[i % DEMO_PRODUCTS.length],
  type: i % 2 === 0 ? 'percent' : 'fixed',
  amount: i % 2 === 0 ? Math.max(5, (5 + i * 3) % 50) : (10000 + i * 5000),
  startDate: '2026-04-01',
  endDate: '2026-04-30',
  status: DISCOUNT_STATUSES[i % 3],
  usedCount: i * 7,
}));

/* ─── Status config ─── */

const STATUS_CONFIG: Record<DiscountStatus, { label: string; className: string }> = {
  active: { label: 'Faol', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' },
  completed: { label: 'Yakunlangan', className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20' },
  pending: { label: 'Kutilmoqda', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' },
};

/* ─── Filter options ─── */

const STATUS_OPTIONS = [
  { value: '', label: 'Hammasi' },
  { value: 'active', label: 'Faol' },
  { value: 'completed', label: 'Yakunlangan' },
  { value: 'pending', label: 'Kutilmoqda' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Hammasi' },
  { value: 'percent', label: 'Foiz (%)' },
  { value: 'fixed', label: "Miqdor (So'm)" },
];

/* ─── Page ─── */

export default function ChegirmaPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DEMO_DISCOUNTS.filter((d) => {
      const matchesSearch = !q || d.product.name.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || d.status === statusFilter;
      const matchesType = !typeFilter || d.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Stat counts
  const activeCount = DEMO_DISCOUNTS.filter((d) => d.status === 'active').length;
  const todaySaved = DEMO_DISCOUNTS.filter((d) => d.status === 'active')
    .reduce((s, d) => s + (d.type === 'fixed' ? d.amount : d.amount * 1000), 0);
  const totalUsed = DEMO_DISCOUNTS.reduce((s, d) => s + d.usedCount, 0);

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Chegirmalar boshqaruvi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mahsulotlarga chegirma qo&apos;shing va boshqaring
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Yangi chegirma
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card-green flex flex-col gap-3 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-90">Faol chegirmalar</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black">{activeCount}</p>
          <p className="text-xs opacity-75">Hozirda aktiv chegirmalar</p>
        </div>

        <div className="stat-card-orange flex flex-col gap-3 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-90">Bugun tejaldi</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-black">{formatPrice(todaySaved)}</p>
          <p className="text-xs opacity-75">Chegirmalar orqali</p>
        </div>

        <div className="stat-card-purple flex flex-col gap-3 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-90">Jami ishlatildi</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black">{totalUsed}</p>
          <p className="text-xs opacity-75">Barcha chegirmalar uchun</p>
        </div>
      </div>

      {/* Table */}
      <ScrollableTable
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Mahsulot qidiring..."
        filters={
          <>
            <SearchableDropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              placeholder="Status"
              searchable={false}
              clearable={!!statusFilter}
              className="w-40"
            />
            <SearchableDropdown
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v); setPage(1); }}
              placeholder="Turi"
              searchable={false}
              clearable={!!typeFilter}
              className="w-44"
            />
          </>
        }
        totalCount={filtered.length}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
            <tr>
              {['Mahsulot', 'Chegirma turi', 'Miqdor', 'Boshlanish', 'Tugash', 'Status', 'Amallar'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  Chegirmalar topilmadi
                </td>
              </tr>
            ) : (
              paginated.map((d) => {
                const status = STATUS_CONFIG[d.status];
                return (
                  <tr key={d.id} className="transition hover:bg-gray-50">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                          <Tag className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{d.product.name}</p>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            {d.product.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          d.type === 'percent'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700',
                        )}
                      >
                        <Percent className="h-3 w-3" />
                        {d.type === 'percent' ? 'Foiz' : "So'm"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {d.type === 'percent' ? `${d.amount}%` : formatPrice(d.amount)}
                    </td>

                    {/* Start date */}
                    <td className="px-4 py-3 text-gray-500">{d.startDate}</td>

                    {/* End date */}
                    <td className="px-4 py-3 text-gray-500">{d.endDate}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', status.className)}>
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Tahrirlash"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="O'chirish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollableTable>

      {/* Modal */}
      {showModal && (
        <CreateDiscountModal
          onClose={() => setShowModal(false)}
          products={DEMO_PRODUCTS}
        />
      )}
    </div>
  );
}
