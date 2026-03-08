import { apiClient } from './client';

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
}

export interface CreateBranchDto {
  name: string;
  address?: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export const branchesApi = {
  getAll(isActive?: boolean) {
    return apiClient
      .get<Branch[]>('/branches', { params: isActive !== undefined ? { isActive } : {} })
      .then((r) => r.data);
  },
  create(dto: CreateBranchDto) {
    return apiClient.post<Branch>('/branches', dto).then((r) => r.data);
  },
  update(id: string, dto: UpdateBranchDto) {
    return apiClient.patch<Branch>(`/branches/${id}`, dto).then((r) => r.data);
  },
  deactivate(id: string) {
    return apiClient.delete<void>(`/branches/${id}`).then((r) => r.data);
  },
};
