'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Settings, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import { useLoyaltyConfig, useUpdateLoyaltyConfig } from '@/hooks/loyalty/useLoyalty';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';

const settingsSchema = z.object({
  isActive: z.boolean(),
  earnRate: z.coerce.number().min(1, 'Must be at least 1'),
  redeemRate: z.coerce.number().min(1, 'Must be at least 1'),
  minRedeem: z.coerce.number().min(0, 'Must be 0 or more'),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function LoyaltySettingsPage() {
  const { t } = useTranslation();
  const { data: config, isLoading } = useLoyaltyConfig();
  const { mutate: save, isPending } = useUpdateLoyaltyConfig();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      isActive: true,
      earnRate: 1000,
      redeemRate: 100,
      minRedeem: 50,
    },
  });

  const isActive = watch('isActive');
  const earnRate = watch('earnRate');
  const redeemRate = watch('redeemRate');

  useEffect(() => {
    if (config) {
      reset({
        isActive: config.isActive,
        earnRate: config.earnRate,
        redeemRate: config.redeemRate,
        minRedeem: config.minRedeem,
      });
    }
  }, [config, reset]);

  const onSubmit = (data: SettingsForm) => {
    save(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-3 sm:p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/loyalty"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Settings className="h-5 w-5 text-blue-600" />
            {t('loyalty.settings') || 'Program Settings'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {t('loyalty.settingsDesc') || 'Configure earn and redeem rates for loyalty points'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        {/* Toggle active */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('loyalty.programActive') || 'Loyalty Program Active'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('loyalty.programActiveDesc') || 'Enable or disable the loyalty program for all customers'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue('isActive', !isActive, { shouldDirty: true })}
              className="shrink-0"
            >
              {isActive ? (
                <ToggleRight className="h-8 w-8 text-blue-600" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>
          <div
            className={cn(
              'mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
              isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500',
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', isActive ? 'bg-green-500' : 'bg-gray-400')} />
            {isActive
              ? (t('loyalty.statusActive') || 'Program is active')
              : (t('loyalty.statusInactive') || 'Program is inactive')}
          </div>
        </div>

        {/* Rates */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {t('loyalty.rateSettings') || 'Point Rates'}
          </h2>

          {/* Earn rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('loyalty.earnRate') || 'Earn Rate'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                {...register('earnRate')}
                className={cn(
                  'w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200',
                  errors.earnRate ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              <span className="text-sm text-gray-500">
                {t('loyalty.earnRateDesc') || "so'm = 1 point"}
              </span>
            </div>
            {errors.earnRate && (
              <p className="mt-1 text-xs text-red-500">{errors.earnRate.message}</p>
            )}
            {earnRate > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Example: 10,000 so&apos;m purchase = {Math.floor(10000 / earnRate)} points
              </p>
            )}
          </div>

          {/* Redeem rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('loyalty.redeemRate') || 'Redeem Rate'}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {t('loyalty.redeemRatePrefix') || '1 point ='}
              </span>
              <input
                type="number"
                min={1}
                {...register('redeemRate')}
                className={cn(
                  'w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200',
                  errors.redeemRate ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              <span className="text-sm text-gray-500">
                {t('loyalty.redeemRateSuffix') || "so'm discount"}
              </span>
            </div>
            {errors.redeemRate && (
              <p className="mt-1 text-xs text-red-500">{errors.redeemRate.message}</p>
            )}
            {redeemRate > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Example: 100 points = {(100 * redeemRate).toLocaleString()} so&apos;m discount
              </p>
            )}
          </div>

          {/* Min redeem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('loyalty.minRedeem') || 'Minimum Redeem'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                {...register('minRedeem')}
                className={cn(
                  'w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200',
                  errors.minRedeem ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              <span className="text-sm text-gray-500">
                {t('loyalty.minRedeemDesc') || 'points minimum per redemption'}
              </span>
            </div>
            {errors.minRedeem && (
              <p className="mt-1 text-xs text-red-500">{errors.minRedeem.message}</p>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending
              ? (t('common.saving') || 'Saving...')
              : (t('common.save') || 'Save Settings')}
          </button>
          {!isDirty && (
            <p className="text-xs text-gray-400">{t('common.noChanges') || 'No changes'}</p>
          )}
        </div>
      </form>
    </div>
  );
}
