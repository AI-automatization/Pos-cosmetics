import api from './client';

// ─── Entity types ──────────────────────────────────────────

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  userId: string;
  userName: string;
  branchName?: string;
  createdAt: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}

// ─── API response shape (server dan keladi) ───────────────

interface AuditLogApiResponse {
  id: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  branchName?: string;
  createdAt?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  oldData?: Record<string, unknown>;   // backend field name alias
  newData?: Record<string, unknown>;   // backend field name alias
}

interface PaginatedAuditResponse {
  items: AuditLogApiResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Mapper ───────────────────────────────────────────────

function mapAuditLog(raw: unknown): AuditLog {
  const r = raw as AuditLogApiResponse;
  return {
    id: r.id,
    action: (r.action ?? 'CREATE') as AuditAction,
    entityType: r.entityType ?? '',
    entityId: r.entityId,
    userId: r.userId ?? '',
    userName: r.userName ?? '',
    branchName: r.branchName,
    createdAt: r.createdAt ?? '',
    oldValue: r.oldValue ?? r.oldData,
    newValue: r.newValue ?? r.newData,
  };
}

// ─── auditApi ─────────────────────────────────────────────

export const auditApi = {
  getAll: async (action?: string): Promise<AuditLog[]> => {
    const params: Record<string, string | number> = { limit: 100 };
    if (action != null && action.length > 0) {
      params.action = action;
    }
    const { data: res } = await api.get<PaginatedAuditResponse | AuditLogApiResponse[]>('/audit-logs', { params });
    const items = Array.isArray(res) ? res : (res as PaginatedAuditResponse).items ?? [];
    return items.map((r) => mapAuditLog(r));
  },
};
