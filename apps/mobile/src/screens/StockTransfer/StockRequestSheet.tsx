// StockRequestSheet.tsx — filialdan katta omborga so'rov yuborish modal

import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockTransferColors';
import type { StockLevel } from './StockTransferTypes';
import { styles } from './NewTransferSheet.styles';
import ProductSearchPanel from './ProductSearchPanel';
import AddedItemsList from './AddedItemsList';
import TransferActions from './TransferActions';
import {
  type AddedItem,
  handleTransferError,
} from './new-transfer.utils';
import useStockRequestData from './useStockRequestData';

interface StockRequestSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export default function StockRequestSheet({ visible, onClose }: StockRequestSheetProps) {
  const { stockLevels, warehouseBranch, userBranch, createTransfer } = useStockRequestData();

  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [notes, setNotes] = useState('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [qtyInputMap, setQtyInputMap] = useState<Record<string, string>>({});

  const loading = createTransfer.isPending;

  const resetForm = useCallback(() => {
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

  // Mahsulotlarni qidirish va filterlash
  const availableProducts = useMemo<StockLevel[]>(() => {
    const all = stockLevels.data ?? [];
    const q = productSearch.toLowerCase().trim();
    const withQty = all.filter((i) => i.totalQty > 0);
    if (!q) return withQty;
    return withQty.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.warehouseName.toLowerCase().includes(q),
    );
  }, [stockLevels.data, productSearch]);

  const addedKeys = useMemo(
    () => new Set(addedItems.map((a) => a.key)),
    [addedItems],
  );

  const handleAddProduct = useCallback(
    (item: StockLevel) => {
      const key = `${item.productId}-${item.warehouseId}`;
      if (addedKeys.has(key)) {
        setProductSearchOpen(false);
        setProductSearch('');
        return;
      }
      const newItem: AddedItem = {
        key,
        productId: item.productId,
        productName: item.name,
        quantity: 1,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
        availableQty: item.totalQty,
      };
      setAddedItems((prev) => [...prev, newItem]);
      setQtyInputMap((prev) => ({ ...prev, [key]: '1' }));
      setProductSearchOpen(false);
      setProductSearch('');
    },
    [addedKeys],
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
    if (!warehouseBranch) {
      Alert.alert('Xatolik', 'Katta ombor topilmadi. Admin ga murojaat qiling.');
      return;
    }
    if (!userBranch) {
      Alert.alert('Xatolik', 'Sizning filialingiz aniqlanmadi. Qayta login qiling.');
      return;
    }
    if (addedItems.length === 0) {
      Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shing");
      return;
    }

    // Miqdor tekshiruvi
    for (const item of addedItems) {
      const rawQty = qtyInputMap[item.key] ?? '';
      const parsed = parseFloat(rawQty.replace(',', '.'));
      if (!rawQty.trim() || isNaN(parsed) || parsed <= 0) {
        Alert.alert('Xatolik', `"${item.productName}" uchun miqdor kiriting`);
        return;
      }
    }

    try {
      await createTransfer.mutateAsync({
        fromBranchId: warehouseBranch.id,
        toBranchId: userBranch.id,
        items: addedItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          warehouseId: i.warehouseId || undefined,
        })),
        notes: notes.trim() || undefined,
      });
      Alert.alert('Muvaffaqiyat', "So'rov yuborildi! Ombor ishchisi ko'rib chiqadi.");
      resetForm();
      onClose();
    } catch (err) {
      handleTransferError(err);
    }
  }, [warehouseBranch, userBranch, addedItems, qtyInputMap, notes, createTransfer, resetForm, onClose]);

  const warehouseName = warehouseBranch?.name ?? 'Markaziy ombor';
  const branchName = userBranch?.name ?? 'Sizning filial';

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
              <Text style={styles.title}>Omborga so'rov</Text>
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
              {/* Yo'nalish info */}
              <View style={infoStyles.infoRow}>
                <Ionicons name="business-outline" size={16} color={C.primary} />
                <Text style={infoStyles.infoText}>
                  {warehouseName} → {branchName}
                </Text>
              </View>

              {/* Qo'shilgan mahsulotlar */}
              <AddedItemsList
                items={addedItems}
                qtyInputMap={qtyInputMap}
                onQtyChange={handleQtyChange}
                onRemove={handleRemoveItem}
                disabled={loading}
              />

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
                <ProductSearchPanel
                  productSearch={productSearch}
                  onSearchChange={setProductSearch}
                  onClose={() => {
                    setProductSearchOpen(false);
                    setProductSearch('');
                  }}
                  isLoading={stockLevels.isLoading}
                  availableProducts={availableProducts}
                  addedKeys={addedKeys}
                  onAddProduct={handleAddProduct}
                />
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

            <TransferActions
              loading={loading}
              onCancel={handleClose}
              onSubmit={() => { void handleSubmit(); }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Info row uchun minimal stillar (inline-free)
import { StyleSheet } from 'react-native';

const infoStyles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primary + '08',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.primary + '20',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
    flex: 1,
  },
});
