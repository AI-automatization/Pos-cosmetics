'use client';

import { cn } from '@/lib/utils';

interface MarginBadgeProps {
  costPrice: number;
  sellPrice: number;
}

export function MarginBadge({ costPrice, sellPrice }: MarginBadgeProps) {
  if (!sellPrice || sellPrice <= 0) return null;
  const margin = ((sellPrice - costPrice) / sellPrice) * 100;
  const profit = sellPrice - costPrice;
  const isNegative = margin < 0;
  const isLow = margin >= 0 && margin < 15;

  return (
    <div
      className={cn(
        'col-span-2 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm',
        isNegative
          ? 'border-red-200 bg-red-50 text-red-700'
          : isLow
            ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
            : 'border-green-200 bg-green-50 text-green-700',
      )}
    >
      <span>
        Margin: <strong>{margin.toFixed(1)}%</strong>
      </span>
      <span>
        Foyda: <strong>{profit.toLocaleString('uz-UZ')} so&#39;m</strong>
      </span>
    </div>
  );
}
