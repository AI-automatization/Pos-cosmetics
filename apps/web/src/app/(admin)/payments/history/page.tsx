'use client';

import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Search, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatPrice, cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import type { Order } from '@/types/order';

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
  NASIYA: CreditCard,
  DEBT: CreditCard,
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

function useOrders(page: number) {
  return useQuery({
    queryKey: ['orders', 'payments-history', page],
    queryFn: () => ordersApi.list({ page, limit: 30 }),
    staleTime: 30_000,
  });
}

export default function PaymentsHistoryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);

  const orders = (data?.items ?? []) as OrderWithCustomer[];
  const filtered = orders.filter(
    (o) =>
      !search ||
      String(o.orderNumber).includes(search) ||
      (o.paymentMethod ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="To'lovlar tarixi" subtitle={`Jami: ${data?.total ?? 0} ta buyurtma`} />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyurtma № yoki to'lov turi..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <CreditCard className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">To&apos;lovlar topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Sana", "Buyurtma №", "Xaridor", "To'lov usuli", "Summa", "Holat"].map((h) => (
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
                {filtered.map((o) => {
                  const method = o.paymentMethod ?? 'CASH';
                  const Icon = METHOD_ICON[method] ?? CreditCard;
                  return (
                    <tr key={o.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(o.createdAt).toLocaleString('uz-UZ', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">
                        #{o.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.customer?.name ?? '—'}</td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {(data?.total ?? 0) > 30 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Sahifa {page}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={orders.length < 30}
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
