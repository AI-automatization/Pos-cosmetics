'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotion,
} from '@/hooks/promotions/usePromotions';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { Promotion, PromotionType, CreatePromotionDto } from '@/types/promotion';
import { PROMO_TYPE_LABELS, PROMO_TYPE_COLORS, DEMO_PROMOTIONS } from '@/types/promotion';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function rulesLabel(p: Promotion): string {
  const r = p.rules as Record<string, unknown>;
  switch (p.type) {
    case 'PERCENT':    return `${r.percent}% chegirma`;
    case 'FIXED':      return `${Number(r.amount).toLocaleString()} so'm chegirma`;
    case 'BUY_X_GET_Y': return `${r.buyQty} olsang ${r.getQty} bepul`;
    case 'BUNDLE':     return `${r.discount}% paket chegirma`;
    default:           return '—';
  }
}

// ─── Rules Form ──────────────────────────────────────────────────────────────

interface RulesFormProps {
  type: PromotionType;
  rules: Record<string, unknown>;
  onChange: (rules: Record<string, unknown>) => void;
}

function RulesForm({ type, rules, onChange }: RulesFormProps) {
  const num = (key: string) => Number(rules[key] ?? 0);
  const set = (key: string, val: unknown) => onChange({ ...rules, [key]: val });

  if (type === 'PERCENT') {
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Foiz (%)</label>
        <input
          type="number" min={1} max={100}
          value={num('percent') || ''}
          onChange={(e) => set('percent', Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="10"
        />
      </div>
    );
  }
  if (type === 'FIXED') {
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Miqdor (so'm)</label>
        <input
          type="number" min={0}
          value={num('amount') || ''}
          onChange={(e) => set('amount', Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="5000"
        />
      </div>
    );
  }
  if (type === 'BUY_X_GET_Y') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Sotib olish soni</label>
          <input
            type="number" min={1}
            value={num('buyQty') || ''}
            onChange={(e) => set('buyQty', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Bepul soni</label>
          <input
            type="number" min={1}
            value={num('getQty') || ''}
            onChange={(e) => set('getQty', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
        </div>
      </div>
    );
  }
  if (type === 'BUNDLE') {
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Paket chegirmasi (%)</label>
        <input
          type="number" min={1} max={100}
          value={num('discount') || ''}
          onChange={(e) => set('discount', Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="15"
        />
      </div>
    );
  }
  return null;
}

// ─── Modal ───────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreatePromotionDto = {
  name: '',
  type: 'PERCENT',
  rules: { percent: 0 },
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: '',
  isActive: true,
};

const DEFAULT_RULES: Record<PromotionType, Record<string, unknown>> = {
  PERCENT:    { percent: 0 },
  FIXED:      { amount: 0 },
  BUY_X_GET_Y: { buyQty: 2, getQty: 1 },
  BUNDLE:     { productIds: [], discount: 0 },
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
  const isPending = creating || updating;

  const setField = <K extends keyof CreatePromotionDto>(key: K, val: CreatePromotionDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleTypeChange = (type: PromotionType) => {
    setForm((f) => ({ ...f, type, rules: DEFAULT_RULES[type] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreatePromotionDto = {
      ...form,
      validTo: form.validTo || undefined,
    };
    if (isEdit && initial) {
      update({ id: initial.id, dto }, { onSuccess: onClose });
    } else {
      create(dto, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Aksiyani tahrirlash' : 'Yangi aksiya'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <span className="sr-only">Yopish</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Aksiya nomi</label>
            <input
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masalan: Bahor chegirmasi"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Turi</label>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value as PromotionType)}
              disabled={isEdit}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              {(Object.keys(PROMO_TYPE_LABELS) as PromotionType[]).map((t) => (
                <option key={t} value={t}>{PROMO_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Dynamic rules */}
          <RulesForm
            type={form.type}
            rules={form.rules as Record<string, unknown>}
            onChange={(r) => setField('rules', r)}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Boshlanish</label>
              <input
                type="date" required
                value={form.validFrom}
                onChange={(e) => setField('validFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Tugash (ixtiyoriy)</label>
              <input
                type="date"
                value={form.validTo ?? ''}
                onChange={(e) => setField('validTo', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Active */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setField('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Faol holat</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit" disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const { data: promotions, isLoading, isError } = usePromotions();
  const { mutate: deletePromo } = useDeletePromotion();
  const { mutate: toggle } = useTogglePromotion();
  const [modal, setModal] = useState<'create' | Promotion | null>(null);

  const items: Promotion[] = isError ? DEMO_PROMOTIONS : (promotions ?? []);

  const handleDelete = (id: string) => {
    if (confirm("Aksiyani o'chirmoqchimisiz?")) deletePromo(id);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Aksiyalar</h1>
            <p className="text-sm text-gray-500">{items.length} ta aksiya</p>
          </div>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yangi aksiya
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nomi</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Turi</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Shartlar</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Muddat</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Hali aksiyalar yo&apos;q
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', PROMO_TYPE_COLORS[p.type])}>
                        {PROMO_TYPE_LABELS[p.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{rulesLabel(p)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(p.validFrom)}
                      {p.validTo ? ` — ${formatDate(p.validTo)}` : ' — belgilangan emas'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle({ id: p.id, isActive: !p.isActive })}
                        title={p.isActive ? "O'chirish" : 'Yoqish'}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition"
                      >
                        {p.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-green-500" />
                            <span className="text-green-700">Faol</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">Nofaol</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal(p)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="Tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
