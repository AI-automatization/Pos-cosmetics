import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';
import type { ServiceStatus, SystemError } from '@raos/types';

export type { ServiceStatus, SystemError } from '@raos/types';

export interface BranchSyncStatus {
  readonly branchId: string;
  readonly branchName: string;
  readonly status: 'synced' | 'pending' | 'offline' | 'error';
  readonly lastSyncAt: string;
  readonly pendingItems: number;
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
