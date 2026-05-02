'use client';

import { useState, useMemo } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  Eye,
  X,
  Clock,
  Loader2,
} from 'lucide-react';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import { useOrder } from '@/hooks/sales/useOrders';
import type { Order, OrderItem } from '@/types/order';

interface OrderWithCustomer extends Order {
  customer?: { id: string; name: string; phone: string } | null;
}

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  TERMINAL: 'Karta',
  NASIYA: 'Nasiya',
  DEBT: 'Nasiya',
  TRANSFER: "Bank o'tkazma",
  CLICK: 'Click',
  PAYME: 'Payme',
};

const METHOD_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Banknote,
  CARD: CreditCard,
  TERMINAL: CreditCard,
  NASIYA: Clock,
  DEBT: Clock,
  TRANSFER: ArrowUpRight,
  CLICK: Smartphone,
  PAYME: Smartphone,
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-orange-100 text-orange-700',
  VOIDED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Yakunlandi',
  RETURNED: 'Qaytarildi',
  VOIDED: 'Bekor qilindi',
};

// Stat card colors
const STAT_COLORS: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <span className={cn('p-1.5 rounded-lg', STAT_COLORS[color])}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// Payment detail modal — fetches full order by id
function PaymentDetailModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data: order, isLoading } = useOrder(orderId);

  const method = order?.paymentMethod ?? 'CASH';
  const MethodIcon = METHOD_ICON[method] ?? CreditCard;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            To&apos;lov tafsiloti
            {order ? (
              <span className="ml-1.5 font-mono text-blue-600">— #{order.orderNumber}</span>
            ) : null}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : order ? (
            <>
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Sana</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(order.createdAt).toLocaleString('uz-UZ', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Kassir</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {order.cashierName ?? '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">To&apos;lov usuli</p>
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
                    <MethodIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {METHOD_LABEL[method] ?? method}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Holat</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
              </div>

              {/* Customer row */}
              {order.customerName && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <span className="text-blue-400">Xaridor:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}

              {/* Items table */}
              {order.items && order.items.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    Mahsulotlar
                  </p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Mahsulot', 'Miqdor', 'Narx', 'Jami'].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {order.items.map((item: OrderItem) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2.5 text-gray-800 font-medium">
                              {item.productName}
                              {item.sku && (
                                <span className="ml-1.5 text-xs text-gray-400 font-mono">
                                  {item.sku}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-gray-600">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-gray-900">
                              {formatPrice(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* Total footer */}
              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Chegirma</span>
                    <span className="text-orange-600">− {formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Soliq</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Jami summa</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 text-sm text-yellow-800">
                  <span className="font-medium">Izoh: </span>
                  {order.notes}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 py-8">Ma&apos;lumot topilmadi</p>
          )}
        </div>
      </div>
    </div>
  );
}

function useOrdersQuery(page: number) {
  return useQuery({
    queryKey: ['orders', 'payments-history', page],
    queryFn: () => ordersApi.list({ page, limit: 30 }),
    staleTime: 30_000,
  });
}

export default function PaymentsHistoryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useOrdersQuery(page);

  const orders = (data?.items ?? []) as OrderWithCustomer[];
  const total = data?.total ?? 0;

  // Compute stats from current page orders
  const stats = useMemo(() => {
    if (!orders.length) return null;
    const cash = orders.filter((o) => o.paymentMethod === 'CASH');
    const card = orders.filter(
      (o) => o.paymentMethod === 'CARD' || o.paymentMethod === ('TERMINAL' as Order['paymentMethod']),
    );
    const debt = orders.filter(
      (o) =>
        o.paymentMethod === 'NASIYA' ||
        o.paymentMethod === ('DEBT' as Order['paymentMethod']),
    );
    const totalSum = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    return {
      total: totalSum,
      totalCount: orders.length,
      cash: {
        sum: cash.reduce((s, o) => s + (Number(o.total) || 0), 0),
        count: cash.length,
      },
      card: {
        sum: card.reduce((s, o) => s + (Number(o.total) || 0), 0),
        count: card.length,
      },
      debt: {
        sum: debt.reduce((s, o) => s + (Number(o.total) || 0), 0),
        count: debt.length,
      },
    };
  }, [orders]);

  const filtered = orders.filter(
    (o) =>
      !search ||
      String(o.orderNumber).includes(search) ||
      (o.paymentMethod ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Jami to'lovlar"
              value={formatPrice(stats.total)}
              sub={`${stats.totalCount} ta`}
              color="blue"
            />
            <StatCard
              label="Naqd"
              value={formatPrice(stats.cash.sum)}
              sub={`${stats.cash.count} ta`}
              color="green"
              icon={Banknote}
            />
            <StatCard
              label="Karta"
              value={formatPrice(stats.card.sum)}
              sub={`${stats.card.count} ta`}
              color="purple"
              icon={CreditCard}
            />
            <StatCard
              label="Nasiya"
              value={formatPrice(stats.debt.sum)}
              sub={`${stats.debt.count} ta`}
              color="orange"
              icon={Clock}
            />
          </div>
        )}

        {/* Table */}
        <ScrollableTable
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buyurtma № yoki to'lov turi..."
          totalCount={total}
          isLoading={isLoading}
          pagination={
            total > pageSize
              ? {
                  page,
                  pageSize,
                  total,
                  onPageChange: setPage,
                  onPageSizeChange: (s) => {
                    setPageSize(s);
                    setPage(1);
                  },
                }
              : undefined
          }
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b border-gray-100 bg-gray-50">
              <tr>
                {["Sana", "Buyurtma №", "To'lov usuli", "Summa", "Holat", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    To&apos;lovlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const method = o.paymentMethod ?? 'CASH';
                  const Icon = METHOD_ICON[method] ?? CreditCard;
                  return (
                    <tr key={o.id} className="transition hover:bg-gray-50 group">
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(o.createdAt).toLocaleString('uz-UZ', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">
                        #{o.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <Icon className="h-4 w-4 text-gray-400" />
                          {METHOD_LABEL[method] ?? method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatPrice(Number(o.total))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrderId(o.id)}
                          className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-blue-600 transition-all"
                          title="Tafsilotlarni ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ScrollableTable>
      </div>

      {/* Detail modal */}
      {selectedOrderId && (
        <PaymentDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
