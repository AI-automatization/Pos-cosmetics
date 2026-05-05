import { api } from './client';

// ─── Types ─────────────────────────────────────────────────
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface TaskAssignee {
  id:        string;
  firstName: string;
  lastName:  string;
}

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  assigneeId:  string | null;
  assignee:    TaskAssignee | null;
  dueDate:     string | null;
  createdAt:   string;
}

export interface CreateTaskDto {
  title:        string;
  description?: string;
  assigneeId?:  string;
  dueDate?:     string;
}

export interface UpdateTaskDto {
  title?:       string;
  description?: string;
  status?:      TaskStatus;
  assigneeId?:  string;
  dueDate?:     string;
}

// ─── API ───────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: { page?: number; limit?: number }): Promise<Task[]> =>
    api.get<Task[]>('/tasks', { params }).then(r => r.data),

  create: (dto: CreateTaskDto): Promise<Task> =>
    api.post<Task>('/tasks', dto).then(r => r.data),

  update: (id: string, dto: UpdateTaskDto): Promise<Task> =>
    api.patch<Task>(`/tasks/${id}`, dto).then(r => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/tasks/${id}`).then(r => r.data),
};
