import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import type { CreateReceiptBody, CreateReceiptResponse } from '../../api/inventory.api';
import { extractErrorMessage } from '../../utils/error';
import { EMPTY_FORM, EMPTY_LINE } from './components/types';
import type { LineItem, FormState, ScanResult, AddMode } from './components/types';

interface UseNewReceiptFormParams {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly createMutation: UseMutationResult<CreateReceiptResponse, Error, CreateReceiptBody>;
}

export function useNewReceiptForm({ visible, onClose, onSuccess, createMutation }: UseNewReceiptFormParams) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [items, setItems] = useState<LineItem[]>([]);
  const [addMode, setAddMode] = useState<AddMode>('none');
  const [manualLine, setManualLine] = useState<Omit<LineItem, 'key'>>(EMPTY_LINE);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanLine, setScanLine] = useState<Omit<LineItem, 'key'>>(EMPTY_LINE);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isScanActive, setIsScanActive] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const { data: catalogProducts = [] } = useQuery<CatalogProduct[]>({
    queryKey: ['catalog-products-kirim'],
    queryFn: () => catalogApi.getProducts(),
    staleTime: 5 * 60_000,
    enabled: visible,
  });

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return catalogProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 5);
  }, [catalogProducts, productSearch]);

  // ── Helpers ──────────────────────────────────────
  const setField = useCallback(
    (key: keyof FormState) => (value: string) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setScanLineField = useCallback(
    (key: keyof Omit<LineItem, 'key'>) => (value: string) =>
      setScanLine((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setManualLineField = useCallback(
    (key: keyof Omit<LineItem, 'key'>) => (value: string) =>
      setManualLine((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const resetAll = useCallback(() => {
    setForm(EMPTY_FORM);
    setItems([]);
    setAddMode('none');
    setManualLine(EMPTY_LINE);
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setCameraOpen(false);
    setIsScanActive(true);
    setProductSearch('');
  }, []);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  // ── Barcode scanned ──────────────────────────────
  const handleBarcodeScanned = useCallback(async (event: { data: string }) => {
    if (scanLoading) return;
    setIsScanActive(false);
    setScanLoading(true);
    const barcode = event.data;
    try {
      const product = await catalogApi.getByBarcode(barcode);
      setScanResult({ productId: product.id, productName: product.name, costPrice: String(product.costPrice) });
      setScanLine({ productId: product.id, productName: product.name, quantity: '1', costPrice: String(product.costPrice), expiryDate: '' });
    } catch {
      setScanResult({ productId: barcode, productName: barcode, costPrice: '0' });
      setScanLine({ productId: barcode, productName: barcode, quantity: '1', costPrice: '0', expiryDate: '' });
    } finally {
      setScanLoading(false);
      setCameraOpen(false);
      setAddMode('scanned');
    }
  }, [scanLoading]);

  // ── Add scanned item ─────────────────────────────
  const handleAddScannedItem = useCallback(() => {
    const qty = parseFloat(scanLine.quantity);
    const cost = parseFloat(scanLine.costPrice);
    if (!scanLine.productName.trim()) { Alert.alert('Xatolik', "Mahsulot nomi bo'sh bo'lishi mumkin emas"); return; }
    if (!qty || qty <= 0) { Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak"); return; }
    if (isNaN(cost) || cost < 0) { Alert.alert('Xatolik', "Narx noto'g'ri"); return; }
    setItems((prev) => [...prev, { ...scanLine, key: `${Date.now()}-${Math.random()}` }]);
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setAddMode('none');
    setIsScanActive(true);
  }, [scanLine]);

  // ── Add manual item ──────────────────────────────
  const handleAddManualItem = useCallback(() => {
    const qty = parseFloat(manualLine.quantity);
    const cost = parseFloat(manualLine.costPrice);
    if (!manualLine.productId) { Alert.alert('Xatolik', 'Katalogdan mahsulot tanlang'); return; }
    if (!qty || qty <= 0) { Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak"); return; }
    if (isNaN(cost) || cost < 0) { Alert.alert('Xatolik', "Narx noto'g'ri"); return; }
    setItems((prev) => [...prev, { ...manualLine, key: `${Date.now()}-${Math.random()}` }]);
    setManualLine(EMPTY_LINE);
    setProductSearch('');
    setAddMode('none');
  }, [manualLine]);

  const handleRemoveItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  // ── Submit ────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!form.supplierName.trim()) { Alert.alert('Xatolik', "Yetkazib beruvchi nomi bo'sh bo'lishi mumkin emas"); return; }
    if (items.length === 0) { Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shish kerak"); return; }
    const body: CreateReceiptBody = {
      supplierName: form.supplierName.trim(),
      invoiceNumber: form.invoiceNumber.trim() || undefined,
      notes: form.notes.trim() || undefined,
      items: items.map((item) => ({
        productId: item.productId || item.productName.trim(),
        quantity: parseFloat(item.quantity),
        costPrice: parseFloat(item.costPrice),
        expiryDate: item.expiryDate.trim() || undefined,
      })),
    };
    try {
      await createMutation.mutateAsync(body);
      resetAll();
      onSuccess();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    }
  }, [form, items, createMutation, resetAll, onSuccess]);

  // ── Camera controls ───────────────────────────────
  const openCamera = useCallback(() => {
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setIsScanActive(true);
    setCameraOpen(true);
  }, []);

  const closeCamera = useCallback(() => {
    setCameraOpen(false);
    setIsScanActive(true);
  }, []);

  const openManualMode = useCallback(() => {
    setManualLine(EMPTY_LINE);
    setAddMode('manual');
  }, []);

  const cancelScan = useCallback(() => {
    setAddMode('none');
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setIsScanActive(true);
  }, []);

  const cancelManual = useCallback(() => {
    setAddMode('none');
    setManualLine(EMPTY_LINE);
  }, []);

  const selectProduct = useCallback((p: CatalogProduct) => {
    setManualLine((prev) => ({ ...prev, productId: p.id, productName: p.name, costPrice: String(p.costPrice) }));
    setProductSearch('');
  }, []);

  const clearProduct = useCallback(() => {
    setManualLine((prev) => ({ ...prev, productId: '', productName: '', costPrice: '' }));
    setProductSearch('');
  }, []);

  return {
    // State
    form,
    items,
    addMode,
    manualLine,
    scanResult,
    scanLine,
    cameraOpen,
    isScanActive,
    scanLoading,
    productSearch,
    catalogProducts,
    filteredProducts,
    loading: createMutation.isPending,

    // Setters
    setField,
    setScanLineField,
    setManualLineField,
    setProductSearch,

    // Actions
    handleClose,
    handleBarcodeScanned,
    handleAddScannedItem,
    handleAddManualItem,
    handleRemoveItem,
    handleSubmit,
    openCamera,
    closeCamera,
    openManualMode,
    cancelScan,
    cancelManual,
    selectProduct,
    clearProduct,
    setIsScanActive,
  };
}
