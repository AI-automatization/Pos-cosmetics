'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  LogIn,
  Pencil,
  Trash2,
  Power,
  LayoutDashboard,
  CreditCard,
  Users,
  Building2,
  AlertOctagon,
  FileText,
  StickyNote,
} from 'lucide-react';
import { toast } from 'sonner';

import { founderApi } from '@/api/founder.api';
import { useFounderTenants, useFounderErrors, useFounderRevenue } from '@/hooks/founder/useFounder';
import { cn, extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

import { OverviewTab } from './OverviewTab';
import { SubscriptionTab } from './SubscriptionTab';
import { UsersTab } from './UsersTab';
import { AuditTab } from './AuditTab';
import { EditTenantModal } from './EditTenantModal';

// ─── Tab definitions ─────────────────────────────────────────────────────────

type TabId = 'overview' | 'subscription' | 'users' | 'branches' | 'errors' | 'audit' | 'notes';

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'subscription', label: 'Подписка', icon: CreditCard },
  { id: 'users', label: 'Пользователи', icon: Users },
  { id: 'branches', label: 'Филиалы', icon: Building2 },
  { id: 'errors', label: 'Ошибки', icon: AlertOctagon },
  { id: 'audit', label: 'Аудит', icon: FileText },
  { id: 'notes', label: 'Заметки', icon: StickyNote },
];

// ─── Severity badge (reused for errors tab) ─────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const configs: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-600',
    ERROR: 'bg-orange-50 text-orange-600',
    WARN: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', configs[severity] ?? 'bg-gray-100 text-gray-500')}>
      {severity}
    </span>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showEdit, setShowEdit] = useState(false);

  // Data
  const { data: tenants, isLoading } = useFounderTenants();
  const { data: errors } = useFounderErrors({ tenantId: id });
  const { data: revenue } = useFounderRevenue(7);

  const tenant = tenants?.find((t) => t.id === id);

  // Mutations
  const editMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => founderApi.editTenant(id, data),
    onSuccess: () => {
      toast.success('Тенант обновлён');
      setShowEdit(false);
      queryClient.invalidateQueries({ queryKey: ['founder', 'tenants'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: () => founderApi.deleteTenant(id),
    onSuccess: () => {
      toast.success('Тенант удалён');
      router.push('/founder/tenants');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const impersonateMut = useMutation({
    mutationFn: () => founderApi.impersonateTenant(id),
    onSuccess: (data: { accessToken?: string; redirectUrl?: string }) => {
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
      }
      const url = data.redirectUrl ?? `/${tenant?.slug}/dashboard`;
      window.open(url, '_blank');
      toast.success('Вход в тенант выполнен');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const toggleStatusMut = useMutation({
    mutationFn: () =>
      founderApi.editTenant(id, { isActive: tenant?.status !== 'ACTIVE' }),
    onSuccess: () => {
      toast.success(tenant?.status === 'ACTIVE' ? 'Тенант деактивирован' : 'Тенант активирован');
      queryClient.invalidateQueries({ queryKey: ['founder', 'tenants'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  // Action handlers
  const handleDelete = () => {
    if (window.confirm(`Удалить тенант "${tenant?.name}"? Это действие необратимо.`)) {
      deleteMut.mutate();
    }
  };

  const handleToggleStatus = () => {
    const action = tenant?.status === 'ACTIVE' ? 'деактивировать' : 'активировать';
    if (window.confirm(`${action[0].toUpperCase() + action.slice(1)} тенант "${tenant?.name}"?`)) {
      toggleStatusMut.mutate();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton variant="table" rows={4} />
      </div>
    );
  }

  // Not found
  if (!tenant) {
    return (
      <div className="flex flex-col items-center gap-4 p-12">
        <p className="text-gray-500">Тенант не найден</p>
        <Link href="/founder/tenants" className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">
          Назад
        </Link>
      </div>
    );
  }

  const isActive = tenant.status === 'ACTIVE';

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-6 pb-0 pt-6">
        {/* Back link */}
        <Link
          href="/founder/tenants"
          className="mb-4 flex w-fit items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Тенанты
        </Link>

        {/* Title + actions */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <Building2 className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">{tenant.name}</h1>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                  )}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-sm text-gray-400">{tenant.slug}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => impersonateMut.mutate()}
              disabled={impersonateMut.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:border-violet-400 hover:text-violet-600 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              Войти
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:border-violet-400 hover:text-violet-600"
            >
              <Pencil className="h-4 w-4" />
              Редактировать
            </button>
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={toggleStatusMut.isPending}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition disabled:opacity-50',
                isActive
                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                  : 'border-green-200 text-green-600 hover:bg-green-50',
              )}
            >
              <Power className="h-4 w-4" />
              {isActive ? 'Деактивировать' : 'Активировать'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          </div>
        </div>

        {/* ─── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition',
                  active
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'errors' && (errors?.length ?? 0) > 0 && (
                  <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                    {errors?.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab content ──────────────────────────────────────────────── */}
      <div className="flex-1 p-6">
        {activeTab === 'overview' && (
          <OverviewTab tenant={tenant} revenue={revenue} />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab tenantId={id} tenantName={tenant.name} />
        )}

        {activeTab === 'users' && (
          <UsersTab tenantId={id} tenantName={tenant.name} />
        )}

        {activeTab === 'branches' && (
          <BranchesSection tenantId={id} />
        )}

        {activeTab === 'errors' && (
          <ErrorsSection errors={errors} />
        )}

        {activeTab === 'audit' && (
          <AuditTab tenantId={id} />
        )}

        {activeTab === 'notes' && (
          <NotesSection />
        )}
      </div>

      {/* ─── Edit modal ───────────────────────────────────────────────── */}
      <EditTenantModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(data) => editMut.mutate(data)}
        isPending={editMut.isPending}
        tenant={tenant}
      />
    </div>
  );
}

function BranchesSection({ tenantId }: { tenantId: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
      <Building2 className="h-8 w-8 text-gray-300" />
      <p className="text-sm text-gray-400">Филиалы — после подключения backend endpoint</p>
      <p className="text-xs text-gray-300">GET /admin/tenants/{tenantId}/branches</p>
    </div>
  );
}

function ErrorsSection({ errors }: { errors: Array<{
  id: string; severity: string; type: string; message: string; url?: string; occurredAt: string;
}> | undefined }) {
  if (!errors || errors.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
        <AlertOctagon className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">Ошибок не найдено</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">Всего: <span className="font-medium text-gray-700">{errors.length}</span> ошибок</p>
      {errors.map((err) => (
        <div key={err.id} className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <SeverityBadge severity={err.severity} />
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{err.type}</span>
            <span className="ml-auto text-xs text-gray-400">{new Date(err.occurredAt).toLocaleString('ru-RU')}</span>
          </div>
          <p className="text-sm text-gray-700">{err.message}</p>
          {err.url && <p className="mt-1 font-mono text-xs text-gray-400">{err.url}</p>}
        </div>
      ))}
    </div>
  );
}

function NotesSection() {
  const [notes, setNotes] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">Внутренние заметки (только локально, сохранение пока недоступно)</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={8}
        placeholder="Напишите заметки..."
        className="w-full rounded-xl border border-gray-200 p-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
}
