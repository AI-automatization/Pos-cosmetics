import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi, CreateInvoiceDto, WriteOffDto } from '@/api/warehouse.api';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

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

export function useUpdateInvoice() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; invoiceNumber?: string; note?: string; supplierId?: string }) =>
      warehouseApi.updateInvoice(id, dto),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['warehouse-invoice', variables.id] });
      void qc.invalidateQueries({ queryKey: ['warehouse-invoices'] });
      toast.success(t('toast.invoiceSaved'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => warehouseApi.createInvoice(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['warehouse-invoices'] });
      void qc.invalidateQueries({ queryKey: ['stock'] });
      toast.success(t('toast.invoiceCreated'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useWriteOff() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: WriteOffDto) => warehouseApi.writeOff(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stock'] });
      toast.success(t('toast.writeOffComplete'));
    },
    onError: () => toast.error(t('toast.genericError')),
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
