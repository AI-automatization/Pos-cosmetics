'use client';

import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title ?? t('common.noDataYet')}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
