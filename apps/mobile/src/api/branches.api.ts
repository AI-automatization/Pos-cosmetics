import { api } from './client';

export interface Branch {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export const branchApi = {
  getAll: async (): Promise<Branch[]> => {
    const { data } = await api.get<Branch[]>('/branches');
    return data;
  },
};
