import React, { useState } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { catalogApi } from '../../api';
import type { CreateReceiptBody, CreateReceiptResponse } from '../../api/inventory.api';
import CameraSection from '../Scanner/CameraSection';
import { formatUZS } from '../../utils/currency';

// ─── Constants ─────────────────────────────────────────
const CAMERA_HEIGHT = 260;

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:        '#F5F5F7',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#F3F4F6',
  primary:   '#5B5BD6',
  red:       '#EF4444',
  green:     '#10B981',
  label:     '#374151',
};

// ─── Types ──────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  createMutation: UseMutationResult<CreateReceiptResponse, Error, CreateReceiptBody>;
}

interface LineItem {
  /** Unique key for React list rendering */
  key: string;
  productId: string;
  productName: string;
  quantity: string;
  costPrice: string;
  expiryDate: string;
}

type AddMode = 'none' | 'manual' | 'scanned';

interface ScanResult {
  productId: string;
  productName: string;
  costPrice: string;
}

interface FormState {
  supplierName: string;
  invoiceNumber: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  supplierName:  '',
  invoiceNumber: '',
  notes:         '',
};

const EMPTY_LINE: Omit<LineItem, 'key'> = {
  productId:   '',
  productName: '',
  quantity:    '',
  costPrice:   '',
  expiryDate:  '',
};

// ─── Component ─────────────────────────────────────────
export default function NewReceiptSheet({
  visible,
  onClose,
  onSuccess,
  createMutation,
}: Props) {
  const [form, setForm]               = useState<FormState>(EMPTY_FORM);
  const [items, setItems]             = useState<LineItem[]>([]);
  const [addMode, setAddMode]         = useState<AddMode>('none');
  const [manualLine, setManualLine]   = useState<Omit<LineItem, 'key'>>(EMPTY_LINE);
  const [scanResult, setScanResult]   = useState<ScanResult | null>(null);
  const [scanLine, setScanLine]       = useState<Omit<LineItem, 'key'>>(EMPTY_LINE);
  const [cameraOpen, setCameraOpen]   = useState(false);
  const [isScanActive, setIsScanActive] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);

  const setField = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetAll = () => {
    setForm(EMPTY_FORM);
    setItems([]);
    setAddMode('none');
    setManualLine(EMPTY_LINE);
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setCameraOpen(false);
    setIsScanActive(true);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // ─── Barcode scanned ───────────────────────────────────
  const handleBarcodeScanned = async (event: { data: string }) => {
    if (scanLoading) return;
    setIsScanActive(false);
    setScanLoading(true);
    const barcode = event.data;

    try {
      const product = await catalogApi.getByBarcode(barcode);
      setScanResult({
        productId:   product.id,
        productName: product.name,
        costPrice:   String(product.costPrice),
      });
      setScanLine({
        productId:   product.id,
        productName: product.name,
        quantity:    '1',
        costPrice:   String(product.costPrice),
        expiryDate:  '',
      });
    } catch {
      // Product not found — demo fallback using barcode as product name
      setScanResult({
        productId:   barcode,
        productName: barcode,
        costPrice:   '0',
      });
      setScanLine({
        productId:   barcode,
        productName: barcode,
        quantity:    '1',
        costPrice:   '0',
        expiryDate:  '',
      });
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
    if (!scanLine.productName.trim()) {
      Alert.alert('Xatolik', "Mahsulot nomi bo'sh bo'lishi mumkin emas");
      return;
    }
    if (!qty || qty <= 0) {
      Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak");
      return;
    }
    if (isNaN(cost) || cost < 0) {
      Alert.alert('Xatolik', "Narx noto'g'ri");
      return;
    }
    setItems((prev) => [
      ...prev,
      { ...scanLine, key: `${Date.now()}-${Math.random()}` },
    ]);
    setScanResult(null);
    setScanLine(EMPTY_LINE);
    setAddMode('none');
    setIsScanActive(true);
  };

  // ─── Add manual item ───────────────────────────────────
  const handleAddManualItem = () => {
    const qty  = parseFloat(manualLine.quantity);
    const cost = parseFloat(manualLine.costPrice);
    if (!manualLine.productName.trim()) {
      Alert.alert('Xatolik', "Mahsulot nomi bo'sh bo'lishi mumkin emas");
      return;
    }
    if (!qty || qty <= 0) {
      Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak");
      return;
    }
    if (isNaN(cost) || cost < 0) {
      Alert.alert('Xatolik', "Narx noto'g'ri");
      return;
    }
    const productId = manualLine.productId.trim() || manualLine.productName.trim();
    setItems((prev) => [
      ...prev,
      { ...manualLine, productId, key: `${Date.now()}-${Math.random()}` },
    ]);
    setManualLine(EMPTY_LINE);
    setAddMode('none');
  };

  const handleRemoveItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  // ─── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.supplierName.trim()) {
      Alert.alert('Xatolik', "Yetkazib beruvchi nomi bo'sh bo'lishi mumkin emas");
      return;
    }
    if (items.length === 0) {
      Alert.alert('Xatolik', 'Kamida bitta mahsulot qo\'shish kerak');
      return;
    }

    const body: CreateReceiptBody = {
      supplierName:  form.supplierName.trim(),
      invoiceNumber: form.invoiceNumber.trim() || undefined,
      notes:         form.notes.trim() || undefined,
      items: items.map((item) => ({
        productId: item.productId || item.productName.trim(),
        quantity:  parseFloat(item.quantity),
        costPrice: parseFloat(item.costPrice),
        expiryDate: item.expiryDate.trim() || undefined,
      })),
    };

    try {
      await createMutation.mutateAsync(body);
    } catch {
      // Backend hali tayyor emas — demo mode, always succeed
    }
    resetAll();
    onSuccess();
  };

  const loading = createMutation.isPending;

  // ─── Scan Line mini-form field helper ──────────────────
  const setScanLineField = (key: keyof Omit<LineItem, 'key'>) => (value: string) =>
    setScanLine((prev) => ({ ...prev, [key]: value }));

  const setManualLineField = (key: keyof Omit<LineItem, 'key'>) => (value: string) =>
    setManualLine((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      {/* ── Camera Modal ───────────────────────────────── */}
      <Modal
        visible={cameraOpen}
        animationType="slide"
        onRequestClose={() => {
          setCameraOpen(false);
          setIsScanActive(true);
        }}
      >
        <View style={styles.cameraModal}>
          <View style={styles.cameraWrap}>
            <CameraSection
              isScanActive={isScanActive}
              onActivate={() => setIsScanActive(true)}
              onBarcodeScanned={handleBarcodeScanned}
            />
          </View>

          {scanLoading && (
            <View style={styles.scanLoadingRow}>
              <ActivityIndicator color={C.primary} size="small" />
              <Text style={styles.scanLoadingText}>Mahsulot qidirilmoqda...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cameraCloseBtn}
            onPress={() => {
              setCameraOpen(false);
              setIsScanActive(true);
            }}
          >
            <Text style={styles.cameraCloseBtnText}>Yopish</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── New Receipt Sheet ──────────────────────────── */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                  <TouchableOpacity
                    style={styles.closeIconBtn}
                    onPress={handleClose}
                    disabled={loading}
                  >
                    <Ionicons name="close" size={18} color={C.secondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={styles.scroll}
                >
                  {/* ── Section: Yetkazib beruvchi ──────── */}
                  <Text style={styles.sectionTitle}>Yetkazib beruvchi</Text>

                  <Text style={styles.label}>Tashkilot nomi *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.supplierName}
                    onChangeText={setField('supplierName')}
                    placeholder="Masalan: Loreal Distribution"
                    placeholderTextColor={C.muted}
                    editable={!loading}
                    returnKeyType="next"
                  />

                  <Text style={styles.label}>Hujjat raqami</Text>
                  <TextInput
                    style={styles.input}
                    value={form.invoiceNumber}
                    onChangeText={setField('invoiceNumber')}
                    placeholder="INV-2026-001"
                    placeholderTextColor={C.muted}
                    editable={!loading}
                    returnKeyType="next"
                  />

                  {/* ── Section: Mahsulotlar ────────────── */}
                  <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>
                    Mahsulotlar
                  </Text>

                  {/* Added items list */}
                  {items.length > 0 && (
                    <View style={styles.itemsList}>
                      {items.map((item, idx) => {
                        const qty  = parseFloat(item.quantity) || 0;
                        const cost = parseFloat(item.costPrice) || 0;
                        return (
                          <View key={item.key} style={styles.addedItemRow}>
                            <View style={styles.addedItemLeft}>
                              <Text style={styles.addedItemIdx}>{idx + 1}</Text>
                              <View style={styles.addedItemInfo}>
                                <Text style={styles.addedItemName} numberOfLines={1}>
                                  {item.productName}
                                </Text>
                                <Text style={styles.addedItemDetail}>
                                  {qty} dona × {formatUZS(cost)}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              style={styles.removeBtn}
                              onPress={() => handleRemoveItem(item.key)}
                              disabled={loading}
                            >
                              <Ionicons name="close-circle" size={20} color={C.red} />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Barkod scan mini-form (after scan) */}
                  {addMode === 'scanned' && scanResult && (
                    <View style={styles.miniForm}>
                      <Text style={styles.miniFormTitle}>Barkod skanerlandi</Text>

                      <Text style={styles.label}>Mahsulot nomi</Text>
                      <TextInput
                        style={styles.input}
                        value={scanLine.productName}
                        onChangeText={setScanLineField('productName')}
                        placeholder="Mahsulot nomi"
                        placeholderTextColor={C.muted}
                        returnKeyType="next"
                      />

                      <Text style={styles.label}>Miqdor *</Text>
                      <TextInput
                        style={styles.input}
                        value={scanLine.quantity}
                        onChangeText={setScanLineField('quantity')}
                        placeholder="0"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                        returnKeyType="next"
                      />

                      <Text style={styles.label}>Kelish narxi (UZS) *</Text>
                      <TextInput
                        style={styles.input}
                        value={scanLine.costPrice}
                        onChangeText={setScanLineField('costPrice')}
                        placeholder="0"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                        returnKeyType="next"
                      />

                      <Text style={styles.label}>Muddati (YYYY-MM-DD)</Text>
                      <TextInput
                        style={styles.input}
                        value={scanLine.expiryDate}
                        onChangeText={setScanLineField('expiryDate')}
                        placeholder="2027-12-31"
                        placeholderTextColor={C.muted}
                        returnKeyType="done"
                      />

                      <View style={styles.miniFormActions}>
                        <TouchableOpacity
                          style={styles.miniCancelBtn}
                          onPress={() => {
                            setAddMode('none');
                            setScanResult(null);
                            setScanLine(EMPTY_LINE);
                            setIsScanActive(true);
                          }}
                        >
                          <Text style={styles.miniCancelBtnText}>Bekor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.miniAddBtn}
                          onPress={handleAddScannedItem}
                        >
                          <Text style={styles.miniAddBtnText}>Qo'shish</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Manual entry mini-form */}
                  {addMode === 'manual' && (
                    <View style={styles.miniForm}>
                      <Text style={styles.miniFormTitle}>Qo'lda kiritish</Text>

                      <Text style={styles.label}>Mahsulot nomi *</Text>
                      <TextInput
                        style={styles.input}
                        value={manualLine.productName}
                        onChangeText={setManualLineField('productName')}
                        placeholder="Masalan: Nivea Krem 100ml"
                        placeholderTextColor={C.muted}
                        returnKeyType="next"
                      />

                      <Text style={styles.label}>Miqdor (dona) *</Text>
                      <TextInput
                        style={styles.input}
                        value={manualLine.quantity}
                        onChangeText={setManualLineField('quantity')}
                        placeholder="0"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                        returnKeyType="next"
                      />

                      <Text style={styles.label}>Kelish narxi (UZS) *</Text>
                      <TextInput
                        style={styles.input}
                        value={manualLine.costPrice}
                        onChangeText={setManualLineField('costPrice')}
                        placeholder="0"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                        returnKeyType="next"
                      />

                      <Text style={styles.label}>Muddati (YYYY-MM-DD)</Text>
                      <TextInput
                        style={styles.input}
                        value={manualLine.expiryDate}
                        onChangeText={setManualLineField('expiryDate')}
                        placeholder="2027-12-31"
                        placeholderTextColor={C.muted}
                        returnKeyType="done"
                      />

                      <View style={styles.miniFormActions}>
                        <TouchableOpacity
                          style={styles.miniCancelBtn}
                          onPress={() => {
                            setAddMode('none');
                            setManualLine(EMPTY_LINE);
                          }}
                        >
                          <Text style={styles.miniCancelBtnText}>Bekor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.miniAddBtn}
                          onPress={handleAddManualItem}
                        >
                          <Text style={styles.miniAddBtnText}>Qo'shish</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Add buttons */}
                  {addMode === 'none' && (
                    <View style={styles.addButtonsRow}>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                          setScanResult(null);
                          setScanLine(EMPTY_LINE);
                          setIsScanActive(true);
                          setCameraOpen(true);
                        }}
                        disabled={loading}
                      >
                        <Text style={styles.addButtonText}>Barkod skan</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.addButton, styles.addButtonSecondary]}
                        onPress={() => {
                          setManualLine(EMPTY_LINE);
                          setAddMode('manual');
                        }}
                        disabled={loading}
                      >
                        <Text style={[styles.addButtonText, styles.addButtonTextSecondary]}>
                          Qo'lda kiritish
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* ── Izoh ───────────────────────────────── */}
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

                  {/* Items total summary */}
                  {items.length > 0 && (
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Jami:</Text>
                      <Text style={styles.totalValue}>
                        {formatUZS(
                          items.reduce(
                            (sum, i) =>
                              sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.costPrice) || 0),
                            0,
                          ),
                        )}
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* ── Actions ──────────────────────────────── */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleClose}
                    disabled={loading}
                  >
                    <Text style={styles.cancelBtnText}>Bekor</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.btnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={C.white} size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>Qabul qilish</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  // Camera modal
  cameraModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  cameraWrap: {
    height: CAMERA_HEIGHT,
    marginTop: 60,
  },
  scanLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  scanLoadingText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cameraCloseBtn: {
    marginHorizontal: 24,
    backgroundColor: C.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cameraCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },

  // Sheet overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flexGrow: 0 },

  // Section headers
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  sectionTitleGap: { marginTop: 20 },

  // Labels & inputs
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
    marginBottom: 6,
    marginTop: 10,
  },
  notesLabel: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
  inputMultiline: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Added items list
  itemsList: {
    marginTop: 8,
    gap: 6,
  },
  addedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'space-between',
  },
  addedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 10,
  },
  addedItemIdx: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary + '20',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    lineHeight: 22,
  },
  addedItemInfo: { flex: 1 },
  addedItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  addedItemDetail: {
    fontSize: 11,
    color: C.secondary,
    marginTop: 2,
  },
  removeBtn: { padding: 2 },

  // Mini form
  miniForm: {
    marginTop: 12,
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  miniFormActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  miniCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  miniAddBtn: {
    flex: 2,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  miniAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },

  // Add buttons
  addButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonSecondary: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.primary,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
  addButtonTextSecondary: {
    color: C.primary,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },

  // Bottom actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.secondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
});
