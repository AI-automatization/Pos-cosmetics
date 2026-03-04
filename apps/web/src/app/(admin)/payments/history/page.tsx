'use client';

// B-013 fix: /payments/history page was missing — sidebar link returned 404

import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Search, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

interface PaymentIntent {
  id: string;
  orderId: string;
  method: 'CASH' | 'CARD' | 'TRANSFER' | 'CLICK' | 'PAYME';
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SETTLED' | 'FAILED' | 'REVERSED';
  createdAt: string;
}

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  TRANSFER: "Bank o'tkazma",
  CLICK: 'Click',
  PAYME: 'Payme',
};

const METHOD_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Banknote,
  CARD: CreditCard,
  TRANSFER: ArrowUpRight,
  CLICK: Smartphone,
  PAYME: Smartphone,
};

const STATUS_STYLE: Record<string, string> = {
  SETTLED: 'bg-green-100 text-green-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  REVERSED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL: Record<string, string> = {
  SETTLED: 'Yakunlandi',
  CONFIRMED: 'Tasdiqlandi',
  PENDING: 'Kutilmoqda',
  FAILED: 'Xato',
  REVERSED: 'Qaytarildi',
};

function usePaymentHistory() {
  return useQuery({
    queryKey: ['payments', 'history'],
    queryFn: () =>
      apiClient
        .get<{ items: PaymentIntent[]; total: number }>('/payments/history', {
          params: { limit: 50, page: 1 },
        })
        .then((r) => (Array.isArray(r.data) ? r.data : r.data.items ?? []))
        .catch(() => [] as PaymentIntent[]),
  });
}

export default function PaymentsHistoryPage() {
  const [search, setSearch] = useState('');
  const { data: payments = [], isLoading } = usePaymentHistory();

  const filtered = payments.filter(
    (p) =>
      !search ||
      p.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      p.method?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="To'lovlar tarixi" subtitle={`Jami: ${payments.length} ta to'lov`} />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Search */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyurtma ID yoki to'lov turi..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
              Yuklanmoqda...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <CreditCard className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">To&apos;lovlar topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Sana', 'Buyurtma', 'Usul', 'Summa', 'Holat'].map((h) => (
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
                {filtered.map((p) => {
                  const Icon = METHOD_ICON[p.method] ?? CreditCard;
                  return (
                    <tr key={p.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.createdAt).toLocaleString('uz-UZ', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {p.orderId?.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <Icon className="h-4 w-4 text-gray-400" />
                          {METHOD_LABEL[p.method] ?? p.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatPrice(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
