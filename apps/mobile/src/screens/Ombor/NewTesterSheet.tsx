// Ombor — NewTesterSheet: bottom sheet to open a new tester/sample
import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  TouchableWithoutFeedback, TextInput, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import { catalogApi } from '../../api/catalog.api';
import type { CatalogProduct } from '../../api/catalog.api';
import { C } from './OmborColors';

// ─── Constants ────────────────────────────────────────────
const MAX_SEARCH_RESULTS = 5;
const ORANGE_TINT = '#FFF7ED';

// ─── Props ────────────────────────────────────────────────
interface NewTesterSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

// ─── Helpers ──────────────────────────────────────────────
function fmtPrice(n: number): string {
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

// ─── Product Row (memoized) ──────────────────────────────
interface ProductRowProps {
  readonly item: CatalogProduct;
  readonly onSelect: (id: string, name: string) => void;
}

const ProductRow = React.memo(function ProductRow({ item, onSelect }: ProductRowProps) {
  return (
    <TouchableOpacity style={s.prodRow} onPress={() => onSelect(item.id, item.name)} activeOpacity={0.7}>
      <Text style={s.prodName} numberOfLines={1}>{item.name}</Text>
      {item.sku ? <Text style={s.prodSku}>{item.sku}</Text> : null}
    </TouchableOpacity>
  );
});

// ─── Component ────────────────────────────────────────────
export default function NewTesterSheet({ visible, onClose, onSuccess }: NewTesterSheetProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [costPrice, setCostPrice] = useState('');
  const [note, setNote] = useState('');
  const [searchText, setSearchText] = useState('');

  const products = useQuery({
    queryKey: ['catalog-products'], queryFn: () => catalogApi.getProducts(),
    staleTime: 60_000, enabled: visible,
  });
  const warehouses = useQuery({
    queryKey: ['inventory-warehouses'], queryFn: () => inventoryApi.getWarehouses(),
    staleTime: 60_000, enabled: visible,
  });

  const productList = products.data ?? [];
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    return productList
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
      .slice(0, MAX_SEARCH_RESULTS);
  }, [productList, searchText]);

  useEffect(() => {
    if (visible) {
      setSelectedProduct(''); setSelectedProductName(''); setSelectedWarehouse('');
      setQuantity('1'); setCostPrice(''); setNote(''); setSearchText('');
    }
  }, [visible]);

  useEffect(() => {
    const wh = warehouses.data;
    if (wh && wh.length === 1) setSelectedWarehouse(wh[0].id);
  }, [warehouses.data]);

  const handleProductSelect = (id: string, name: string) => {
    setSelectedProduct(id); setSelectedProductName(name); setSearchText('');
  };
  const handleClearProduct = () => {
    setSelectedProduct(''); setSelectedProductName(''); setSearchText('');
  };

  const qty = Number(quantity);
  const price = Number(costPrice);
  const isValid = selectedProduct.length > 0 && selectedWarehouse.length > 0 && qty > 0 && price >= 0 && costPrice.length > 0;
  const totalPreview = qty > 0 && price >= 0 ? qty * price : 0;

  const mutation = useMutation({
    mutationFn: () => inventoryApi.openTester({
      productId: selectedProduct, warehouseId: selectedWarehouse,
      quantity: qty, costPrice: price, note: note.trim() || undefined,
    }),
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = () => { if (!isValid || mutation.isPending) return; mutation.mutate(); };

  const warehouseList = warehouses.data ?? [];
  const showWarehousePicker = warehouseList.length > 1;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.wrapper}>
        <View style={s.sheet}>
          <View style={s.dragHandle} />

          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Tester ochish</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={C.secondary} />
            </TouchableOpacity>
          </View>

          <View style={s.formBody}>
            {/* Product selector */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Mahsulot *</Text>
              {selectedProduct ? (
                <View style={s.chipRow}>
                  <View style={s.chip}>
                    <Text style={s.chipText} numberOfLines={1}>{selectedProductName}</Text>
                    <TouchableOpacity onPress={handleClearProduct} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Ionicons name="close-circle" size={16} color={C.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <View style={s.searchBox}>
                    <Ionicons name="search-outline" size={16} color={C.muted} />
                    <TextInput style={s.searchInput} value={searchText} onChangeText={setSearchText}
                      placeholder="Mahsulot nomi yoki SKU..." placeholderTextColor={C.muted}
                      returnKeyType="search" autoCorrect={false} />
                  </View>
                  {filteredProducts.length > 0 && (
                    <FlatList data={filteredProducts} keyExtractor={(p) => p.id}
                      renderItem={({ item }) => <ProductRow item={item} onSelect={handleProductSelect} />}
                      scrollEnabled={false} style={s.dropdown} />
                  )}
                  {searchText.trim().length > 0 && filteredProducts.length === 0 && !products.isLoading && (
                    <Text style={s.noResult}>Mahsulot topilmadi</Text>
                  )}
                </>
              )}
            </View>

            {/* Warehouse selector */}
            {showWarehousePicker && (
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Ombor *</Text>
                <View style={s.whRow}>
                  {warehouseList.map((wh) => {
                    const sel = selectedWarehouse === wh.id;
                    return (
                      <TouchableOpacity key={wh.id} style={[s.whBtn, sel && s.whBtnActive]}
                        onPress={() => setSelectedWarehouse(wh.id)} activeOpacity={0.7}>
                        <Text style={[s.whBtnText, sel && s.whBtnTextActive]}>{wh.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Quantity */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Miqdor *</Text>
              <TextInput style={s.input} value={quantity} onChangeText={setQuantity}
                placeholder="1" placeholderTextColor={C.muted} keyboardType="number-pad" />
            </View>

            {/* Cost price */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Narxi (UZS/dona) *</Text>
              <TextInput style={s.input} value={costPrice} onChangeText={setCostPrice}
                placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" />
            </View>

            {/* Total preview */}
            {isValid && totalPreview > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Jami:</Text>
                <Text style={s.totalValue}>{fmtPrice(totalPreview)} UZS</Text>
              </View>
            )}

            {/* Note */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Izoh</Text>
              <TextInput style={[s.input, s.inputMulti]} value={note} onChangeText={setNote}
                placeholder="Izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline />
            </View>

            {/* Submit */}
            <TouchableOpacity style={[s.submitBtn, (!isValid || mutation.isPending) && s.submitDisabled]}
              onPress={handleSubmit} activeOpacity={0.85} disabled={!isValid || mutation.isPending}>
              {mutation.isPending
                ? <ActivityIndicator size="small" color={C.white} />
                : <Text style={s.submitText}>Tester ochish</Text>}
            </TouchableOpacity>

            {mutation.isError && (
              <Text style={s.mutErr}>Xatolik yuz berdi. Qaytadan urinib ko'ring.</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 36, elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.12, shadowRadius: 12,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: C.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  formBody: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 2 },

  // Product search
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg,
    borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },
  dropdown: { borderWidth: 1, borderColor: C.border, borderRadius: 10, backgroundColor: C.white, maxHeight: 200 },
  prodRow: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  prodName: { fontSize: 14, fontWeight: '600', color: C.text },
  prodSku: { fontSize: 11, color: C.muted, marginTop: 2 },
  noResult: { fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 8 },

  // Selected product chip
  chipRow: { flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ORANGE_TINT,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, maxWidth: '100%',
  },
  chipText: { fontSize: 14, fontWeight: '600', color: C.orange, flexShrink: 1 },

  // Warehouse picker
  whRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  whBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg,
    minHeight: 48, alignItems: 'center', justifyContent: 'center',
  },
  whBtnActive: { borderColor: C.orange, backgroundColor: ORANGE_TINT },
  whBtnText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  whBtnTextActive: { color: C.orange },

  // Inputs
  input: {
    borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text,
  },
  inputMulti: { maxHeight: 80, textAlignVertical: 'top' },

  // Total preview
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: ORANGE_TINT, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: C.secondary },
  totalValue: { fontSize: 16, fontWeight: '700', color: C.orange },

  // Submit
  submitBtn: {
    backgroundColor: C.orange, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 4,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '700', color: C.white },
  mutErr: { fontSize: 13, color: C.red, textAlign: 'center' },
});
