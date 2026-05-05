// NewTransferSheet.tsx — yangi o'tkazma modal komponenti

import React, { useState, useCallback, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { extractErrorMessage } from '../../utils/error';
import { C } from './StockTransferColors';
import type { StockLevel, TransferItem } from './StockTransferTypes';
import type { Branch } from '../../api/branches.api';
import type { CreateTransferBody, CreateTransferResponse } from '../../api/inventory.api';

interface NewTransferSheetProps {
  readonly visible:         boolean;
  readonly onClose:         () => void;
  readonly onSuccess:       () => void;
  readonly stockLevels:     UseQueryResult<StockLevel[]>;
  readonly branches:        UseQueryResult<Branch[]>;
  readonly createTransfer:  UseMutationResult<CreateTransferResponse, Error, CreateTransferBody>;
}

interface AddedItem extends TransferItem {
  key: string;
}

export default function NewTransferSheet({
  visible,
  onClose,
  onSuccess,
  stockLevels,
  branches,
  createTransfer,
}: NewTransferSheetProps) {
  const [fromBranchId,      setFromBranchId]      = useState('');
  const [toBranchId,        setToBranchId]         = useState('');
  const [addedItems,        setAddedItems]         = useState<AddedItem[]>([]);
  const [notes,             setNotes]              = useState('');
  const [productSearchOpen, setProductSearchOpen]  = useState(false);
  const [productSearch,     setProductSearch]      = useState('');
  const [qtyInputMap,       setQtyInputMap]        = useState<Record<string, string>>({});

  const loading = createTransfer.isPending;

  const resetForm = useCallback(() => {
    setFromBranchId('');
    setToBranchId('');
    setAddedItems([]);
    setNotes('');
    setProductSearchOpen(false);
    setProductSearch('');
    setQtyInputMap({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Qidiruv bo'yicha filterlangan va mavjud mahsulotlar
  const availableProducts = useMemo<StockLevel[]>(() => {
    const all = stockLevels.data ?? [];
    const q   = productSearch.toLowerCase().trim();
    const withQty = all.filter((i) => i.totalQty > 0);
    if (!q) return withQty;
    return withQty.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.warehouseName.toLowerCase().includes(q),
    );
  }, [stockLevels.data, productSearch]);

  const handleAddProduct = useCallback(
    (item: StockLevel) => {
      const key = `${item.productId}-${item.warehouseId}`;
      const alreadyExists = addedItems.some((a) => a.key === key);
      if (alreadyExists) {
        setProductSearchOpen(false);
        setProductSearch('');
        return;
      }
      const newItem: AddedItem = {
        key,
        productId:    item.productId,
        productName:  item.name,
        quantity:     1,
        warehouseId:  item.warehouseId,
        warehouseName: item.warehouseName,
        availableQty: item.totalQty,
      };
      setAddedItems((prev) => [...prev, newItem]);
      setQtyInputMap((prev) => ({ ...prev, [key]: '1' }));
      setProductSearchOpen(false);
      setProductSearch('');
    },
    [addedItems],
  );

  const handleRemoveItem = useCallback((key: string) => {
    setAddedItems((prev) => prev.filter((i) => i.key !== key));
    setQtyInputMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleQtyChange = useCallback((key: string, text: string) => {
    setQtyInputMap((prev) => ({ ...prev, [key]: text }));
    const parsed = parseFloat(text.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setAddedItems((prev) =>
        prev.map((i) => (i.key === key ? { ...i, quantity: parsed } : i)),
      );
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!fromBranchId) {
      Alert.alert('Xatolik', "Qayerdan filialini tanlang");
      return;
    }
    if (!toBranchId) {
      Alert.alert('Xatolik', "Qayerga filialini tanlang");
      return;
    }
    if (fromBranchId === toBranchId) {
      Alert.alert('Xatolik', "Bir xil filialga o'tkazib bo'lmaydi");
      return;
    }
    if (addedItems.length === 0) {
      Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shing");
      return;
    }

    // Har bir mahsulot miqdorini tekshirish
    for (const item of addedItems) {
      const rawQty = qtyInputMap[item.key] ?? '';
      const parsed = parseFloat(rawQty.replace(',', '.'));
      if (!rawQty.trim() || isNaN(parsed) || parsed <= 0) {
        Alert.alert('Xatolik', `"${item.productName}" uchun miqdor kiriting`);
        return;
      }
      if (parsed > item.availableQty) {
        Alert.alert(
          'Xatolik',
          `"${item.productName}" uchun miqdor mavjud qoldiqdan oshib ketdi. Maksimal: ${item.availableQty} dona`,
        );
        return;
      }
    }

    const payload: CreateTransferBody = {
      fromBranchId,
      toBranchId,
      items: addedItems.map((i) => ({
        productId:   i.productId,
        quantity:    i.quantity,
        warehouseId: i.warehouseId || undefined,
      })),
      notes: notes.trim() || undefined,
    };

    try {
      await createTransfer.mutateAsync(payload);
      resetForm();
      onSuccess();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    }
  }, [
    fromBranchId,
    toBranchId,
    addedItems,
    qtyInputMap,
    notes,
    createTransfer,
    resetForm,
    onSuccess,
  ]);

  const branchList = branches.data ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Sarlavha */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>Yangi o'tkazma</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={C.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.scroll}
            >
              {/* Qaydan filiali */}
              <Text style={styles.label}>Qaydan:</Text>
              {branches.isLoading ? (
                <ActivityIndicator size="small" color={C.primary} style={styles.branchLoader} />
              ) : (
                <View style={styles.chipRow}>
                  {branchList.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.chip,
                        fromBranchId === b.id && styles.chipActive,
                      ]}
                      onPress={() => setFromBranchId(b.id)}
                      disabled={loading}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          fromBranchId === b.id && styles.chipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Qayerga filiali */}
              <Text style={[styles.label, styles.labelTop]}>Qayga:</Text>
              {branches.isLoading ? (
                <ActivityIndicator size="small" color={C.primary} style={styles.branchLoader} />
              ) : (
                <View style={styles.chipRow}>
                  {branchList.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.chip,
                        toBranchId === b.id && styles.chipActive,
                        fromBranchId === b.id && styles.chipSameDisabled,
                      ]}
                      onPress={() => setToBranchId(b.id)}
                      disabled={loading || fromBranchId === b.id}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          toBranchId === b.id && styles.chipTextActive,
                          fromBranchId === b.id && styles.chipTextDisabled,
                        ]}
                        numberOfLines={1}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Qo'shilgan mahsulotlar */}
              {addedItems.length > 0 && (
                <>
                  <Text style={[styles.label, styles.labelTop]}>
                    Tanlangan mahsulotlar ({addedItems.length}):
                  </Text>
                  {addedItems.map((item) => (
                    <View key={item.key} style={styles.addedItemRow}>
                      <View style={styles.addedItemInfo}>
                        <Text style={styles.addedItemName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <Text style={styles.addedItemMeta}>
                          {item.warehouseName} · Maks: {item.availableQty} dona
                        </Text>
                      </View>
                      <TextInput
                        style={styles.qtyInput}
                        value={qtyInputMap[item.key] ?? ''}
                        onChangeText={(t) => handleQtyChange(item.key, t)}
                        keyboardType="numeric"
                        placeholder="Miqdor"
                        placeholderTextColor={C.muted}
                        editable={!loading}
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemoveItem(item.key)}
                        disabled={loading}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={20} color={C.red} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* Mahsulot qo'shish tugmasi */}
              <TouchableOpacity
                style={[styles.addProductBtn, styles.labelTop]}
                onPress={() => setProductSearchOpen(true)}
                disabled={loading}
                activeOpacity={0.75}
              >
                <Ionicons name="add-circle-outline" size={18} color={C.primary} />
                <Text style={styles.addProductBtnText}>Mahsulot qo'shish</Text>
              </TouchableOpacity>

              {/* Mahsulot qidirish paneli */}
              {productSearchOpen && (
                <View style={styles.searchPanel}>
                  <View style={styles.searchInputRow}>
                    <Ionicons name="search-outline" size={16} color={C.muted} />
                    <TextInput
                      style={styles.searchInput}
                      value={productSearch}
                      onChangeText={setProductSearch}
                      placeholder="Mahsulot nomini kiriting..."
                      placeholderTextColor={C.muted}
                      autoFocus
                      returnKeyType="search"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setProductSearchOpen(false);
                        setProductSearch('');
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={16} color={C.secondary} />
                    </TouchableOpacity>
                  </View>

                  {stockLevels.isLoading ? (
                    <ActivityIndicator size="small" color={C.primary} style={styles.branchLoader} />
                  ) : availableProducts.length === 0 ? (
                    <View style={styles.searchEmpty}>
                      <Text style={styles.searchEmptyText}>Mahsulot topilmadi</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={availableProducts}
                      keyExtractor={(i) => `${i.productId}-${i.warehouseId}`}
                      scrollEnabled={false}
                      renderItem={({ item }) => {
                        const key = `${item.productId}-${item.warehouseId}`;
                        const alreadyAdded = addedItems.some((a) => a.key === key);
                        return (
                          <TouchableOpacity
                            style={[
                              styles.searchResultRow,
                              alreadyAdded && styles.searchResultRowAdded,
                            ]}
                            onPress={() => handleAddProduct(item)}
                            disabled={alreadyAdded}
                            activeOpacity={0.75}
                          >
                            <View style={styles.searchResultInfo}>
                              <Text style={styles.searchResultName} numberOfLines={1}>
                                {item.name}
                              </Text>
                              <Text style={styles.searchResultMeta}>
                                {item.warehouseName} · {item.totalQty % 1 === 0
                                  ? String(item.totalQty)
                                  : item.totalQty.toFixed(2)} dona
                              </Text>
                            </View>
                            {alreadyAdded ? (
                              <Ionicons name="checkmark-circle" size={20} color={C.green} />
                            ) : (
                              <Ionicons name="add-circle-outline" size={20} color={C.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      }}
                      ItemSeparatorComponent={() => <View style={styles.searchSeparator} />}
                    />
                  )}
                </View>
              )}

              {/* Izoh */}
              <Text style={[styles.label, styles.labelTop]}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Qo'shimcha ma'lumot..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                editable={!loading}
                returnKeyType="done"
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Harakat tugmalari */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={() => { void handleSubmit(); }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="swap-horizontal-outline" size={16} color={C.white} />
                    <Text style={styles.submitBtnText}>O'tkazish</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingHorizontal:    20,
    paddingTop:           12,
    paddingBottom:        40,
    maxHeight:            '92%' as const,
  },
  handle: {
    width:           36,
    height:          4,
    borderRadius:    2,
    backgroundColor: C.border,
    alignSelf:       'center',
    marginBottom:    14,
  },
  titleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   16,
  },
  title: {
    fontSize:   18,
    fontWeight: '800',
    color:      C.text,
  },
  closeBtn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: C.bg,
    borderWidth:     1,
    borderColor:     C.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scroll: { flexShrink: 1 },

  label: {
    fontSize:     13,
    fontWeight:   '600',
    color:        '#374151',
    marginBottom: 8,
  },
  labelTop: { marginTop: 16 },

  branchLoader: { marginVertical: 8 },

  // Filial chip-lar
  chipRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       C.border,
    backgroundColor:   C.white,
    minHeight:         36,
    justifyContent:    'center',
  },
  chipActive: {
    borderColor:     C.primary,
    backgroundColor: C.primary + '12',
  },
  chipSameDisabled: {
    borderColor:     C.border,
    backgroundColor: C.bg,
    opacity:         0.5,
  },
  chipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      C.secondary,
  },
  chipTextActive: {
    color:      C.primary,
    fontWeight: '700',
  },
  chipTextDisabled: {
    color: C.muted,
  },

  // Qo'shilgan mahsulot satri
  addedItemRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: C.bg,
    borderRadius:    10,
    padding:         10,
    marginBottom:    6,
    borderWidth:     1,
    borderColor:     C.border,
  },
  addedItemInfo: {
    flex: 1,
    gap:  2,
  },
  addedItemName: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.text,
  },
  addedItemMeta: {
    fontSize: 11,
    color:    C.secondary,
  },
  qtyInput: {
    borderWidth:       1,
    borderColor:       C.border,
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   6,
    fontSize:          14,
    color:             C.text,
    backgroundColor:   C.white,
    width:             70,
    textAlign:         'center',
  },
  removeBtn: {
    padding: 2,
  },

  // Mahsulot qo'shish tugmasi
  addProductBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    paddingVertical: 12,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     C.primary + '40',
    backgroundColor: C.primary + '08',
  },
  addProductBtnText: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.primary,
  },

  // Qidiruv paneli
  searchPanel: {
    marginTop:       8,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     C.border,
    backgroundColor: C.white,
    overflow:        'hidden',
  },
  searchInputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    C.text,
    padding:  0,
  },
  searchEmpty: {
    paddingVertical: 20,
    alignItems:      'center',
  },
  searchEmptyText: {
    fontSize: 14,
    color:    C.muted,
  },
  searchResultRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 12,
    paddingVertical:   10,
    gap:               10,
  },
  searchResultRowAdded: {
    backgroundColor: '#F0FDF4',
  },
  searchResultInfo: { flex: 1, gap: 2 },
  searchResultName: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.text,
  },
  searchResultMeta: {
    fontSize: 12,
    color:    C.secondary,
  },
  searchSeparator: {
    height:          1,
    backgroundColor: C.border,
    marginHorizontal: 12,
  },

  // Input (izoh)
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
  inputMultiline: {
    height:     80,
    paddingTop: 12,
  },

  // Tugmalar
  actions: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     20,
  },
  cancelBtn: {
    flex:            1,
    borderWidth:     1,
    borderColor:     C.border,
    borderRadius:    12,
    paddingVertical: 14,
    alignItems:      'center',
  },
  cancelBtnText: {
    fontSize:   15,
    fontWeight: '600',
    color:      C.secondary,
  },
  submitBtn: {
    flex:            2,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             6,
    backgroundColor: C.primary,
    borderRadius:    12,
    paddingVertical: 14,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize:   15,
    fontWeight: '700',
    color:      C.white,
  },
});
