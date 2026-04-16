'use client';

import { useState } from 'react';
import { RotateCcw, CheckCircle, Clock, X } from 'lucide-react';
import { useOrdersForReturns, useCreateReturn } from '@/hooks/sales/useReturns';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, cn } from '@/lib/utils';
import type { Order } from '@/types/order';
import type { CreateReturnDto } from '@/types/returns';

interface BackendOrderItem {
  id: string;
  productId: string;
  product?: { id: string; name: string };
  quantity: number | string;
  unitPrice: number | string;
}

interface BackendOrder extends Omit<Order, 'items'> {
  user?: { firstName?: string; lastName?: string };
  customer?: { id: string; name: string; phone: string } | null;
  items: BackendOrderItem[];
}

function ReturnModal({ order, onClose }: { order: BackendOrder; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState<Record<string, { qty: number; max: number }>>({});
  const { mutate: createReturn, isPending } = useCreateReturn();

  const toggle = (item: BackendOrderItem) => {
    setSelected((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return { ...prev, [item.id]: { qty: Number(item.quantity), max: Number(item.quantity) } };
    });
  };

  const setQty = (itemId: string, qty: number) => {
    setSelected((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], qty: Math.max(0.001, Math.min(qty, prev[itemId].max)) },
    }));
  };

  const handleSubmit = () => {
    const items: CreateReturnDto['items'] = Object.entries(selected).map(([orderItemId, { qty }]) => {
      const oi = order.items.find((i) => i.id === orderItemId)!;
      return { orderItemId, productId: oi.productId, quantity: qty };
    });
    createReturn({ orderId: order.id, items, reason: reason || undefined }, { onSuccess: onClose });
  };

  const total = Object.entries(selected).reduce((s, [id, { qty }]) => {
    const item = order.items.find((i) => i.id === id);
    return s + Number(item?.unitPrice ?? 0) * qty;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Qaytarish — #{order.orderNumber}</h2>
            <p className="text-xs text-gray-500">
              {formatPrice(Number(order.total))} •{' '}
              {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item) => {
            const isSelected = !!selected[item.id];
            const productName = item.product?.name ?? item.productId.slice(0, 8);
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition',
                  isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                )}
                onClick={() => toggle(item)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
                  <p className="text-xs text-gray-500">
                    {Number(item.quantity)} × {formatPrice(Number(item.unitPrice))}
                  </p>
                </div>
                {isSelected && (
                  <input
                    type="number"
                    value={selected[item.id].qty}
                    min={0.001}
                    max={Number(item.quantity)}
                    step={0.001}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setQty(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm text-center outline-none focus:border-blue-400"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Sabab (ixtiyoriy)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Qaytarish sababi..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {Object.keys(selected).length > 0 && (
          <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm flex justify-between">
            <span className="text-gray-600">Qaytarish summasi:</span>
            <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || Object.keys(selected).length === 0}
          className="w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {isPending ? 'Yuklanmoqda...' : "Qaytarish so'rovini yuborish"}
        </button>
      </div>
    </div>
  );
}

type FilterTab = 'ALL' | 'COMPLETED' | 'RETURNED';

export default function ReturnsPage() {
  const [tab, setTab] = useState<FilterTab>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [returnOrder, setReturnOrder] = useState<BackendOrder | null>(null);

  const { data, isLoading } = useOrdersForReturns({ page, limit: pageSize });

  const orders = (data?.items ?? []) as BackendOrder[];
  const total = data?.total ?? 0;
  const filtered = orders
    .filter((o) => tab === 'ALL' || o.status === tab)
    .filter((o) => !search || String(o.orderNumber).includes(search));

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'COMPLETED', label: 'Qaytarish mumkin' },
    { key: 'RETURNED', label: 'Qaytarilgan' },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Qaytarishlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">Buyurtmalardan mahsulot qaytarish</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setPage(1); }}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition',
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ScrollableTable
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buyurtma №..."
        totalCount={total}
        isLoading={isLoading}
        pagination={total > pageSize ? {
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        } : undefined}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Buyurtma №', 'Kassir', 'Mahsulotlar', 'Summa', 'Sana', 'Holat', 'Amal'].map((h) => (
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <RotateCcw className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  Buyurtma topilmadi
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const cashierName = order.user
                  ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim()
                  : '—';
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{cashierName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{order.items.length} ta</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'RETURNED' ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" /> Qaytarilgan
                        </span>
                      ) : order.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          <Clock className="h-3 w-3" /> Yakunlangan
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => setReturnOrder(order)}
                          className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Qaytarish
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollableTable>

      {returnOrder && <ReturnModal order={returnOrder} onClose={() => setReturnOrder(null)} />}
    </div>
  );
}
