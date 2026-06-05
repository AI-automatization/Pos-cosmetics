'use client';

import { useState } from 'react';
import {
  Plus, Copy, ToggleLeft, ToggleRight, Trash2, Ticket,
  Percent, DollarSign, CheckCircle2, XCircle,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import {
  usePromoCodes,
  useDeletePromoCode,
  useTogglePromoCode,
} from '@/hooks/promotions/usePromoCodes';
import { CreatePromoCodeModal } from './CreatePromoCodeModal';
import type { PromoCode } from '@/types/promo-code';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n-context';

/* ─── Status helpers ─── */

type StatusKey = 'active' | 'expired' | 'depleted' | 'inactive';

function getStatus(c: PromoCode): StatusKey {
  if (!c.isActive) return 'inactive';
  const now = Date.now();
  if (c.validTo && new Date(c.validTo).getTime() < now) return 'expired';
  if (c.usageLimit > 0 && c.usageCount >= c.usageLimit) return 'depleted';
  return 'active';
}

const STATUS_STYLE: Record<StatusKey, string> = {
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  expired:  'bg-gray-100 text-gray-500 ring-1 ring-gray-400/20',
  depleted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  inactive: 'bg-red-50 text-red-600 ring-1 ring-red-500/20',
};

const STATUS_LABEL: Record<StatusKey, string> = {
  active: 'Faol', expired: 'Muddati tugagan', depleted: 'Limit tugagan', inactive: 'Faol emas',
};

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ─── Page ─── */

export default function PromoCodesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = usePromoCodes(page, pageSize);
  const { mutate: remove } = useDeletePromoCode();
  const { mutate: toggle } = useTogglePromoCode();

  const items = data?.items ?? [];
  const filtered = search
    ? items.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    : items;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success(t('toast.codeCopied', { code })));
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Ticket className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Promo Kodlar</h1>
            <p className="text-sm text-gray-500">Chegirma kodlarini boshqarish</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Yangi kod
        </button>
      </div>

      {/* Table */}
      <ScrollableTable
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Kod qidirish..."
        totalCount={data?.total ?? 0}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: data?.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
            <tr>
              {['Kod', 'Turi', 'Qiymat', 'Ishlatildi/Limit', 'Boshlanish', 'Tugash', 'Status', 'Amallar'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  {isLoading ? 'Yuklanmoqda...' : 'Promo kodlar topilmadi'}
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const status = getStatus(c);
                return (
                  <tr key={c.id} className="transition hover:bg-gray-50">
                    {/* Code + copy */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-gray-900">{c.code}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(c.code)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Nusxalash"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        c.type === 'PERCENT' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700',
                      )}>
                        {c.type === 'PERCENT'
                          ? <Percent className="h-3 w-3" />
                          : <DollarSign className="h-3 w-3" />}
                        {c.type === 'PERCENT' ? 'Foiz' : "So'm"}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {c.type === 'PERCENT' ? `${Number(c.value)}%` : formatPrice(Number(c.value))}
                    </td>

                    {/* Usage/Limit */}
                    <td className="px-4 py-3 text-gray-600">
                      <span className="font-medium">{c.usageCount}</span>
                      <span className="text-gray-400"> / {c.usageLimit === 0 ? '∞' : c.usageLimit}</span>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3 text-gray-500">{fmtDate(c.validFrom)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(c.validTo)}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STATUS_STYLE[status],
                      )}>
                        {status === 'active'
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <XCircle className="h-3 w-3" />}
                        {STATUS_LABEL[status]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggle({ id: c.id, isActive: !c.isActive })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                          title={c.isActive ? "O'chirish" : 'Yoqish'}
                        >
                          {c.isActive
                            ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                            : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`"${c.code}" promo kodni o'chirishni tasdiqlaysizmi?`)) {
                              remove(c.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="O'chirish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollableTable>

      {showCreate && <CreatePromoCodeModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
