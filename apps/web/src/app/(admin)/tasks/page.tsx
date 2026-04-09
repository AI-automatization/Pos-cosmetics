'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ClipboardList, Plus, X, CheckCircle2, Circle, Clock, Trash2,
  ChevronRight,
} from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/tasks/useTasks';
import { useUsers } from '@/hooks/settings/useUsers';
import { useBranches } from '@/hooks/settings/useBranches';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/api/tasks.api';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; next: TaskStatus | null }> = {
  PENDING: { label: 'Kutilmoqda', icon: Circle, color: 'text-gray-500 bg-gray-100', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Jarayonda', icon: Clock, color: 'text-blue-600 bg-blue-100', next: 'DONE' },
  DONE: { label: 'Bajarildi', icon: CheckCircle2, color: 'text-green-600 bg-green-100', next: null },
};

const taskSchema = z.object({
  title: z.string().min(1, 'Sarlavha kiritilishi shart'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

function TaskCard({ task, assigneeName }: { task: Task; assigneeName?: string }) {
  const { mutate: update } = useUpdateTask();
  const { mutate: remove } = useDeleteTask();
  const cfg = STATUS_CONFIG[task.status];
  const Icon = cfg.icon;

  return (
    <div className={cn(
      'bg-white border rounded-xl p-4 space-y-2 transition',
      task.status === 'DONE' ? 'opacity-60 border-gray-100' : 'border-gray-200 hover:border-blue-200 hover:shadow-sm',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (cfg.next) update({ id: task.id, dto: { status: cfg.next } });
            }}
            disabled={!cfg.next}
            className="mt-0.5 shrink-0"
            title={cfg.next ? `${STATUS_CONFIG[cfg.next].label}ga o'tkazish` : undefined}
          >
            <Icon className={cn('h-4.5 w-4.5', task.status === 'DONE' ? 'text-green-500' : task.status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-gray-400')} />
          </button>
          <div className="min-w-0">
            <p className={cn('text-sm font-medium text-gray-900 leading-snug', task.status === 'DONE' && 'line-through text-gray-400')}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => remove(task.id)}
          className="shrink-0 rounded-md p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cfg.color)}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
        {assigneeName && (
          <span className="text-xs text-gray-400">{assigneeName}</span>
        )}
        {task.dueDate && (
          <span className={cn(
            'text-xs',
            new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-medium' : 'text-gray-400',
          )}>
            {new Date(task.dueDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
        {cfg.next && (
          <button
            type="button"
            onClick={() => update({ id: task.id, dto: { status: cfg.next! } })}
            className="ml-auto flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700"
          >
            {STATUS_CONFIG[cfg.next].label}ga o&apos;tkazish
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [branchFilter, setBranchFilter] = useState('');

  const { data, isLoading } = useTasks();
  const { data: users = [] } = useUsers();
  const { data: branches = [] } = useBranches();
  const { mutate: createTask, isPending } = useCreateTask();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
  });
  const assigneeId = watch('assigneeId') ?? '';

  const tasks = data?.items ?? [];

  const branchUserIds = branchFilter
    ? new Set(users.filter((u) => u.branchId === branchFilter).map((u) => u.id))
    : null;

  const filtered = tasks.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (branchUserIds && t.assigneeId && !branchUserIds.has(t.assigneeId)) return false;
    return true;
  });

  const userMap = new Map(users.map((u) => [u.id, `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || u.id]));

  const onSubmit = (formData: TaskForm) => {
    createTask(
      {
        title: formData.title,
        description: formData.description || undefined,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate || undefined,
      },
      { onSuccess: () => { reset(); setShowForm(false); } },
    );
  };

  const baseTasks = branchUserIds
    ? tasks.filter((t) => !t.assigneeId || branchUserIds.has(t.assigneeId))
    : tasks;

  const counts = {
    ALL: baseTasks.length,
    PENDING: baseTasks.filter((t) => t.status === 'PENDING').length,
    IN_PROGRESS: baseTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: baseTasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Topshiriqlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">{tasks.length} ta topshiriq</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Yopish' : "Topshiriq qo'shish"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Yangi topshiriq</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div>
              <input
                {...register('title')}
                placeholder="Topshiriq sarlavhasi *"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200',
                  errors.title ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <textarea
              {...register('description')}
              placeholder="Qo'shimcha izoh (ixtiyoriy)"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Xodimga tayinlash</label>
                <SearchableDropdown
                  options={users.map((u) => ({
                    value: u.id,
                    label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || u.id,
                  }))}
                  value={assigneeId}
                  onChange={(val) => setValue('assigneeId', val || undefined)}
                  placeholder="— Tanlang —"
                  searchable={users.length > 4}
                  clearable
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Muddat</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { reset(); setShowForm(false); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Bekor
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isPending ? 'Saqlanmoqda...' : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Branch + Status filters */}
      <div className="flex flex-wrap items-center gap-3">
        {branches.length > 0 && (
          <SearchableDropdown
            options={[
              { value: '', label: 'Barcha filiallar' },
              ...branches.map((b) => ({ value: b.id, label: b.name })),
            ]}
            value={branchFilter}
            onChange={(val) => setBranchFilter(val)}
            placeholder="Barcha filiallar"
            searchable={branches.length > 4}
            clearable={false}
            className="w-48"
          />
        )}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'DONE'] as const).map((s) => {
          const label = s === 'ALL' ? 'Barchasi' : STATUS_CONFIG[s].label;
          const count = counts[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600',
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16">
          <ClipboardList className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {filter === 'ALL' ? "Topshiriqlar yo'q" : `${STATUS_CONFIG[filter as TaskStatus].label} topshiriq yo'q`}
          </p>
          {filter === 'ALL' && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              + Birinchi topshiriqni qo&apos;shing
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assigneeName={task.assigneeId ? userMap.get(task.assigneeId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
