import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi, CreateInvoiceDto, WriteOffDto } from '@/api/warehouse.api';
import { toast } from 'sonner';

export function useWarehouseInvoices(params?: { from?: string; to?: string; page?: number }) {
  return useQuery({
    queryKey: ['warehouse-invoices', params],
    queryFn: () => warehouseApi.listInvoices(params).then((r) => r.data),
  });
}

export function useWarehouseInvoice(id: string) {
  return useQuery({
    queryKey: ['warehouse-invoice', id],
    queryFn: () => warehouseApi.getInvoice(id).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => warehouseApi.createInvoice(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['warehouse-invoices'] });
      void qc.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Nakladnoy saqlandi');
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useWriteOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: WriteOffDto) => warehouseApi.writeOff(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Spisanie amalga oshirildi');
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useWarehouseDashboard() {
  return useQuery({
    queryKey: ['warehouse-dashboard'],
    queryFn: () => warehouseApi.getDashboard().then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useWarehouseAlerts() {
  return useQuery({
    queryKey: ['warehouse-alerts'],
    queryFn: () => warehouseApi.getAlerts().then((r) => r.data),
  });
}

export function useStockLevels(params?: Parameters<typeof warehouseApi.getStockLevels>[0]) {
  return useQuery({
    queryKey: ['stock-levels', params],
    queryFn: () => warehouseApi.getStockLevels(params).then((r) => r.data),
  });
}

export function useWarehouseMovements(params?: Parameters<typeof warehouseApi.listMovements>[0]) {
  return useQuery({
    queryKey: ['warehouse-movements', params],
    queryFn: () => warehouseApi.listMovements(params).then((r) => r.data),
  });
}
