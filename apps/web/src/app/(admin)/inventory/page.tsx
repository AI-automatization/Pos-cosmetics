'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, PackageOpen, User, FlaskConical, FileText } from 'lucide-react';
import { useStock, useMovementsWithUsers, useInvoices } from '@/hooks/inventory/useInventory';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { StockInModal } from './StockInModal';
import { StockOutModal } from './StockOutModal';
import { TesterModal } from './TesterModal';
import { ProductStockDrawer } from './ProductStockDrawer';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { cn, formatPrice } from '@/lib/utils';
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
  const [tab, setTab] = useState<'stock' | 'movements' | 'invoices'>('stock');
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [testerOpen, setTesterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockLevel | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUser();
  const isOwner = currentUser?.role === 'OWNER';

  const { data: stock, isLoading, isError, refetch } = useStock({ search: search || undefined });
  const { data: movements, isLoading: movLoading } = useMovementsWithUsers();
  const { data: invoicesData, isLoading: invLoading } = useInvoices({ limit: 50 });

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
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
            onClick={() => setTesterOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100"
          >
            <FlaskConical className="h-4 w-4" />
            Tester
          </button>
          {!isOwner && (
            <button
              type="button"
              onClick={() => setStockOutOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Chiqim
            </button>
          )}
          {!isOwner && (
            <button
              type="button"
              onClick={() => setStockInOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Kirim
            </button>
          )}
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
        <button
          type="button"
          onClick={() => setTab('invoices')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          Nakладные
          {invoicesData && invoicesData.total > 0 && (
            <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
              {invoicesData.total}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Zaxira holati */}
      {tab === 'stock' && (
        isError ? (
          <ErrorState compact onRetry={refetch} />
        ) : (
          <ScrollableTable
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Mahsulot nomi, barcode yoki SKU..."
            totalCount={stock?.length}
            isLoading={isLoading}
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mahsulot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Kategoriya</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Zaxira</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Min</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!stock || stock.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <PackageOpen className="h-10 w-10 opacity-40" />
                        <p className="text-sm">{search ? "Qidiruv bo'yicha natija topilmadi" : "Mahsulotlar yo'q"}</p>
                      </div>
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
          </ScrollableTable>
        )
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
              <div className="overflow-x-auto">
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
                      ? (m.note?.split(' | ')[0] ?? m.note ?? '—')
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
            </div>
          )}
        </>
      )}

      {/* Invoices tab */}
      {tab === 'invoices' && (
        <>
          {invLoading && <LoadingSkeleton variant="table" rows={5} />}
          {!invLoading && (!invoicesData || invoicesData.items.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-400">Nakладные topilmadi</p>
            </div>
          )}
          {invoicesData && invoicesData.items.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Sana', 'Hujjat #', 'Yetkazib beruvchi', 'Mahsulotlar', 'Jami summa', 'Holat', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoicesData.items.map((inv) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-yellow-50 text-yellow-700',
                      APPROVED: 'bg-green-50 text-green-700',
                      REJECTED: 'bg-red-50 text-red-700',
                    };
                    const statusLabels: Record<string, string> = {
                      PENDING: 'Kutilmoqda',
                      APPROVED: 'Tasdiqlangan',
                      REJECTED: 'Rad etilgan',
                    };
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(inv.createdAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {inv.invoiceNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{inv.supplier?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{inv.itemsCount} ta</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(inv.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[inv.status] ?? 'bg-gray-100 text-gray-600')}>
                            {statusLabels[inv.status] ?? inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceId(inv.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Ko&apos;rish
                          </button>
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

      {/* Modals — hidden for OWNER role */}
      {!isOwner && <StockInModal isOpen={stockInOpen} onClose={() => setStockInOpen(false)} />}
      {!isOwner && <StockOutModal isOpen={stockOutOpen} onClose={() => setStockOutOpen(false)} />}
      <TesterModal isOpen={testerOpen} onClose={() => setTesterOpen(false)} />

      {/* Product detail drawer — to'liq product ob'ekti uzatiladi */}
      <ProductStockDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <InvoiceDetailDrawer
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </div>
  );
}
