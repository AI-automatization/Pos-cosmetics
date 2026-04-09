import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import type { Receipt, ReceiptListResponse, CreateReceiptBody } from '../../api/inventory.api';

export function useKirimData(selectedId?: string | null) {
  const qc = useQueryClient();

  const list = useQuery<ReceiptListResponse>({
    queryKey: ['kirim'],
    queryFn: () => inventoryApi.getReceipts(),
    staleTime: 30_000,
  });

  const detail = useQuery<Receipt>({
    queryKey: ['kirim', selectedId],
    queryFn: () => inventoryApi.getReceiptById(selectedId!),
    enabled: !!selectedId,
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

  const approve = useMutation<void, Error, string>({
    mutationFn: inventoryApi.approveReceipt,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kirim'] });
    },
  });

  const reject = useMutation<void, Error, string>({
    mutationFn: inventoryApi.rejectReceipt,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kirim'] });
    },
  });

  return { list, detail, create, approve, reject };
}
