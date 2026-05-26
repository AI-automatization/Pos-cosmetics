import { useQuery } from '@tanstack/react-query';
import {
  inventoryApi,
  WarehouseDashboardResponse,
  WarehouseAlertsResponse,
} from '../../api/inventory.api';
import { alertsApi } from '../../api/alerts.api';

export function useWarehouseDashboard() {
  const dashboard = useQuery<WarehouseDashboardResponse>({
    queryKey: ['warehouse-dashboard'],
    queryFn: () => inventoryApi.getWarehouseDashboard(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const alerts = useQuery<WarehouseAlertsResponse>({
    queryKey: ['warehouse-alerts'],
    queryFn: () => inventoryApi.getWarehouseAlerts(),
    staleTime: 60_000,
  });

  const restockRequests = useQuery({
    queryKey: ['restock-requests'],
    queryFn: async () => {
      const items = await alertsApi.getRestockRequests();
      return items.filter((n) => n.type === 'LOW_STOCK' && !n.isRead);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // REQUESTED transfer so'rovlari soni (ombor ishchisi uchun)
  const transferRequests = useQuery({
    queryKey: ['stock-transfers', 'REQUESTED'],
    queryFn: () => inventoryApi.listTransfers({ status: 'REQUESTED' }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return { dashboard, alerts, restockRequests, transferRequests };
}
