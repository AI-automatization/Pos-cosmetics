'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, LogIn } from 'lucide-react';
import { useOpenShift } from '@/hooks/pos/useShift';
import { formatPrice } from '@/lib/utils';

const schema = z.object({
  cashierName: z.string().min(1, 'Kassir nomi kiritilishi shart').max(80),
  openingCash: z.coerce.number().min(0, 'Manfiy bo\'lishi mumkin emas'),
});

type FormData = z.infer<typeof schema>;

const QUICK_AMOUNTS = [0, 100_000, 200_000, 500_000, 1_000_000];

interface ShiftOpenModalProps {
  onOpened: () => void;
}

export function ShiftOpenModal({ onOpened }: ShiftOpenModalProps) {
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cashierName: 'Kassir', openingCash: 0 },
  });

  const openShiftMutation = useOpenShift(onOpened);
  const openingCash = watch('openingCash');

  const handleQuick = (amount: number) => {
    setSelectedQuick(amount);
    setValue('openingCash', amount, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    openShiftMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 border-b border-gray-100 px-6 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">Smenani ochish</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Kassada ishlashni boshlash uchun smenani oching
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Cashier name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Kassir ismi <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cashierName')}
              autoFocus
              placeholder="Ismi va familiyasi"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.cashierName && (
              <p className="mt-1 text-xs text-red-600">{errors.cashierName.message}</p>
            )}
          </div>

          {/* Opening cash */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Kassadagi boshlang'ich naqd pul
            </label>
            <input
              {...register('openingCash')}
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-right text-lg font-bold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.openingCash && (
              <p className="mt-1 text-xs text-red-600">{errors.openingCash.message}</p>
            )}

            {/* Quick amounts */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuick(amt)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    selectedQuick === amt && Number(openingCash) === amt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {amt === 0 ? 'Bo\'sh' : `${(amt / 1000).toFixed(0)}K`}
                </button>
              ))}
            </div>

            {Number(openingCash) > 0 && (
              <p className="mt-2 text-right text-xs text-gray-400">
                = {formatPrice(Number(openingCash))}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={openShiftMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {openShiftMutation.isPending ? 'Ochilmoqda...' : 'Smenani ochish'}
          </button>
        </form>
      </div>
    </div>
  );
}
