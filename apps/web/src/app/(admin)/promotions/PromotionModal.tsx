'use client';

import { useState } from 'react';
import { X, Package2 } from 'lucide-react';
import {
  useCreatePromotion,
  useUpdatePromotion,
} from '@/hooks/promotions/usePromotions';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Promotion, PromotionType, CreatePromotionDto } from '@/types/promotion';
import { PROMO_TYPE_LABEL_KEYS } from '@/types/promotion';
import { useProducts } from '@/hooks/catalog/useProducts';

/* ─── Helpers ─── */

import { Percent, Zap, Gift, Tag } from 'lucide-react';

const TYPED_ICONS: Record<PromotionType, React.ComponentType<{ className?: string }>> = {
  PERCENT:     Percent,
  FIXED:       Zap,
  BUY_X_GET_Y: Gift,
  BUNDLE:      Tag,
};

const MODAL_GRADIENTS: Record<PromotionType, string> = {
  PERCENT:     'from-blue-600 to-blue-700',
  FIXED:       'from-violet-600 to-violet-700',
  BUY_X_GET_Y: 'from-emerald-600 to-emerald-700',
  BUNDLE:      'from-amber-600 to-amber-700',
};

const DEFAULT_RULES: Record<PromotionType, Record<string, unknown>> = {
  PERCENT:     { percent: 0 },
  FIXED:       { amount: 0 },
  BUY_X_GET_Y: { buyQty: 2, getQty: 1 },
  BUNDLE:      { productIds: [], discount: 0 },
};

const EMPTY_FORM: CreatePromotionDto = {
  name: '',
  type: 'PERCENT',
  rules: { percent: 0 },
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: '',
  isActive: true,
};

/* ─── RulesForm ─── */

interface ProductOption {
  value: string;
  label: string;
}

function RulesForm({
  type,
  rules,
  onChange,
  products,
}: {
  type: PromotionType;
  rules: Record<string, unknown>;
  onChange: (rules: Record<string, unknown>) => void;
  products: ProductOption[];
}) {
  const { t } = useTranslation();
  const num = (key: string) => Number(rules[key] ?? 0);
  const set = (key: string, val: unknown) => onChange({ ...rules, [key]: val });

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition';
  const productOptions = [{ value: '', label: t('promotions.allProducts') }, ...products];

  if (type === 'PERCENT') {
    return (
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.percent')}</label>
          <input type="number" min={1} max={100} value={num('percent') || ''} onChange={(e) => set('percent', Number(e.target.value))} className={inputCls} placeholder="10" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Package2 className="h-3.5 w-3.5" />
            {t('promotions.forProduct')} <span className="font-normal text-gray-400">({t('promotions.forProductOptional')})</span>
          </label>
          <SearchableDropdown options={productOptions} value={(rules.productId as string) ?? ''} onChange={(val) => set('productId', val || undefined)} placeholder={t('promotions.allProducts')} searchable clearable />
        </div>
      </div>
    );
  }
  if (type === 'FIXED') {
    return (
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.amount')}</label>
          <input type="number" min={0} value={num('amount') || ''} onChange={(e) => set('amount', Number(e.target.value))} className={inputCls} placeholder="5000" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Package2 className="h-3.5 w-3.5" />
            {t('promotions.forProduct')} <span className="font-normal text-gray-400">({t('promotions.forProductOptional')})</span>
          </label>
          <SearchableDropdown options={productOptions} value={(rules.productId as string) ?? ''} onChange={(val) => set('productId', val || undefined)} placeholder={t('promotions.allProducts')} searchable clearable />
        </div>
      </div>
    );
  }
  if (type === 'BUY_X_GET_Y') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.buyCount')}</label>
          <input type="number" min={1} value={num('buyQty') || ''} onChange={(e) => set('buyQty', Number(e.target.value))} className={inputCls} placeholder="2" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.freeCount')}</label>
          <input type="number" min={1} value={num('getQty') || ''} onChange={(e) => set('getQty', Number(e.target.value))} className={inputCls} placeholder="1" />
        </div>
      </div>
    );
  }
  if (type === 'BUNDLE') {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.bundlePercent')}</label>
        <input type="number" min={1} max={100} value={num('discount') || ''} onChange={(e) => set('discount', Number(e.target.value))} className={inputCls} placeholder="15" />
      </div>
    );
  }
  return null;
}

/* ─── Modal ─── */

export interface PromotionModalProps {
  initial?: Promotion;
  onClose: () => void;
}

export function PromotionModal({ initial, onClose }: PromotionModalProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<CreatePromotionDto>(
    initial
      ? {
          name: initial.name,
          type: initial.type,
          rules: initial.rules as Record<string, unknown>,
          validFrom: initial.validFrom.slice(0, 10),
          validTo: initial.validTo?.slice(0, 10) ?? '',
          isActive: initial.isActive,
        }
      : EMPTY_FORM,
  );

  const { mutate: create, isPending: creating } = useCreatePromotion();
  const { mutate: update, isPending: updating } = useUpdatePromotion();
  const { data: productsData } = useProducts({ limit: 200 });
  const isPending = creating || updating;

  const productOptions = (productsData?.items ?? []).map((p) => ({ value: p.id, label: p.name }));

  const setField = <K extends keyof CreatePromotionDto>(key: K, val: CreatePromotionDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleTypeChange = (type: PromotionType) => {
    setForm((f) => ({ ...f, type, rules: DEFAULT_RULES[type] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreatePromotionDto = { ...form, validTo: form.validTo || undefined };
    if (isEdit && initial) {
      update({ id: initial.id, dto }, { onSuccess: onClose });
    } else {
      create(dto, { onSuccess: onClose });
    }
  };

  const TypeIcon = TYPED_ICONS[form.type];
  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Dynamic gradient header */}
        <div className={cn('relative bg-gradient-to-br px-6 py-5', MODAL_GRADIENTS[form.type])}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <TypeIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEdit ? t('promotions.editPromo') : t('promotions.createPromo')}
              </h3>
              <p className="text-xs text-white/70">
                {isEdit ? t('promotions.editSubtitle') : t('promotions.createSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-4 p-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.name')}</label>
              <input required value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} placeholder={t('promotions.namePlaceholder')} />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.type')}</label>
              <SearchableDropdown
                options={(Object.keys(PROMO_TYPE_LABEL_KEYS) as PromotionType[]).map((tp) => ({
                  value: tp,
                  label: t(PROMO_TYPE_LABEL_KEYS[tp]),
                }))}
                value={form.type}
                onChange={(val) => handleTypeChange(val as PromotionType)}
                placeholder={t('promotions.selectType')}
                searchable={false}
                clearable={false}
                disabled={isEdit}
              />
            </div>

            {/* Dynamic rules */}
            <RulesForm
              type={form.type}
              rules={form.rules as Record<string, unknown>}
              onChange={(r) => setField('rules', r)}
              products={productOptions}
            />

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.startDate')}</label>
                <input type="date" required value={form.validFrom} onChange={(e) => setField('validFrom', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('promotions.endDate')}</label>
                <input type="date" value={form.validTo ?? ''} onChange={(e) => setField('validTo', e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:bg-gray-100">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setField('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{t('promotions.activeState')}</p>
                <p className="text-xs text-gray-400">{t('promotions.activeDesc')}</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit" disabled={isPending}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60',
                form.type === 'PERCENT' ? 'bg-blue-600 hover:bg-blue-700' :
                form.type === 'FIXED' ? 'bg-violet-600 hover:bg-violet-700' :
                form.type === 'BUY_X_GET_Y' ? 'bg-emerald-600 hover:bg-emerald-700' :
                'bg-amber-600 hover:bg-amber-700',
              )}
            >
              {isPending ? t('common.saving') : isEdit ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
