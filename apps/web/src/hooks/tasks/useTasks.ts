'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tasksApi, type CreateTaskDto, type UpdateTaskDto } from '@/api/tasks.api';

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
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Topshiriq qo'shildi!");
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) => tasksApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Topshiriq o'chirildi");
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}
