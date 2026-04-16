'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import { exchangeRateApi } from '@/api/exchangeRate.api';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { toast } from 'sonner';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatRate(v: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(v));
}

export default function ExchangeRatesPage() {
  const [days, setDays] = useState(30);
  const qc = useQueryClient();

  const { data: latest, isLoading: latestLoading } = useQuery({
    queryKey: ['exchange-rate', 'latest'],
    queryFn: () => exchangeRateApi.getLatest(),
    staleTime: 60_000,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['exchange-rate', 'history', days],
    queryFn: () => exchangeRateApi.getHistory(days),
    staleTime: 60_000,
  });

  const { mutate: syncRate, isPending: syncing } = useMutation({
    mutationFn: () => exchangeRateApi.syncFromCbu(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['exchange-rate'] });
      toast.success(`Yangilandi: 1 USD = ${formatRate(data.usdUzs)} so'm`);
    },
    onError: () => toast.error("CBU dan yuklab bo'lmadi"),
  });

  const isLoading = latestLoading || historyLoading;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <DollarSign className="h-5 w-5 text-green-600" />
            Valyuta kurslari
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">USD/UZS kursi — CBU ma'lumotlari</p>
        </div>
        <button
          type="button"
          onClick={() => syncRate()}
          disabled={syncing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          CBU dan yangilash
        </button>
      </div>

      {/* Latest rate card */}
      {latestLoading ? (
        <LoadingSkeleton variant="card" rows={1} />
      ) : latest ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-xs font-medium text-green-600">Joriy kurs (CBU)</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {formatRate(latest.usdUzs)} <span className="text-base font-normal">so'm</span>
            </p>
            <p className="mt-1 text-xs text-green-500">1 USD = {formatRate(latest.usdUzs)} UZS</p>
            <p className="mt-3 text-xs text-gray-400">
              Sana: {formatDate(latest.date)} · Manba: {latest.source}
            </p>
          </div>

          {history && history.length >= 2 && (() => {
            const prev = history[history.length - 2]?.usdUzs ?? latest.usdUzs;
            const diff = latest.usdUzs - prev;
            const pct = prev > 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';
            const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
            const color = diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-500';
            return (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-medium text-gray-500">Kechadan farq</p>
                <p className={`mt-2 flex items-center gap-1 text-2xl font-bold ${color}`}>
                  <Icon className="h-5 w-5" />
                  {diff > 0 ? '+' : ''}{formatRate(diff)}
                </p>
                <p className={`mt-1 text-xs ${color}`}>{diff > 0 ? '+' : ''}{pct}%</p>
              </div>
            );
          })()}

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">Oxirgi yangilanish</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{formatDate(latest.date)}</p>
            <p className="mt-1 text-xs text-gray-400">Manba: {latest.source}</p>
          </div>
        </div>
      ) : null}

      {/* History */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Kurs tarixi</h2>
          <div className="flex gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  days === d
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {d} kun
              </button>
            ))}
          </div>
        </div>

        <ScrollableTable
          totalCount={history?.length}
          isLoading={isLoading}
        >
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Sana</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">Kurs (UZS)</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">Farq</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Manba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!history || history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-gray-400">Kurs tarixi topilmadi</td>
                </tr>
              ) : (
                [...history].reverse().map((row, idx, arr) => {
                  const prev = arr[idx + 1];
                  const diff = prev ? row.usdUzs - prev.usdUzs : 0;
                  const color = diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-400';
                  return (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-700">{formatDate(row.date)}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-900">
                        {formatRate(row.usdUzs)}
                      </td>
                      <td className={`px-5 py-3 text-right tabular-nums text-xs ${color}`}>
                        {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${formatRate(diff)}`}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">{row.source}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ScrollableTable>
      </div>
    </div>
  );
}

