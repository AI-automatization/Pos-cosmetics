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

// Backend response types
interface BackendService {
  name: string;
  status: 'ok' | 'error' | 'warn';
  latencyMs?: number;
  message?: string;
}

interface BackendHealthResponse {
  services?: BackendService[];
  uptime?: number;
}

function mapStatus(s?: 'ok' | 'error' | 'warn'): 'healthy' | 'degraded' | 'error' {
  if (s === 'ok') return 'healthy';
  if (s === 'warn') return 'degraded';
  if (s === 'error') return 'error';
  return 'healthy';
}

function mapService(svc?: BackendService): ServiceStatus {
  return {
    status: mapStatus(svc?.status),
    responseMs: svc?.latencyMs,
    message: svc?.message,
  };
}

interface PaginatedErrors {
  items?: SystemError[];
  data?: SystemError[];
}

export const systemApi = {
  getHealth: async (): Promise<SystemHealth> => {
    const { data: raw } = await api.get<BackendHealthResponse>('/system/health');
    const services = raw.services ?? [];
    const find = (name: string) => services.find((s) => s.name === name);
    return {
      apiStatus:      mapService(find('api')),
      databaseStatus: mapService(find('database')),
      workerStatus:   mapService(find('worker')),
      fiscalStatus:   mapService(find('fiscal') ?? find('fiscal-adapter')),
      uptime:         raw.uptime ?? 0,
    };
  },

  getErrors: async (limit = 20): Promise<SystemError[]> => {
    const { data } = await api.get<SystemError[] | PaginatedErrors>('/system/errors', {
      params: { limit, level: 'error' },
    });
    if (Array.isArray(data)) return data;
    return (data as PaginatedErrors).items ?? (data as PaginatedErrors).data ?? [];
  },
};
