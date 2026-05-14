'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag, Percent, Zap, Gift, Calendar } from 'lucide-react';
import {
  usePromotions,
  useDeletePromotion,
  useTogglePromotion,
} from '@/hooks/promotions/usePromotions';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { useCanEdit } from '@/hooks/auth/useAuth';
import { useTranslation } from '@/i18n/i18n-context';
import type { Promotion, PromotionType } from '@/types/promotion';
import { PROMO_TYPE_LABEL_KEYS, PROMO_TYPE_COLORS, DEMO_PROMOTIONS } from '@/types/promotion';
import { PromotionModal } from './PromotionModal';

/* ─── Helpers ─── */

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function useRulesLabel() {
  const { t } = useTranslation();
  return (p: Promotion): string => {
    const r = p.rules as Record<string, unknown>;
    switch (p.type) {
      case 'PERCENT':     return t('promotions.rulesPercent', { percent: String(r.percent ?? '') });
      case 'FIXED':       return t('promotions.rulesFixed', { amount: Number(r.amount ?? 0).toLocaleString() });
      case 'BUY_X_GET_Y': return t('promotions.rulesBuyXGetY', { buyQty: String(r.buyQty ?? ''), getQty: String(r.getQty ?? '') });
      case 'BUNDLE':      return t('promotions.rulesBundle', { discount: String(r.discount ?? '') });
      default:            return '—';
    }
  };
}

const TYPE_ICONS: Record<PromotionType, React.ComponentType<{ className?: string }>> = {
  PERCENT:     Percent,
  FIXED:       Zap,
  BUY_X_GET_Y: Gift,
  BUNDLE:      Tag,
};

const TYPE_GRADIENTS: Record<PromotionType, string> = {
  PERCENT:     'from-blue-500 to-blue-600',
  FIXED:       'from-violet-500 to-violet-600',
  BUY_X_GET_Y: 'from-emerald-500 to-emerald-600',
  BUNDLE:      'from-amber-500 to-amber-600',
};

const TYPE_ICON_BG: Record<PromotionType, string> = {
  PERCENT:     'bg-blue-50 text-blue-600',
  FIXED:       'bg-violet-50 text-violet-600',
  BUY_X_GET_Y: 'bg-emerald-50 text-emerald-600',
  BUNDLE:      'bg-amber-50 text-amber-600',
};

/* ─── PromotionCard ─── */

interface CardProps {
  promotion: Promotion;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function PromotionCard({ promotion: p, canEdit, onEdit, onDelete, onToggle }: CardProps) {
  const { t } = useTranslation();
  const rulesLabel = useRulesLabel();
  const TypeIcon = TYPE_ICONS[p.type];
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className={cn('h-1.5 w-full bg-gradient-to-r', TYPE_GRADIENTS[p.type])} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TYPE_ICON_BG[p.type])}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{p.name}</p>
              <span className={cn('mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', PROMO_TYPE_COLORS[p.type])}>
                {t(PROMO_TYPE_LABEL_KEYS[p.type])}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-full p-1 transition hover:bg-gray-100"
            title={p.isActive ? t('promotions.deactivate') : t('promotions.activate')}
          >
            {p.isActive
              ? <ToggleRight className="h-6 w-6 text-emerald-500" />
              : <ToggleLeft className="h-6 w-6 text-gray-300" />}
          </button>
        </div>

        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
          {rulesLabel(p)}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(p.validFrom)}{p.validTo ? ` → ${formatDate(p.validTo)}` : ' → ∞'}</span>
          </div>
          <span className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
            p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400',
          )}>
            {p.isActive ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center justify-end gap-1 border-t border-gray-50 px-4 py-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('common.edit')}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function PromotionsPage() {
  const { t } = useTranslation();
  const { data: promotions, isLoading, isError } = usePromotions();
  const { mutate: deletePromo } = useDeletePromotion();
  const { mutate: toggle } = useTogglePromotion();
  const [modal, setModal] = useState<'create' | Promotion | null>(null);
  const canEdit = useCanEdit();

  const items: Promotion[] = isError ? DEMO_PROMOTIONS : (promotions ?? []);

  const handleDelete = (id: string) => {
    if (confirm(t('promotions.deleteConfirm'))) deletePromo(id);
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Tag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('promotions.title')}</h1>
            <p className="text-sm text-gray-500">{t('promotions.count', { count: items.length })}</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            {t('promotions.new')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 h-1.5 w-full rounded bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={t('promotions.empty')}
          description={t('promotions.emptyDesc')}
          action={canEdit ? { label: t('promotions.create'), onClick: () => setModal('create') } : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <PromotionCard
              key={p.id}
              promotion={p}
              canEdit={canEdit}
              onEdit={() => setModal(p)}
              onDelete={() => handleDelete(p.id)}
              onToggle={() => toggle({ id: p.id, isActive: !p.isActive })}
            />
          ))}
        </div>
      )}

      {modal && (
        <PromotionModal
          initial={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
