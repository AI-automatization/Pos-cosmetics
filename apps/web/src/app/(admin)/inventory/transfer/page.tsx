'use client';

import { useState } from 'react';
import { ArrowRightLeft, Check, Truck, Package, XCircle, Plus } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useTransfers, useTransferAction } from '@/hooks/inventory/useInventory';
import { cn } from '@/lib/utils';
import type { TransferStatus, StockTransfer } from '@/types/inventory';

/* ─── Status config ─── */

const STATUS_CONFIG: Record<TransferStatus, { label: string; color: string; icon: typeof Check }> = {
  REQUESTED: { label: "So'ralgan", color: 'bg-yellow-100 text-yellow-700', icon: ArrowRightLeft },
  APPROVED: { label: 'Tasdiqlangan', color: 'bg-blue-100 text-blue-700', icon: Check },
  SHIPPED: { label: "Jo'natilgan", color: 'bg-purple-100 text-purple-700', icon: Truck },
  RECEIVED: { label: 'Qabul qilingan', color: 'bg-green-100 text-green-700', icon: Package },
  CANCELLED: { label: 'Bekor qilingan', color: 'bg-gray-100 text-gray-500', icon: XCircle },
};

const FILTER_TABS: { value: TransferStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'REQUESTED', label: "So'ralgan" },
  { value: 'APPROVED', label: 'Tasdiqlangan' },
  { value: 'SHIPPED', label: "Jo'natilgan" },
  { value: 'RECEIVED', label: 'Qabul qilingan' },
  { value: 'CANCELLED', label: 'Bekor qilingan' },
];

/* ─── Transfer Card ─── */

function TransferCard({ transfer, onAction }: {
  transfer: StockTransfer;
  onAction: (id: string, action: 'approve' | 'ship' | 'receive' | 'cancel') => void;
}) {
  const cfg = STATUS_CONFIG[transfer.status];
  const StatusIcon = cfg.icon;
  const date = new Date(transfer.createdAt).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const nextActions = getNextActions(transfer.status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {transfer.fromBranch?.name ?? 'Filial'} → {transfer.toBranch?.name ?? 'Filial'}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cfg.color)}>
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">{date}</p>
          {transfer.requestedBy && (
            <p className="mt-0.5 text-xs text-gray-400">
              So&apos;ragan: {[transfer.requestedBy.firstName, transfer.requestedBy.lastName].filter(Boolean).join(' ')}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mt-3 flex flex-col gap-1">
        {transfer.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {item.product?.name ?? item.productId}
              {item.product?.sku && <span className="ml-1 text-xs text-gray-400">({item.product.sku})</span>}
            </span>
            <span className="font-medium text-gray-900">{item.quantity} dona</span>
          </div>
        ))}
      </div>

      {transfer.notes && (
        <p className="mt-2 text-xs text-gray-400">Izoh: {transfer.notes}</p>
      )}

      {/* Actions */}
      {nextActions.length > 0 && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          {nextActions.map(({ action, label, variant }) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction(transfer.id, action)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                variant === 'danger' && 'bg-red-50 text-red-600 hover:bg-red-100',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getNextActions(status: TransferStatus): { action: 'approve' | 'ship' | 'receive' | 'cancel'; label: string; variant: 'primary' | 'danger' }[] {
  switch (status) {
    case 'REQUESTED': return [
      { action: 'approve', label: 'Tasdiqlash', variant: 'primary' },
      { action: 'cancel', label: 'Bekor qilish', variant: 'danger' },
    ];
    case 'APPROVED': return [
      { action: 'ship', label: "Jo'natish", variant: 'primary' },
      { action: 'cancel', label: 'Bekor qilish', variant: 'danger' },
    ];
    case 'SHIPPED': return [
      { action: 'receive', label: 'Qabul qilish', variant: 'primary' },
    ];
    default: return [];
  }
}

/* ─── Main Page ─── */

export default function TransferPage() {
  const [statusFilter, setStatusFilter] = useState<TransferStatus | 'ALL'>('ALL');
  const { data, isLoading, isError, refetch } = useTransfers(
    statusFilter === 'ALL' ? undefined : { status: statusFilter },
  );
  const { mutate: doAction, isPending } = useTransferAction();

  const transfers = data?.items ?? [];

  return (
    <PageLayout
      actions={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yangi so&apos;rov
        </button>
      }
    >
      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              statusFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton variant="card" rows={4} />}
      {isError && <ErrorState compact onRetry={refetch} />}

      {!isLoading && !isError && transfers.length === 0 && (
        <EmptyState
          icon={ArrowRightLeft}
          title="Transfer so'rovlari yo'q"
          description="Filiallar o'rtasida tovar ko'chirish uchun yangi so'rov yarating"
        />
      )}

      {transfers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {transfers.map((t) => (
            <TransferCard
              key={t.id}
              transfer={t}
              onAction={(id, action) => {
                if (!isPending) doAction({ id, action });
              }}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
