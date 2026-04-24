'use client';

import { useState, useMemo } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, RotateCcw, XCircle, Receipt, ShoppingCart, Eye, X, Banknote, CreditCard, Clock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { useOrders, useOrder } from '@/hooks/sales/useOrders';
import { formatPrice, formatDateTime, cn } from '@/lib/utils';
import type { OrderStatus, PaymentMethod } from '@/types/order';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  COMPLETED: { label: 'Bajarildi', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  RETURNED: { label: 'Qaytarildi', icon: RotateCcw, className: 'bg-yellow-100 text-yellow-700' },
  VOIDED: { label: 'Bekor qilindi', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Naqd',
  NAQD: 'Naqd',
  CARD: 'Karta',
  KARTA: 'Karta',
  TERMINAL: 'Karta',
  NASIYA: 'Nasiya',
  DEBT: 'Nasiya',
  ARALASH: 'Aralash',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{status}</span>;
  const { label, icon: Icon, className } = config;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

const STATUS_FILTERS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'COMPLETED', label: 'Bajarildi' },
  { value: 'RETURNED', label: 'Qaytarildi' },
  { value: 'VOIDED', label: 'Bekor qilindi' },
];

const PAYMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Banknote,
  NAQD: Banknote,
  CARD: CreditCard,
  KARTA: CreditCard,
  TERMINAL: CreditCard,
  NASIYA: Clock,
  DEBT: Clock,
  ARALASH: Banknote,
};

function OrderDetailModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data: order, isLoading } = useOrder(orderId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-2xl max-h-[85vh] flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {order ? `Buyurtma #${order.orderNumber}` : 'Buyurtma tafsilotlari'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <LoadingSkeleton variant="table" rows={4} />
          ) : order ? (
            <>
              {/* Order meta info */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">Sana</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">Kassir</p>
                  <p className="text-sm font-semibold text-gray-900">{order.cashierName ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">To&apos;lov usuli</p>
                  {order.paymentMethod ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      {(() => {
                        const Icon = PAYMENT_ICONS[order.paymentMethod] ?? Banknote;
                        return <Icon className="h-3.5 w-3.5 text-blue-500" />;
                      })()}
                      {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">—</p>
                  )}
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">Holat</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Customer row (if present) */}
              {order.customerName && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5">
                  <span className="text-xs font-medium text-blue-500">Mijoz: </span>
                  <span className="text-sm font-semibold text-blue-800">{order.customerName}</span>
                </div>
              )}

              {/* Notes row (if present) */}
              {order.notes && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-500">Izoh: </span>
                  <span className="text-sm text-gray-700">{order.notes}</span>
                </div>
              )}

              {/* Order items table */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Mahsulotlar</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Mahsulot
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Miqdor
                        </th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Narx
                        </th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Jami
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-400">
                            Mahsulotlar mavjud emas
                          </td>
                        </tr>
                      ) : (
                        order.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              {item.sku && (
                                <p className="text-xs text-gray-400">{item.sku}</p>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-700">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-700">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                              {formatPrice(item.total)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment intents detail */}
              {order.paymentIntents && order.paymentIntents.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">To&apos;lovlar</h3>
                  <div className="space-y-1.5">
                    {order.paymentIntents.map((pi, idx) => {
                      const Icon = PAYMENT_ICONS[pi.method] ?? Banknote;
                      return (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                          <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <Icon className="h-4 w-4 text-blue-500" />
                            {PAYMENT_LABELS[pi.method] ?? pi.method}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(pi.amount))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Totals footer */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Jami (soliqlarsiz)</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Chegirma</span>
                    <span>- {formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Soliq</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>Umumiy</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">Ma&apos;lumot topilmadi</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const LIMIT = pageSize;

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    limit: LIMIT,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedOrders = useMemo(() => {
    if (!sortField) return orders;
    return [...orders].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === 'string'
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) > (bVal as number)
          ? 1
          : (aVal as number) < (bVal as number)
          ? -1
          : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [orders, sortField, sortDir]);

  function SortHeader({ field, label }: { field: string; label: string }) {
    const active = sortField === field;
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 hover:text-gray-900 group"
      >
        {label}
        <span
          className={cn(
            'transition-colors',
            active ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500',
          )}
        >
          {active && sortDir === 'desc' ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </span>
      </button>
    );
  }

  return (
    <>
    <PageLayout
      title="Buyurtmalar"
      subtitle={`Jami: ${total} ta buyurtma`}
    >
      {/* Status filter tabs */}
      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setStatusFilter(f.value as OrderStatus | 'ALL'); setPage(1); }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError && <ErrorState compact onRetry={refetch} />}

      {!isError && (
        orders.length === 0 && !isLoading ? (
          <EmptyState icon={ShoppingCart} title="Buyurtmalar mavjud emas" />
        ) : (
          <ScrollableTable
            totalCount={total}
            isLoading={isLoading}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
            }}
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1">
                      <Receipt className="h-3.5 w-3.5" />
                      Buyurtma №
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <SortHeader field="createdAt" label="Sana" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kassir</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">To&apos;lov</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Holat</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <SortHeader field="total" label="Summa" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedOrders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-700">{o.cashierName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {o.paymentMethod ? (
                        <span className="inline-flex items-center gap-1">
                          {(() => {
                            const Icon = PAYMENT_ICONS[o.paymentMethod] ?? Banknote;
                            return <Icon className="h-3.5 w-3.5 text-blue-500" />;
                          })()}
                          {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(o.id)}
                        title="Ko'rish"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        )
      )}
    </PageLayout>

    {selectedOrderId && (
      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    )}
    </>
  );
}
