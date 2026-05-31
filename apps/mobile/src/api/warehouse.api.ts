import api from './client';
import type {
  InvoiceListResponse,
  InvoiceDetail,
  WarehouseDashboardResponse,
  WarehouseAlertsResponse,
  OpenTesterDto,
  OpenTesterResponse,
  TesterListResponse,
} from './inventory.types';

export const warehouseApi = {
  listInvoices: async (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }): Promise<InvoiceListResponse> => {
    const res = await api.get('/warehouse/invoices', { params });
    return res.data;
  },

  getInvoice: async (id: string): Promise<InvoiceDetail> => {
    const res = await api.get(`/warehouse/invoices/${id}`);
    return res.data;
  },

  approveInvoice: async (id: string): Promise<InvoiceDetail> => {
    const res = await api.patch(`/warehouse/invoices/${id}/approve`);
    return res.data;
  },

  rejectInvoice: async (id: string): Promise<InvoiceDetail> => {
    const res = await api.patch(`/warehouse/invoices/${id}/reject`);
    return res.data;
  },

  openTester: async (dto: OpenTesterDto): Promise<OpenTesterResponse> => {
    const { data } = await api.post<OpenTesterResponse>('/inventory/testers', dto);
    return data;
  },

  getTesters: async (params?: {
    from?: string;
    to?: string;
  }): Promise<TesterListResponse> => {
    const { data } = await api.get<TesterListResponse>('/inventory/testers', { params });
    return data;
  },

  getWarehouseDashboard: async (): Promise<WarehouseDashboardResponse> => {
    const { data } = await api.get('/warehouse/dashboard');
    return data;
  },

  getWarehouseAlerts: async (): Promise<WarehouseAlertsResponse> => {
    const { data } = await api.get('/warehouse/alerts');
    return data;
  },
};
