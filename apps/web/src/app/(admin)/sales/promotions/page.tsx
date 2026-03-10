'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Tag, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatPrice, cn } from '@/lib/utils';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotion,
} from '@/hooks/promotions/usePromotions';
import type { Promotion, CreatePromotionDto, PromotionType } from '@/types/promotion';
import { PROMO_TYPE_LABELS, PROMO_TYPE_COLORS } from '@/types/promotion';

const promoSchema = z.object({
  name: z.string().min(2, 'Kamida 2 belgi'),
  description: z.string().optional(),
  type: z.enum(['PERCENT', 'FIXED', 'BUY_X_GET_Y', 'BUNDLE']),
  value: z.number().min(0.01, "Qiymat 0 dan katta bo'lishi kerak"),
  minOrderAmount: z.number().optional(),
  maxUsageCount: z.number().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

type PromoForm = z.infer<typeof promoSchema>;

function PromoModal({ promo, onClose }: { promo?: Promotion; onClose: () => void }) {
  const { mutate: create, isPending: creating } = useCreatePromotion();
  const { mutate: update, isPending: updating } = useUpdatePromotion();
  const isPending = creating || updating;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PromoForm>({
    resolver: zodResolver(promoSchema) as Resolver<PromoForm>,
    defaultValues: {
      name: promo?.name ?? '',
      description: promo?.description ?? '',
      type: (promo?.type ?? 'PERCENT') as PromotionType,
      value: Number(promo?.value ?? 10),
      minOrderAmount: promo?.minOrderAmount ? Number(promo.minOrderAmount) : undefined,
      maxUsageCount: promo?.maxUsageCount ? Number(promo.maxUsageCount) : undefined,
      startsAt: promo?.startsAt ? promo.startsAt.slice(0, 10) : '',
      expiresAt: promo?.expiresAt ? promo.expiresAt.slice(0, 10) : '',
      isActive: promo?.isActive ?? true,
    },
  });

  const type = watch('type');

  const onSubmit = (data: PromoForm) => {
    const dto: CreatePromotionDto = {
      name: data.name,
      description: data.description || undefined,
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount,
      maxUsageCount: data.maxUsageCount,
      startsAt: data.startsAt || undefined,
      expiresAt: data.expiresAt || undefined,
      isActive: data.isActive,
    };
    if (promo) {
      update({ id: promo.id, dto }, { onSuccess: onClose });
    } else {
      create(dto, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">{promo ? 'Aksiyani tahrirlash' : "Aksiya qo'shish"}</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nomi <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Aksiya nomi"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tavsif</label>
            <input
              {...register('description')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Ixtiyoriy..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Turi <span className="text-red-500">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(PROMO_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {type === 'PERCENT' ? 'Chegirma %' : "Qiymat (so'm)"} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('value', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Min. buyurtma</label>
              <input
                {...register('minOrderAmount', { valueAsNumber: true })}
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Ixtiyoriy"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max. ishlatish</label>
              <input
                {...register('maxUsageCount', { valueAsNumber: true })}
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Ixtiyoriy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Boshlanish</label>
              <input
                {...register('startsAt')}
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tugash</label>
              <input
                {...register('expiresAt')}
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Faol</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState<Promotion | null>(null);

  const { data: promos = [], isLoading } = usePromotions();
  const { mutate: deletePromo, isPending: isDeleting } = useDeletePromotion();
  const { mutate: toggle } = useTogglePromotion();

  const active = promos.filter((p) => p.isActive).length;
  const expired = promos.filter((p) => p.expiresAt && new Date(p.expiresAt) < new Date()).length;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aksiyalar</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {active} faol · {expired} muddati o&apos;tgan
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Aksiya qo&apos;shish
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={4} />
      ) : promos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Tag className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Aksiyalar mavjud emas</p>
          <p className="mt-1 text-xs text-gray-400">Birinchi aksiyani qo&apos;shing</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Nomi', 'Turi', 'Qiymat', 'Ishlatilgan', 'Muddati', 'Holat', 'Amallar'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promos.map((p) => {
                const isExpired = p.expiresAt ? new Date(p.expiresAt) < new Date() : false;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', PROMO_TYPE_COLORS[p.type])}>
                        {PROMO_TYPE_LABELS[p.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {p.type === 'PERCENT' ? `${p.value}%` : formatPrice(Number(p.value))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.usageCount} {p.maxUsageCount ? `/ ${p.maxUsageCount}` : ''}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.expiresAt ? (
                        <span className={isExpired ? 'text-red-500' : 'text-gray-600'}>
                          {new Date(p.expiresAt).toLocaleDateString('uz-UZ')}
                          {isExpired && " (o'tgan)"}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggle({ id: p.id, isActive: !p.isActive })}
                        aria-label={p.isActive ? 'Faolsizlashtirish' : 'Faollashtirish'}
                      >
                        {p.isActive
                          ? <ToggleRight className="h-5 w-5 text-green-500" />
                          : <ToggleLeft className="h-5 w-5 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          aria-label="Tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(p)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <PromoModal
          promo={editing ?? undefined}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
      <ConfirmDialog
        isOpen={!!deleting}
        title="Aksiyani o'chirish"
        message={`"${deleting?.name}" ni o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        isPending={isDeleting}
        onConfirm={() => {
          if (deleting) deletePromo(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
