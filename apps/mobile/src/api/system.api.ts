import { api } from './client';

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'error';
  responseMs?: number;
  message?: string;
}

export interface SystemHealth {
  apiStatus: ServiceStatus;
  databaseStatus: ServiceStatus;
  workerStatus: ServiceStatus;
  fiscalStatus: ServiceStatus;
  uptime: number;
}

export interface SystemError {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  occurredAt: string;
  service: string;
}

export const systemApi = {
  getHealth: async (): Promise<SystemHealth> => {
    const { data } = await api.get<SystemHealth>('/system/health');
    return data;
  },

  getErrors: async (limit = 20): Promise<SystemError[]> => {
    const { data } = await api.get<SystemError[]>('/system/errors', {
      params: { limit, level: 'error' },
    });
    return data;
  },
};
