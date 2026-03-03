'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Users, Package, GitBranch, Zap, AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useSubscription, useBillingPlans, useUsageStats, useUpgradePlan } from '@/hooks/settings/useBilling';
import { formatPrice, cn } from '@/lib/utils';
import type { SubscriptionStatus, BillingPlan } from '@/types/billing';

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; className: string }> = {
  TRIAL: { label: 'Sinov davri', className: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: 'Faol', className: 'bg-green-100 text-green-700' },
  PAST_DUE: { label: "To'lov kechikdi", className: 'bg-orange-100 text-orange-700' },
  CANCELLED: { label: 'Bekor qilingan', className: 'bg-gray-100 text-gray-600' },
  EXPIRED: { label: 'Muddati o\'tgan', className: 'bg-red-100 text-red-700' },
};

function UsageBar({ label, used, max, icon: Icon }: {
  label: string;
  used: number;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <Icon className="h-4 w-4 text-gray-400" />
          {label}
        </span>
        <span className={cn('text-sm', isHigh ? 'text-orange-600 font-semibold' : 'text-gray-500')}>
          {used} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={cn('h-2 rounded-full transition-all', isHigh ? 'bg-orange-400' : 'bg-blue-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrentPlan,
  onUpgrade,
  isUpgrading,
}: {
  plan: BillingPlan;
  isCurrentPlan: boolean;
  onUpgrade: () => void;
  isUpgrading: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-5 transition',
        isCurrentPlan
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-blue-300',
      )}
    >
      {isCurrentPlan && (
        <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
          Joriy tarif
        </span>
      )}

      <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
      {plan.description && (
        <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
      )}

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatPrice(plan.priceMonthly)}
        </span>
        <span className="text-sm text-gray-500">/oy</span>
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-2">
        <li className="flex items-center gap-2 text-sm text-gray-600">
          <GitBranch className="h-4 w-4 text-blue-500" />
          {plan.maxBranches} ta filial
        </li>
        <li className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4 text-blue-500" />
          {plan.maxProducts.toLocaleString()} ta mahsulot
        </li>
        <li className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-blue-500" />
          {plan.maxUsers} ta foydalanuvchi
        </li>
        {plan.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onUpgrade}
        disabled={isCurrentPlan || isUpgrading}
        className={cn(
          'mt-4 w-full rounded-lg py-2 text-sm font-medium transition',
          isCurrentPlan
            ? 'cursor-default bg-blue-600 text-white opacity-80'
            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60',
        )}
      >
        {isCurrentPlan ? 'Joriy tarif' : isUpgrading ? 'Yuklanmoqda...' : 'Tanlash'}
      </button>
    </div>
  );
}

export default function BillingPage() {
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);

  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: plans = [], isLoading: plansLoading } = useBillingPlans();
  const { data: usage, isLoading: usageLoading } = useUsageStats();
  const { mutate: upgrade, isPending: upgrading } = useUpgradePlan();

  const isLoading = subLoading || plansLoading || usageLoading;

  const handleUpgrade = (planSlug: string) => {
    setUpgradeTarget(planSlug);
    upgrade({ planSlug, months: 1 }, { onSettled: () => setUpgradeTarget(null) });
  };

  const statusCfg = subscription ? STATUS_CONFIG[subscription.status] : null;

  return (
    <PageLayout
      title="Hisob va tarif"
      subtitle="Obuna holati va foydalanish statistikasi"
    >
      {isLoading && <LoadingSkeleton variant="table" rows={4} />}

      {!isLoading && (
        <div className="space-y-6">
          {/* Current subscription info */}
          {subscription ? (
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joriy tarif</p>
                  <p className="text-lg font-semibold text-gray-900">{subscription.plan.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {statusCfg && (
                  <span className={cn('rounded-full px-3 py-1 text-sm font-medium', statusCfg.className)}>
                    {statusCfg.label}
                  </span>
                )}
                {subscription.expiresAt && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Tugash sanasi</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(subscription.expiresAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                )}
                {subscription.trialEndsAt && subscription.status === 'TRIAL' && (
                  <div className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                    <AlertCircle className="h-4 w-4" />
                    Sinov:{' '}
                    {new Date(subscription.trialEndsAt).toLocaleDateString('uz-UZ')} gacha
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              Faol obuna topilmadi. Quyidan tarif tanlang.
            </div>
          )}

          {/* Usage stats */}
          {usage && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Zap className="h-4 w-4 text-blue-500" />
                Foydalanish
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <UsageBar label="Filiallar" used={usage.branches.used} max={usage.branches.max} icon={GitBranch} />
                <UsageBar label="Mahsulotlar" used={usage.products.used} max={usage.products.max} icon={Package} />
                <UsageBar label="Foydalanuvchilar" used={usage.users.used} max={usage.users.max} icon={Users} />
              </div>
            </div>
          )}

          {/* Plans */}
          {plans.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-700">Tariflar</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans
                  .filter((p) => p.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((plan: BillingPlan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrentPlan={subscription?.planId === plan.id}
                      onUpgrade={() => handleUpgrade(plan.slug)}
                      isUpgrading={upgrading && upgradeTarget === plan.slug}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
