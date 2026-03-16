import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

export interface Branch {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly isActive: boolean;
  readonly address?: string;
  readonly manager?: string;
  readonly contact?: string;
}

export const branchesApi = {
  async getBranches(): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>(ENDPOINTS.BRANCHES);
    return data;
  },

  async getBranchById(id: string): Promise<Branch> {
    const { data } = await apiClient.get<Branch>(`${ENDPOINTS.BRANCHES}/${id}`);
    return data;
  },
};
