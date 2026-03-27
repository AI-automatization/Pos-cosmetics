import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import { CONFIG } from '../../config';
import type { LowStockItem } from '../../api/inventory.api';

function makeDemoStock(): LowStockItem[] {
  return [
    { productId: 'p1',  productName: 'Glow Serum Vitamin C',        warehouseId: 'w1', warehouseName: 'Tashkent City Mall', stock: 42, minStockLevel: 10 },
    { productId: 'p2',  productName: 'Hydra-Lock Cream',             warehouseId: 'w2', warehouseName: 'Riviera Branch',     stock: 3,  minStockLevel: 10 },
    { productId: 'p3',  productName: 'Midnight Recovery Oil',        warehouseId: 'w3', warehouseName: 'Samarkand Darvoza', stock: 0,  minStockLevel: 5  },
    { productId: 'p4',  productName: 'Silk Foundation SPF30',        warehouseId: 'w1', warehouseName: 'Tashkent City Mall', stock: 15, minStockLevel: 5  },
    { productId: 'p5',  productName: 'Rose Water Toner',             warehouseId: 'w2', warehouseName: 'Riviera Branch',     stock: 2,  minStockLevel: 8  },
    { productId: 'p6',  productName: 'Retinol Night Cream',          warehouseId: 'w1', warehouseName: 'Tashkent City Mall', stock: 0,  minStockLevel: 6  },
    { productId: 'p7',  productName: 'SPF 50 Sunscreen',             warehouseId: 'w3', warehouseName: 'Samarkand Darvoza', stock: 20, minStockLevel: 10 },
    { productId: 'p8',  productName: 'Micellar Cleansing Water',     warehouseId: 'w2', warehouseName: 'Riviera Branch',     stock: 4,  minStockLevel: 12 },
    { productId: 'p9',  productName: 'Collagen Booster Serum',       warehouseId: 'w1', warehouseName: 'Tashkent City Mall', stock: 30, minStockLevel: 8  },
    { productId: 'p10', productName: 'Hyaluronic Acid Moisturizer',  warehouseId: 'w3', warehouseName: 'Samarkand Darvoza', stock: 1,  minStockLevel: 10 },
    { productId: 'p11', productName: 'Vitamin C Brightening Toner',  warehouseId: 'w1', warehouseName: 'Tashkent City Mall', stock: 18, minStockLevel: 5  },
    { productId: 'p12', productName: 'Anti-Aging Eye Cream',         warehouseId: 'w2', warehouseName: 'Riviera Branch',     stock: 0,  minStockLevel: 4  },
  ];
}

export function useOmborData() {
  const stockLevels = useQuery<LowStockItem[]>({
    queryKey: ['ombor-stock'],
    queryFn: async () => {
      try {
        const res = await inventoryApi.getStockLevels();
        if (res.length > 0) return res;
        return makeDemoStock();
      } catch {
        return makeDemoStock();
      }
    },
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  return { stockLevels };
}
