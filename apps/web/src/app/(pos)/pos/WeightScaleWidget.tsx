'use client';

import { Scale, Unplug, Plug } from 'lucide-react';
import { useWeightScale } from '@/hooks/pos/useWeightScale';
import { cn } from '@/lib/utils';

interface WeightScaleWidgetProps {
  onWeightConfirm?: (weight: number, unit: string) => void;
}

export function WeightScaleWidget({ onWeightConfirm }: WeightScaleWidgetProps) {
  const { weight, unit, connected, error, isSupported, connect, disconnect } = useWeightScale();

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <Scale className="h-4 w-4 text-gray-400" />

      {connected ? (
        <>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tabular-nums text-gray-900">
              {weight.toFixed(3)}
            </span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
          {onWeightConfirm && weight > 0 && (
            <button
              type="button"
              onClick={() => onWeightConfirm(weight, unit)}
              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              Qo&apos;shish
            </button>
          )}
          <button
            type="button"
            onClick={disconnect}
            title="Uzish"
            className="ml-auto rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <Unplug className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={connect}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition',
              'text-gray-600 hover:bg-gray-100',
            )}
          >
            <Plug className="h-3.5 w-3.5" />
            Tarozi ulash
          </button>
          {error && (
            <span className="text-xs text-red-500 truncate max-w-[150px]" title={error}>
              {error}
            </span>
          )}
        </>
      )}
    </div>
  );
}
