import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import type { ReceiptListResponse, CreateReceiptBody, CreateTransferBody, Receipt, InvoiceDetail } from '../../api/inventory.api';

/** Map InvoiceDetail → legacy Receipt shape (used by Kirim screens) */
function invoiceToReceipt(inv: InvoiceDetail): Receipt {
  return {
    id: inv.id,
    receiptNumber: inv.invoiceNumber ?? '#' + String(inv.id).slice(0, 6),
    date: new Date(inv.createdAt).toLocaleDateString('uz-UZ'),
    supplierName: inv.supplier?.name ?? "Noma'lum",
    itemsCount: inv.itemsCount ?? inv.items?.length ?? 0,
    totalCost: inv.totalCost ?? 0,
    status: inv.status,
    notes: inv.note ?? undefined,
  };
}

export function useKirimData() {
  const qc = useQueryClient();

  const list = useQuery<ReceiptListResponse>({
    queryKey: ['kirim'],
    queryFn: async (): Promise<ReceiptListResponse> => {
      const res = await inventoryApi.listInvoices();
      return {
        items: res.invoices.map((inv) => ({
          id: inv.id,
          receiptNumber: inv.invoiceNumber ?? '#' + String(inv.id).slice(0, 6),
          date: new Date(inv.createdAt).toLocaleDateString('uz-UZ'),
          supplierName: inv.supplier?.name ?? "Noma'lum",
          itemsCount: inv.itemsCount,
          totalCost: inv.totalCost,
          status: inv.status,
        })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    },
    staleTime: 30_000,
  });

  const create = useMutation<
    Awaited<ReturnType<typeof inventoryApi.createReceipt>>,
    Error,
    CreateReceiptBody
  >({
    mutationFn: inventoryApi.createReceipt,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kirim'] });
    },
  });

  const transfer = useMutation<
    Awaited<ReturnType<typeof inventoryApi.createTransfer>>,
    Error,
    CreateTransferBody
  >({
    mutationFn: inventoryApi.createTransfer,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kirim'] });
    },
  });

  const accept = useMutation<Receipt, Error, string>({
    mutationFn: async (id: string): Promise<Receipt> => {
      const inv = await inventoryApi.approveInvoice(id);
      return invoiceToReceipt(inv);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kirim'] });
    },
  });

  const cancel = useMutation<Receipt, Error, string>({
    mutationFn: async (id: string): Promise<Receipt> => {
      const inv = await inventoryApi.rejectInvoice(id);
      return invoiceToReceipt(inv);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kirim'] });
    },
  });

  return { list, create, transfer, accept, cancel };
}
