'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Ma'lumotlarni yuklab bo'lmadi",
  description = "Server bilan aloqa uzildi. Qayta urinib ko'ring.",
  onRetry,
  compact = false,
  className,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3',
          className,
        )}
      >
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="flex-1 text-sm text-red-700">{title}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Qayta urinish
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </button>
      )}
    </div>
  );
}
