'use client';

// Dashboard da kichik USD/UZS valyuta kursi widget (CBU)
import { TrendingUp } from 'lucide-react';
import { useExchangeRate } from '@/hooks/finance/useExchangeRate';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function formatRate(rate: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(rate));
}

export function ExchangeRateWidget() {
  const { data, isLoading } = useExchangeRate();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isFallback = data.source === 'FALLBACK';

  return (
    <Link
      href="/finance/exchange-rates"
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
      title="Kurs tarixini ko'rish"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">USD / UZS (CBU)</p>
        <p className="mt-0.5 text-lg font-bold text-gray-900">
          {formatRate(data.usdUzs)} so&apos;m
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-gray-400">{data.date}</span>
        {isFallback && (
          <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
            Demo
          </span>
        )}
        {!isFallback && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              data.source === 'CBU' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
            )}
          >
            {data.source}
          </span>
        )}
      </div>
    </Link>
  );
}

// Kichikroq inline variant — header yoki boshqa joylar uchun
export function ExchangeRateBadge() {
  const { data, isLoading } = useExchangeRate();

  if (isLoading) {
    return <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />;
  }

  if (!data) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs">
      <span className="font-medium text-gray-500">USD</span>
      <TrendingUp className="h-3 w-3 text-green-500" />
      <span className="font-bold text-gray-900">{formatRate(data.usdUzs)}</span>
    </div>
  );
}
