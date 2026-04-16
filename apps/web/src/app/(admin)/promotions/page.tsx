'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag, Percent, Zap, Gift, X, Calendar, Package2 } from 'lucide-react';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotion,
} from '@/hooks/promotions/usePromotions';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import { useCanEdit } from '@/hooks/auth/useAuth';
import type { Promotion, PromotionType, CreatePromotionDto } from '@/types/promotion';
import { PROMO_TYPE_LABELS, PROMO_TYPE_COLORS, DEMO_PROMOTIONS } from '@/types/promotion';
import { useProducts } from '@/hooks/catalog/useProducts';

/* ─── Helpers ─── */

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function rulesLabel(p: Promotion): string {
  const r = p.rules as Record<string, unknown>;
  switch (p.type) {
    case 'PERCENT':     return `${r.percent}% chegirma`;
    case 'FIXED':       return `${Number(r.amount).toLocaleString()} so'm chegirma`;
    case 'BUY_X_GET_Y': return `${r.buyQty} olsang ${r.getQty} bepul`;
    case 'BUNDLE':      return `${r.discount}% paket chegirma`;
    default:            return '—';
  }
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

const MODAL_GRADIENTS: Record<PromotionType, string> = {
  PERCENT:     'from-blue-600 to-blue-700',
  FIXED:       'from-violet-600 to-violet-700',
  BUY_X_GET_Y: 'from-emerald-600 to-emerald-700',
  BUNDLE:      'from-amber-600 to-amber-700',
};

const TYPE_ICON_BG: Record<PromotionType, string> = {
  PERCENT:     'bg-blue-50 text-blue-600',
  FIXED:       'bg-violet-50 text-violet-600',
  BUY_X_GET_Y: 'bg-emerald-50 text-emerald-600',
  BUNDLE:      'bg-amber-50 text-amber-600',
};

/* ─── RulesForm ─── */

interface ProductOption {
  value: string;
  label: string;
}

interface RulesFormProps {
  type: PromotionType;
  rules: Record<string, unknown>;
  onChange: (rules: Record<string, unknown>) => void;
  products: ProductOption[];
}

function RulesForm({ type, rules, onChange, products }: RulesFormProps) {
  const num = (key: string) => Number(rules[key] ?? 0);
  const set = (key: string, val: unknown) => onChange({ ...rules, [key]: val });

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition';

  const productOptions = [{ value: '', label: 'Barcha mahsulotlar' }, ...products];

  if (type === 'PERCENT') {
    return (
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Foiz (%)</label>
          <input
            type="number" min={1} max={100}
            value={num('percent') || ''}
            onChange={(e) => set('percent', Number(e.target.value))}
            className={inputCls}
            placeholder="10"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Package2 className="h-3.5 w-3.5" />
            Qaysi mahsulotga <span className="font-normal text-gray-400">(ixtiyoriy)</span>
          </label>
          <SearchableDropdown
            options={productOptions}
            value={(rules.productId as string) ?? ''}
            onChange={(val) => set('productId', val || undefined)}
            placeholder="Barcha mahsulotlar"
            searchable
            clearable
          />
        </div>
      </div>
    );
  }
  if (type === 'FIXED') {
    return (
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Miqdor (so&apos;m)</label>
          <input
            type="number" min={0}
            value={num('amount') || ''}
            onChange={(e) => set('amount', Number(e.target.value))}
            className={inputCls}
            placeholder="5000"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Package2 className="h-3.5 w-3.5" />
            Qaysi mahsulotga <span className="font-normal text-gray-400">(ixtiyoriy)</span>
          </label>
          <SearchableDropdown
            options={productOptions}
            value={(rules.productId as string) ?? ''}
            onChange={(val) => set('productId', val || undefined)}
            placeholder="Barcha mahsulotlar"
            searchable
            clearable
          />
        </div>
      </div>
    );
  }
  if (type === 'BUY_X_GET_Y') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Sotib olish soni</label>
          <input
            type="number" min={1}
            value={num('buyQty') || ''}
            onChange={(e) => set('buyQty', Number(e.target.value))}
            className={inputCls}
            placeholder="2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Bepul soni</label>
          <input
            type="number" min={1}
            value={num('getQty') || ''}
            onChange={(e) => set('getQty', Number(e.target.value))}
            className={inputCls}
            placeholder="1"
          />
        </div>
      </div>
    );
  }
  if (type === 'BUNDLE') {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Paket chegirmasi (%)</label>
        <input
          type="number" min={1} max={100}
          value={num('discount') || ''}
          onChange={(e) => set('discount', Number(e.target.value))}
          className={inputCls}
          placeholder="15"
        />
      </div>
    );
  }
  return null;
}

/* ─── Modal ─── */

const EMPTY_FORM: CreatePromotionDto = {
  name: '',
  type: 'PERCENT',
  rules: { percent: 0 },
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: '',
  isActive: true,
};

const DEFAULT_RULES: Record<PromotionType, Record<string, unknown>> = {
  PERCENT:     { percent: 0 },
  FIXED:       { amount: 0 },
  BUY_X_GET_Y: { buyQty: 2, getQty: 1 },
  BUNDLE:      { productIds: [], discount: 0 },
};

interface ModalProps {
  initial?: Promotion;
  onClose: () => void;
}

function PromotionModal({ initial, onClose }: ModalProps) {
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

  const productOptions = (productsData?.items ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

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

  const TypeIcon = TYPE_ICONS[form.type];
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
                {isEdit ? 'Aksiyani tahrirlash' : 'Yangi aksiya yaratish'}
              </h3>
              <p className="text-xs text-white/70">
                {isEdit ? 'Mavjud aksiyani yangilash' : "Chegirma yoki aksiya qo'shing"}
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
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Aksiya nomi</label>
              <input
                required
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
                placeholder="Masalan: Bahor chegirmasi"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Aksiya turi</label>
              <SearchableDropdown
                options={(Object.keys(PROMO_TYPE_LABELS) as PromotionType[]).map((t) => ({
                  value: t,
                  label: PROMO_TYPE_LABELS[t],
                }))}
                value={form.type}
                onChange={(val) => handleTypeChange(val as PromotionType)}
                placeholder="Turni tanlang"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Boshlanish</label>
                <input
                  type="date" required
                  value={form.validFrom}
                  onChange={(e) => setField('validFrom', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Tugash (ixtiyoriy)</label>
                <input
                  type="date"
                  value={form.validTo ?? ''}
                  onChange={(e) => setField('validTo', e.target.value)}
                  className={inputCls}
                />
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
                <p className="text-sm font-semibold text-gray-800">Faol holat</p>
                <p className="text-xs text-gray-400">Aksiya darhol boshlanadi</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Bekor qilish
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
              {isPending ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── PromotionCard ─── */

interface CardProps {
  promotion: Promotion;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function PromotionCard({ promotion: p, canEdit, onEdit, onDelete, onToggle }: CardProps) {
  const TypeIcon = TYPE_ICONS[p.type];
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Color stripe */}
      <div className={cn('h-1.5 w-full bg-gradient-to-r', TYPE_GRADIENTS[p.type])} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TYPE_ICON_BG[p.type])}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{p.name}</p>
              <span className={cn('mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', PROMO_TYPE_COLORS[p.type])}>
                {PROMO_TYPE_LABELS[p.type]}
              </span>
            </div>
          </div>
          {/* Status toggle */}
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-full p-1 transition hover:bg-gray-100"
            title={p.isActive ? 'Nofaol qilish' : 'Faol qilish'}
          >
            {p.isActive
              ? <ToggleRight className="h-6 w-6 text-emerald-500" />
              : <ToggleLeft className="h-6 w-6 text-gray-300" />}
          </button>
        </div>

        {/* Rules badge */}
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
          {rulesLabel(p)}
        </div>

        {/* Date + status footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(p.validFrom)}{p.validTo ? ` → ${formatDate(p.validTo)}` : ' → ∞'}</span>
          </div>
          <span className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
            p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400',
          )}>
            {p.isActive ? 'Faol' : 'Nofaol'}
          </span>
        </div>
      </div>

      {/* Action footer — visible on hover */}
      {canEdit && (
        <div className="flex items-center justify-end gap-1 border-t border-gray-50 px-4 py-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Tahrirlash
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            O&apos;chirish
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function PromotionsPage() {
  const { data: promotions, isLoading, isError } = usePromotions();
  const { mutate: deletePromo } = useDeletePromotion();
  const { mutate: toggle } = useTogglePromotion();
  const [modal, setModal] = useState<'create' | Promotion | null>(null);
  const canEdit = useCanEdit();

  const items: Promotion[] = isError ? DEMO_PROMOTIONS : (promotions ?? []);

  const handleDelete = (id: string) => {
    if (confirm("Aksiyani o'chirmoqchimisiz?")) deletePromo(id);
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Tag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Aksiyalar</h1>
            <p className="text-sm text-gray-500">{items.length} ta aksiya</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Yangi aksiya
          </button>
        )}
      </div>

      {/* Content */}
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
          title="Hali aksiyalar yo'q"
          description="Chegirma yoki aksiya yaratish uchun tugmani bosing"
          action={canEdit ? { label: 'Aksiya yaratish', onClick: () => setModal('create') } : undefined}
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

      {/* Modal */}
      {modal && (
        <PromotionModal
          initial={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
