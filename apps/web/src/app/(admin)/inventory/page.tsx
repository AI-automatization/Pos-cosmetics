'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, PackageOpen, User } from 'lucide-react';
import { useStock, useMovementsWithUsers } from '@/hooks/inventory/useInventory';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StockInModal } from './StockInModal';
import { StockOutModal } from './StockOutModal';
import { ProductStockDrawer } from './ProductStockDrawer';
import { cn } from '@/lib/utils';
import type { StockLevel, StockStatus } from '@/types/inventory';

function StatusBadge({ status }: { status: StockStatus }) {
  const config: Record<string, { label: string; className: string }> = {
    OK: { label: 'OK', className: 'bg-green-100 text-green-700' },
    LOW: { label: 'Kam', className: 'bg-yellow-100 text-yellow-700' },
    OUT: { label: 'Tugagan', className: 'bg-red-100 text-red-700' },
  };
  const item = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', item.className)}>
      {item.label}
    </span>
  );
}

function StockQty({ value, status }: { value: number; status: StockStatus }) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        status === 'OUT' ? 'text-red-600' : status === 'LOW' ? 'text-yellow-600' : 'text-gray-900',
      )}
    >
      {value}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockLevel | null>(null);

  const { data: stock, isLoading, isError } = useStock({ search: search || undefined });
  const { data: movements, isLoading: movLoading } = useMovementsWithUsers();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Zaxira holati</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {stock ? `${stock.length} ta mahsulot` : 'Yuklanmoqda...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/inventory/low-stock"
            className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
          >
            <AlertTriangle className="h-4 w-4" />
            Kam zaxira
          </a>
          <button
            type="button"
            onClick={() => setStockOutOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Chiqim
          </button>
          <button
            type="button"
            onClick={() => setStockInOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Kirim
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('stock')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'stock'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          Zaxira holati
        </button>
        <button
          type="button"
          onClick={() => setTab('movements')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'movements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          Harakatlar tarixi
          {movements && movements.length > 0 && (
            <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
              {movements.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Zaxira holati */}
      {tab === 'stock' && (
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Mahsulot nomi, barcode yoki SKU..."
            className="max-w-sm"
          />

          {isLoading ? (
            <LoadingSkeleton variant="table" rows={8} />
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Ma&apos;lumotlarni yuklashda xato yuz berdi
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Mahsulot</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Barcode</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Kategoriya</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Zaxira</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Min</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!stock || stock.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                        {search ? "Qidiruv bo'yicha natija topilmadi" : "Mahsulotlar yo'q"}
                      </td>
                    </tr>
                  ) : (
                    stock.map((item) => (
                      <tr
                        key={item.productId}
                        onClick={() => setSelectedProduct(item)}
                        className={cn(
                          'cursor-pointer transition hover:bg-blue-50/60',
                          item.status === 'OUT' && 'bg-red-50/40',
                          item.status === 'LOW' && 'bg-yellow-50/40',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-xs text-gray-400">
                            {item.sku} · {item.unit}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {item.barcode ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.categoryName}</td>
                        <td className="px-4 py-3 text-right">
                          <StockQty value={item.currentStock} status={item.status} />
                          <span className="ml-1 text-xs text-gray-400">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{item.minStock}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab: Harakatlar tarixi */}
      {tab === 'movements' && (
        <>
          {movLoading ? (
            <LoadingSkeleton variant="table" rows={8} />
          ) : !movements || movements.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
              <PackageOpen className="h-12 w-12 opacity-40" />
              <p className="text-sm">Harakatlar tarixi yo&apos;q</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sana</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Tur</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Mahsulot</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Miqdor</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Yetkazib beruvchi</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        Kim kiritgan
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map((m) => {
                    const isIn = m.type === 'IN';
                    const noteSupplier = isIn
                      ? (m.notes?.split(' | ')[0] ?? m.notes ?? '—')
                      : '—';
                    return (
                      <tr key={m.id} className="transition hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          {formatDate(m.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-medium',
                              isIn
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700',
                            )}
                          >
                            {isIn ? 'Kirim' : 'Chiqim'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{m.productName}</td>
                        <td
                          className={cn(
                            'px-4 py-3 text-right font-semibold tabular-nums',
                            isIn ? 'text-green-600' : 'text-red-600',
                          )}
                        >
                          {isIn ? '+' : '-'}
                          {m.quantity}
                        </td>
                        <td className="max-w-[140px] truncate px-4 py-3 text-gray-600">
                          {noteSupplier}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            {m.userName}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <StockInModal isOpen={stockInOpen} onClose={() => setStockInOpen(false)} />
      <StockOutModal isOpen={stockOutOpen} onClose={() => setStockOutOpen(false)} />

      {/* Product detail drawer — to'liq product ob'ekti uzatiladi */}
      <ProductStockDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
