'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tasksApi, type CreateTaskDto, type UpdateTaskDto } from '@/api/tasks.api';
import { useTranslation } from '@/i18n/i18n-context';

const TASKS_KEY = 'tasks';

export function useTasks() {
  return useQuery({
    queryKey: [TASKS_KEY],
    queryFn: () => tasksApi.list(),
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success(t('toast.taskCreated'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) => tasksApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success(t('toast.taskDeleted'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}
