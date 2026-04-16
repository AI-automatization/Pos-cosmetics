// TransferSheet — ombordan do'konga o'tkazma

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
  FlatList,
} from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchApi, type Branch } from '../../api/branches.api';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import type { CreateTransferBody, CreateTransferResponse } from '../../api/inventory.api';
import { extractErrorMessage } from '../../utils/error';
import { C } from './KirimColors';

interface TransferLine {
  key: string;
  productId: string;
  productName: string;
  quantity: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transferMutation: UseMutationResult<CreateTransferResponse, Error, CreateTransferBody>;
}

const EMPTY_LINE: Omit<TransferLine, 'key'> = {
  productId: '',
  productName: '',
  quantity: '1',
};

export default function TransferSheet({ visible, onClose, onSuccess, transferMutation }: Props) {
  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId]     = useState('');
  const [notes, setNotes]               = useState('');
  const [items, setItems]               = useState<TransferLine[]>([]);
  const [addingItem, setAddingItem]     = useState(false);
  const [newLine, setNewLine]           = useState<Omit<TransferLine, 'key'>>(EMPTY_LINE);
  const [productSearch, setProductSearch] = useState('');

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn:  branchApi.getAll,
    staleTime: 5 * 60_000,
    enabled:  visible,
  });

  const { data: catalogProducts = [] } = useQuery<CatalogProduct[]>({
    queryKey: ['catalog-products-transfer'],
    queryFn:  () => catalogApi.getProducts(),
    staleTime: 5 * 60_000,
    enabled:  visible,
  });

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return catalogProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 6);
  }, [catalogProducts, productSearch]);

  const resetAll = () => {
    setFromBranchId('');
    setToBranchId('');
    setNotes('');
    setItems([]);
    setAddingItem(false);
    setNewLine(EMPTY_LINE);
    setProductSearch('');
  };

  const handleClose = () => { resetAll(); onClose(); };

  const handleSelectProduct = (p: CatalogProduct) => {
    setNewLine((prev) => ({ ...prev, productId: p.id, productName: p.name }));
    setProductSearch('');
  };

  const handleAddItem = () => {
    if (!newLine.productId) { Alert.alert('Xatolik', 'Mahsulot tanlang'); return; }
    const qty = parseFloat(newLine.quantity);
    if (!qty || qty <= 0) { Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak"); return; }
    setItems((prev) => [...prev, { ...newLine, key: `${Date.now()}-${Math.random()}` }]);
    setNewLine(EMPTY_LINE);
    setProductSearch('');
    setAddingItem(false);
  };

  const handleRemoveItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const handleSubmit = async () => {
    if (!fromBranchId) { Alert.alert('Xatolik', 'Manba filialni tanlang'); return; }
    if (!toBranchId)   { Alert.alert('Xatolik', 'Manzil filialni tanlang'); return; }
    if (fromBranchId === toBranchId) { Alert.alert('Xatolik', 'Manba va manzil filial bir xil bo\'lmasin'); return; }
    if (items.length === 0) { Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shing"); return; }

    try {
      await transferMutation.mutateAsync({
        fromBranchId,
        toBranchId,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity:  parseFloat(i.quantity),
        })),
      });
      resetAll();
      onSuccess();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    }
  };

  const loading = transferMutation.isPending;
  const fromBranch = branches.find((b) => b.id === fromBranchId);
  const toBranch   = branches.find((b) => b.id === toBranchId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                <MaterialCommunityIcons name="transfer" size={20} color={C.primary} />
                <Text style={styles.title}>Ombordan o'tkazma</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={18} color={C.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              style={styles.scroll}
            >
              {/* ── Manba filial ─────────────────────── */}
              <Text style={styles.label}>Manba (kimdan)</Text>
              <View style={styles.branchList}>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.branchChip, fromBranchId === b.id && styles.branchChipActive]}
                    onPress={() => setFromBranchId(b.id)}
                    disabled={loading}
                  >
                    <Text style={[styles.branchChipText, fromBranchId === b.id && styles.branchChipTextActive]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Manzil filial ────────────────────── */}
              <Text style={[styles.label, { marginTop: 16 }]}>Manzil (kimga)</Text>
              <View style={styles.branchList}>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.branchChip,
                      toBranchId === b.id && styles.branchChipActive,
                      b.id === fromBranchId && styles.branchChipDisabled,
                    ]}
                    onPress={() => b.id !== fromBranchId && setToBranchId(b.id)}
                    disabled={loading || b.id === fromBranchId}
                  >
                    <Text style={[
                      styles.branchChipText,
                      toBranchId === b.id && styles.branchChipTextActive,
                      b.id === fromBranchId && styles.branchChipTextDisabled,
                    ]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Yo'nalish ko'rsatkich ────────────── */}
              {fromBranch && toBranch && (
                <View style={styles.routeRow}>
                  <Text style={styles.routeText} numberOfLines={1}>{fromBranch.name}</Text>
                  <Ionicons name="arrow-forward" size={16} color={C.primary} />
                  <Text style={styles.routeText} numberOfLines={1}>{toBranch.name}</Text>
                </View>
              )}

              {/* ── Mahsulotlar ───────────────────────── */}
              <Text style={[styles.label, { marginTop: 16 }]}>Mahsulotlar</Text>

              {items.map((item) => (
                <View key={item.key} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.itemQty}>{item.quantity} dona</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.key)} disabled={loading}>
                    <Ionicons name="close-circle" size={20} color={C.red} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* ── Mahsulot qo'shish formi ────────────── */}
              {addingItem ? (
                <View style={styles.addForm}>
                  <Text style={styles.addFormTitle}>Mahsulot qo'shish</Text>

                  {newLine.productId ? (
                    <View style={styles.selectedProduct}>
                      <Text style={styles.selectedProductName} numberOfLines={1}>{newLine.productName}</Text>
                      <TouchableOpacity onPress={() => setNewLine(EMPTY_LINE)}>
                        <Ionicons name="close-circle" size={18} color={C.muted} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        value={productSearch}
                        onChangeText={setProductSearch}
                        placeholder="Mahsulot nomi yoki SKU..."
                        placeholderTextColor={C.muted}
                        autoFocus
                      />
                      {filteredProducts.length > 0 && (
                        <FlatList
                          data={filteredProducts}
                          keyExtractor={(p) => p.id}
                          scrollEnabled={false}
                          renderItem={({ item: p }) => (
                            <TouchableOpacity
                              style={styles.productSuggestion}
                              onPress={() => handleSelectProduct(p)}
                            >
                              <Text style={styles.productSuggestionName}>{p.name}</Text>
                              <Text style={styles.productSuggestionSku}>{p.sku}</Text>
                            </TouchableOpacity>
                          )}
                        />
                      )}
                    </>
                  )}

                  <Text style={[styles.label, { marginTop: 10 }]}>Miqdor</Text>
                  <TextInput
                    style={styles.input}
                    value={newLine.quantity}
                    onChangeText={(v) => setNewLine((prev) => ({ ...prev, quantity: v }))}
                    placeholder="1"
                    placeholderTextColor={C.muted}
                    keyboardType="numeric"
                  />

                  <View style={styles.addFormBtns}>
                    <TouchableOpacity
                      style={styles.cancelSmallBtn}
                      onPress={() => { setAddingItem(false); setNewLine(EMPTY_LINE); setProductSearch(''); }}
                    >
                      <Text style={styles.cancelSmallBtnText}>Bekor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddItem}>
                      <Text style={styles.addSmallBtnText}>Qo'shish</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addItemBtn}
                  onPress={() => setAddingItem(true)}
                  disabled={loading}
                >
                  <Ionicons name="add" size={18} color={C.primary} />
                  <Text style={styles.addItemBtnText}>Mahsulot qo'shish</Text>
                </TouchableOpacity>
              )}

              {/* ── Izoh ─────────────────────────────── */}
              <Text style={[styles.label, { marginTop: 16 }]}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Qo'shimcha ma'lumot..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </ScrollView>

            {/* ── Actions ─────────────────────────────── */}
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
                  : <Text style={styles.submitBtnText}>Yuborish</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav:       { width: '100%' },
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:              24,
    paddingBottom:        40,
    maxHeight:            '92%' as const,
  },
  handle:    { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  titleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:     { fontSize: 20, fontWeight: '800', color: C.text },
  closeBtn:  { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  scroll:    { flexShrink: 1 },
  label:     { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },

  // Branch chips
  branchList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  branchChip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       '#E5E7EB',
    backgroundColor:   C.white,
  },
  branchChipActive:       { borderColor: C.primary, backgroundColor: C.primary + '15' },
  branchChipDisabled:     { opacity: 0.35 },
  branchChipText:         { fontSize: 13, color: C.secondary, fontWeight: '500' },
  branchChipTextActive:   { color: C.primary, fontWeight: '700' },
  branchChipTextDisabled: { color: C.muted },

  // Route indicator
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: C.primary + '0D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  routeText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.primary, textAlign: 'center' },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: C.text },
  itemQty:  { fontSize: 12, color: C.muted, marginTop: 2 },

  // Add form
  addForm: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  addFormTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  selectedProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  selectedProductName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.primary },
  productSuggestion: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productSuggestionName: { fontSize: 14, color: C.text, fontWeight: '500' },
  productSuggestionSku:  { fontSize: 12, color: C.muted },
  addFormBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cancelSmallBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelSmallBtnText: { fontSize: 14, color: C.secondary, fontWeight: '600' },
  addSmallBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addSmallBtnText: { fontSize: 14, color: C.white, fontWeight: '700' },

  // Add item button
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addItemBtnText: { fontSize: 14, color: C.primary, fontWeight: '600' },

  // Input
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.white,
  },
  inputMultiline: { height: 72, textAlignVertical: 'top', paddingTop: 12 },

  // Actions
  actions:       { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:     { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: C.secondary },
  submitBtn:     { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnDisabled:   { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
