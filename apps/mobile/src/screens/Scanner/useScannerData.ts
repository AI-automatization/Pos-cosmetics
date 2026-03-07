import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog.api';
import { inventoryApi } from '../../api/inventory.api';
import type { ProductInfo } from '../../api/catalog.api';

export type ScannerMode = 'scan' | 'count';

export interface CountEntry {
  productId: string;
  productName: string;
  barcode: string;
  systemQty: number;
  actualQty: number;
}

export function useScannerData() {
  const [mode, setMode] = useState<ScannerMode>('scan');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [countEntries, setCountEntries] = useState<CountEntry[]>([]);

  const productQuery = useQuery({
    queryKey: ['scanner', 'product', scannedBarcode],
    queryFn: () => catalogApi.getByBarcode(scannedBarcode!),
    enabled: scannedBarcode !== null,
    retry: false,
  });

  const stockQuery = useQuery({
    queryKey: ['scanner', 'stock', productQuery.data?.id],
    queryFn: () => inventoryApi.getProductStock(productQuery.data!.id),
    enabled: productQuery.data !== undefined,
  });

  const handleBarcodeScan = useCallback((barcode: string) => {
    setScannedBarcode(barcode);
  }, []);

  const resetScan = useCallback(() => {
    setScannedBarcode(null);
  }, []);

  const addCountEntry = useCallback(
    (product: ProductInfo, systemQty: number, actualQty: number) => {
      setCountEntries((prev) => {
        const existing = prev.findIndex((e) => e.productId === product.id);
        const entry: CountEntry = {
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          systemQty,
          actualQty,
        };
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = entry;
          return updated;
        }
        return [...prev, entry];
      });
    },
    [],
  );

  const clearCountEntries = useCallback(() => {
    setCountEntries([]);
  }, []);

  const totalSystemQty = countEntries.reduce((s, e) => s + e.systemQty, 0);
  const totalActualQty = countEntries.reduce((s, e) => s + e.actualQty, 0);

  return {
    mode,
    setMode,
    scannedBarcode,
    productQuery,
    stockQuery,
    handleBarcodeScan,
    resetScan,
    countEntries,
    addCountEntry,
    clearCountEntries,
    totalSystemQty,
    totalActualQty,
  };
}
