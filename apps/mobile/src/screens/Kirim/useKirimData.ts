import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { ReceiptListResponse, CreateReceiptBody } from '../../api/inventory.api';

function makeDemoReceipts(): ReceiptListResponse {
  return {
    items: [
      {
        id: '1',
        receiptNumber: 'KR-00245',
        date: '2026-03-10',
        supplierName: 'Loreal Distribution',
        itemsCount: 6,
        totalCost: 4_850_000,
        status: 'RECEIVED',
      },
      {
        id: '2',
        receiptNumber: 'KR-00244',
        date: '2026-03-09',
        supplierName: 'Nivea Uzbekistan',
        itemsCount: 4,
        totalCost: 2_340_000,
        status: 'PENDING',
      },
      {
        id: '3',
        receiptNumber: 'KR-00243',
        date: '2026-03-08',
        supplierName: 'Garnier Official',
        itemsCount: 3,
        totalCost: 1_920_000,
        status: 'RECEIVED',
      },
      {
        id: '4',
        receiptNumber: 'KR-00242',
        date: '2026-03-07',
        supplierName: 'Procter & Gamble',
        itemsCount: 5,
        totalCost: 3_150_000,
        status: 'RECEIVED',
      },
      {
        id: '5',
        receiptNumber: 'KR-00241',
        date: '2026-03-05',
        supplierName: 'Chanel Boutique',
        itemsCount: 2,
        totalCost: 8_400_000,
        status: 'CANCELLED',
      },
    ],
    total: 5,
    page: 1,
    limit: 20,
  };
}

export function useKirimData() {
  const qc = useQueryClient();

  const list = useQuery<ReceiptListResponse>({
    queryKey: ['kirim'],
    queryFn: async () => {
      try {
        const res = await inventoryApi.getReceipts();
        if (res.items.length > 0) return res;
        return makeDemoReceipts();
      } catch {
        return makeDemoReceipts();
      }
    },
    refetchInterval: 60_000,
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

  return { list, create };
}
