import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import type { CreateReceiptBody, CreateReceiptResponse } from '../../api/inventory.api';
import { extractErrorMessage } from '../../utils/error';

import { C, EMPTY_FORM, EMPTY_LINE } from './components/types';
import type { LineItem, FormState, ScanResult, AddMode } from './components/types';
import SupplierForm from './components/SupplierForm';
import AddedItemsList from './components/AddedItemsList';
import ScannedItemMiniForm from './components/ScannedItemMiniForm';
import ManualItemMiniForm from './components/ManualItemMiniForm';
import AddItemButtons from './components/AddItemButtons';
import CameraOverlay from './components/CameraOverlay';

// ─── Types ──────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  createMutation: UseMutationResult<CreateReceiptResponse, Error, CreateReceiptBody>;
}

// ─── Component ─────────────────────────────────────────
export default function NewReceiptSheet({ visible, onClose, onSuccess, createMutation }: Props) {
  const [form, setForm]                 = useState<FormState>(EMPTY_FORM);
  const [items, setItems]               = useState<LineItem[]>([]);
  const [addMode, setAddMode]           = useState<AddMode>('none');
  const [manualLine, setManualLine]     = useState<Omit<LineItem, 'key'>>(EMPTY_LINE);
  const [scanResult, setScanResult]     = useState<ScanResult | null>(null);
  const [scanLine, setScanLine]         = useState<Omit<LineItem, 'key'>>(EMPTY_LINE);
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [isScanActive, setIsScanActive] = useState(true);
  const [scanLoading, setScanLoading]   = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const { data: catalogProducts = [] } = useQuery<CatalogProduct[]>({
    queryKey: ['catalog-products-kirim'],
    queryFn:  () => catalogApi.getProducts(),
    staleTime: 5 * 60_000,
    enabled:  visible,
  });

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return catalogProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 5);
  }, [catalogProducts, productSearch]);

  // ─── Helpers ───────────────────────────────────────────
  const setField = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setScanLineField = (key: keyof Omit<LineItem, 'key'>) => (value: string) =>
    setScanLine((prev) => ({ ...prev, [key]: value }));

  const setManualLineField = (key: keyof Omit<LineItem, 'key'>) => (value: string) =>
    setManualLine((prev) => ({ ...prev, [key]: value }));

  const resetAll = () => {
    setForm(EMPTY_FORM);
    setItems([]);
    setAddMode('none');
    setManualLine(EMPTY_LINE);
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setCameraOpen(false);
    setIsScanActive(true);
    setProductSearch('');
  };

  const handleClose = () => { resetAll(); onClose(); };

  // ─── Barcode scanned ───────────────────────────────────
  const handleBarcodeScanned = async (event: { data: string }) => {
    if (scanLoading) return;
    setIsScanActive(false);
    setScanLoading(true);
    const barcode = event.data;
    try {
      const product = await catalogApi.getByBarcode(barcode);
      setScanResult({ productId: product.id, productName: product.name, costPrice: String(product.costPrice) });
      setScanLine({ productId: product.id, productName: product.name, quantity: '1', costPrice: String(product.costPrice), expiryDate: '' });
    } catch {
      // Demo fallback: product not in catalog yet (404) or network error.
      setScanResult({ productId: barcode, productName: barcode, costPrice: '0' });
      setScanLine({ productId: barcode, productName: barcode, quantity: '1', costPrice: '0', expiryDate: '' });
    } finally {
      setScanLoading(false);
      setCameraOpen(false);
      setAddMode('scanned');
    }
  };

  // ─── Add scanned item ──────────────────────────────────
  const handleAddScannedItem = () => {
    const qty  = parseFloat(scanLine.quantity);
    const cost = parseFloat(scanLine.costPrice);
    if (!scanLine.productName.trim()) { Alert.alert('Xatolik', "Mahsulot nomi bo'sh bo'lishi mumkin emas"); return; }
    if (!qty || qty <= 0)             { Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak"); return; }
    if (isNaN(cost) || cost < 0)      { Alert.alert('Xatolik', "Narx noto'g'ri"); return; }
    setItems((prev) => [...prev, { ...scanLine, key: `${Date.now()}-${Math.random()}` }]);
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setAddMode('none');
    setIsScanActive(true);
  };

  // ─── Add manual item ───────────────────────────────────
  const handleAddManualItem = () => {
    const qty  = parseFloat(manualLine.quantity);
    const cost = parseFloat(manualLine.costPrice);
    if (!manualLine.productId)   { Alert.alert('Xatolik', 'Katalogdan mahsulot tanlang'); return; }
    if (!qty || qty <= 0)        { Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak"); return; }
    if (isNaN(cost) || cost < 0) { Alert.alert('Xatolik', "Narx noto'g'ri"); return; }
    setItems((prev) => [...prev, { ...manualLine, key: `${Date.now()}-${Math.random()}` }]);
    setManualLine(EMPTY_LINE);
    setProductSearch('');
    setAddMode('none');
  };

  const handleRemoveItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  // ─── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.supplierName.trim()) { Alert.alert('Xatolik', "Yetkazib beruvchi nomi bo'sh bo'lishi mumkin emas"); return; }
    if (items.length === 0)        { Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shish kerak"); return; }
    const body: CreateReceiptBody = {
      supplierName:  form.supplierName.trim(),
      invoiceNumber: form.invoiceNumber.trim() || undefined,
      notes:         form.notes.trim() || undefined,
      items: items.map((item) => ({
        productId:  item.productId || item.productName.trim(),
        quantity:   parseFloat(item.quantity),
        costPrice:  parseFloat(item.costPrice),
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
  };

  const loading = createMutation.isPending;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}
          >
            <View style={styles.sheet}>
              <View style={styles.handle} />

              {/* Title row */}
              <View style={styles.titleRow}>
                <Text style={styles.title}>Yangi kirim</Text>
                <TouchableOpacity style={styles.closeIconBtn} onPress={handleClose} disabled={loading}>
                  <Ionicons name="close" size={18} color={C.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                style={styles.scroll}
              >
                {/* ── Yetkazib beruvchi ─────────────────── */}
                <SupplierForm form={form} setField={setField} loading={loading} />

                {/* ── Mahsulotlar ───────────────────────── */}
                <Text style={styles.sectionTitle}>Mahsulotlar</Text>

                <AddedItemsList items={items} loading={loading} onRemove={handleRemoveItem} />

                {addMode === 'scanned' && scanResult && (
                  <ScannedItemMiniForm
                    scanLine={scanLine}
                    onChangeField={setScanLineField}
                    onAdd={handleAddScannedItem}
                    onCancel={() => {
                      setAddMode('none');
                      setScanResult(null);
                      setScanLine(EMPTY_LINE);
                      setIsScanActive(true);
                    }}
                  />
                )}

                {addMode === 'manual' && (
                  <ManualItemMiniForm
                    manualLine={manualLine}
                    onChangeField={setManualLineField}
                    catalogProducts={catalogProducts}
                    filteredProducts={filteredProducts}
                    productSearch={productSearch}
                    onProductSearch={setProductSearch}
                    onSelectProduct={(p) => {
                      setManualLine((prev) => ({ ...prev, productId: p.id, productName: p.name, costPrice: String(p.costPrice) }));
                      setProductSearch('');
                    }}
                    onClearProduct={() => {
                      setManualLine((prev) => ({ ...prev, productId: '', productName: '', costPrice: '' }));
                      setProductSearch('');
                    }}
                    onAdd={handleAddManualItem}
                    onCancel={() => { setAddMode('none'); setManualLine(EMPTY_LINE); }}
                  />
                )}

                {addMode === 'none' && (
                  <AddItemButtons
                    loading={loading}
                    onScanPress={() => {
                      setScanResult(null);
                      setScanLine(EMPTY_LINE);
                      setIsScanActive(true);
                      setCameraOpen(true);
                    }}
                    onManualPress={() => { setManualLine(EMPTY_LINE); setAddMode('manual'); }}
                  />
                )}

                {/* ── Izoh ────────────────────────────── */}
                <Text style={[styles.label, styles.notesLabel]}>Izoh</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={form.notes}
                  onChangeText={setField('notes')}
                  placeholder="Qo'shimcha ma'lumot..."
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                  returnKeyType="done"
                />
              </ScrollView>

              {/* ── Actions ──────────────────────────── */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
                  <Text style={styles.cancelBtnText}>Bekor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color={C.white} size="small" />
                    : <Text style={styles.submitBtnText}>Qabul qilish</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* ── Camera Overlay ───────────────────────── */}
          {cameraOpen && (
            <CameraOverlay
              scanLoading={scanLoading}
              isScanActive={isScanActive}
              onActivate={() => setIsScanActive(true)}
              onBarcodeScanned={handleBarcodeScanned}
              onClose={() => { setCameraOpen(false); setIsScanActive(true); }}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav:          { width: '100%' },
  sheet: {
    backgroundColor:    C.white,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:            24,
    paddingBottom:      40,
    maxHeight:          '92%' as const,
  },
  handle:       { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  titleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:        { fontSize: 20, fontWeight: '800', color: C.text },
  closeIconBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.border, alignItems: 'center', justifyContent: 'center' },
  scroll:       { flexShrink: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.primary, marginBottom: 4, marginTop: 20 },
  label:        { fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 6, marginTop: 10 },
  notesLabel:   { marginTop: 20 },
  input: {
    borderWidth:       1,
    borderColor:       C.border,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          15,
    color:             C.text,
    backgroundColor:   C.bg,
  },
  inputMultiline: { height: 72, textAlignVertical: 'top', paddingTop: 12 },
  actions:      { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:    { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: C.secondary },
  submitBtn:    { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnDisabled:  { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
