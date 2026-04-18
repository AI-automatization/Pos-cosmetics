import api from './client';

// ─── Entity types ──────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  phone?: string;
  createdAt?: string;
}

// ─── Request body types ────────────────────────────────────

export interface CreateBranchBody {
  name: string;
  address: string;
  phone?: string;
}

// ─── API response shape (server dan keladi) ───────────────

interface BranchApiResponse {
  id: string;
  name?: string;
  address?: string;
  isActive?: boolean;
  phone?: string;
  createdAt?: string;
}

// ─── Mapper ───────────────────────────────────────────────

function mapBranch(b: BranchApiResponse, fallback?: CreateBranchBody): Branch {
  return {
    id: b.id,
    name: b.name ?? fallback?.name ?? '',
    address: b.address ?? fallback?.address ?? '',
    isActive: b.isActive ?? true,
    phone: b.phone ?? fallback?.phone,
    createdAt: b.createdAt,
  };
}

// ─── branchesApi ──────────────────────────────────────────

export const branchesApi = {
  getAll: async (): Promise<Branch[]> => {
    const { data } = await api.get<BranchApiResponse[]>('/branches');
    return data.map((b) => mapBranch(b));
  },

  create: async (body: CreateBranchBody): Promise<Branch> => {
    const { data } = await api.post<BranchApiResponse>('/branches', body);
    return mapBranch(data, body);
  },

  update: async (id: string, body: Partial<CreateBranchBody>): Promise<Branch> => {
    const { data } = await api.patch<BranchApiResponse>(`/branches/${id}`, body);
    return mapBranch(data);
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Branch> => {
    const { data } = await api.patch<BranchApiResponse>(`/branches/${id}`, { isActive });
    return mapBranch(data);
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/branches/${id}`);
  },
};
