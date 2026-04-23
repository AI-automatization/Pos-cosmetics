'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings, CreditCard, Plus, Pencil, Trash2, Loader2, X, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editPlan, setEditPlan] = useState<Record<string, unknown> | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-db', 'table-data', 'subscription_plans', 1],
    queryFn: () =>
      founderApi.db.getTableData('subscription_plans', { page: 1, limit: 50, sort: 'id', sortDir: 'asc' }),
    staleTime: 30_000,
  });

  const deletePlanMut = useMutation({
    mutationFn: (id: string) => founderApi.db.deleteRow('subscription_plans', id),
    onSuccess: () => {
      toast.success('План удалён');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'subscription_plans'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const planRows = plans?.rows ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Settings className="h-6 w-6 text-violet-600" />
          Настройки платформы
        </h1>
        <p className="mt-1 text-sm text-gray-500">Тарифные планы и конфигурация</p>
      </div>

      {/* Info */}
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700">
          Тарифные планы определяют лимиты для каждого тенанта: количество филиалов, товаров, пользователей и длительность пробного периода.
          Изменения применяются к новым подпискам.
        </p>
      </div>

      {/* Plans header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <CreditCard className="h-4 w-4" /> Тарифные планы
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{planRows.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => { setEditPlan(null); setShowPlanForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Новый план
        </button>
      </div>

      {/* Plans grid */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={3} />
      ) : planRows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {planRows.map((plan, i) => {
            const price = Number(plan['priceMonthly'] ?? plan['price_monthly'] ?? 0);
            const isFree = price === 0;
            return (
              <div key={String(plan['id'] ?? i)} className="flex flex-col rounded-xl border border-gray-200 bg-white">
                {/* Card header */}
                <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{String(plan['name'] ?? '—')}</h3>
                    <p className="font-mono text-xs text-gray-400">{String(plan['slug'] ?? '')}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => { setEditPlan(plan); setShowPlanForm(true); }}
                      className="rounded p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600" title="Редактировать">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => { if (confirm(`Удалить план "${plan['name']}"?`)) deletePlanMut.mutate(String(plan['id'])); }}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Удалить">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="border-b border-gray-100 px-5 py-4">
                  <p className="text-2xl font-bold text-violet-600">
                    {isFree ? 'Бесплатно' : `${price.toLocaleString('ru')} сум`}
                  </p>
                  {!isFree && <p className="text-xs text-gray-400">в месяц</p>}
                </div>

                {/* Features */}
                <div className="flex flex-1 flex-col gap-2.5 px-5 py-4 text-sm">
                  <LimitRow label="Филиалы" value={plan['maxBranches'] ?? plan['max_branches']} />
                  <LimitRow label="Товары" value={plan['maxProducts'] ?? plan['max_products']} />
                  <LimitRow label="Пользователи" value={plan['maxUsers'] ?? plan['max_users']} />
                  <LimitRow label="Пробный период" value={plan['trialDays'] ?? plan['trial_days']} suffix=" дней" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">Тарифные планы не созданы</p>
          <p className="mt-1 text-xs text-gray-400">Создайте первый план для подключения тенантов</p>
        </div>
      )}

      {showPlanForm && (
        <PlanFormModal
          plan={editPlan}
          onClose={() => { setShowPlanForm(false); setEditPlan(null); }}
        />
      )}
    </div>
  );
}

// ─── Limit row ───────────────────────────────────────────────────────────────

function LimitRow({ label, value, suffix = '' }: { label: string; value: unknown; suffix?: string }) {
  const v = value != null && value !== '' ? String(value) : null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{v ? `${v}${suffix}` : '∞'}</span>
    </div>
  );
}

// ─── Plan Form Modal ─────────────────────────────────────────────────────────

function PlanFormModal({ plan, onClose }: { plan: Record<string, unknown> | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = plan !== null;
  const [name, setName] = useState(String(plan?.['name'] ?? ''));
  const [slug, setSlug] = useState(String(plan?.['slug'] ?? ''));
  const [price, setPrice] = useState(String(plan?.['priceMonthly'] ?? plan?.['price_monthly'] ?? '0'));
  const [maxBranches, setMaxBranches] = useState(String(plan?.['maxBranches'] ?? plan?.['max_branches'] ?? ''));
  const [maxProducts, setMaxProducts] = useState(String(plan?.['maxProducts'] ?? plan?.['max_products'] ?? ''));
  const [maxUsers, setMaxUsers] = useState(String(plan?.['maxUsers'] ?? plan?.['max_users'] ?? ''));
  const [trialDays, setTrialDays] = useState(String(plan?.['trialDays'] ?? plan?.['trial_days'] ?? '14'));

  const saveMut = useMutation({
    mutationFn: () => {
      const data: Record<string, unknown> = {
        name, slug,
        price_monthly: Number(price) || 0,
        max_branches: maxBranches ? Number(maxBranches) : null,
        max_products: maxProducts ? Number(maxProducts) : null,
        max_users: maxUsers ? Number(maxUsers) : null,
        trial_days: Number(trialDays) || 0,
      };
      if (isEdit) return founderApi.db.updateRow('subscription_plans', String(plan['id']), data);
      return founderApi.db.createRow('subscription_plans', data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'План обновлён' : 'План создан');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'subscription_plans'] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold text-gray-900">{isEdit ? 'Редактировать план' : 'Новый тарифный план'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="space-y-3 p-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Название</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Free / Basic / Pro" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="free / basic / pro" className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Цена (сум/мес)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = бесплатный" className={inputCls} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="mb-1 block text-xs font-medium text-gray-500">Филиалы</label><input type="number" value={maxBranches} onChange={(e) => setMaxBranches(e.target.value)} placeholder="∞" className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-500">Товары</label><input type="number" value={maxProducts} onChange={(e) => setMaxProducts(e.target.value)} placeholder="∞" className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-500">Юзеры</label><input type="number" value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} placeholder="∞" className={inputCls} /></div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Пробный период (дней)</label>
            <input type="number" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} className={inputCls} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Отмена</button>
            <button type="submit" disabled={saveMut.isPending || !name || !slug}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
