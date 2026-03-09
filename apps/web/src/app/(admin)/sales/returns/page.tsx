'use client';

import { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { useReturns, useApproveReturn, useRejectReturn } from '@/hooks/sales/useReturns';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { Return, ReturnStatus } from '@/types/returns';
import { RETURN_REASON_LABELS, RETURN_STATUS_LABELS } from '@/types/returns';

type FilterTab = 'ALL' | ReturnStatus;

function StatusBadge({ status }: { status: ReturnStatus }) {
  const configs: Record<ReturnStatus, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
    PENDING: { icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { icon: CheckCircle, className: 'bg-green-100 text-green-700' },
    REJECTED: { icon: XCircle, className: 'bg-red-100 text-red-700' },
  };
  const config = configs[status];
  if (!config) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{status}</span>;
  const { icon: Icon, className } = config;
  return (
    <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {RETURN_STATUS_LABELS[status]}
    </span>
  );
}

function AdminPinModal({ returnItem, onClose }: { returnItem: Return; onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject'>('approve');
  const { mutate: approve, isPending: approving } = useApproveReturn();
  const { mutate: reject, isPending: rejecting } = useRejectReturn();

  const handleAction = () => {
    if (mode === 'approve') {
      approve({ id: returnItem.id, pin }, { onSuccess: onClose });
    } else {
      reject({ id: returnItem.id, note: rejectNote }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Qaytarish: {returnItem.orderNumber}</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Sabab: <span className="font-medium text-gray-900">{RETURN_REASON_LABELS[returnItem.reason]}</span></p>
          <p className="mt-1 text-gray-500">Summa: <span className="font-bold text-gray-900">{formatPrice(returnItem.totalAmount)}</span></p>
        </div>

        <div className="mb-4 flex gap-2">
          <button type="button" onClick={() => setMode('approve')} className={cn('flex-1 rounded-lg py-2 text-sm font-medium', mode === 'approve' ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-700')}>
            Tasdiqlash
          </button>
          <button type="button" onClick={() => setMode('reject')} className={cn('flex-1 rounded-lg py-2 text-sm font-medium', mode === 'reject' ? 'bg-red-600 text-white' : 'border border-gray-200 text-gray-700')}>
            Rad etish
          </button>
        </div>

        {mode === 'approve' ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Admin PIN (4-6 raqam)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-mono tracking-widest outline-none focus:border-blue-400"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Rad etish sababi</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Nima uchun rad etildi..."
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleAction}
          disabled={approving || rejecting || (mode === 'approve' && pin.length < 4) || (mode === 'reject' && !rejectNote)}
          className={cn(
            'mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60',
            mode === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
          )}
        >
          {approving || rejecting ? 'Yuklanmoqda...' : mode === 'approve' ? 'Tasdiqlash' : 'Rad etish'}
        </button>
      </div>
    </div>
  );
}

export default function ReturnsPage() {
  const [tab, setTab] = useState<FilterTab>('ALL');
  const [actionReturn, setActionReturn] = useState<Return | null>(null);

  const { data: returns, isLoading } = useReturns(tab !== 'ALL' ? { status: tab } : undefined);

  if (isLoading) return <LoadingSkeleton variant="table" rows={4} />;

  const counts = {
    ALL: returns?.length ?? 0,
    PENDING: returns?.filter((r) => r.status === 'PENDING').length ?? 0,
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'PENDING', label: 'Kutilmoqda' },
    { key: 'APPROVED', label: 'Tasdiqlangan' },
    { key: 'REJECTED', label: 'Rad etilgan' },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Qaytarishlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">Mahsulot qaytarish va refund boshqaruvi</p>
        </div>
      </div>

      {/* Pending alert */}
      {counts.PENDING > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <Clock className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            <strong>{counts.PENDING} ta qaytarish</strong> admin tasdiqlashini kutmoqda
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition',
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
            {t.key === 'PENDING' && counts.PENDING > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
                {counts.PENDING}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Buyurtma", "Kassir", "Sabab", "Mahsulotlar", "Summa", "Sana", "Holat", "Amal"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(returns ?? []).length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <RotateCcw className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  Qaytarish topilmadi
                </td>
              </tr>
            ) : (returns ?? []).map((ret) => (
              <tr key={ret.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-gray-900">{ret.orderNumber}</td>
                <td className="px-4 py-3 text-gray-600">{ret.cashierName ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{RETURN_REASON_LABELS[ret.reason]}</td>
                <td className="px-4 py-3 text-gray-600">{(ret.items ?? []).length} ta mahsulot</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(ret.totalAmount)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(ret.createdAt).toLocaleDateString('uz-UZ')}</td>
                <td className="px-4 py-3"><StatusBadge status={ret.status} /></td>
                <td className="px-4 py-3">
                  {ret.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => setActionReturn(ret)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Ko'rib chiqish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actionReturn && (
        <AdminPinModal returnItem={actionReturn} onClose={() => setActionReturn(null)} />
      )}
    </div>
  );
}
