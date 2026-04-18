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
    oldValue: r.oldValue,
    newValue: r.newValue,
  };
}

// ─── auditApi ─────────────────────────────────────────────

export const auditApi = {
  getAll: async (action?: string): Promise<AuditLog[]> => {
    const params: Record<string, string> = {};
    if (action != null && action.length > 0) {
      params.action = action;
    }
    const { data } = await api.get<AuditLogApiResponse[]>('/audit-logs', { params });
    return data.map((r) => mapAuditLog(r));
  },
};
