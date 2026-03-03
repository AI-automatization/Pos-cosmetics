import { apiClient } from './client';
import type {
  DailyRevenue,
  TopProduct,
  ShiftReport,
  DashboardData,
  DateRangeQuery,
} from '@/types/reports';

export const reportsApi = {
  getDashboard() {
    return apiClient.get<DashboardData>('/reports/dashboard').then((r) => r.data);
  },

  getDailyRevenue(params: DateRangeQuery) {
    return apiClient
      .get<DailyRevenue[]>('/reports/daily-revenue', { params })
      .then((r) => r.data);
  },

  getTopProducts(params: DateRangeQuery & { limit?: number }) {
    return apiClient
      .get<TopProduct[]>('/reports/top-products', { params })
      .then((r) => r.data);
  },

  getShifts(params: DateRangeQuery) {
    return apiClient
      .get<ShiftReport[]>('/reports/shifts', { params })
      .then((r) => r.data);
  },
};
