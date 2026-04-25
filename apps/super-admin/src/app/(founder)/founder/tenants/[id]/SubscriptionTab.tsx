'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { cn, extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

interface SubscriptionTabProps {
  tenantId: string;
  tenantName: string;
}

interface SubscriptionData {
  plan?: string;
  status?: string;
  expiresAt?: string;
  maxBranches?: number;
  maxProducts?: number;
  maxUsers?: number;
}

interface UsageData {
  branches?: { used: number; max: number };
  products?: { used: number; max: number };
  users?: { used: number; max: number };
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isHigh = pct > 80;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={cn('font-mono font-medium', isHigh ? 'text-red-600' : 'text-gray-900')}>
          {used} / {max}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100">
        <div
          className={cn(
            'h-2.5 rounded-full transition-all',
            isHigh ? 'bg-red-500' : pct > 50 ? 'bg-amber-400' : 'bg-violet-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Current plan, usage bars, subscription override
export function SubscriptionTab({ tenantId, tenantName }: SubscriptionTabProps) {
  const queryClient = useQueryClient();
  const [showOverride, setShowOverride] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const [newMaxBranches, setNewMaxBranches] = useState('');
  const [newMaxProducts, setNewMaxProducts] = useState('');
  const [newMaxUsers, setNewMaxUsers] = useState('');

  const { data: subscription, isLoading: subLoading } = useQuery<SubscriptionData>({
    queryKey: ['founder', 'tenant-subscription', tenantId],
    queryFn: () => founderApi.getTenantSubscription(tenantId),
    staleTime: 60_000,
  });

  const { data: usage, isLoading: usageLoading } = useQuery<UsageData>({
    queryKey: ['founder', 'tenant-usage', tenantId],
    queryFn: () => founderApi.getTenantUsage(tenantId),
    staleTime: 60_000,
  });

  const overrideMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => founderApi.overrideSubscription(tenantId, data),
    onSuccess: () => {
      toast.success('Подписка обновлена');
      setShowOverride(false);
      queryClient.invalidateQueries({ queryKey: ['founder', 'tenant-subscription', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['founder', 'tenant-usage', tenantId] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const handleOverride = () => {
    const data: Record<string, unknown> = {};
    if (newPlan) data.plan = newPlan;
    if (newMaxBranches) data.maxBranches = parseInt(newMaxBranches, 10);
    if (newMaxProducts) data.maxProducts = parseInt(newMaxProducts, 10);
    if (newMaxUsers) data.maxUsers = parseInt(newMaxUsers, 10);
    overrideMut.mutate(data);
  };

  if (subLoading || usageLoading) return <LoadingSkeleton variant="card" rows={3} />;

  const plan = subscription?.plan ?? 'FREE';
  const status = subscription?.status ?? 'ACTIVE';
  const expiresAt = subscription?.expiresAt;

  const PLAN_COLORS: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    BASIC: 'bg-blue-100 text-blue-700',
    PRO: 'bg-violet-100 text-violet-700',
    ENTERPRISE: 'bg-amber-100 text-amber-700',
  };

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

  return (
    <div className="flex flex-col gap-6">
      {/* Current plan card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <Crown className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Текущий план</p>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-3 py-1 text-sm font-bold', PLAN_COLORS[plan] ?? PLAN_COLORS.FREE)}>
                  {plan}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                  )}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOverride(!showOverride)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 transition hover:border-violet-400 hover:text-violet-600"
          >
            <Settings className="h-4 w-4" />
            Override
          </button>
        </div>

        {expiresAt && (
          <p className="mt-3 text-sm text-gray-500">
            Дата окончания:{' '}
            <span className="font-medium text-gray-700">
              {new Date(expiresAt).toLocaleDateString('ru-RU')}
            </span>
          </p>
        )}
      </div>

      {/* Usage bars */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-700">Использование</h3>
        </div>
        <div className="flex flex-col gap-5">
          <UsageBar
            label="Филиалы"
            used={usage?.branches?.used ?? 0}
            max={usage?.branches?.max ?? subscription?.maxBranches ?? 1}
          />
          <UsageBar
            label="Товары"
            used={usage?.products?.used ?? 0}
            max={usage?.products?.max ?? subscription?.maxProducts ?? 100}
          />
          <UsageBar
            label="Пользователи"
            used={usage?.users?.used ?? 0}
            max={usage?.users?.max ?? subscription?.maxUsers ?? 5}
          />
        </div>
      </div>

      {/* Override form */}
      {showOverride && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-6">
          <h3 className="mb-4 font-semibold text-violet-800">
            Override подписки — {tenantName}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">План</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className={inputCls}
              >
                <option value="">Не менять</option>
                <option value="FREE">FREE</option>
                <option value="BASIC">BASIC</option>
                <option value="PRO">PRO</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">Макс. филиалов</label>
              <input
                type="number"
                value={newMaxBranches}
                onChange={(e) => setNewMaxBranches(e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">Макс. товаров</label>
              <input
                type="number"
                value={newMaxProducts}
                onChange={(e) => setNewMaxProducts(e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">Макс. пользователей</label>
              <input
                type="number"
                value={newMaxUsers}
                onChange={(e) => setNewMaxUsers(e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setShowOverride(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-white"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleOverride}
              disabled={overrideMut.isPending}
              className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {overrideMut.isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
