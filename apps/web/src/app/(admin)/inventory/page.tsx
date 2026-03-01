'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { useStock } from '@/hooks/inventory/useInventory';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types/inventory';

function StatusBadge({ status }: { status: StockStatus }) {
  const config = {
    OK: { label: 'OK', className: 'bg-green-100 text-green-700' },
    LOW: { label: 'Kam', className: 'bg-yellow-100 text-yellow-700' },
    OUT: { label: 'Tugagan', className: 'bg-red-100 text-red-700' },
  };
  const { label, className } = config[status];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
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

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const { data: stock, isLoading, isError } = useStock({ search: search || undefined });

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
          <Link
            href="/inventory/low-stock"
            className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
          >
            <AlertTriangle className="h-4 w-4" />
            Kam zaxira
          </Link>
          <Link
            href="/inventory/stock-out"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Chiqim
          </Link>
          <Link
            href="/inventory/stock-in"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Kirim
          </Link>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Mahsulot nomi, barcode yoki SKU..."
        className="max-w-sm"
      />

      {/* Table */}
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
                    {search ? 'Qidiruv bo\'yicha natija topilmadi' : 'Mahsulotlar yo\'q'}
                  </td>
                </tr>
              ) : (
                stock.map((item) => (
                  <tr
                    key={item.productId}
                    className={cn(
                      'transition hover:bg-gray-50',
                      item.status === 'OUT' && 'bg-red-50/40',
                      item.status === 'LOW' && 'bg-yellow-50/40',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="text-xs text-gray-400">{item.sku} · {item.unit}</div>
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
    </div>
  );
}
