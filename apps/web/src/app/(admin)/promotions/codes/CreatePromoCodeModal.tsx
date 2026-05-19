'use client';

import { useState } from 'react';
import { Percent, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreatePromoCode } from '@/hooks/promotions/usePromoCodes';
import type { CreatePromoCodeDto, PromoType } from '@/types/promo-code';

interface Props { onClose: () => void }

export function CreatePromoCodeModal({ onClose }: Props) {
  const { mutate: create, isPending } = useCreatePromoCode();
  const [form, setForm] = useState<CreatePromoCodeDto>({
    type: 'PERCENT',
    value: 10,
    validFrom: new Date().toISOString().slice(0, 10),
  });

  const set = <K extends keyof CreatePromoCodeDto>(k: K, v: CreatePromoCodeDto[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        ...form,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: form.validTo ? new Date(form.validTo).toISOString() : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Yangi promo kod</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kod (bo'sh — auto)</label>
            <input
              type="text"
              value={form.code ?? ''}
              onChange={(e) => set('code', e.target.value.toUpperCase() || undefined)}
              placeholder="SUMMER25 (ixtiyoriy)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Turi</label>
            <div className="flex gap-2">
              {(['PERCENT', 'FIXED'] as PromoType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition',
                    form.type === t
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  )}
                >
                  {t === 'PERCENT' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  {t === 'PERCENT' ? 'Foiz (%)' : "So'm (UZS)"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {form.type === 'PERCENT' ? 'Chegirma foizi (%)' : "Chegirma summasi (so'm)"}
            </label>
            <input
              type="number" required min={0}
              max={form.type === 'PERCENT' ? 100 : undefined}
              value={form.value}
              onChange={(e) => set('value', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Limit (0=cheksiz)</label>
              <input
                type="number" min={0}
                value={form.usageLimit ?? 0}
                onChange={(e) => set('usageLimit', Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Min xarid (so'm)</label>
              <input
                type="number" min={0}
                value={form.minPurchase ?? 0}
                onChange={(e) => set('minPurchase', Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Boshlanish</label>
              <input
                type="date" required
                value={form.validFrom}
                onChange={(e) => set('validFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tugash (ixtiyoriy)</label>
              <input
                type="date"
                value={form.validTo ?? ''}
                onChange={(e) => set('validTo', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
            >
              {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
