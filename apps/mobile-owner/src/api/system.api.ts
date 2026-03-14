import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

export interface ServiceStatus {
  readonly status: 'healthy' | 'degraded' | 'error';
  readonly responseMs?: number;
  readonly message?: string;
}

export interface BranchSyncStatus {
  readonly branchId: string;
  readonly branchName: string;
  readonly status: 'synced' | 'pending' | 'offline' | 'error';
  readonly lastSyncAt: string;
  readonly pendingItems: number;
}

export interface SystemError {
  readonly id: string;
  readonly level: 'error' | 'warn' | 'info';
  readonly message: string;
  readonly occurredAt: string;
  readonly service: string;
}

export interface SystemHealth {
  readonly apiStatus: ServiceStatus;
  readonly databaseStatus: ServiceStatus;
  readonly workerStatus: ServiceStatus;
  readonly fiscalStatus: ServiceStatus;
  readonly uptime: number;
  readonly syncStatuses: BranchSyncStatus[];
  readonly recentErrors: SystemError[];
}

export interface SystemErrorsParams {
  fromDate?: string;
  level?: 'error' | 'warn';
  limit?: number;
}

export const systemApi = {
  async getHealth(): Promise<SystemHealth> {
    const { data } = await apiClient.get<SystemHealth>(ENDPOINTS.SYSTEM_HEALTH);
    return data;
  },

  async getSyncStatus(): Promise<BranchSyncStatus[]> {
    const { data } = await apiClient.get<BranchSyncStatus[]>(ENDPOINTS.SYSTEM_SYNC_STATUS);
    return data;
  },

  async getErrors(params: SystemErrorsParams): Promise<SystemError[]> {
    const { data } = await apiClient.get<SystemError[]>(ENDPOINTS.SYSTEM_ERRORS, {
      params: {
        from_date: params.fromDate,
        level: params.level,
        limit: params.limit ?? 50,
      },
    });
    return data;
  },
};
