'use client';

import { CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { OrderStatus } from '@/types/order';

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  COMPLETED: { icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  RETURNED: { icon: RotateCcw, className: 'bg-yellow-100 text-yellow-700' },
  VOIDED: { icon: XCircle, className: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<OrderStatus, string> = {
    COMPLETED: t('orders.completed'),
    RETURNED: t('orders.returned'),
    VOIDED: t('orders.cancelled'),
  };
  const config = STATUS_CONFIG[status];
  if (!config) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{status}</span>;
  const { icon: Icon, className } = config;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export { STATUS_CONFIG };
