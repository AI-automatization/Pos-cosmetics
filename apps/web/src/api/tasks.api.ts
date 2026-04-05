import { apiClient } from './client';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigneeId?: string | null;
  dueDate?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}

export const tasksApi = {
  list(page = 1, limit = 50) {
    return apiClient
      .get<{ items: Task[]; total: number }>(`/tasks?page=${page}&limit=${limit}`)
      .then((r) => r.data);
  },
  create(dto: CreateTaskDto) {
    return apiClient.post<Task>('/tasks', dto).then((r) => r.data);
  },
  update(id: string, dto: UpdateTaskDto) {
    return apiClient.patch<Task>(`/tasks/${id}`, dto).then((r) => r.data);
  },
  remove(id: string) {
    return apiClient.delete(`/tasks/${id}`).then((r) => r.data);
  },
};
