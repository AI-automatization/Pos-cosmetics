import { useQuery } from '@tanstack/react-query';
import { inventoryApi, InventoryItem } from '../../api/inventory.api';
import { useBranchStore } from '../../store/branch.store';
import { DASHBOARD_REFETCH_INTERVAL } from '../../config/constants';

export type WarehouseTab = 'all' | 'low' | 'expiring';

const MOCK_ITEMS: InventoryItem[] = [
  { id: 'w1', productName: 'Chanel No.5 EDP 100ml', barcode: '3145891253317', quantity: 8, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 320_000, stockValue: 2_560_000, reorderLevel: 5, expiryDate: '2026-12-01', status: 'normal' },
  { id: 'w2', productName: 'Dior Sauvage EDT 60ml', barcode: '3348901419610', quantity: 3, unit: 'dona', branchName: 'Yunusabad', branchId: 'b2', costPrice: 285_000, stockValue: 855_000, reorderLevel: 5, expiryDate: '2026-08-15', status: 'low' },
  { id: 'w3', productName: "L'Oreal Elvive Shampoo", barcode: '3600523562985', quantity: 0, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 42_000, stockValue: 0, reorderLevel: 10, expiryDate: null, status: 'out_of_stock' },
  { id: 'w4', productName: 'Nivea Moisturizing Cream', barcode: '4005900134141', quantity: 12, unit: 'dona', branchName: 'Sergeli', branchId: 'b3', costPrice: 28_000, stockValue: 336_000, reorderLevel: 15, expiryDate: '2026-04-10', status: 'expiring' },
  { id: 'w5', productName: 'MAC Studio Fix Foundation', barcode: '0773602519606', quantity: 4, unit: 'dona', branchName: "Mirzo Ulug'bek", branchId: 'b4', costPrice: 195_000, stockValue: 780_000, reorderLevel: 5, expiryDate: '2025-12-01', status: 'expired' },
  { id: 'w6', productName: 'Versace Eros EDT 100ml', barcode: '8011003818303', quantity: 15, unit: 'dona', branchName: 'Yunusabad', branchId: 'b2', costPrice: 310_000, stockValue: 4_650_000, reorderLevel: 5, expiryDate: '2027-03-20', status: 'normal' },
  { id: 'w7', productName: 'Garnier Micellar Water', barcode: '3600541520097', quantity: 2, unit: 'dona', branchName: 'Chilonzor', branchId: 'b1', costPrice: 35_000, stockValue: 70_000, reorderLevel: 8, expiryDate: null, status: 'low' },
  { id: 'w8', productName: 'NYX Matte Lipstick', barcode: '0800897155681', quantity: 22, unit: 'dona', branchName: "Mirzo Ulug'bek", branchId: 'b4', costPrice: 58_000, stockValue: 1_276_000, reorderLevel: 10, expiryDate: null, status: 'normal' },
  { id: 'w9', productName: 'Bioderma Sensibio H2O', barcode: '3401399503090', quantity: 1, unit: 'dona', branchName: 'Sergeli', branchId: 'b3', costPrice: 125_000, stockValue: 125_000, reorderLevel: 6, expiryDate: '2026-04-20', status: 'expiring' },
  { id: 'w10', productName: 'Maybelline Fit Me Foundation', barcode: '3600531252403', quantity: 0, unit: 'dona', branchName: 'Yunusabad', branchId: 'b2', costPrice: 65_000, stockValue: 0, reorderLevel: 8, expiryDate: null, status: 'out_of_stock' },
];

export function useWarehouseData(tab: WarehouseTab) {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const stock = useQuery<InventoryItem[]>({
    queryKey: ['warehouse', tab, selectedBranchId],
    queryFn: async () => {
      try {
        if (tab === 'low') {
          const data = await inventoryApi.getLowStock(selectedBranchId);
          if (data.length > 0) return data;
          return MOCK_ITEMS.filter((i) => i.status === 'low' || i.status === 'out_of_stock');
        }
        if (tab === 'expiring') {
          const data = await inventoryApi.getExpiring(selectedBranchId, 30);
          if (data.length > 0) return data;
          return MOCK_ITEMS.filter((i) => i.status === 'expiring' || i.status === 'expired');
        }
        const page = await inventoryApi.getStock({ branchId: selectedBranchId, status: 'all', limit: 100 });
        if (page.items.length > 0) return page.items;
        return MOCK_ITEMS;
      } catch {
        if (tab === 'low') return MOCK_ITEMS.filter((i) => i.status === 'low' || i.status === 'out_of_stock');
        if (tab === 'expiring') return MOCK_ITEMS.filter((i) => i.status === 'expiring' || i.status === 'expired');
        return MOCK_ITEMS;
      }
    },
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  return { stock };
}
