import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import { CONFIG } from '../../config';
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
        items: [
          { productId: 'p1', productName: "L'Oreal Paris Excellence Creme", qty: 12, unit: 'dona', costPrice: 450_000 },
          { productId: 'p2', productName: "L'Oreal Absolut Repair Shampoo", qty: 10, unit: 'dona', costPrice: 280_000 },
          { productId: 'p3', productName: "L'Oreal Infallible Pro Glow Foundation", qty: 8, unit: 'dona', costPrice: 380_000 },
          { productId: 'p4', productName: "L'Oreal Voluminous Lash Mascara", qty: 15, unit: 'dona', costPrice: 195_000 },
          { productId: 'p5', productName: "L'Oreal True Match Powder", qty: 10, unit: 'dona', costPrice: 220_000 },
          { productId: 'p6', productName: "L'Oreal Pure Clay Mask", qty: 6, unit: 'dona', costPrice: 265_000 },
        ],
      },
      {
        id: '2',
        receiptNumber: 'KR-00244',
        date: '2026-03-09',
        supplierName: 'Nivea Uzbekistan',
        itemsCount: 4,
        totalCost: 2_340_000,
        status: 'PENDING',
        items: [
          { productId: 'p7', productName: 'Nivea Rich Moisturizing Cream', qty: 20, unit: 'dona', costPrice: 380_000 },
          { productId: 'p8', productName: 'Nivea Sun Protect & Bronze SPF 20', qty: 15, unit: 'dona', costPrice: 420_000 },
          { productId: 'p9', productName: 'Nivea Visage Pure Cleansing Milk', qty: 18, unit: 'dona', costPrice: 310_000 },
          { productId: 'p10', productName: 'Nivea Body Lotion Almond Oil', qty: 12, unit: 'dona', costPrice: 230_000 },
        ],
      },
      {
        id: '3',
        receiptNumber: 'KR-00243',
        date: '2026-03-08',
        supplierName: 'Garnier Official',
        itemsCount: 3,
        totalCost: 1_920_000,
        status: 'RECEIVED',
        items: [
          { productId: 'p11', productName: 'Garnier Fructis Shampoo Damage Repair', qty: 14, unit: 'dona', costPrice: 280_000 },
          { productId: 'p12', productName: 'Garnier Micellar Cleansing Water', qty: 10, unit: 'dona', costPrice: 350_000 },
          { productId: 'p13', productName: 'Garnier SkinActive Gel Cream', qty: 8, unit: 'dona', costPrice: 290_000 },
        ],
      },
      {
        id: '4',
        receiptNumber: 'KR-00242',
        date: '2026-03-07',
        supplierName: 'Procter & Gamble',
        itemsCount: 5,
        totalCost: 3_150_000,
        status: 'RECEIVED',
        items: [
          { productId: 'p14', productName: 'Gillette Gillette Fusion ProGlide Razor', qty: 8, unit: 'dona', costPrice: 185_000 },
          { productId: 'p15', productName: 'Olay Total Effects Day Cream', qty: 12, unit: 'dona', costPrice: 320_000 },
          { productId: 'p16', productName: 'Braun Silk Expert Hair Removal', qty: 2, unit: 'dona', costPrice: 1_200_000 },
          { productId: 'p17', productName: 'Pantene Gold Series Shampoo', qty: 20, unit: 'dona', costPrice: 150_000 },
          { productId: 'p18', productName: 'Always Ultra Sanitary Pads', qty: 30, unit: 'dona', costPrice: 95_000 },
        ],
      },
      {
        id: '5',
        receiptNumber: 'KR-00241',
        date: '2026-03-05',
        supplierName: 'Chanel Boutique',
        itemsCount: 2,
        totalCost: 8_400_000,
        status: 'CANCELLED',
        items: [
          { productId: 'p19', productName: 'Chanel No. 5 Parfum 100ml', qty: 3, unit: 'dona', costPrice: 3_200_000 },
          { productId: 'p20', productName: 'Chanel Coco Mademoiselle Eau de Toilette', qty: 2, unit: 'dona', costPrice: 1_000_000 },
        ],
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
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
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
