import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import type { ReceiptListResponse, CreateReceiptBody, CreateTransferBody } from '../../api/inventory.api';

export function useKirimData() {
  const qc = useQueryClient();

  const list = useQuery<ReceiptListResponse>({
    queryKey: ['kirim'],
    queryFn: () => inventoryApi.getReceipts(),
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

  return { list, create, transfer };
}
